import { useState } from "react";
import { FaFolder } from "react-icons/fa";

const FolderCard = ({ onCreate, onCancel }) => {
    const [folderName, setFolderName] = useState("New Folder");

    const handleCreate = () => {
        if (folderName.trim()) {
            onCreate(folderName);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            handleCreate();
        } else if (e.key === 'Escape') {
            onCancel();
        }
    };

    return (
        <div className=" rounded-lg p-5  shadow-lg fixed inset-0 z-10 flex items-center justify-center bg-black/20">
            <div className="relative w-0.7 max-w-6xl p-6 bg-white border-2 border-primary rounded-lg shadow-xl m-8">
                <div className="flex items-center mb-4">
                    <FaFolder className="w-10 h-10 text-primary mr-3" />
                    <input
                        type="text"
                        value={folderName}
                        onChange={(e) => setFolderName(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="font-semibold text-sm text-black truncate w-full border-b-2 border-gray-300 focus:border-primary focus:outline-none"
                        autoFocus
                        onFocus={(e) => e.target.select()} 
                    />
                </div>
                <div className="flex justify-end gap-2">
                    <button 
                        onClick={() => onCancel(false)}
                        className="px-4 py-1 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleCreate}
                        className="px-4 py-1 text-sm font-medium text-white bg-primary rounded-lg hover:bg-secondary"
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FolderCard