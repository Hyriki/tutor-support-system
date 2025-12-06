import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CourseSection from '../../components/course/CourseSection';
import FileDetails from './FileDetails';
import FolderCard from '../../components/resource/FolderCard';
import { FaPlus, FaTimes, FaGripVertical } from 'react-icons/fa';

import { useState, useRef, useEffect } from 'react';

const COURSE_STORAGE_KEY = "tss_course_sections_v1";
const COURSE_FILEDATA_PREFIX = "tss_course_file_";

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

        // Load file data
        const fileData = {};
        saved?.forEach(section => {
            section.items?.forEach(item => {
                if (item.id) {
                    const key = `${COURSE_FILEDATA_PREFIX}${item.id}`;
                    const data = localStorage.getItem(key);
                    if (data) fileData[item.id] = data;
                }
            });
        });
        fileDataRef.current = fileData;
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
        const dataUrl = fileDataRef.current[item.id];
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

    const handleDeleteSection = (sectionId) => {
        if (window.confirm("Delete this section and all its contents?")) {
            const section = sections.find(s => s.sectionId === sectionId);
            section?.items?.forEach(item => {
                const key = `${COURSE_FILEDATA_PREFIX}${item.id}`;
                localStorage.removeItem(key);
                delete fileDataRef.current[item.id];
            });
            setSections(prev => prev.filter(sec => sec.sectionId !== sectionId));
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

    const handleUploadFiles = (sectionId, fileList, parentFolderId = null) => {
        const files = Array.from(fileList);
        files.forEach(file => {
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

            const interval = setInterval(() => {
                setUploadQueue(prevQueue => {
                    let didFinish = false;
                    const nextQueue = prevQueue.map(u => {
                        if (u.id !== uploadId) return u;
                        const increment = Math.random() * 20 + 5;
                        const nextProgress = Math.min(100, u.progress + increment);
                        if (nextProgress >= 100) didFinish = true;
                        return { ...u, progress: nextProgress };
                    });

                    if (!didFinish) return nextQueue;

                    clearInterval(uploadIntervals.current[uploadId]);
                    delete uploadIntervals.current[uploadId];

                    const item = nextQueue.find(u => u.id === uploadId) || uploadObj;
                    if (item.file) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const dataUrl = e.target.result;
                            const key = `${COURSE_FILEDATA_PREFIX}${uploadId}`;
                            localStorage.setItem(key, dataUrl);
                            fileDataRef.current[uploadId] = dataUrl;

                            const ext = item.fileName.split('.').pop();
                            const newItem = {
                                id: uploadId,
                                title: item.fileName,
                                type: ext || 'file',
                                size: `${item.sizeMB.toFixed(2)} MB`,
                                lastModified: new Date().toISOString(),
                                isLocked: false,
                                isVisible: true,
                                isPrivate: true,
                                parentId: parentFolderId
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
                        };
                        reader.readAsDataURL(item.file);
                    }

                    const updated = nextQueue.map(u => 
                        u.id === uploadId ? { ...u, progress: 100, status: 'done' } : u
                    );
                    setTimeout(() => {
                        setUploadQueue(q => q.filter(x => x.id !== uploadId));
                    }, 1200);
                    return updated;
                });
            }, 200);

            uploadIntervals.current[uploadId] = interval;
        });
    };

    const handleDeleteItem = (sectionId, itemId) => {
        if (window.confirm("Delete this item?")) {
            const key = `${COURSE_FILEDATA_PREFIX}${itemId}`;
            localStorage.removeItem(key);
            delete fileDataRef.current[itemId];
            
            setSections(prev => prev.map(sec => 
                sec.sectionId === sectionId
                    ? { ...sec, items: sec.items.filter(item => item.id !== itemId) }
                    : sec
            ));
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

    const handleSave = () => {
        if (title.trim()) {
            onSave(title, description);
        }
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
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="e.g., Module 1: Introduction"
                        className="w-full px-4 py-2 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        autoFocus
                    />
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
