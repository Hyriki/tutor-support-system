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
    FaFile,
    FaFileWord,
    FaFileExcel,
    FaFileArchive,
    FaFileCode,
    FaFileAlt
} from 'react-icons/fa';

import { useState } from 'react'
import FileDetails from '../../pages/Resource/FileDetails';

const ResourceCard = ({ id, type, size, size_unit, title, onViewDetails, onDownload, onDelete, onRename }) => {
    const lowerType = type.toLowerCase();
    let Icon;
    let iconColor;
    switch(lowerType) {
        case "folder":
            Icon = FaFolder;
            iconColor = "text-primary";
            break;
        case "pdf":
            Icon = FaFilePdf;
            iconColor = "text-orange-500";
            break;
        // Word documents
        case "doc":
        case "docx":
            Icon = FaFileWord;
            iconColor = "text-blue-600";
            break;
        // Excel spreadsheets
        case "xls":
        case "xlsx":
            Icon = FaFileExcel;
            iconColor = "text-green-600";
            break;
        // Compressed files
        case "zip":
        case "rar":
        case "7z":
        case "tar":
        case "gz":
            Icon = FaFileArchive;
            iconColor = "text-yellow-600";
            break;
        // Code files
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
            Icon = FaFileCode;
            iconColor = "text-gray-700";
            break;
        // Text files
        case "txt":
        case "md":
        case "csv":
        case "log":
            Icon = FaFileAlt;
            iconColor = "text-gray-600";
            break;
        // Video types
        case "mp4":
        case "mov":
        case "avi":
        case "mkv":
        case "flv":
        case "wmv":
            Icon = FaFileVideo;
            iconColor = "text-purple-500";
            break;
        // Image types
        case "jpg":
        case "jpeg":
        case "png":
        case "svg":
        case "gif":
        case "webp":
        case "ico":
            Icon = FaFileImage;
            iconColor = "text-green-500";
            break;
        default:
            Icon = FaFile;
            iconColor = "text-gray-500";
            break;
    }

    const item = {
        id,
        "title" : title,
        "type" : type,
        "size" : size,
        "size_unit": size_unit,
    }

    const [dropActive, setActive] = useState(false);

    const handleViewClick = () => {
        onViewDetails(item); // Tell the parent to open the modal
        setActive(false);    // Close the dropdown
    }
    const handleDownload = () => {
        onDownload(item);
        setActive(false);
    }
    const handleDelete = () => {
        if (onDelete) {
            const ok = window.confirm(`Delete "${title}"?`);
            if (ok) onDelete(id);
        }
        setActive(false);
    }
    const handleRename = () => {
        if (!onRename) return;
        const next = window.prompt("Rename to:", title);
        if (next && next.trim()) {
            onRename(id, next.trim());
        }
        setActive(false);
    }

    return (
        <div className="relative group border border-gray-200 rounded-lg p-5 select-none cursor-pointer 
                        transition-transform duration-200 
                        hover:scale-105
                        hover:border-gray-500
                        hover:z-10 "
            onMouseLeave={() => setActive(false)}
        >
            {/* Action icons */}
            <div className="absolute hidden top-5 right-5 group-hover:flex items-center gap-3 text-gray-500">
                <FaDownload className="w-5 h-5 cursor-pointer hover:text-gray-800" onClick={handleDownload}/>
                <FaShareAlt className="w-5 h-5 cursor-pointer hover:text-gray-800" />
                <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-gray-800" onClick={() => setActive(!dropActive)} />
            </div>
            {/* Dropdown Menu (Statically shown as in the image) */}
            {dropActive && 
                <div 
                    className="absolute top-12 right-5 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                    
                >
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleViewClick}>View</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleDownload}>Download</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleRename}>Rename</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</button>
                    <button className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100" onClick={handleDelete}>Delete</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleViewClick}>Details</button>
                </div>
            }

            <Icon className={`w-12 h-12 ${iconColor} mb-4`} />
            <h3 className="font-semibold text-sm truncate mb-1">{title}</h3>
            {lowerType === "folder" ? 
                <p className="text-xs text-gray-500">Folder</p> :
                <p className="text-xs text-gray-500">{size} {size_unit}</p>
            }
            
        </div>
    )
}
export default ResourceCard