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
    FaFile 
} from 'react-icons/fa';

import { useState } from 'react'
import FileDetails from '../../pages/Resource/FileDetails';

const ResourceCard = ({ type, size, size_unit, title, onViewDetails }) => {
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
        // Group common video types
        case "mp4":
        case "mov":
        case "avi":
            Icon = FaFileVideo;
            iconColor = "text-purple-500";
            break;
        // Group common image types
        case "jpg":
        case "jpeg":
        case "png":
        case "svg":
        case "gif":
            Icon = FaFileImage;
            iconColor = "text-green-500";
            break;
        default:
            Icon = FaFile;
            iconColor = "text-gray-500";
            break;
    }

    const item = {
        "title" : title,
        "type" : type,
        "size" : size,
    }

    const [dropActive, setActive] = useState(false);

    const handleViewClick = () => {
        onViewDetails(item); // Tell the parent to open the modal
        setActive(false);    // Close the dropdown
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
                <FaDownload className="w-5 h-5 cursor-pointer hover:text-gray-800" />
                <FaShareAlt className="w-5 h-5 cursor-pointer hover:text-gray-800" />
                <FaEllipsisV className="w-5 h-5 cursor-pointer hover:text-gray-800" onClick={() => setActive(!dropActive)} />
            </div>
            {/* Dropdown Menu (Statically shown as in the image) */}
            {dropActive && 
                <div 
                    className="absolute top-12 right-5 w-40 bg-white border border-gray-200 rounded-lg shadow-xl z-10"
                    
                >
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={handleViewClick}>View</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Download</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Move</button>
                    <button className="block w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Delete</button>
                    <button className="block w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Details</button>
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