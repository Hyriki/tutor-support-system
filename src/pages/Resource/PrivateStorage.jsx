import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ResourceCard from "../../components/resource/ResourceCard";
import FileDetails from "./FileDetails";
import FolderCard from "../../components/resource/FolderCard";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";
import { getDownloadUrl, downloadFolderAsZip, uploadFileWithPresignedUrl } from "../../lib/s3Client";

import {
    FaRegCommentDots,
    FaSearch,
    FaFilter,
    FaFolderPlus,
    FaBars,
    FaTh,
    FaUpload,
    FaFolder,
    FaFilePdf,
    FaFileVideo,
    FaFileImage,
    FaEllipsisV,
    FaEye,
    FaDownload,
    FaShareAlt,
} from 'react-icons/fa';

const STORAGE_ITEMS_KEY = "tss_private_storage_items_v1";
const STORAGE_USAGE_KEY = "tss_private_storage_usage_v1";
const STORAGE_FILEDATA_PREFIX = "tss_file_data_"; // Prefix for individual file storage

const computeUsageFromItems = (items = []) => {
    return items.reduce((sum, item) => {
        if (item.size && item.size_unit) {
            const num = parseFloat(item.size);
            if (Number.isFinite(num)) {
                return sum + (item.size_unit === 'KB' ? num / 1024 : num);
            }
        }
        return sum;
    }, 0);
};

const dedupeItems = (items = []) => {
    const seenIds = new Set();
    const seenSig = new Set();
    const result = [];
    for (const item of items) {
        const id = item.id || crypto.randomUUID();
        const sig = `${(item.title || '').toLowerCase()}__${item.size || ''}__${item.size_unit || ''}`;
        if (seenIds.has(id) || seenSig.has(sig)) continue;
        seenIds.add(id);
        seenSig.add(sig);
        result.push({ ...item, id });
    }
    return result;
};

