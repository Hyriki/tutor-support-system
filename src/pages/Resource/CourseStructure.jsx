import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CourseSection from '../../components/course/CourseSection';
import FileDetails from './FileDetails';
import FolderCard from '../../components/resource/FolderCard';
import { FaPlus, FaTimes, FaGripVertical } from 'react-icons/fa';
import { uploadFileWithPresignedUrl, deleteFromS3, getS3FileUrl } from '../../lib/s3Client';

import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COURSE_STORAGE_KEY = "tss_course_sections_v1";

// Deduplicate items within each section by id
const dedupeSections = (sections) =>
    (sections || []).map(sec => {
        const seen = new Set();
        const items = (sec.items || []).filter(item => {
            if (!item?.id) return true;
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
        return { ...sec, items };
    });

const courseTitle = "Software Engineering";
const courseID = "C03001";
const lecturer = "Tran Truong Tan Phat";
const className = "CC04 - CC05";

    


export default function CourseStructure() {
    const navigate = useNavigate();
    const [sections, setSections] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const [currentSectionId, setCurrentSectionId] = useState(null);
    const [isCreatingFolder, setIsCreatingFolder] = useState(false);
    const [uploadQueue, setUploadQueue] = useState([]);
    const [isCreatingSection, setIsCreatingSection] = useState(false);
    const [editingSection, setEditingSection] = useState(null);
    const [currentFolderIdForCreate, setCurrentFolderIdForCreate] = useState(null);
    const [dragSectionId, setDragSectionId] = useState(null);
    const uploadIntervals = useRef({});
    const fileDataRef = useRef({});

    // Load sections from localStorage
    useEffect(() => {
        const saved = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || "null");
        if (saved && saved.length > 0) {
            setSections(dedupeSections(saved));
        } else {
            setSections([]);
        }

        // S3 URLs are already stored in items, no need to load from localStorage
    }, []);

    // Save sections to localStorage
    useEffect(() => {
        if (sections.length > 0) {
            localStorage.setItem(COURSE_STORAGE_KEY, JSON.stringify(sections));
        }
    }, [sections]);

    const handleViewDetails = (item) => {
        if (item.type?.toLowerCase() === 'folder') {
            setCurrentSectionId(item.sectionId);
            return;
        }
        // Use S3 URL if available, otherwise fall back to localStorage
        const dataUrl = item.s3Url || fileDataRef.current[item.id];
        setSelectedItem({ ...item, dataUrl });
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleCreateSection = (title, description) => {
        const newSection = {
            sectionId: `sec_${crypto.randomUUID()}`,
            title: title || "New Section",
            description: description || "",
            items: []
        };
        setSections(prev => [...prev, newSection]);
        setIsCreatingSection(false);
    };

    const handleEditSection = (sectionId, title, description) => {
        setSections(prev => prev.map(sec =>
            sec.sectionId === sectionId
                ? { ...sec, title, description }
                : sec
        ));
        setEditingSection(null);
    };

    const handleDeleteSection = async (sectionId) => {
        if (window.confirm("Delete this section and all its contents?")) {
            try {
                const section = sections.find(s => s.sectionId === sectionId);
                // Delete all S3 files in this section
                for (const item of section?.items || []) {
                    if (item?.s3Key) {
                        await deleteFromS3(item.s3Key);
                    }
                    delete fileDataRef.current[item.id];
                }
                setSections(prev => prev.filter(sec => sec.sectionId !== sectionId));
            } catch (error) {
                console.error("Delete section error:", error);
                alert("Failed to delete section: " + error.message);
            }
        }
    };

    const handleCreateFolder = (sectionId, folderName, parentFolderId = null) => {
        const newFolder = {
            id: crypto.randomUUID(),
            title: folderName,
            type: "folder",
            isLocked: false,
            isVisible: true,
            parentId: parentFolderId,
            sectionId
        };
        setSections(prev => prev.map(sec => 
            sec.sectionId === sectionId
                ? { ...sec, items: [...(sec.items || []), newFolder] }
                : sec
        ));
        setIsCreatingFolder(false);
    };

    const handleUploadFiles = async (sectionId, fileList, parentFolderId = null) => {
        const files = Array.from(fileList);
        for (const file of files) {
            const sizeMB = file.size / (1024 * 1024);
            const uploadId = crypto.randomUUID();
            const uploadObj = {
                id: uploadId,
                fileName: file.name,
                sizeMB,
                progress: 0,
                status: 'uploading',
                file,
                sectionId
            };

            setUploadQueue(prev => [...prev, uploadObj]);

            try {
                // Simulate upload progress
                const interval = setInterval(() => {
                    setUploadQueue(prevQueue => {
                        const nextQueue = prevQueue.map(u =>
                            u.id === uploadId ? { ...u, progress: Math.min(90, u.progress + Math.random() * 15) } : u
                        );
                        return nextQueue;
                    });
                }, 300);

                // Upload file to S3 via backend (no CORS issues)
                const uploadResult = await uploadFileWithPresignedUrl(file);
                clearInterval(interval);

                const ext = file.name.split('.').pop();
                const newItem = {
                    id: uploadId,
                    title: file.name,
                    type: ext || 'file',
                    size: `${sizeMB.toFixed(2)} MB`,
                    lastModified: new Date().toISOString(),
                    isLocked: false,
                    isVisible: true,
                    parentId: parentFolderId,
                    s3Key: uploadResult.key,
                    s3Url: uploadResult.url
                };

                setSections(prev => prev.map(sec => {
                    if (sec.sectionId !== sectionId) return sec;
                    const seen = new Set();
                    const items = [...(sec.items || []), newItem].filter(it => {
                        if (!it?.id) return true;
                        if (seen.has(it.id)) return false;
                        seen.add(it.id);
                        return true;
                    });
                    return { ...sec, items };
                }));

                setUploadQueue(prevQueue => prevQueue.map(u => 
                    u.id === uploadId ? { ...u, progress: 100, status: 'done' } : u
                ));
                setTimeout(() => {
                    setUploadQueue(q => q.filter(x => x.id !== uploadId));
                }, 1200);
            } catch (error) {
                console.error("Upload error:", error);
                setUploadQueue(prevQueue => prevQueue.map(u => 
                    u.id === uploadId ? { ...u, status: 'error', error: error.message } : u
                ));
            }
        }
    };

    const handleDeleteItem = async (sectionId, itemId) => {
        if (window.confirm("Delete this item?")) {
            try {
                // Find the item to get S3 key
                const section = sections.find(s => s.sectionId === sectionId);
                const item = section?.items?.find(i => i.id === itemId);
                
                // If folder, delete all files inside recursively
                if (item?.type?.toLowerCase() === 'folder') {
                    const deleteItemsInFolder = (parentId) => {
                        const childItems = section.items.filter(i => i.parentId === parentId);
                        childItems.forEach(async (child) => {
                            if (child.type?.toLowerCase() === 'folder') {
                                deleteItemsInFolder(child.id);
                            } else if (child.s3Key) {
                                await deleteFromS3(child.s3Key);
                            }
                        });
                    };
                    deleteItemsInFolder(itemId);
                } else if (item?.s3Key) {
                    // Delete from S3 if it has an s3Key
                    await deleteFromS3(item.s3Key);
                }

                delete fileDataRef.current[itemId];
                
                setSections(prev => prev.map(sec => 
                    sec.sectionId === sectionId
                        ? { ...sec, items: sec.items.filter(i => i.id !== itemId && i.parentId !== itemId) }
                        : sec
                ));
            } catch (error) {
                console.error("Delete error:", error);
                alert("Failed to delete item: " + error.message);
            }
        }
    };

    const handleUpdateItem = (sectionId, updatedItem) => {
        setSections(prev => prev.map(sec => 
            sec.sectionId === sectionId
                ? { ...sec, items: sec.items.map(item => item.id === updatedItem.id ? updatedItem : item) }
                : sec
        ));
    };

    // Drag-and-drop reorder sections
    const handleDragStart = (sectionId) => setDragSectionId(sectionId);
    const handleDragEnd = () => setDragSectionId(null);
    const handleDragOver = (e, overSectionId) => {
        e.preventDefault();
        if (!dragSectionId || dragSectionId === overSectionId) return;
        setSections(prev => {
            const from = prev.findIndex(s => s.sectionId === dragSectionId);
            const to = prev.findIndex(s => s.sectionId === overSectionId);
            if (from === -1 || to === -1 || from === to) return prev;
            const next = [...prev];
            const [moved] = next.splice(from, 1);
            next.splice(to, 0, moved);
            return next;
        });
    };

    return (
        <div>
            <Header/>
            <div className="font-sans min-h-screen p-8 text-gray-800">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">{courseTitle} ({courseID})</h1>
                        <p className="text-lg font-medium text-gray-700">{lecturer} [{className}]</p>
                    </div>
                    <button 
                        onClick={() => navigate("/courses/student")}
                        className='px-5 py-2 bg-gray-100 cursor-pointer'
                        >
                    </button>
                    <button 
                        onClick={() => setIsCreatingSection(true)}
                        className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition duration-200 flex items-center gap-2"
                    >
                        <FaPlus className="w-4 h-4" />
                        Create Section
                    </button>
                </div>
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    {sections.map((section) => (
                        <div
                            key={section.sectionId}
                            onDragOver={(e) => handleDragOver(e, section.sectionId)}
                            className={`relative rounded-lg ${dragSectionId === section.sectionId ? 'ring-2 ring-primary' : ''}`}
                        >
                            <CourseSection 
                                sectionId={section.sectionId}
                                title={section.title} 
                                description={section.description || ""}
                                items={section.items} 
                                dragHandle={(
                                    <div
                                        draggable
                                        onDragStart={() => handleDragStart(section.sectionId)}
                                        onDragEnd={handleDragEnd}
                                        className="text-gray-400 hover:text-gray-600 cursor-grab"
                                        title="Drag to reorder"
                                    >
                                        <FaGripVertical className="w-5 h-5" />
                                    </div>
                                )}
                                onViewDetails={handleViewDetails}
                                onDelete={() => handleDeleteSection(section.sectionId)}
                                onEdit={() => setEditingSection(section)}
                                onAddFolder={(folderParentId) => {
                                    setCurrentSectionId(section.sectionId);
                                    setCurrentFolderIdForCreate(folderParentId);
                                    setIsCreatingFolder(true);
                                }}
                                onUploadFiles={(files, parentFolderId) => handleUploadFiles(section.sectionId, files, parentFolderId)}
                                onDeleteItem={(itemId) => handleDeleteItem(section.sectionId, itemId)}
                                onUpdateItem={handleUpdateItem}
                                uploadQueue={uploadQueue.filter(u => u.sectionId === section.sectionId)}
                            />
                        </div>
                    ))}
                </div>
            </div>
            <Footer/>

            {/* Modals */}
            {selectedItem && (
                <FileDetails 
                    file={selectedItem} 
                    comments={selectedItem.comments || []}
                    onClose={handleCloseModal}
                />
            )}

            {isCreatingFolder && (
                <FolderCard
                    onCreate={(name) => handleCreateFolder(currentSectionId, name, currentFolderIdForCreate)}
                    onCancel={() => {
                        setIsCreatingFolder(false);
                        setCurrentFolderIdForCreate(null);
                    }}
                />
            )}

            {isCreatingSection && (
                <SectionModal
                    onSave={handleCreateSection}
                    onCancel={() => setIsCreatingSection(false)}
                />
            )}

            {editingSection && (
                <SectionModal
                    section={editingSection}
                    onSave={(title, desc) => handleEditSection(editingSection.sectionId, title, desc)}
                    onCancel={() => setEditingSection(null)}
                />
            )}
        </div>
    );
}

// Section Create/Edit Modal Component
function SectionModal({ section, onSave, onCancel }) {
    const [title, setTitle] = useState(section?.title || "");
    const [description, setDescription] = useState(section?.description || "");
    const [error, setError] = useState("");

    const handleSave = () => {
        if (!title.trim()) {
            setError("Title is required");
            return;
        }
        setError("");
        onSave(title, description);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl p-6">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">
                        {section ? "Edit Section" : "Create Section"}
                    </h2>
                    <FaTimes 
                        className="w-6 h-6 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={onCancel}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Section Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => {
                            setTitle(e.target.value);
                            if (error) setError("");
                        }}
                        placeholder="e.g., Module 1: Introduction"
                        className={`w-full px-4 py-2 border text-black rounded-lg focus:outline-none focus:ring-2 ${
                            error ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:ring-primary'
                        }`}
                        autoFocus
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                </div>

                <div className="mb-6">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description (Optional)
                    </label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of this section..."
                        rows={4}
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                <div className="flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-secondary"
                    >
                        {section ? "Save Changes" : "Create Section"}
                    </button>
                </div>
            </div>
        </div>
    );
}
