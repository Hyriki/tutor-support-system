// MessageWindow.js
import React, { useState } from 'react';
import {
    FaSearch,
    FaChevronDown,
    FaChevronRight,
    FaPaperPlane,
    FaTimes,
} from 'react-icons/fa';

// --- Icon Components ---
const SearchIcon = () => <FaSearch />;
const ChevronDownIcon = () => <FaChevronDown />;
const ChevronRightIcon = () => <FaChevronRight />;
const PaperPlaneIcon = () => <FaPaperPlane />;
const TimesIcon = () => <FaTimes />;

// --- Chat Data ---
const chats = [
    {
        id: 'chat-1',
        contactName: 'JOHN DO',
        lastMessage: 'Please submit the assignment before...',
        lastMessageDate: '20/10/25',
        fullHistory: [
            { sender: 'JOHN DO', message: 'Please submit the assignment before the deadline. This is a final reminder. Regards, John.', timestamp: '20/10/25 09:15'}
        ],
        unread: true,
        avatarColor: 'bg-green-200',
        avatarTextColor: 'text-green-700',
        avatarText: 'JD'
    },
    {
        id: 'chat-2',
        contactName: 'JOHN DOES',
        lastMessage: 'There will be no classes this week bec...',
        lastMessageDate: '16/10/25',
        fullHistory: [
            { sender: 'JOHN DOES', message: 'Please take your time to review lesson 4. I will prepare a make up class in the near future', timestamp: '16/10/25 11:20' },
            { sender: 'Me', message: 'Dear teacher will there be classes this week?', timestamp: '16/10/25 11:15' },
            { sender: 'JOHN DOES', message: 'There will be no classes this week because I have to attend a conference. Please use this time to revise what you have learned in class. Regards, John.', timestamp: '16/10/25 11:00' }
        ],
        unread: false,
        avatarColor: 'bg-purple-200',
        avatarTextColor: 'text-purple-700',
        avatarText: 'JD'
    },
    {
        id: 'chat-3',
        contactName: 'JOHN DID',
        lastMessage: 'Excellent! Also remember to prepare a pre...',
        lastMessageDate: '20/9/25',
        
        fullHistory: [
            { sender: 'JOHN DID', message: 'Dear students, please remember to bring your textbooks for the next session.', timestamp: '20/9/25 14:30'},
            { sender: 'Me', message: 'Understood. Will bring them.', timestamp: '20/9/25 14:45'},
            { sender: 'JOHN DID', message: 'Excellent! Also remember to prepare a presentation on the next topic', timestamp: '20/9/25 15:00'}
        ],
        unread: false,
        avatarColor: 'bg-red-200',
        avatarTextColor: 'text-red-700',
        avatarText: 'JD'
    },
    {
        id: 'chat-4',
        contactName: 'JOHN DONE',
        lastMessage: '[Reminder] Next week we will have no ...',
        lastMessageDate: '13/8/25',
        
        fullHistory: [
            { sender: 'Me', message: 'Teacher, do we have the break next week?', timestamp: '13/8/25 10:10'},
            { sender: 'JOHN DONE', message: '[Reminder] Next week we will have no class on Monday due to the national holiday.', timestamp: '13/8/25 10:15'}
        ],
        
        unread: false,
        avatarColor: 'bg-cyan-200',
        avatarTextColor: 'text-cyan-700',
        avatarText: 'JD'
    },
];

// --- Component Definition ---
export default function MessageWindow({ isOpen, onClose }) {
    
    const [activeChatId, setActiveChatId] = useState('chat-2'); 

    return (
        <>
            {/* 1. The Overlay */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={onClose} 
                ></div>
            )}
            
            {/* 2. The Window */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-full md:w-[400px] bg-white text-gray-800 shadow-2xl z-40
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                `}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200 bg-gray-50">
                    <h2 className="text-lg font-semibold">Messages</h2>
                    <button
                        onClick={onClose} 
                        className="text-gray-500 hover:text-gray-700"
                    >
                        <TimesIcon />
                    </button>
                </div>
                
                <div className="p-4 overflow-y-auto h-[calc(100%-65px)]">
                    
                    {/* Search Input */}
                    <div className="flex mb-4">
                        <div className="relative flex-1">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <SearchIcon className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search contact"
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 **rounded-md** focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        {/* <button className="bg-teal-500 text-white px-4 py-2 rounded-r-md hover:bg-teal-600 transition-colors border border-teal-500 -ml-px">
                            Search
                        </button> */}
                    </div>

                    {/* Message List (Accordion Style) */}
                    <div className="space-y-2">
                        {chats.map((chat) => (
                            <div key={chat.id} className="border border-gray-200 rounded-lg">
                                {/* Clickable Chat Item Header */}
                                <div 
                                    className="flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors rounded-lg"
                                    onClick={() => {
                                        setActiveChatId(activeChatId === chat.id ? null : chat.id);
                                    }}
                                >
                                    {/* Avatar */}
                                    <div className={`relative w-10 h-10 ${chat.avatarColor} rounded-full flex items-center justify-center mr-3 font-semibold ${chat.avatarTextColor} shrink-0`}>
                                        {chat.avatarText}
                                        {chat.unread && (
                                            <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 bg-red-500 rounded-full border-2 border-white" />
                                        )}
                                    </div>
                                    
                                    {/* Message Info */}
                                    <div className="flex-1 min-w-0"> 
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold text-sm truncate">{chat.contactName}</span>
                                            <span className="text-xs text-gray-500 shrink-0 ml-2">{chat.lastMessageDate}</span>
                                        </div>
                                        <p className={`text-sm text-gray-600 truncate ${chat.unread ? 'font-bold' : ''}`}>
                                            {chat.lastMessage}
                                        </p>
                                    </div>

                                    {/* Chevron Icon */}
                                    <div className="ml-2 shrink-0">
                                        {activeChatId === chat.id ? (
                                            <ChevronDownIcon className="text-gray-400 text-xs" />
                                        ) : (
                                            <ChevronRightIcon className="text-gray-400 text-xs" />
                                        )}
                                    </div>
                                </div>

                                {/* Expanded Content (Conditional) */}
                                {activeChatId === chat.id && (
                                    <div className="p-3 border-t border-gray-200">
                                        
                                        {/* Chat History */}
                                        <div className="space-y-3 mb-4 max-h-60 overflow-y-auto pr-2">
                                            {chat.fullHistory.map((msg, index) => (
                                                <div key={index} className={`flex ${msg.sender === 'Me' ? 'justify-end' : 'justify-start'}`}>
                                                    <div className={`p-2 rounded-lg max-w-[80%] ${msg.sender === 'Me' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-800'}`}>
                                                        <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                                        <span className={`text-xs ${msg.sender === 'Me' ? 'text-blue-200' : 'text-gray-500'} block text-right mt-1`}>
                                                            {msg.timestamp}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                        
                                        {/* Message Input and Send Button --- */}
                                        <div className="mt-4 flex items-center bg-gray-50 border border-gray-200 rounded-md p-1"> {/* Added styling for container */}
                                            <input
                                                type="text"
                                                className="flex-1 p-2 bg-transparent focus:outline-none placeholder-gray-500 text-gray-800"
                                                placeholder="Write a message..."
                                            />
                                            <button className="shrink-0 bg-primary hover:bg-secondary text-white p-2 rounded-md transition-colors ml-2">
                                                <PaperPlaneIcon className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}