const PrivateStorage = () => {
    const totalStorage = 300.0;
    const [storageUsed, setStorageUsed] = useState(0);
    const storagePercentage = totalStorage === 0 ? 0 : (storageUsed / totalStorage) * 100;

    // Upload simulation state
    const [uploadQueue, setUploadQueue] = useState([]); // {id, fileName, sizeMB, progress, status}
    const [uploadErrors, setUploadErrors] = useState([]);
    const fileInputRef = useRef(null);
    const uploadIntervals = useRef({});
    const fileDataRef = useRef({}); // {id: dataURL or null}


    // ------------ STATE DECLARATIONS ---------------------
    const [selectedItem, setSelectedItem] = useState(null);
    const [isNewFolder, toggleIsNewFolder] = useState(false);
    const [itemList, setItemList] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loaded, setLoaded] = useState(false);
    const [activeTab, setActiveTab] = useState("my-files"); // "my-files" or "recent"
    const [filterType, setFilterType] = useState("all"); // "all", "images", "documents", "videos", "archives"
    const [showFilterMenu, setShowFilterMenu] = useState(false);
    const [currentFolderId, setCurrentFolderId] = useState(null); // null = root, or folder id



    // ------------ VIEW DETAILS ----------
    const handleViewDetails = (itemFromCard) => {
        // 1. Dùng ID để tìm lại object gốc trong danh sách itemList
        // Object gốc này mới chứa đầy đủ s3Key, description, v.v.
        console.log("Item từ Card gửi lên:", itemFromCard);
        const fullItem = itemList.find(i => i.id === itemFromCard.id);
        console.log("Item tìm thấy trong itemList:", fullItem);

        // Kiểm tra an toàn: nếu không tìm thấy thì dùng tạm item từ card
        const itemToView = fullItem || itemFromCard;

        // 2. Nếu là Folder -> đi vào folder
        if (itemToView.type === "folder") {
            setCurrentFolderId(itemToView.id);
            setSearchQuery(""); 
            return;
        }

        // 3. Nếu là File -> Hiện modal view details
        // Lấy dataUrl từ local (nếu có) để xem ảnh vừa upload ngay lập tức
        const dataUrl = fileDataRef.current[itemToView.id];
        
        // Quan trọng: Truyền itemToView (đã có s3Key) vào state
        setSelectedItem({ ...itemToView, dataUrl });
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleExitFolder = () => {
        setCurrentFolderId(null);
        setSearchQuery("");
    };

    useEffect(() => {
        // hydrate from storage (metadata and file payloads)
        const savedItems = JSON.parse(localStorage.getItem(STORAGE_ITEMS_KEY) || "null") || [];
        const savedUsage = parseFloat(localStorage.getItem(STORAGE_USAGE_KEY));
        
        // Load individual file data from localStorage
        const fileData = {};
        savedItems.forEach(item => {
            if (item.id) {
                const key = `${STORAGE_FILEDATA_PREFIX}${item.id}`;
                const data = localStorage.getItem(key);
                if (data) {
                    fileData[item.id] = data;
                }
            }
        });
        fileDataRef.current = fileData;

        const deduped = dedupeItems(savedItems);
        setItemList(deduped);
        if (Number.isFinite(savedUsage)) {
            setStorageUsed(savedUsage);
        } else {
            setStorageUsed(Math.round(computeUsageFromItems(deduped) * 100) / 100);
        }
        setLoaded(true);
    }, []);

    useEffect(() => {
        return () => {
            Object.values(uploadIntervals.current).forEach((id) => clearInterval(id));
            uploadIntervals.current = {};
        };
    }, []);

    useEffect(() => {
        if (!loaded) return;
        localStorage.setItem(STORAGE_ITEMS_KEY, JSON.stringify(itemList));
        localStorage.setItem(STORAGE_USAGE_KEY, String(storageUsed));
    }, [itemList, storageUsed, loaded]);

    // ------------ CREATE FOLDERS -------------
    const handleCreateFolder = (folderName) => {
        const folder = {
            "title" : folderName,
            "type": "folder",
            "size": null,
            "size_unit": null,
            "parentId": currentFolderId // Store parent folder reference
        }
        setItemList(prev => [...prev, { id: crypto.randomUUID(), ...folder }])
        toggleIsNewFolder(false)
    }

    const handleDeleteItem = (id) => {
        setItemList(prev => {
            const target = prev.find(i => i.id === id);
            const filtered = prev.filter(i => i.id !== id);
            
            // If deleting a folder, also delete all files inside it
            if (target && target.type === "folder") {
                const filesInFolder = prev.filter(i => i.parentId === id);
                filesInFolder.forEach(file => {
                    filtered.splice(filtered.indexOf(file), 1);
                    const delta = sizeStringToMB(file.size, file.size_unit);
                    setStorageUsed(val => Math.max(0, Math.round((val - delta) * 100) / 100));
                    const copy = { ...fileDataRef.current };
                    delete copy[file.id];
                    fileDataRef.current = copy;
                });
            } else if (target && target.size && target.size_unit) {
                const delta = sizeStringToMB(target.size, target.size_unit);
                setStorageUsed(val => Math.max(0, Math.round((val - delta) * 100) / 100));
            }
            
            const copy = { ...fileDataRef.current };
            delete copy[id];
            fileDataRef.current = copy;
            localStorage.removeItem(`${STORAGE_FILEDATA_PREFIX}${id}`);
            return filtered;
        });
    }

    const handleRenameItem = (id, newTitle) => {
        if (!newTitle || !newTitle.trim()) return;
        setItemList(prev => prev.map(item => item.id === id ? { ...item, title: newTitle.trim() } : item));
    }


    // ------------ SORT FILES ------------------------------
    const sortFiles = (fileList) => {
        const sortedList = [...fileList]; 
        
        sortedList.sort((a, b) => {
            // 1. Type sort
            if (a.type === 'folder' && b.type !== 'folder') {
                return -1; 
            }
            if (a.type !== 'folder' && b.type === 'folder') {
                return 1; 
            }

            // 2. Alphabetical sort
            return a.title.localeCompare(b.title);
        });
        return sortedList;
    };

    const handleSortList = () => {
        setItemList(prevList => {
            return sortFiles(prevList);
        })
    }

    // ------------ SEARCH & FILTER FILES ------------------------------
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    }

    const getFilteredByType = (items) => {
        if (filterType === "all") return items;
        
        const imageExts = ["jpg", "jpeg", "png", "gif", "svg", "webp", "ico"];
        const docExts = ["pdf", "doc", "docx", "txt", "md", "json", "csv", "xls", "xlsx", "ppt", "pptx"];
        const videoExts = ["mp4", "mov", "avi", "mkv", "flv", "wmv"];
        const archiveExts = ["zip", "rar", "7z", "tar", "gz"];
        
        return items.filter(item => {
            const ext = (item.type || "").toLowerCase();
            switch(filterType) {
                case "images":
                    return imageExts.includes(ext);
                case "documents":
                    return docExts.includes(ext);
                case "videos":
                    return videoExts.includes(ext);
                case "archives":
                    return archiveExts.includes(ext);
                default:
                    return true;
            }
        });
    };

    const getRecentItems = (items) => {
        const sorted = [...items].sort((a, b) => {
            const dateA = new Date(a.lastModified || 0).getTime();
            const dateB = new Date(b.lastModified || 0).getTime();
            return dateB - dateA;
        });
        return sorted.slice(0, 10); // Show top 10 recent
    };

    // Get items in current folder (or root if currentFolderId is null)
    const itemsInFolder = itemList.filter(item => {
        if (currentFolderId === null) {
            return !item.parentId; // Items with no parent (root level)
        }
        return item.parentId === currentFolderId; // Items with matching parentId
    });

    const filteredItems = itemsInFolder.filter(item => 
        item.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    let displayItems = activeTab === "recent" ? getRecentItems(filteredItems) : filteredItems;
    displayItems = getFilteredByType(displayItems);

    // -------------------- DOWNLOAD FILES ------------------------------
    // const handleDownloadFile = async (data) => {
    //     try {
    //         // If it's a folder, create a zip archive via backend
    //         if (data.type === "folder") {
    //             await handleDownloadFolder(data.id, data.title);
    //             return;
    //         }

    //         // For single files, use presigned URL from backend
    //         if (data.s3Key) {
    //             const downloadUrl = await getDownloadUrl(data.s3Key, data.title);
    
    //             const link = document.createElement('a');
    //             link.href = downloadUrl;
    //             link.download = data.title || 'download';
                
    //             // 3. Thêm target blank để xử lý an toàn hơn
    //             link.target = '_blank'; 
                
    //             document.body.appendChild(link);
    //             link.click();
    //             document.body.removeChild(link);
    //             return;
    //         }

    //         // Fallback: use localStorage data
    //         const stored = fileDataRef.current[data.id];
    //         let href = "";
    //         if (stored && typeof stored === 'string' && stored.startsWith('data:')) {
    //             href = stored;
    //         } else {
    //             // fallback: export metadata as JSON
    //             const jsonString = JSON.stringify(data, null, 2);
    //             const blob = new Blob([jsonString], { type: 'application/json'});
    //             href = URL.createObjectURL(blob);
    //         }

    //         const link = document.createElement('a');
    //         link.href = href;
    //         link.download = data.title || 'download';
    //         document.body.appendChild(link);
    //         link.click();
    //         document.body.removeChild(link);

    //         if (!href.startsWith('data:')) {
    //             URL.revokeObjectURL(href);
    //         }
    //     } catch (error) {
    //         console.error("Download error:", error);
    //         alert("Failed to download file: " + error.message);
    //     }
    // }

    const handleDownloadFile = async (incomingData) => {
        try {
            // [FIX QUAN TRỌNG]: Tìm lại item gốc trong state để đảm bảo có đủ field s3Key
            // incomingData từ ResourceCard gửi lên có thể bị thiếu s3Key
            const fullItem = itemList.find(i => i.id === incomingData.id) || incomingData;

            // Nếu là Folder
            if (fullItem.type === "folder") {
                await handleDownloadFolder(fullItem.id, fullItem.title);
                return;
            }

            // Nếu là File có S3 Key (Ưu tiên dùng cái này)
            if (fullItem.s3Key) {
                // Gọi hàm getDownloadUrl (Lưu ý: Không dùng destructuring {})
                const downloadUrl = await getDownloadUrl(fullItem.s3Key, fullItem.title);
                
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = fullItem.title || 'download';
                link.target = '_blank'; // Mở tab mới cho an toàn
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                return;
            }

            // --- Phần Fallback cũ (giữ nguyên hoặc xóa nếu bạn đã chuyển hẳn sang S3) ---
            const stored = fileDataRef.current[fullItem.id];
            let href = "";
            if (stored && typeof stored === 'string' && stored.startsWith('data:')) {
                href = stored;
            } else {
                // Đây là nguyên nhân file bị corrupt trước đó (nó tạo file JSON)
                const jsonString = JSON.stringify(fullItem, null, 2);
                const blob = new Blob([jsonString], { type: 'application/json'});
                href = URL.createObjectURL(blob);
            }

            const link = document.createElement('a');
            link.href = href;
            link.download = fullItem.title || 'download';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);

            if (!href.startsWith('data:')) {
                URL.revokeObjectURL(href);
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download file: " + error.message);
        }
    }

    const handleDownloadFolder = async (folderId, folderName) => {
        try {
            // Get all files in this folder
            const filesInFolder = itemList.filter(item => item.parentId === folderId && item.type !== "folder");
            
            if (filesInFolder.length === 0) {
                alert("This folder is empty");
                return;
            }

            // Get S3 keys from files that have them
            const fileKeys = filesInFolder
                .filter(f => f.s3Key)
                .map(f => f.s3Key);

            if (fileKeys.length === 0) {
                alert("No files with S3 storage found in this folder");
                return;
            }

            // Use backend API to download as ZIP (handles download directly)
            await downloadFolderAsZip(folderName, fileKeys);
        } catch (error) {
            console.error("Folder download error:", error);
            alert("Failed to download folder: " + error.message);
        }
    }

    // -------------------- Upload helpers ------------------------------
    const formatSize = (sizeMB) => {
        if (sizeMB < 1) {
            return { size: Math.round(sizeMB * 1024), unit: 'KB' };
        }
        return { size: Math.round(sizeMB * 10) / 10, unit: 'MB' };
    }

    const sizeStringToMB = (size, unit) => {
        const num = parseFloat(size);
        if (!Number.isFinite(num)) return 0;
        if (unit === 'KB') return num / 1024;
        return num;
    }

    const getAvailableStorageSpace = () => {
        try {
            const test = '__test__';
            localStorage.setItem(test, test);
            localStorage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    };

    const clearOldFileData = (excludeIds = []) => {
        // Remove storage for files that no longer exist in itemList
        const validIds = new Set(itemList.map(item => item.id).concat(excludeIds));
        
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith(STORAGE_FILEDATA_PREFIX)) {
                const id = key.substring(STORAGE_FILEDATA_PREFIX.length);
                if (!validIds.has(id)) {
                    localStorage.removeItem(key);
                }
            }
        });
    };

    const uploadFileToS3 = async (file, uploadId) => {
        try {
            const result = await uploadFileWithPresignedUrl(file, "private-storage");
            console.log(`✓ Uploaded file to S3: ${file.name}`, result);
            return result; // Returns { key, url }
        } catch (error) {
            console.error(`✗ Failed to upload ${file.name} to S3:`, error);
            throw error;
        }
    };

    const handleFilesSelected = (fileList) => {
        const files = Array.from(fileList);
        const newErrors = [];

        files.forEach((file) => {
            const sizeMB = file.size / (1024 * 1024);
            if (sizeMB > 200) {
                newErrors.push(`${file.name} exceeds the maximum file size of 200 MB.`);
                return;
            }
            if (storageUsed + sizeMB > totalStorage) {
                newErrors.push(`Not enough storage for ${file.name}.`);
                return;
            }

            const uploadId = crypto.randomUUID();
            const uploadObj = {
                id: uploadId,
                fileName: file.name,
                sizeMB: sizeMB,
                progress: 0,
                status: 'uploading',
                file,
            };

            setUploadQueue(prev => [...prev, uploadObj]);

            // Upload file to S3 directly
            uploadFileToS3(file, uploadId)
                .then((s3Result) => {
                    // File uploaded to S3, now add to itemList with S3 metadata only
                    const { size, unit } = formatSize(sizeMB);
                    const ext = file.name.split('.').pop();
                    const newItem = {
                        id: uploadId,
                        title: file.name,
                        type: ext || 'file',
                        size: String(size),
                        size_unit: unit,
                        lastModified: new Date().toISOString(),
                        parentId: currentFolderId,
                        isPrivate: true,
                        s3Key: s3Result.key,
                        s3Url: s3Result.url
                    };
                    
                    setItemList(prev => {
                        const exists = prev.some(p => p.id === uploadId);
                        if (exists) return prev;
                        return [...prev, newItem];
                    });
                    
                    setStorageUsed(prev => Math.round((prev + sizeMB) * 100) / 100);
                    
                    // Update upload queue
                    setUploadQueue(q => 
                        q.map(u => u.id === uploadId ? { ...u, progress: 100, status: 'done' } : u)
                    );
                    
                    // Remove from queue after delay
                    setTimeout(() => {
                        setUploadQueue(q => q.filter(x => x.id !== uploadId));
                    }, 1200);
                })
                .catch((error) => {
                    console.error(`Failed to upload ${file.name}:`, error);
                    setUploadQueue(q => q.filter(x => x.id !== uploadId));
                    setUploadErrors(prev => [...prev, `Failed to upload ${file.name}: ${error.message}`]);
                });
        });

        if (newErrors.length) {
            setUploadErrors(prev => [...prev, ...newErrors]);
        }
    }

    const onDropFiles = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.dataTransfer && e.dataTransfer.files) {
            handleFilesSelected(e.dataTransfer.files);
        }
    }

    const onDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    }

    const openFilePicker = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    }

    const onFileInputChange = (e) => {
        if (e.target.files) {
            handleFilesSelected(e.target.files);
            e.target.value = null;
        }
    }

    


    return (
        <div className="">
            <Header />
                <div className="font-sans text-gray-900 bg-white p-8 max-w-7xl mx-auto">
                            
                    {/* ---- 1. Header: Profile & Messages ---- */}
                    <header className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full">
                                {/* Avatar placeholder */}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wide">JOHN DOE</h1>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                            <FaRegCommentDots className="w-5 h-5" />
                            Messages
                        </button>
                    </header>

                    {/* ---- 2. Storage Info ---- */}
                    <section className="mb-8">
                        <h2 className="text-lg font-semibold mb-3">Private Files</h2>
                        <div className="bg-primary-light border border-border-primary rounded-lg p-5">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Storage Used: {storageUsed} MB of {totalStorage} MB</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                                <div
                                    className={`h-2.5 rounded-full transition-all duration-700 ease-linear ${storagePercentage > 80 ? 'bg-red-500' : 'bg-secondary'}`}
                                    style={{ width: `${storagePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Maximum file size for new uploads: 200 MB, total storage limit: 300 MB
                        </p>
                    </section>

                    {/* ---- 2.5. Breadcrumb Navigation ---- */}
                    {currentFolderId && (
                        <div className="flex items-center gap-2 mb-6 text-sm">
                            <button 
                                onClick={handleExitFolder}
                                className="text-primary hover:text-secondary font-semibold cursor-pointer"
                            >
                                ← My Files
                            </button>
                            <span className="text-gray-400">/</span>
                            <span className="text-gray-700 font-medium">
                                {itemList.find(i => i.id === currentFolderId)?.title || "Folder"}
                            </span>
                        </div>
                    )}

                    {/* ---- 3. Tabs Navigation ---- */}
                    <nav className="flex border-b border-gray-200 mb-6">
                        <button 
                            className={`cursor-pointer py-3 px-5 text-sm font-semibold transition-colors ${
                                activeTab === "my-files" 
                                    ? "text-primary border-b-2 border-primary" 
                                    : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"
                            }`}
                            onClick={() => setActiveTab("my-files")}
                        >
                            My Files
                        </button>
                        <button 
                            className={`cursor-pointer py-3 px-5 text-sm font-semibold transition-colors ${
                                activeTab === "recent" 
                                    ? "text-primary border-b-2 border-primary" 
                                    : "text-gray-500 hover:text-gray-800 border-b-2 border-transparent"
                            }`}
                            onClick={() => setActiveTab("recent")}
                        >
                            Recent
                        </button>
                    </nav>

                    {/* ---- 4. Action Bar: Search, Filter, Buttons ---- */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="relative w-full md:w-auto">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaSearch className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="search"
                                placeholder="Search Files..."
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-primary"
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>
                        <div className="flex items-center gap-3 relative">
                            <div className="relative">
                                <button 
                                    className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg"
                                    onClick={() => setShowFilterMenu(!showFilterMenu)}
                                >
                                    <FaFilter className="w-5 h-5" />
                                    Filter
                                </button>
                                {showFilterMenu && (
                                    <div className="absolute top-12 left-0 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                                        <button 
                                            className={`block w-full px-4 py-2 text-sm text-left ${
                                                filterType === "all" ? "text-primary font-semibold" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => { setFilterType("all"); setShowFilterMenu(false); }}
                                        >
                                            All Files
                                        </button>
                                        <button 
                                            className={`block w-full px-4 py-2 text-sm text-left ${
                                                filterType === "images" ? "text-primary font-semibold" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => { setFilterType("images"); setShowFilterMenu(false); }}
                                        >
                                            Images
                                        </button>
                                        <button 
                                            className={`block w-full px-4 py-2 text-sm text-left ${
                                                filterType === "documents" ? "text-primary font-semibold" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => { setFilterType("documents"); setShowFilterMenu(false); }}
                                        >
                                            Documents
                                        </button>
                                        <button 
                                            className={`block w-full px-4 py-2 text-sm text-left ${
                                                filterType === "videos" ? "text-primary font-semibold" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => { setFilterType("videos"); setShowFilterMenu(false); }}
                                        >
                                            Videos
                                        </button>
                                        <button 
                                            className={`block w-full px-4 py-2 text-sm text-left ${
                                                filterType === "archives" ? "text-primary font-semibold" : "text-gray-700 hover:bg-gray-100"
                                            }`}
                                            onClick={() => { setFilterType("archives"); setShowFilterMenu(false); }}
                                        >
                                            Archives
                                        </button>
                                    </div>
                                )}
                            </div>
                            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg cursor-pointer hover:bg-secondary"
                                    onClick={() => toggleIsNewFolder(true)}
                            >
                                <FaFolderPlus className="w-5 h-5" />
                                New Folder
                            </button>
                            {isNewFolder && (
                                <FolderCard
                                    onCreate={handleCreateFolder}
                                    onCancel={toggleIsNewFolder}
                                />
                            )}

                            <div className="flex items-center gap-1 ml-2">
                                <button className="p-2 text-gray-500 rounded-lg cursor-pointer hover:bg-gray-100"
                                        onClick={() => handleSortList()}>
                                    <FaBars className="w-6 h-6" />
                                </button>
                                <button className="p-2 text-primary cursor-pointer bg-gray-100 rounded-lg">
                                    <FaTh className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ---- 5. Upload Area ---- */}
                    <section
                        className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8"
                        onDrop={onDropFiles}
                        onDragOver={onDragOver}
                    >
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
                            <FaUpload className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-600 mb-2">Add files by dragging and dropping them here</p>
                        <p className="text-sm text-gray-400 mb-4">OR</p>
                        <div className="flex items-center justify-center gap-4">
                            <button
                                className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold text-white bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-900"
                                onClick={openFilePicker}
                            >
                                <FaUpload className="w-5 h-5" />
                                Choose Files
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                multiple
                                className="hidden"
                                onChange={onFileInputChange}
                            />
                        </div>

                        {/* Upload queue */}
                        {uploadErrors.length > 0 && (
                            <div className="mt-4 text-left max-w-xl mx-auto">
                                {uploadErrors.map((err, idx) => (
                                    <div key={idx} className="text-sm text-red-600">{err}</div>
                                ))}
                            </div>
                        )}

                        {uploadQueue.length > 0 && (
                            <div className="mt-6 max-w-2xl mx-auto text-left space-y-3">
                                {uploadQueue.map(u => (
                                    <div key={u.id} className="bg-gray-50 p-3 rounded-md">
                                        <div className="flex justify-between items-center mb-2">
                                            <div className="text-sm font-medium">{u.fileName}</div>
                                            <div className="text-xs text-gray-500">{Math.round(u.progress)}%</div>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                            <div
                                                className={`h-2 rounded-full transition-all duration-500 ease-linear ${u.status === 'uploading' ? 'bg-primary' : 'bg-green-500'}`}
                                                style={{ width: `${u.progress}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* ---- 6. File Grid ---- */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Map filtered itemList */}
                        {displayItems.map((item) => (
                            <ResourceCard 
                                key={item.id} 
                                id={item.id}
                                type={item.type} 
                                size={item.size} 
                                size_unit={item.size_unit} 
                                title={item.title} 
                                onViewDetails={handleViewDetails}
                                onDownload={handleDownloadFile}
                                onDelete={handleDeleteItem}
                                onRename={handleRenameItem}
                            />
                        ))}

                        {/* Search not found*/}
                        {displayItems.length === 0 && !isNewFolder && (
                            <p className="text-gray-500 col-span-full text-center py-8">
                                {searchQuery ? `Could not find the item "${searchQuery}".` : "No files found."}
                            </p>
                        )}
                        {selectedItem && (
                            <FileDetails 
                                file={selectedItem} 
                                comments={selectedItem.comments || []}
                                onClose={handleCloseModal}
                                onDownload={handleDownloadFile}
                            />
                        )}
                    </section>

                    {/* ---- 7. Footer Actions ---- */}
                    {/* <footer className="flex items-center gap-4">
                        <button className="px-8 py-2.5 font-semibold text-white bg-primary rounded-lg cursor-pointer hover:bg-secondary">
                            Save Changes
                        </button>
                        <button className="px-8 py-2.5 font-semibold text-primary bg-white border border-primary rounded-lg cursor-pointer hover:bg-teal-50">
                            Cancel
                        </button>
                    </footer> */}

                </div>
            <Footer />
        </div>
    )
}
export default PrivateStorage;