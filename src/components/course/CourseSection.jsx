import React from 'react';
import {
    FaPlayCircle,      // For the "General" section (might need adjustment if a different icon is preferred)
    FaChevronDown,    // For expanded sections
    FaChevronRight,   // For collapsed sections (not shown but good for toggle)
    FaTh,             // Grid icon for "Reorder sections"
    FaCog,            // Settings icon
    FaTimes,          // Close/delete icon
    FaFileAlt,        // Document icon for chapters
    FaLock,           // Lock icon
    FaEye,            // Eye icon for visibility
    FaLink,           // Link icon
    FaFolderOpen,      // Folder icon for implementation
    FaFolder,
    FaFilePdf,
    FaFileVideo,
    FaFileImage,
    FaFile,
    FaEyeSlash,
    FaUnlock,
} from 'react-icons/fa';
import { useState } from 'react'

export default function CourseSection({ title, items }) {

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
            case "mp4":
            case "mov":
            case "avi":
                IconComponent = FaFileVideo;
                iconColor = "text-purple-500";
                break;
            case "jpg":
            case "jpeg":
            case "png":
            case "svg":
            case "gif":
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
    const handleToggleVisibility = (itemId) => {
        setCurrentItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, isVisible: !item.isVisible } : item
            )
        );
    };
    const handleToggleLock = (itemId) => {
        setCurrentItems(prevItems =>
            prevItems.map(item =>
                item.id === itemId ? { ...item, isLocked: !item.isLocked } : item
            )
        );
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
                    <FaTh className="w-5 h-5 hover:text-gray-800 cursor-pointer" title="Reorder sections" />
                    <FaCog className="w-5 h-5 hover:text-gray-800 cursor-pointer" title="Settings" />
                    <FaTimes className="w-5 h-5 hover:text-red-500 cursor-pointer" title="Delete section" />
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

                    {currentItems?.map((item) => (
                        <div key={item.id} className="ml-8 py-3"> {/* Use item.id for keys! */}
                            
                            <div className='flex flex-row relative items-center gap-4'>
                                {getIconElement(item.type)}
                                <h3 className="font-semibold text-gray-800 hover:text-blue-500 hover:underline cursor-pointer select-none">{item.title}</h3>
                                <div className='right-4 absolute flex flex-row gap-4'>
                                    {item.isLocked ? 
                                        <FaLock className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleLock(item.id)}/> :
                                        <FaUnlock className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleLock(item.id)}/>
                                    }
                                    {item.isVisible ?
                                        <FaEye className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleVisibility(item.id)}/> :
                                        <FaEyeSlash className={`w-5 h-5 hover:text-gray-800 cursor-pointer`} onClick={() => handleToggleVisibility(item.id)}/>
                                    }
                                    
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

                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}