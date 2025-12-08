import React, { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
    FaSearch, FaChevronDown, FaBars, FaTimes, FaEnvelope, FaBell,
    FaSignInAlt, FaUserPlus, FaUser, FaFolder,
    FaTrophy, FaChartBar, FaChartPie, FaSignOutAlt, FaUserCircle,
    FaClipboardList, FaStar
} from 'react-icons/fa';

// Giả sử bạn dùng axios để gọi API (nhớ cài: npm install axios)
import axios from 'axios'; 

// Import các Component con
import MessageWindow from './MessageWindow'; 
import Notification from '../notification/Notification2'; 

// Component Icon con
const SearchIcon = () => <FaSearch />;
const ChevronDownIcon = () => <FaChevronDown />;
const BarsIcon = () => <FaBars />;
const TimesIcon = () => <FaTimes />;
const EnvelopeIcon = () => <FaEnvelope />; 
const BellIcon = () => <FaBell />;

// --- Navigation Items ---
const defaultHeaderList = [
    { title: "Home", path: "/" },
    { title: "Courses", path: "/courses" },
    { title: "Sessions", path: "/sessions" },
]
const coordinatorHeaderList = [
    { title: "Statistical", path: "/analyze" },
    { title: "Optimize Resources", path: "/optimize" },
    { title: "Awarding", path: "/awarding" },
]

