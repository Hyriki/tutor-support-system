import React, { useState, useEffect } from 'react';
import { getDownloadUrl, downloadFolderAsZip } from '../../lib/s3Client';
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
    FaLock,
    FaDownload
} from 'react-icons/fa';

export default function CourseSectionStudent({ 
    sectionId,
    title, 
    description = "",
    items, 
    onViewDetails,
    onDownload
}) {
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

    const [isExpanded, toggleExpansion] = useState(false);
    const [currentItems, setCurrentItems] = useState(items);
    const [currentFolderId, setCurrentFolderId] = useState(null);

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

    const handleViewDetails = (item) => {
        // If locked, don't allow access
        if (item.isLocked) {
            return;
        }

        // If folder, navigate into it
        if (item.type?.toLowerCase() === 'folder') {
            setCurrentFolderId(item.id);
        } else {
            // If file, view details
            onViewDetails(item);
        }
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

    const handleDownload = async (e, item) => {
        e.stopPropagation();
        if (item.isLocked) return;
        
        try {
            // Folder: download as ZIP
            if (item.type?.toLowerCase() === 'folder') {
                // Get all items in THIS folder (not current view)
                const folderItems = currentItems.filter(i => i.parentId === item.id && !i.isLocked && i.s3Key);
                if (folderItems.length === 0) {
                    alert("No files in this folder");
                    return;
                }

                const fileKeys = folderItems.map(f => f.s3Key);
                await downloadFolderAsZip(item.title, fileKeys);
                // Function now handles the download directly
            } else if (item.s3Key) {
                // File: download single
                const downloadUrl = await getDownloadUrl(item.s3Key, item.title);
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = item.title;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Download error:", error);
        }
    };

    // Filter visible items only (default to visible if undefined)
    const visibleItems = getItemsInCurrentFolder().filter(item => item.isVisible !== false);

    return (
        <div className="bg-secondary-light border border-border-primary rounded-lg mb-4 select-none">
            <div className="flex justify-between items-center p-4 cursor-pointer select-none"
                onClick={() => toggleExpansion(!isExpanded)}>
                <div className="flex items-center gap-3">
                    {isExpanded ? 
                        <FaChevronDown className="text-primary bg-primary-light rounded-full p-1 w-6 h-6 hover:border-2 hover:border-primary" /> 
                        : <FaChevronRight className="text-primary bg-primary-light rounded-full p-1 w-6 h-6 hover:border-2 hover:border-primary" />
                    }
                    <h2 className="text-lg font-semibold text-blue-800">{title}</h2>
                </div>
            </div>

            <div
                className={`
                    transition-[max-height] duration-300 ease-in-out
                    overflow-hidden
                    ${isExpanded ? 'max-h-[1000px]' : 'max-h-0'}
                `}
            >
                <div className="overflow-y-auto max-h-96 px-4 pb-4 text-gray-700 divide-y divide-secondary">
                    
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

                    {visibleItems.map((item) => (
                        <div key={item.id} className="ml-8 py-3">
                            
                            <div className='flex flex-row relative items-center gap-4'>
                                {getIconElement(item.type)}
                                <h3 
                                    className={`font-semibold text-gray-800 ${!item.isLocked ? 'hover:text-blue-500 hover:underline cursor-pointer' : 'text-gray-400 cursor-not-allowed'} select-none truncate max-w-[60%]`}
                                    onClick={() => handleViewDetails(item)}
                                    title={item.title}
                                >
                                    {item.title}
                                </h3>
                                <div className='right-4 absolute flex flex-row gap-4'>
                                    {item.isLocked && (
                                        <FaLock className="w-5 h-5 text-gray-400" title="Locked" />
                                    )}
                                    {!item.isLocked && (
                                        <FaDownload 
                                            className="w-5 h-5 hover:text-blue-600 cursor-pointer" 
                                            title={item.type?.toLowerCase() === 'folder' ? 'Download folder' : 'Download'}
                                            onClick={(e) => handleDownload(e, item)}
                                        />
                                    )}
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

                    {visibleItems.length === 0 && (
                        <div className="ml-8 py-4 text-gray-500 text-sm">
                            No items available in this section.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
