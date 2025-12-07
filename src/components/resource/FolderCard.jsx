import { useState } from "react";
import { FaFolder } from "react-icons/fa";

const FolderCard = ({ onCreate, onCancel }) => {
    const [folderName, setFolderName] = useState("New Folder");
    const [error, setError] = useState("");

    const handleCreate = () => {
        if (!folderName.trim()) {
            setError("Folder name is required");
            return;
        }
        setError("");
        onCreate(folderName);
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
                <div className="mb-4">
                    <div className="flex items-center">
                        <FaFolder className="w-10 h-10 text-primary mr-3" />
                        <input
                            type="text"
                            value={folderName}
                            onChange={(e) => {
                                setFolderName(e.target.value);
                                if (error) setError("");
                            }}
                            onKeyDown={handleKeyDown}
                            className={`font-semibold text-sm text-black truncate w-full border-b-2 focus:outline-none ${
                                error ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-primary'
                            }`}
                            autoFocus
                            onFocus={(e) => e.target.select()} 
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mt-1 ml-13">{error}</p>}
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