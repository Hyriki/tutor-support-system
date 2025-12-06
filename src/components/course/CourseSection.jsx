import React, { useState, useRef, useEffect } from 'react';
import {
    FaChevronDown,
    FaChevronRight,
    FaFolder,
    FaFilePdf,
    FaFileVideo,
    FaFileImage,
    FaFile,
    FaFileWord,
    FaFileExcel,
    FaFileArchive,
    FaFileCode,
    FaFileAlt,
    FaEyeSlash,
    FaUnlock,
    FaLock,
    FaEye,
    FaEdit,
    FaTrash,
    FaFolderPlus,
    FaUpload,
    FaBold,
    FaItalic,
    FaUnderline,
    FaStrikethrough,
    FaList,
    FaListOl,
    FaTimes
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

export default function CourseSection({ 
    sectionId,
    title, 
    description = "",
    items, 
    onViewDetails, 
    onDelete, 
    onAddFolder, 
    onUploadFiles,
    onDeleteItem,
    onUpdateItem,
    onEdit,
    uploadQueue = [],
    dragHandle
}) {
    const navigate = useNavigate();
    const getIconElement = (type) => {
        const lowerType = type ? type.toLowerCase() : 'default';

        let IconComponent; 
        let iconColor;

        switch (lowerType) {
            case "folder":
                IconComponent = FaFolder;
                iconColor = "text-primary";
                break;
            case "pdf":
                IconComponent = FaFilePdf;
                iconColor = "text-orange-500";
                break;
            case "doc":
            case "docx":
                IconComponent = FaFileWord;
                iconColor = "text-blue-600";
                break;
            case "xls":
            case "xlsx":
                IconComponent = FaFileExcel;
                iconColor = "text-green-600";
                break;
            case "zip":
            case "rar":
            case "7z":
            case "tar":
            case "gz":
                IconComponent = FaFileArchive;
                iconColor = "text-yellow-600";
                break;
            case "js":
            case "ts":
            case "tsx":
            case "jsx":
            case "py":
            case "java":
            case "cpp":
            case "c":
            case "html":
            case "css":
            case "json":
            case "xml":
            case "yaml":
            case "yml":
                IconComponent = FaFileCode;
                iconColor = "text-gray-700";
                break;
            case "txt":
            case "md":
            case "csv":
            case "log":
                IconComponent = FaFileAlt;
                iconColor = "text-gray-600";
                break;
            case "mp4":
            case "mov":
            case "avi":
            case "mkv":
            case "flv":
            case "wmv":
                IconComponent = FaFileVideo;
                iconColor = "text-purple-500";
                break;
            case "jpg":
            case "jpeg":
            case "png":
            case "svg":
            case "gif":
            case "webp":
            case "ico":
                IconComponent = FaFileImage;
                iconColor = "text-green-500";
                break;
            default:
                IconComponent = FaFile;
                iconColor = "text-gray-500";
                break;
        }
        return (
            <IconComponent 
                className={`w-8 h-8 ${iconColor} mb-4`} 
            />
        );
    };

    //Toggle Expansion of Section
    const [isExpanded, toggleExpansion] = useState(false);
    const [currentItems, setCurrentItems] = useState(items);
    const [editingItem, setEditingItem] = useState(null);
    const [currentFolderId, setCurrentFolderId] = useState(null);
    const fileInputRef = useRef(null);

    // Sync items when parent updates (e.g., after uploads)
    useEffect(() => {
        setCurrentItems(items);
    }, [items]);

    // Get items in current folder (filter by parentId)
    const getItemsInCurrentFolder = () => {
        if (!currentFolderId) return currentItems.filter(item => !item.parentId);
        return currentItems.filter(item => item.parentId === currentFolderId);
    };

    // Get breadcrumb path
    const getBreadcrumbPath = () => {
        const path = [];
        let folderId = currentFolderId;
        while (folderId) {
            const folder = currentItems.find(item => item.id === folderId);
            if (folder) {
                path.unshift(folder);
                folderId = folder.parentId;
            } else {
                break;
            }
        }
        return path;
    };

    const handleToggleVisibility = (itemId) => {
        setCurrentItems(prevItems => {
            const next = prevItems.map(item =>
                item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
            );
            const updated = next.find(item => item.id === itemId);
            if (updated && onUpdateItem) onUpdateItem(sectionId, updated);
            return next;
        });
    };
    const handleToggleLock = (itemId) => {
        setCurrentItems(prevItems => {
            const next = prevItems.map(item =>
                item.id === itemId ? { ...item, isLocked: !item.isLocked } : item
            );
            const updated = next.find(item => item.id === itemId);
            if (updated && onUpdateItem) onUpdateItem(sectionId, updated);
            return next;
        });
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files.length > 0 && onUploadFiles) {
            onUploadFiles(e.target.files, currentFolderId);
        }
    };

    const handleViewDetails = (item) => {
        // Nếu là folder, navigate vào
        if (item.type?.toLowerCase() === 'folder') {
            setCurrentFolderId(item.id);
        } else {
            // Nếu là file, gọi callback onViewDetails
            onViewDetails(item);
        }
    };

    const handleNavigateToFolder = (folderId) => {
        setCurrentFolderId(folderId);
    };

    const handleBackFolder = () => {
        const breadcrumb = getBreadcrumbPath();
        if (breadcrumb.length > 0) {
            const parentFolder = breadcrumb[breadcrumb.length - 2];
            setCurrentFolderId(parentFolder?.id || null);
        } else {
            setCurrentFolderId(null);
        }
    };

    const handleEditItem = (item) => {
        setEditingItem({ ...item });
    };

    const handleSaveItemEdit = (updatedItem) => {
        setCurrentItems(prev => prev.map(item => 
            item.id === updatedItem.id ? updatedItem : item
        ));
        if (onUpdateItem) {
            onUpdateItem(sectionId, updatedItem);
        }
        setEditingItem(null);
    };
    
    return (
        <div className="bg-secondary-light border border-border-primary rounded-lg mb-4 select-none">
            <div className="flex justify-between items-center p-4 cursor-pointer select-none"
                >
                <div className="flex items-center gap-3" onClick={() => toggleExpansion(!isExpanded)}>
                    {isExpanded ? <FaChevronDown className="text-primary bg-primary-light rounded-full p-1 w-6 h-6 hover:border-2 hover:border-primary" /> 
                    : <FaChevronRight className="text-primary bg-primary-light rounded-full p-1 w-6 h-6 hover:border-2 hover:border-primary" />}
                    <h2 className="text-lg font-semibold text-blue-800">{title}</h2>
                </div>
                <div className="flex items-center gap-4 text-gray-600">
                    {dragHandle && (
                        <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}>
                            {dragHandle}
                        </div>
                    )}
                    <FaEdit className="w-5 h-5 hover:text-blue-600 cursor-pointer" title="Edit section" onClick={(e) => { e.stopPropagation(); onEdit && onEdit(); }} />
                    <FaTrash className="w-5 h-5 hover:text-red-500 cursor-pointer" title="Delete section" onClick={(e) => { e.stopPropagation(); onDelete && onDelete(); }} />
                </div>
            </div>
            {/* Content for section (can be added here if needed) */}
            <div
                className={`
                    transition-[max-height] duration-300 ease-in-out
                    overflow-hidden
                    ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}
                `}
            >
                {/* Your original content div is now inside the animator */}
                <div className="overflow-hidden px-4 pb-4 text-gray-700 divide-y divide-secondary">

                    {/* Breadcrumb Navigation */}
                    {currentFolderId && (
                        <div className="ml-8 py-2 flex items-center gap-2 text-sm">
                            <button 
                                onClick={handleBackFolder}
                                className="text-primary hover:text-secondary font-semibold"
                            >
                                ← Back
                            </button>
                            <span className="text-gray-500">
                                {getBreadcrumbPath().map((folder, idx) => (
                                    <span key={folder.id}>
                                        {idx > 0 && ' / '}
                                        {folder.title}
                                    </span>
                                ))}
                            </span>
                        </div>
                    )}

                    {getItemsInCurrentFolder()?.map((item) => (
                        <div key={item.id} className="ml-8 py-3">
                            
                            <div className='flex flex-row relative items-center gap-4'>
                                {getIconElement(item.type)}
                                <h3 
                                    className="font-semibold text-gray-800 hover:text-blue-500 hover:underline cursor-pointer select-none truncate max-w-[60%]" 
                                    onClick={() => handleViewDetails(item)}
                                    title={item.title}
                                >
                                    {item.title}
                                </h3>
                                <div className='right-4 absolute flex flex-row gap-4'>
                                    {item.isLocked ? 
                                        <FaLock className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleLock(item.id)}/> :
                                        <FaUnlock className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleLock(item.id)}/>
                                    }
                                    {item.isVisible ?
                                        <FaEye className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleVisibility(item.id)}/> :
                                        <FaEyeSlash className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleVisibility(item.id)}/>
                                    }
                                    <FaEdit className="w-5 h-5 hover:text-blue-600 cursor-pointer" onClick={() => handleEditItem(item)} />
                                    <FaTrash className="w-5 h-5 hover:text-red-500 cursor-pointer" onClick={() => onDeleteItem && onDeleteItem(item.id)} />
                                </div>
                            </div>

                            {Array.isArray(item.description) && (
                                <div className="ml-16 mt-1 pl-1">
                                    {item.description.map((line, index) => (
                                        <p key={index} className="text-sm text-gray-600">
                                            {line}
                                        </p>
                                    ))}
                                </div>
                            )}

                            {typeof item.description === 'string' && item.description && (
                                <div 
                                    className="ml-16 mt-2 pl-2 text-sm text-gray-600"
                                    style={{
                                        whiteSpace: 'pre-wrap',
                                        wordWrap: 'break-word'
                                    }}
                                >
                                    {/* Render HTML with inline styles for bullets and lists */}
                                    <style>{`
                                        .description-content ul {
                                            list-style-type: disc;
                                            margin-left: 1.5rem;
                                            padding-left: 0;
                                        }
                                        .description-content ol {
                                            list-style-type: decimal;
                                            margin-left: 1.5rem;
                                            padding-left: 0;
                                        }
                                        .description-content li {
                                            margin: 0.25rem 0;
                                        }
                                        .description-content blockquote {
                                            border-left: 4px solid #9CA3AF;
                                            padding-left: 1rem;
                                            margin: 0.5rem 0;
                                            font-style: italic;
                                            color: #6B7280;
                                        }
                                        .description-content p {
                                            margin: 0.25rem 0;
                                        }
                                    `}</style>
                                    <div 
                                        className="description-content"
                                        dangerouslySetInnerHTML={{ __html: item.description }}
                                    />
                                </div>
                            )}

                        </div>
                    ))}

                    {/* Upload Queue */}
                    {uploadQueue.length > 0 && (
                        <div className="ml-8 mt-4 space-y-2">
                            {uploadQueue.map(u => (
                                <div key={u.id} className="bg-gray-50 p-3 rounded-md">
                                    <div className="flex justify-between items-center mb-2">
                                        <div className="text-sm font-medium">{u.fileName}</div>
                                        <div className="text-xs text-gray-500">{Math.round(u.progress)}%</div>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className={`h-2 rounded-full transition-all duration-500 ${u.status === 'uploading' ? 'bg-primary' : 'bg-green-500'}`}
                                            style={{ width: `${u.progress}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Files/Folders Section */}
                    <div className="ml-8 mt-4 pt-4 border-t border-gray-200 flex gap-3">
                        <button
                            onClick={() => onAddFolder && onAddFolder(currentFolderId)}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                            <FaFolderPlus className="w-4 h-4" />
                            Add Folder
                        </button>
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-secondary"
                        >
                            <FaUpload className="w-4 h-4" />
                            Upload Files
                        </button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleFileSelect}
                        />
                    </div>
                </div>
            </div>

            {/* Edit Item Modal */}
            {editingItem && (
                <ItemEditModal
                    item={editingItem}
                    onSave={handleSaveItemEdit}
                    onCancel={() => setEditingItem(null)}
                />
            )}
        </div>
    )
}

// Item Edit Modal with Rich Text Editor
function ItemEditModal({ item, onSave, onCancel }) {
    const [title, setTitle] = useState(item.title || "");
    const [description, setDescription] = useState(item.description || "");
    const editorRef = useRef(null);
    const isInitializedRef = useRef(false);

    // Initialize editor content only once
    React.useEffect(() => {
        if (editorRef.current && !isInitializedRef.current) {
            editorRef.current.innerHTML = description;
            isInitializedRef.current = true;
        }
    }, []);

    const handleFormat = (command, value = null) => {
        if (command === 'removeFormat') {
            // Select all content to clear everything
            document.execCommand('selectAll', false);
            
            // Xóa bullet list
            if (document.queryCommandState('insertUnorderedList')) {
                document.execCommand('insertUnorderedList', false);
            }
            // Xóa numbered list
            if (document.queryCommandState('insertOrderedList')) {
                document.execCommand('insertOrderedList', false);
            }
            // Xóa blockquote bằng cách format thành paragraph
            document.execCommand('formatBlock', false, '<p>');
            // Xóa tất cả format còn lại (bold, italic, underline, etc)
            document.execCommand(command, false, value);
            
            // Collapse selection về cuối
            document.execCommand('collapseToEnd', false);
        } else {
            document.execCommand(command, false, value);
        }
        editorRef.current?.focus();
    };

    const handleEditorInput = (e) => {
        setDescription(e.currentTarget.innerHTML);
    };

    const handleSave = () => {
        if (title.trim()) {
            const html = editorRef.current?.innerHTML || "";
            onSave({
                ...item,
                title: title.trim(),
                description: html
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl p-6 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold text-primary">Edit Item</h2>
                    <FaTimes 
                        className="w-6 h-6 cursor-pointer text-gray-500 hover:text-red-500" 
                        onClick={onCancel}
                    />
                </div>

                {/* Title Input */}
                <div className="mb-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Title
                    </label>
                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        placeholder="Item title..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>

                {/* Rich Text Editor Toolbar */}
                <div className="mb-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Description
                    </label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden flex flex-col">
                        <div className="bg-gray-100 border-b border-gray-300 p-2 flex flex-wrap gap-1">
                            <button
                                onClick={() => handleFormat('bold')}
                                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-sm font-semibold"
                                title="Bold (Ctrl+B)"
                                type="button"
                            >
                                <FaBold className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat('italic')}
                                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-sm italic"
                                title="Italic (Ctrl+I)"
                                type="button"
                            >
                                <FaItalic className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat('underline')}
                                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-sm underline"
                                title="Underline (Ctrl+U)"
                                type="button"
                            >
                                <FaUnderline className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat('strikethrough')}
                                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1 text-sm line-through"
                                title="Strikethrough"
                                type="button"
                            >
                                <FaStrikethrough className="w-4 h-4" />
                            </button>

                            <div className="border-l border-gray-300 mx-1"></div>

                            <button
                                onClick={() => handleFormat('insertUnorderedList')}
                                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                                title="Bullet List"
                                type="button"
                            >
                                <FaList className="w-4 h-4" />
                            </button>
                            <button
                                onClick={() => handleFormat('insertOrderedList')}
                                className="p-2 hover:bg-gray-200 rounded flex items-center gap-1"
                                title="Numbered List"
                                type="button"
                            >
                                <FaListOl className="w-4 h-4" />
                            </button>

                            <div className="border-l border-gray-300 mx-1"></div>

                            <button
                                onClick={() => handleFormat('undo')}
                                className="p-2 hover:bg-gray-200 rounded text-sm"
                                title="Undo"
                                type="button"
                            >
                                Undo
                            </button>
                            <button
                                onClick={() => handleFormat('redo')}
                                className="p-2 hover:bg-gray-200 rounded text-sm"
                                title="Redo"
                                type="button"
                            >
                                Redo
                            </button>

                            <div className="border-l border-gray-300 mx-1"></div>

                            <button
                                onClick={() => handleFormat('removeFormat')}
                                className="p-2 hover:bg-gray-200 rounded text-sm"
                                title="Clear Formatting"
                                type="button"
                            >
                                Clear
                            </button>
                        </div>

                        {/* Contenteditable Editor */}
                        <div
                            ref={editorRef}
                            contentEditable
                            suppressContentEditableWarning
                            onInput={handleEditorInput}
                            onKeyDown={(e) => {
                                // Allow default behavior for Enter, Backspace, etc.
                            }}
                            className="w-full p-4 min-h-64 focus:outline-none overflow-auto text-gray-800 leading-relaxed"
                            style={{
                                whiteSpace: 'pre-wrap',
                                wordWrap: 'break-word',
                                overflowWrap: 'break-word',
                                tabSize: '4'
                            }}
                        />
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-3 mt-6">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                        type="button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-5 py-2 text-sm font-semibold text-white bg-primary rounded-lg hover:bg-secondary"
                        type="button"
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    )
}