export default function Header({TabList = 1}) {
    const navigate = useNavigate();
    
    // --- 1. AUTH STATE ---
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    // --- STATE MỚI CHO NOTIFICATION ---
    const [unreadCount, setUnreadCount] = useState(0); // Số lượng thông báo chưa đọc

    useEffect(() => {
        const storedUser = sessionStorage.getItem('currentUser');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
            setIsAuthenticated(true);
        } else {
            setUser(null);
            setIsAuthenticated(false);
        }
        setLoading(false);
    }, []);

    // --- 2. LOGIC REAL-TIME (POLLING) ---
    useEffect(() => {
        // Chỉ chạy khi đã đăng nhập
        if (!isAuthenticated || !user) return;

        const fetchNotificationCount = async () => {
            try {
                // [LƯU Ý]: Thay đường dẫn này bằng API thực tế của bạn
                // Ví dụ: GET /api/notifications/unread-count
                const response = await axios.get(`YOUR_API_URL/notifications/count/${user.id}`);
                
                // Giả sử API trả về { count: 5 }
                setUnreadCount(response.data.count); 
            } catch (error) {
                console.error("Lỗi lấy thông báo:", error);
            }
        };

        // Gọi ngay lần đầu
        fetchNotificationCount();

        // Thiết lập Polling: Gọi lại sau mỗi 3 giây (3000ms)
        // Kỹ thuật này giúp 2 tab cập nhật gần như tức thì khi demo
        const intervalId = setInterval(fetchNotificationCount, 3000);

        // Dọn dẹp interval khi component unmount hoặc user logout
        return () => clearInterval(intervalId);
    }, [isAuthenticated, user]);


    const handleLogout = () => {
        sessionStorage.removeItem('currentUser');
        setUser(null);
        setIsAuthenticated(false);
        setUnreadCount(0); // Reset thông báo
        navigate('/login');
    };

    // --- MENU SWITCHING ---
    let navItems = [];
    switch (TabList) {
        case 1: navItems = defaultHeaderList; break;
        case 2: navItems = coordinatorHeaderList; break;
        default: navItems = defaultHeaderList;
    }

    // --- UI STATES ---
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [isMessageWindowOpen, setIsMessageWindowOpen] = useState(false);
    const [isNotificationOpen, setIsNotificationOpen] = useState(false); 

    const linkClassName = ({ isActive }) =>
        `text-base font-bold uppercase tracking-wider hover:bg-secondary transition-colors px-3 py-2 rounded-md ${
            isActive ? "bg-secondary" : "" 
        }`;
    
    const mobileLinkClassName = ({ isActive }) =>
        `block text-base font-bold uppercase tracking-wider hover:bg-secondary transition-colors px-3 py-2 rounded-md ${
            isActive ? "bg-secondary" : "" 
        }`;

    return (
    <header className="bg-primary text-white shadow-md relative z-50">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="flex items-center justify-between h-16">
            
                {/* 1. Logo */}
                <div className="shrink-0">
                    <Link to="/" className="text-[32px] font-bold">
                        TutorConnect
                    </Link>
                </div>

                {/* 2. Navigation Menu (Desktop) */}
                <div className="hidden md:flex md:items-center md:space-x-10">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.title}
                            to={item.path}
                            className={linkClassName}
                        >
                            {item.title}
                        </NavLink>
                    ))}
                </div>

                {/* 3. Controls (Desktop) */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Language Selector */}
                    <button className="flex items-center text-sm hover:text-cyan-100 transition-colors">
                        <span>En</span>
                        <ChevronDownIcon />
                    </button>

                    <span className="text-white cursor-default">|</span>

                    {/* Search Button */}
                    <button className="hover:text-cyan-100 transition-colors">
                        <span className="sr-only">Search</span>
                        <SearchIcon />
                    </button>

                    {/* CHỈ HIỆN KHI ĐÃ LOGIN */}
                    {isAuthenticated && (
                        <>
                            {/* Message Button */}
                            <button
                                onClick={() => setIsMessageWindowOpen(!isMessageWindowOpen)}
                                className="hover:text-cyan-100 transition-colors relative"
                            >
                                <EnvelopeIcon />
                            </button>

                            {/* --- NOTIFICATION BELL (Đã thêm Badge) --- */}
                            <button
                                onClick={() => {
                                    setIsNotificationOpen(!isNotificationOpen);
                                    // Optional: Khi mở ra thì reset số lượng về 0 (nếu muốn)
                                    // setUnreadCount(0); 
                                }}
                                className="hover:text-cyan-100 transition-colors relative"
                            >
                                <BellIcon />
                                {/* Hiển thị chấm đỏ nếu có thông báo mới */}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] flex items-center justify-center border border-primary">
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </span>
                                )}
                            </button>
                        </>
                    )}

                    {/* User Avatar / Login Button */}
                    <div className="relative">
                        <button className="shrink-0 cursor-pointer flex items-center gap-2" onClick={() => setShowUserMenu(!showUserMenu)}>
                            {isAuthenticated ? (
                                <img
                                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                                    src="https://placehold.co/40x40/E2E8F0/A0AEC0?text=User"
                                    alt="User avatar"
                                />
                            ) : (
                                <FaUserCircle className="h-8 w-8" />
                            )}
                        </button>

                        {/* DROPDOWN MENU */}
                        {showUserMenu && (
                            <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50 text-gray-800">
                                <ul className="py-1 text-sm">
                                    {loading ? (
                                        <li className="px-4 py-2 text-center text-gray-500">Loading...</li>
                                    ) : !isAuthenticated ? (
                                        // GUEST MENU
                                        <>
                                            <li>
                                                <button onClick={() => { navigate('/login'); setShowUserMenu(false); }} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                                                    <FaSignInAlt /> Login
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={() => { navigate('register'); setShowUserMenu(false); }} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                                                    <FaUserPlus /> Sign Up
                                                </button>
                                            </li>
                                        </>
                                    ) : (
                                        // LOGGED IN USER MENU
                                        <>
                                            <li className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                                                <p className="font-bold text-gray-900 truncate">{user?.name}</p>
                                                <p className="text-xs text-gray-500 capitalize">{user?.role}</p>
                                            </li>
                                            
                                            {/* Common Items */}
                                            <li>
                                                <button onClick={() => navigate('/profile')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                                                    <FaUser /> Profile
                                                </button>
                                            </li>
                                            <li>
                                                <button onClick={() => navigate('/user/private')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left">
                                                    <FaFolder /> Private Storage
                                                </button>
                                            </li>

                                            {/* Role-Based Items: Admin/SAO */}
                                            {(user?.role === 'admin' || user?.role === 'sao') && (
                                                <>
                                                    <div className="border-t my-1"></div>
                                                    <li><button onClick={() => navigate('/analyze')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaChartPie /> Statistical</button></li>
                                                    <li><button onClick={() => navigate('/optimize')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaChartBar /> Optimize Resource</button></li>
                                                    <li><button onClick={() => navigate('/awarding')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaTrophy /> Awarding</button></li>
                                                    <li><button onClick={() => navigate('/manage-program')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaClipboardList /> Manage Program</button></li>
                                                </>
                                            )}

                                            {/* Role-Based Items: Tutor */}
                                            {user?.role === 'tutor' && (
                                                <>
                                                    <div className="border-t my-1"></div>
                                                    <li><button onClick={() => navigate('/student-progress/2352429')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaClipboardList /> Record Progress</button></li>
                                                </>
                                            )}

                                            {user?.role === 'tutor' && (
                                                <>
                                                    <div className="border-t my-1"></div>
                                                    <li><button onClick={() => navigate('/set-availability')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaClipboardList /> Set availability</button></li>
                                                </>
                                            )}

                                            {/* Role-Based Items: Student */}
                                            {user?.role === 'student' && (
                                                <>
                                                    <div className="border-t my-1"></div>
                                                    <li><button onClick={() => navigate('/evaluation/2352429')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaStar /> Write Evaluation</button></li>
                                                </>
                                            )}

                                            {user?.role === 'student' && (
                                                <>
                                                    <div className="border-t my-1"></div>
                                                    <li><button onClick={() => navigate('/register-course')} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"><FaClipboardList /> Register Program</button></li>
                                                </>
                                            )}

                                            <div className="border-t my-1"></div>
                                            <li>
                                                <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600">
                                                    <FaSignOutAlt /> Log Out
                                                </button>
                                            </li>
                                        </>
                                    )}
                                </ul>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Mobile Menu Button */}
                <div className="md:hidden flex items-center">
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white hover:text-cyan-100 p-2 rounded-md"
                    >
                        {isMobileMenuOpen ? <TimesIcon /> : <BarsIcon />}
                    </button>
                </div>

            </div>
        </nav>

        {/* 5. Mobile Menu (Simplified) */}
        <div className={`md:hidden absolute top-full left-0 w-full bg-primary shadow-lg px-4 pt-2 pb-4 space-y-4 transition-all duration-300 ease-in-out z-10 ${isMobileMenuOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-60 pointer-events-none'}`}>
            <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <NavLink key={item.title} to={item.path} className={mobileLinkClassName} onClick={() => setIsMobileMenuOpen(false)}>
                        {item.title}
                    </NavLink>
                ))}
                {isAuthenticated && (
                     <button onClick={handleLogout} className="block w-full text-left text-base font-bold uppercase tracking-wider hover:bg-red-600 transition-colors px-3 py-2 rounded-md bg-red-500 mt-4">
                        Log Out
                    </button>
                )}
            </div>
        </div>

        {/* --- COMPONENT MESSAGE --- */}
        <MessageWindow 
            isOpen={isMessageWindowOpen} 
            onClose={() => setIsMessageWindowOpen(false)} 
        />
        
        {/* --- COMPONENT NOTIFICATION --- */}
        {/* Để danh sách thông báo bên trong cũng cập nhật realtime, 
            bạn cũng nên áp dụng logic Polling tương tự bên trong file Notification.jsx 
            hoặc truyền props triggerUpdate vào.
        */}
        <Notification 
            isOpen={isNotificationOpen}
            onClose={() => setIsNotificationOpen(false)}
            // Nếu component Notification của bạn nhận props để render lại, hãy truyền vào đây
            // key={unreadCount} // Mẹo: Thay đổi key sẽ buộc component re-render và fetch lại dữ liệu
        /> 
            
    </header>
    );
}