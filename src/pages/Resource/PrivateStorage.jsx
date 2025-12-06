import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ResourceCard from "../../components/resource/ResourceCard";
import FileDetails from "./FileDetails";
import FolderCard from "../../components/resource/FolderCard";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import JSZip from "jszip";

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
    const handleViewDetails = (item) => {
        // If it's a folder, enter the folder
        if (item.type === "folder") {
            setCurrentFolderId(item.id);
            setSearchQuery(""); // Clear search when entering folder
            return;
        }
        const dataUrl = fileDataRef.current[item.id];
        setSelectedItem({ ...item, dataUrl });
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
    const handleDownloadFile = (data) => {
        // If it's a folder, create a zip archive
        if (data.type === "folder") {
            handleDownloadFolder(data.id, data.title);
            return;
        }

        const stored = fileDataRef.current[data.id];
        let href = "";
        if (stored && typeof stored === 'string' && stored.startsWith('data:')) {
            href = stored;
        } else {
            // fallback: export metadata as JSON
            const jsonString = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonString], { type: 'application/json'});
            href = URL.createObjectURL(blob);
        }

        const link = document.createElement('a');
        link.href = href;
        link.download = data.title || 'download';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        if (!href.startsWith('data:')) {
            URL.revokeObjectURL(href);
        }
    }

    const handleDownloadFolder = async (folderId, folderName) => {
        const zip = new JSZip();
        
        // Get all files in this folder
        const filesInFolder = itemList.filter(item => item.parentId === folderId && item.type !== "folder");
        
        if (filesInFolder.length === 0) {
            alert("This folder is empty");
            return;
        }

        let successCount = 0;
        let failedFiles = [];
        
        // Add each file to the zip
        for (const file of filesInFolder) {
            const dataUrl = fileDataRef.current[file.id];
            if (dataUrl && typeof dataUrl === 'string' && dataUrl.startsWith('data:')) {
                try {
                    // Convert data URL to blob
                    const response = await fetch(dataUrl);
                    const blob = await response.blob();
                    zip.file(file.title, blob);
                    successCount++;
                    console.log(`Added ${file.title} to zip`);
                } catch (err) {
                    console.warn(`Failed to add ${file.title} to zip:`, err);
                    failedFiles.push(file.title);
                }
            } else {
                console.warn(`No data found for ${file.title} (id: ${file.id})`);
                failedFiles.push(file.title);
            }
        }

        if (successCount === 0) {
            alert("No files could be added to the archive. Files may not have been stored.");
            return;
        }

        // Generate and download the zip
        try {
            const blob = await zip.generateAsync({ type: "blob" });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = `${folderName}.zip`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(link.href);
            
            if (failedFiles.length > 0) {
                console.warn(`Zip created but ${failedFiles.length} files were missing: ${failedFiles.join(', ')}`);
                alert(`Archive created with ${successCount} file(s). ${failedFiles.length} file(s) were not stored.`);
            }
        } catch (error) {
            console.error("Error creating zip file:", error);
            alert("Failed to create zip archive");
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

    const saveSmallFileData = (id, file, sizeMB) => {
        return new Promise((resolve, reject) => {
            // persist file payloads up to 20MB into localStorage to avoid quota issues
            if (sizeMB > 20) {
                fileDataRef.current[id] = null;
                console.warn(`File ${file.name} exceeds 20MB storage limit. Only metadata will be saved.`);
                resolve(false); // Return false but don't reject
                return;
            }
            
            const reader = new FileReader();
            reader.onload = () => {
                try {
                    const dataUrl = reader.result;
                    fileDataRef.current[id] = dataUrl;
                    // Store individual file data
                    localStorage.setItem(`${STORAGE_FILEDATA_PREFIX}${id}`, dataUrl);
                    console.log(`✓ Saved file data for ${file.name}`);
                    resolve(true);
                } catch (e) {
                    if (e.name === 'QuotaExceededError') {
                        console.warn(`✗ Storage quota exceeded for ${file.name}. File will not be saved.`);
                        fileDataRef.current[id] = null;
                        reject(new Error(`Storage full! Cannot save "${file.name}".`));
                    } else {
                        console.error("Error saving file data:", e);
                        fileDataRef.current[id] = null;
                        reject(e);
                    }
                }
            }
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

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

            // simulate upload progress; finalize within one interval
            const interval = setInterval(() => {
                setUploadQueue((prevQueue) => {
                    let didFinish = false;
                    const nextQueue = prevQueue.map(u => {
                        if (u.id !== uploadId) return u;
                        const increment = Math.random() * 20 + 5; // 5 - 25
                        const nextProgress = Math.min(100, u.progress + increment);
                        if (nextProgress >= 100) {
                            didFinish = true;
                        }
                        return { ...u, progress: nextProgress };
                    });

                    if (!didFinish) return nextQueue;

                    clearInterval(uploadIntervals.current[uploadId]);
                    delete uploadIntervals.current[uploadId];

                    // finalize file into storage - first save data, then add to list
                    const item = nextQueue.find(u => u.id === uploadId) || uploadObj;
                    
                    if (item.file) {
                        saveSmallFileData(uploadId, item.file, item.sizeMB)
                            .then((saved) => {
                                // Only add to itemList if file was saved successfully
                                const { size, unit } = formatSize(item.sizeMB);
                                const ext = item.fileName.split('.').pop();
                                const newItem = {
                                    id: uploadId,
                                    title: item.fileName,
                                    type: ext || 'file',
                                    size: String(size),
                                    size_unit: unit,
                                    lastModified: new Date().toISOString(),
                                    parentId: currentFolderId,
                                    isPrivate: true
                                };
                                setItemList(prev => {
                                    const exists = prev.some(p => p.id === uploadId || (p.title?.toLowerCase() === newItem.title.toLowerCase() && p.size === newItem.size && p.size_unit === newItem.size_unit));
                                    if (exists) return prev;
                                    return [...prev, newItem];
                                });
                                setStorageUsed(prev => Math.round((prev + item.sizeMB) * 100) / 100);
                            })
                            .catch((error) => {
                                // Don't add file to list if storage failed
                                console.error(`Failed to save ${item.fileName}:`, error.message);
                                alert(error.message + ' File not added to storage.');
                            });
                    }

                    const updated = nextQueue.map(u => u.id === uploadId ? { ...u, progress: 100, status: 'done' } : u);
                    setTimeout(() => {
                        setUploadQueue((q) => q.filter(x => x.id !== uploadId));
                    }, 1200);
                    return updated;
                });
            }, 500 + Math.random() * 500);

            uploadIntervals.current[uploadId] = interval;
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