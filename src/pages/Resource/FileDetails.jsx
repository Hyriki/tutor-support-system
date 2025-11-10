import React, { useState } from 'react';
import Header from '../../components/header/Header';
import Footer from '../../components/footer/Footer';
import { 
    FaTimes, 
    FaDownload, 
    FaPrint, 
    FaChevronLeft, 
    FaChevronRight 
} from 'react-icons/fa';

// --- Sample Data (You would pass this in as props) ---

const sampleFile = {
    title: "SE - CHAPTER 6",
    type: "PDF Document",
    size: "2.5 MB",
    lastModified: "2024-07-25 10:30 AM",
    totalPages: 5,
    // A placeholder for the preview image
    previewUrl: "https://i.imgur.com/bWSIKk8.png" 
};

const sampleComments = [
    {
        id: 1,
        author: "John Doe",
        timestamp: "2 hours ago",
        text: "This has some nice notes!",
        isOnline: true
    },
    {
        id: 2,
        author: "Jane Doe",
        timestamp: "1 day ago",
        text: "Love the lessons!",
        isOnline: false
    }
];

// --- The Main Component ---

export default function FileDetails({ file = sampleFile, comments = sampleComments, onClose }) {
    
    const [currentPage, setCurrentPage] = useState(1);
    const [newComment, setNewComment] = useState("");

    const handlePostComment = () => {
        if (newComment.trim()) {
            // Add your comment posting logic here
            console.log("Posting comment:", newComment);
            setNewComment("");
        }
    };

    const handleChangePage = (amount) => {
        setCurrentPage(prev => Math.max(1, prev + amount))
    }

    return (
        // Modal Overlay
        <div>
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20">
                
                {/* Modal Content */}
                <div className="relative w-full max-w-6xl p-6 bg-white rounded-lg shadow-xl m-8">
                    
                    {/* --- Header --- */}
                    <div className="flex items-start justify-between pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{file.title}</h2>
                            <p className="text-sm text-gray-500">
                                {file.type} | {file.size} | Last modified: {file.lastModified}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                            <FaDownload className="w-5 h-5 cursor-pointer hover:text-primary" title="Download" />
                            <FaPrint className="w-5 h-5 cursor-pointer hover:text-primary" title="Print" />
                            <FaTimes 
                                className="w-6 h-6 cursor-pointer hover:text-red-500" 
                                title="Close"
                                onClick={onClose} 
                            />
                        </div>
                    </div>

                    {/* --- Main Body (Viewer + Sidebar) --- */}
                    <div className="flex flex-col md:flex-row gap-6 pt-6">
                        
                        {/* Column 1: Document Viewer */}
                        <div className="grow bg-gray-100 rounded-lg p-4 flex flex-col justify-between">
                            {/* Document Preview Area */}
                            <div className="grow flex items-center justify-center">
                                {/* In a real app, this would be a <Document> from react-pdf or an <iframe> */}
                                <img 
                                    src={file.previewUrl} 
                                    alt="File preview" 
                                    className="object-contain max-h-[60vh] border rounded-md shadow-sm"
                                />
                            </div>
                            
                            {/* Pagination */}
                            <div className="flex items-center justify-between p-4 bg-white rounded-md mt-4 shadow-inner">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-default cursor-pointer"
                                        onClick={() => handleChangePage(-1)}
                                        disabled={currentPage === 1}
                                >
                                    <FaChevronLeft />
                                    Previous
                                </button>
                                <span className="text-sm text-gray-600">
                                    Page <span className="font-semibold">{currentPage}</span> of {file.totalPages}
                                </span>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-default cursor-pointer"
                                        onClick={() => handleChangePage(+1)}
                                        disabled={currentPage === file.totalPages}
                                >
                                    Next
                                    <FaChevronRight />
                                </button>
                            </div>
                        </div>

                        {/* Column 2: Sidebar (Info + Comments) */}
                        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6">
                            
                            {/* File Information Card */}
                            <div className="p-4 bg-gray-50 border rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">File Information</h3>
                                <div className="space-y-2 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Type:</span>
                                        <span className="font-medium text-gray-800">{file.type}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Size:</span>
                                        <span className="font-medium text-gray-800">{file.size}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Last-Modified:</span>
                                        <span className="font-medium text-gray-800">{file.lastModified}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Comments Card */}
                            <div className="p-4 bg-gray-50 border rounded-lg grow flex flex-col">
                                <h3 className="text-lg font-semibold text-gray-800 mb-4">Comments</h3>
                                
                                {/* Comment List */}
                                <div className="grow space-y-4 max-h-64 overflow-y-auto mb-4 pr-2">
                                    {comments.map((comment) => (
                                        <div key={comment.id} className="flex gap-3">
                                            <div className="relative">
                                                <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full font-semibold text-sm">
                                                    {comment.author.charAt(0)}
                                                </span>
                                                <span 
                                                    className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-white
                                                        ${comment.isOnline ? 'bg-green-500' : 'bg-gray-400'}`}
                                                ></span>
                                            </div>
                                            <div>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="font-semibold text-sm">{comment.author}</span>
                                                    <span className="text-xs text-gray-500">{comment.timestamp}</span>
                                                </div>
                                                <p className="text-sm text-gray-700">{comment.text}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Add Comment Form */}
                                <div className="mt-auto">
                                    <textarea 
                                        className="w-full p-2 border rounded-md text-sm"
                                        rows="3"
                                        placeholder="Add comments..."
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                    ></textarea>
                                    <button 
                                        className="w-full px-4 py-2 mt-2 font-semibold text-white bg-primary rounded-md hover:bg-secondary cursor-pointer"
                                        onClick={handlePostComment}
                                    >
                                        POST COMMENTS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}