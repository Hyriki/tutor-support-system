import React, { useState, useEffect, useRef } from 'react';
import {
    FaSearch,
    FaChevronLeft,
    FaPaperPlane,
    FaTimes,
    FaPlus,
    FaEllipsisV,
} from 'react-icons/fa';
import { initialData, MOCK_USER_STUDENT, MOCK_USER_TUTOR, SHARED_CHAT_ID } from './mockChatData';

const STORAGE_KEY = 'react-chat-app-data';

// --- Component Definition ---
export default function MessageWindow({ isOpen, onClose }) {
    // --- State Management ---
    const [allChatsData, setAllChatsData] = useState(() => {
        try {
            const storedData = localStorage.getItem(STORAGE_KEY);
            if (storedData) {
                return JSON.parse(storedData);
            }
            // If no data in storage, initialize with default and save it
            localStorage.setItem(STORAGE_KEY, JSON.stringify(initialData));
            return initialData;
        } catch (error) {
            console.error("Failed to parse chats from localStorage", error);
            return initialData;
        }
    });

    const [activeChatId, setActiveChatId] = useState(SHARED_CHAT_ID);
    const [messageInputs, setMessageInputs] = useState({});
    const [toast, setToast] = useState('');

    // Tab-specific user for demo purposes. This state is NOT synced.
    const [currentUser, setCurrentUser] = useState(MOCK_USER_STUDENT);

    // Group modal state
    const [groupModalOpen, setGroupModalOpen] = useState(false);
    const [newGroupName, setNewGroupName] = useState('');
    const [selectedMembers, setSelectedMembers] = useState([]);
    const [errorMsg, setErrorMsg] = useState('');
    
    // Action menu state
    const [openMenuId, setOpenMenuId] = useState(null);

    // Modals for group actions
    const [renameModal, setRenameModal] = useState({ isOpen: false, chatId: null, currentName: '' });
    const [addMembersModal, setAddMembersModal] = useState({ isOpen: false, chatId: null, members: [] });

    // Ref for auto-scrolling
    const chatHistoryRef = useRef(null);
    const menuRef = useRef(null);

    const chats = allChatsData[currentUser.id] || [];

    const getDateLabel = (date) => `${String(date.getDate()).padStart(2,'0')}/${String(date.getMonth()+1).padStart(2,'0')}/${String(date.getFullYear()).slice(-2)}`;
    const getTimeLabel = (date) => `${date.getHours()}:${String(date.getMinutes()).padStart(2,'0')}`;


    // --- Effects ---

    // Effect to listen for changes in other tabs
    useEffect(() => {
        const handleStorageChange = (e) => {
            if (e.key === STORAGE_KEY && e.newValue) {
                try {
                    // Update state without re-writing to localStorage to avoid loops
                    setAllChatsData(JSON.parse(e.newValue));
                } catch (error) {
                    console.error("Failed to parse chats from storage event", error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    // A wrapper to update state and localStorage simultaneously
    const updateAllChatsData = (newAllChatsData) => {
        setAllChatsData(newAllChatsData);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newAllChatsData));
    };

    // Effect for toast
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    // Effect for auto-scrolling
    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [activeChatId, allChatsData, currentUser]); // Run when chat changes or data updates

    // Effect to close dropdown menu on outside click
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [menuRef]);

    const toggleMember = (id) => {
        setSelectedMembers(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
    };

    const createGroup = () => {
        if (!newGroupName.trim()) {
            setErrorMsg('Please enter a group name.');
            return;
        }
        if (selectedMembers.length === 0) {
            setErrorMsg('Select at least one member.');
            return;
        }

        const groupName = newGroupName.trim();
        const initials = groupName.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() || 'G';
        
        const now = new Date();
        const dateLabel = getDateLabel(now);
        const timestamp = `${dateLabel} ${getTimeLabel(now)}`;
        
        const memberNames = selectedMembers.map(id => chats.find(c => c.id === id)?.contactName).filter(Boolean);

        // Map selected chat IDs to the user IDs of the contacts. This is the key fix.
        const memberUserIds = selectedMembers.map(chatId => {
            const contactChat = chats.find(c => c.id === chatId);
            if (!contactChat) return null;

            // In a real app, the contact object would have a user ID. Here we simulate it.
            if (contactChat.contactName === MOCK_USER_TUTOR.name) return MOCK_USER_TUTOR.id;
            if (contactChat.contactName === MOCK_USER_STUDENT.name) return MOCK_USER_STUDENT.id;
            
            // For other contacts without a mock user account, we can't sync.
            return null;
        }).filter(Boolean); // Filter out nulls for contacts we can't resolve to a user.
        const allMemberUserIds = [...new Set([currentUser.id, ...memberUserIds])];
        
        const createMessage = { 
            sender: 'System', 
            message: `Group "${groupName}" created by ${currentUser.name}.`, 
            timestamp 
        };
        
        const memberMessages = memberNames.map(name => ({
            sender: 'System',
            message: `${name} was added to the group.`,
            timestamp
        }));

        const newHistory = [createMessage, ...memberMessages]; 

        const newChatId = `group-${Date.now()}`;
        const newChat = {
            id: newChatId,
            contactName: groupName,
            lastMessage: newHistory[newHistory.length - 1].message,
            lastMessageDate: dateLabel,
            fullHistory: newHistory,
            unread: false, // This will be customized per user
            avatarColor: 'bg-indigo-200',
            avatarTextColor: 'text-indigo-700',
            avatarText: initials,
            members: allMemberUserIds, // Store the resolved user IDs
            isGroup: true,
        };

        const newAllData = { ...allChatsData };
        allMemberUserIds.forEach(memberId => {
            const userChats = newAllData[memberId] || [];
            const chatForUser = {
                ...newChat,
                unread: memberId !== currentUser.id
            };
            newAllData[memberId] = [chatForUser, ...userChats]; // Prepend the new group
        });
        updateAllChatsData(newAllData);

        setActiveChatId(newChatId);
        setToast(`Group "${groupName}" created.`);

        // reset group modal
        setGroupModalOpen(false);
        setNewGroupName('');
        setSelectedMembers([]);
        setErrorMsg('');
    };

    const handleSend = () => {
        const messageText = messageInputs[activeChatId]?.trim();
        if (!messageText) return;

        const now = new Date();
        const dateLabel = getDateLabel(now);
        const timestamp = `${dateLabel} ${getTimeLabel(now)}`;

        const newMessageObj = {
            sender: currentUser.name, // Use the current tab's user
            message: messageText,
            timestamp: timestamp
        };

        const newAllData = { ...allChatsData };
        let wasUpdated = false;

        const activeChatForCurrentUser = allChatsData[currentUser.id]?.find(c => c.id === activeChatId);

        if (activeChatForCurrentUser?.isGroup) {
            // --- GROUP CHAT ---
            const memberUserIds = activeChatForCurrentUser.members || [];
            const currentHistory = activeChatForCurrentUser.fullHistory || [];
            const newGroupHistory = [...currentHistory, newMessageObj];
            wasUpdated = true;

            memberUserIds.forEach(memberId => {
                if (newAllData[memberId]) {
                    newAllData[memberId] = newAllData[memberId].map(chat => {
                        if (chat.id === activeChatId) {
                            return {
                                ...chat,
                                fullHistory: newGroupHistory,
                                lastMessage: messageText,
                                lastMessageDate: dateLabel,
                                unread: memberId !== currentUser.id,
                            };
                        }
                        return chat;
                    });
                }
            });
        } else if (activeChatId === SHARED_CHAT_ID) {
            // --- SHARED 1-on-1 CHAT ---
            const currentHistory = allChatsData[currentUser.id].find(c => c.id === SHARED_CHAT_ID)?.fullHistory || [];
            const newSharedHistory = [...currentHistory, newMessageObj];
            wasUpdated = true;

            const updateUserChat = (userId) => allChatsData[userId].map(chat => 
                chat.id === SHARED_CHAT_ID ? {
                    ...chat,
                    fullHistory: newSharedHistory,
                    lastMessage: messageText,
                    lastMessageDate: dateLabel,
                    unread: currentUser.id !== userId,
                } : chat
            );

            newAllData[MOCK_USER_STUDENT.id] = updateUserChat(MOCK_USER_STUDENT.id);
            newAllData[MOCK_USER_TUTOR.id] = updateUserChat(MOCK_USER_TUTOR.id);
        } else {
            // --- PRIVATE 1-on-1 CHAT (not shared) ---
            newAllData[currentUser.id] = allChatsData[currentUser.id].map(chat => {
                if (chat.id === activeChatId) {
                    wasUpdated = true;
                    return {
                        ...chat,
                        fullHistory: [...chat.fullHistory, newMessageObj],
                        lastMessage: messageText,
                        lastMessageDate: dateLabel,
                    };
                }
                return chat;
            });
        }

        if (wasUpdated) {
            updateAllChatsData(newAllData);
        }

        setMessageInputs(prevInputs => ({
            ...prevInputs,
            [activeChatId]: ''
        }));
    };

    const handleDeleteHistory = (chatId) => {
        const newAllData = { ...allChatsData };
        newAllData[currentUser.id] = chats.filter(c => c.id !== chatId);

        // If the deleted chat was the active one, deactivate it to avoid a stale view
        if (activeChatId === chatId) {
            setActiveChatId(null);
        }

        updateAllChatsData(newAllData);
        setOpenMenuId(null);
    };

    const handleRenameGroup = (newName) => {
        const { chatId } = renameModal;
        if (!newName.trim() || !chatId) return;

        const newAllData = { ...allChatsData };
        const newNameTrimmed = newName.trim();
        const newInitials = newNameTrimmed.split(' ').map(s => s[0]).slice(0,2).join('').toUpperCase() || 'G';

        const now = new Date();
        const systemMessage = {
            sender: 'System',
            message: `${currentUser.name} renamed the group to "${newNameTrimmed}".`,
            timestamp: `${getDateLabel(now)} ${getTimeLabel(now)}`
        };

        newAllData[currentUser.id] = chats.map(c => 
            c.id === chatId ? { 
                ...c, 
                contactName: newNameTrimmed,
                avatarText: newInitials,
                fullHistory: [...c.fullHistory, systemMessage],
                lastMessage: systemMessage.message,
                lastMessageDate: getDateLabel(now)
            } : c
        );
        updateAllChatsData(newAllData);
        setRenameModal({ isOpen: false, chatId: null, currentName: '' });
        setOpenMenuId(null);
    };

    const handleAddMembers = (newMemberIds) => {
        const { chatId } = addMembersModal;
        if (newMemberIds.length === 0 || !chatId) return; // newMemberIds are chat IDs

        const newAllData = { ...allChatsData };

        // 1. Map new member chat IDs to user IDs
        const newMemberUserIds = newMemberIds.map(id => {
            const contactChat = chats.find(c => c.id === id);
            if (!contactChat) return null;
            if (contactChat.contactName === MOCK_USER_TUTOR.name) return MOCK_USER_TUTOR.id;
            if (contactChat.contactName === MOCK_USER_STUDENT.name) return MOCK_USER_STUDENT.id;
            return null;
        }).filter(Boolean);

        // 2. Get existing members and combine
        const existingMemberUserIds = addMembersModal.members || [];
        const allMemberUserIds = [...new Set([...existingMemberUserIds, ...newMemberUserIds])];

        // 3. Create system messages
        const now = new Date();
        const timestamp = `${getDateLabel(now)} ${getTimeLabel(now)}`;
        const memberNames = newMemberIds.map(id => chats.find(c => c.id === id)?.contactName).filter(Boolean);
        const systemMessages = memberNames.map(name => ({
            sender: 'System',
            message: `${name} was added to the group by ${currentUser.name}.`,
            timestamp: timestamp
        }));
        
        // 4. Find the original group to get its history
        const originalGroup = chats.find(c => c.id === chatId);
        if (!originalGroup) return;

        const newHistory = [...originalGroup.fullHistory, ...systemMessages];
        const lastMessage = systemMessages.length > 0 ? systemMessages[systemMessages.length - 1].message : originalGroup.lastMessage;
        const lastMessageDate = getDateLabel(now);

        // 5. Update/add the group for ALL members
        allMemberUserIds.forEach(memberId => {
            const userChats = newAllData[memberId] || [];
            const existingGroupIndex = userChats.findIndex(c => c.id === chatId);

            if (existingGroupIndex > -1) {
                // Update existing group for old member
                userChats[existingGroupIndex].members = allMemberUserIds;
                userChats[existingGroupIndex].fullHistory = newHistory;
                userChats[existingGroupIndex].lastMessage = lastMessage;
                userChats[existingGroupIndex].lastMessageDate = lastMessageDate;
                userChats[existingGroupIndex].unread = memberId !== currentUser.id;
            } else {
                // Add group for new member
                userChats.unshift({ ...originalGroup, members: allMemberUserIds, fullHistory: newHistory, lastMessage, lastMessageDate, unread: true });
            }
            newAllData[memberId] = userChats;
        });
        
        updateAllChatsData(newAllData);
        setAddMembersModal({ isOpen: false, chatId: null, members: [] });
        setOpenMenuId(null);
    };

    const activeChat = chats.find(c => c.id === activeChatId);

    // --- Modal-specific data ---
    const addMembers_currentGroup = addMembersModal.isOpen 
        ? chats.find(c => c.id === addMembersModal.chatId) 
        : null;
    
    const addMembers_availableMembers = addMembers_currentGroup 
        ? chats.filter(c => {
            if (c.isGroup) return false; // Can't add a group to a group

            // Resolve the chat contact to its user ID to check if it's already a member
            let contactUserId = null;
            if (c.contactName === MOCK_USER_TUTOR.name) contactUserId = MOCK_USER_TUTOR.id;
            else if (c.contactName === MOCK_USER_STUDENT.name) contactUserId = MOCK_USER_STUDENT.id;

            // If we found a user ID, check if they are already in the group
            if (contactUserId) return !addMembers_currentGroup.members.includes(contactUserId);
            return true; // Allow adding other contacts who aren't mock users
          })
        : [];


    return (
        <>
            {/* 1. The Overlay (mobile) */}
            {isOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-30 md:hidden"
                    onClick={onClose} 
                ></div>
            )}

            {/* Toast Notification */}
            {toast && (
                <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-black/75 text-white rounded-lg shadow-xl py-2 px-4 text-sm font-medium animate-pulse">
                    {toast}
                </div>
            )}
            
            {/* 2. The Window */}
            <div
                className={`
                    fixed top-0 right-0 h-full w-full 
                    md:w-[700px] lg:w-[800px] md:h-[calc(100%-4rem)] md:top-auto md:bottom-0 md:rounded-tl-xl
                    bg-white text-gray-800 shadow-2xl z-40
                    transform transition-transform duration-300 ease-in-out
                    ${isOpen ? 'translate-x-0' : 'translate-x-full'}
                    flex overflow-hidden
                `}
            >
                {/* --- Column 1: Chat List --- */}
                <div className={`
                    w-full md:w-[300px] lg:w-[340px] flex-shrink-0
                    border-r border-gray-200 flex flex-col
                    ${activeChatId ? 'hidden md:flex' : 'flex'}
                `}>
                    {/* List Header */}
                    <div className="flex justify-between items-center p-4 border-b border-gray-200">
                        <h2 className="text-xl font-semibold">Messages</h2>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => { setGroupModalOpen(true); setErrorMsg(''); }}
                                className="text-sm bg-primary text-white px-3 py-1.5 rounded-lg font-medium hover:opacity-90 transition flex items-center gap-1.5"
                            >
                                <FaPlus size={12} /> New Group
                            </button>
                            <button
                                onClick={() => setCurrentUser(currentUser.id === MOCK_USER_STUDENT.id ? MOCK_USER_TUTOR : MOCK_USER_STUDENT)}
                                className="text-gray-400 hover:text-gray-600 p-1"
                                title={`Switch to ${currentUser.id === MOCK_USER_STUDENT.id ? MOCK_USER_TUTOR.name : MOCK_USER_STUDENT.name}`}
                            >
                                <FaTimes />
                            </button>
                        </div>
                    </div>

                    {/* Search Input */}
                    <div className="p-3 border-b border-gray-200">
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaSearch className="text-gray-400" />
                            </span>
                            <input
                                type="text"
                                placeholder="Search contact"
                                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                            />
                        </div>
                    </div>

                    {/* Message List */}
                    <div className="flex-1 overflow-y-auto p-2 space-y-1">
                        {chats.map((chat) => {
                            const isMenuOpen = openMenuId === chat.id;
                            return (
                                <div key={chat.id} className="relative group">
                                    <div 
                                        className={`flex items-center p-3 hover:bg-gray-100 cursor-pointer transition-colors rounded-lg ${activeChatId === chat.id ? 'bg-blue-50' : ''}`}
                                        onClick={() => {
                                            setActiveChatId(chat.id);
                                            if(chat.unread) {
                                                const newAllData = { ...allChatsData };
                                                newAllData[currentUser.id] = chats.map(c => c.id === chat.id ? { ...c, unread: false } : c);
                                                updateAllChatsData(newAllData);
                                            }
                                        }}
                                    >
                                        {/* Avatar */}
                                        <div className={`relative w-10 h-10 ${chat.avatarColor} rounded-full flex items-center justify-center mr-3 font-semibold ${chat.avatarTextColor} shrink-0`}>
                                            {chat.avatarText}
                                            {chat.unread && <span className="absolute -bottom-0.5 -right-0.5 block h-3 w-3 bg-red-500 rounded-full border-2 border-white" />}
                                        </div>
                                        
                                        {/* Message Info */}
                                        <div className="flex-1 min-w-0"> 
                                            <div className="flex justify-between items-center">
                                                <span className={`font-semibold text-sm truncate ${activeChatId === chat.id ? 'text-blue-700' : ''}`}>{chat.contactName}</span>
                                                <span className="text-xs text-gray-500 shrink-0 ml-2">{chat.lastMessageDate}</span>
                                            </div>
                                            <p className={`text-sm text-gray-600 truncate ${chat.unread ? 'font-bold text-gray-800' : ''}`}>{chat.lastMessage}</p>
                                        </div>
                                    </div>

                                    {/* Three-dot menu button */}
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(isMenuOpen ? null : chat.id); }}
                                        className={`absolute top-1/2 -translate-y-1/2 right-2 p-2 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                                    >
                                        <FaEllipsisV />
                                    </button>

                                    {/* Dropdown Menu */}
                                    {isMenuOpen && (
                                        <div ref={menuRef} className="absolute right-0 top-12 z-20 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                            {chat.isGroup ? (
                                                <>
                                                    <button onClick={() => { setRenameModal({ isOpen: true, chatId: chat.id, currentName: chat.contactName }); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Rename</button>
                                                    <button onClick={() => { setAddMembersModal({ isOpen: true, chatId: chat.id, members: chat.members || [] }); setSelectedMembers([]); setOpenMenuId(null); }} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Add Members</button>
                                                </>
                                            ) : (
                                                <button onClick={() => handleDeleteHistory(chat.id)} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Delete History</button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* --- Column 2: Active Chat --- */}
                <div className={`
                    flex-1 flex flex-col bg-white
                    ${activeChatId ? 'flex' : 'hidden md:flex'}
                `}>
                    {!activeChat ? (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                            Select a chat to start messaging
                        </div>
                    ) : (
                        <>
                            {/* Active Chat Header */}
                            <div className="flex items-center p-4 border-b border-gray-200">
                                {/* Mobile-only Back Button */}
                                <button 
                                    className="text-gray-500 hover:text-gray-700 mr-3 md:hidden"
                                    onClick={() => setActiveChatId(null)}
                                >
                                    <FaChevronLeft />
                                </button>
                                <div className={`w-10 h-10 ${activeChat.avatarColor} rounded-full flex items-center justify-center mr-3 font-semibold ${activeChat.avatarTextColor} shrink-0`}>
                                    {activeChat.avatarText}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-semibold">{activeChat.contactName}</h3>
                                </div>
                                <button 
                                    className="text-gray-400 hover:text-gray-600 p-1 md:hidden"
                                    onClick={onClose}
                                >
                                    <FaTimes />
                                </button>
                            </div>

                            {/* Chat History */}
                            <div ref={chatHistoryRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                                {activeChat.fullHistory.map((msg, index) => (
                                    // --- (MODIFICATION 2) ---
                                    // Changed flex alignment for System messages
                                    <div key={index} className={`flex ${
                                        msg.sender === currentUser.name ? 'justify-end' 
                                        : msg.sender === 'System' ? 'justify-center' 
                                        : 'justify-start'
                                    }`}>
                                        <div className={`py-2 px-4 rounded-lg ${ // max-w-[75%] removed from here
                                            msg.sender === currentUser.name 
                                                ? 'bg-primary text-white rounded-t-xl rounded-bl-xl max-w-[75%]' // re-added max-w
                                                : msg.sender === 'System'
                                                    ? 'bg-transparent text-gray-500 text-sm text-center' // kept it simple
                                                    : 'bg-gray-100 text-gray-800 rounded-t-xl rounded-br-xl max-w-[75%]' // re-added max-w
                                        }`}>
                                            <p className={`text-sm whitespace-pre-wrap ${msg.sender === 'System' ? 'italic' : ''}`}>{msg.message}</p>
                                            <span className={`text-xs ${
                                                msg.sender === currentUser.name ? 'text-blue-200' 
                                                : msg.sender === 'System' ? 'hidden'
                                                : 'text-gray-500'
                                            } block text-right mt-1`}>
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Message Input and Send Button */}
                            <div className="p-4 border-t border-gray-200 bg-white">
                                <div className="flex items-center bg-gray-100 rounded-full p-1">
                                    <input
                                        type="text"
                                        className="flex-1 p-2 px-4 bg-transparent focus:outline-none placeholder-gray-500 text-gray-800"
                                        placeholder="Write a message..."
                                        value={messageInputs[activeChatId] || ''}
                                        onChange={e => {
                                            const newInputs = {...messageInputs};
                                            newInputs[activeChatId] = e.target.value;
                                            setMessageInputs(newInputs);
                                        }}
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && !e.shiftKey) {
                                                e.preventDefault();
                                                handleSend();
                                            }
                                        }}
                                    />
                                    <button 
                                        className="shrink-0 bg-primary hover:opacity-90 text-white p-3 rounded-full transition-colors ml-1"
                                        onClick={handleSend}
                                    >
                                        <FaPaperPlane className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* --- Group Creation Modal --- */}
            {groupModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-11/12 md:w-[560px] rounded-xl shadow-lg border">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div>
                                <h3 className="text-lg font-semibold">Create New Group</h3>
                                <p className="text-sm text-gray-500">Choose group name and members</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => { setGroupModalOpen(false); setErrorMsg(''); }}>
                                <FaTimes size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {errorMsg && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{errorMsg}</div>}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Group name</label>
                                <input
                                    value={newGroupName}
                                    onChange={e => setNewGroupName(e.target.value)}
                                    // --- (MODIFICATION 1) ---
                                    // Added text-gray-900 to make typed text visible
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                    placeholder="e.g. Project Study Group"
                                />
                            </div>

                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">Select members</div>
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto pr-2 border rounded-lg p-2">
                                    {chats.filter(c => !c.isGroup).map(c => (
                                        <label key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(c.id)}
                                                onChange={() => toggleMember(c.id)}
                                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${c.avatarColor} ${c.avatarTextColor}`}>{c.avatarText}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">{c.contactName}</div>
                                                </div>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                                    onClick={() => { setGroupModalOpen(false); setErrorMsg(''); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                                    onClick={createGroup}
                                >
                                    Create Group
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Rename Group Modal --- */}
            {renameModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-11/12 md:w-[400px] rounded-xl shadow-lg border">
                        <div className="flex justify-between items-center p-4 border-b">
                            <h3 className="text-lg font-semibold">Rename Group</h3>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => setRenameModal({ isOpen: false, chatId: null, currentName: '' })}>
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New group name</label>
                                <input
                                    defaultValue={renameModal.currentName}
                                    onKeyDown={e => e.key === 'Enter' && handleRenameGroup(e.target.value)}
                                    className="w-full border border-gray-300 px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-900"
                                    placeholder="Enter new name"
                                    id="rename-group-input"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition" onClick={() => setRenameModal({ isOpen: false, chatId: null, currentName: '' })}>Cancel</button>
                                <button className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition" onClick={() => handleRenameGroup(document.getElementById('rename-group-input').value)}>Save</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* --- Add Members Modal --- */}
            {addMembersModal.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
                    <div className="bg-white w-11/12 md:w-[560px] rounded-xl shadow-lg border">
                        <div className="flex justify-between items-center p-4 border-b">
                            <div>
                                <h3 className="text-lg font-semibold">Add Members to Group</h3>
                                <p className="text-sm text-gray-500">Select members to add</p>
                            </div>
                            <button className="text-gray-400 hover:text-gray-600" onClick={() => setAddMembersModal({ isOpen: false, chatId: null, members: [] })}>
                                <FaTimes size={18} />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            {errorMsg && <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">{errorMsg}</div>}
                            <div>
                                <div className="text-sm font-medium text-gray-700 mb-2">Select members</div>
                                <div className="grid grid-cols-1 gap-2 max-h-48 overflow-auto pr-2 border rounded-lg p-2">
                                    {addMembers_availableMembers.length > 0 ? addMembers_availableMembers.map(c => (
                                        <label key={c.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedMembers.includes(c.id)}
                                                onChange={() => toggleMember(c.id)}
                                                className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                            />
                                            <div className="flex items-center gap-3">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${c.avatarColor} ${c.avatarTextColor}`}>{c.avatarText}</div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-800">{c.contactName}</div>
                                                </div>
                                            </div>
                                        </label>
                                    )) : (
                                        <div className="p-4 text-center text-sm text-gray-500">No other contacts to add.</div>
                                    )}
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition"
                                    onClick={() => setAddMembersModal({ isOpen: false, chatId: null, members: [] })}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="px-4 py-2 bg-primary text-white rounded-lg font-semibold hover:opacity-90 transition"
                                    onClick={() => handleAddMembers(selectedMembers)}
                                >
                                    Add Members
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}