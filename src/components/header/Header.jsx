import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { 
    FaSearch, FaChevronDown, FaBars, FaTimes, FaEnvelope,
    FaSignInAlt, FaUserPlus, FaUser, FaShoppingCart, FaCog,
    FaIdCard, FaSignOutAlt, FaFolder,
    FaTrophy, FaAward,           // For Awarding
    FaChartBar, FaChartLine,FaChartPie,     // For Analyze
    FaPen, FaEdit, FaStar,       // For Write Review
    FaClipboardList,              // For Review (form)
    FaUserGraduate, FaUserCircle,  // For Student Profile
    FaSlidersH, FaCogs, FaProjectDiagram    // For Optimize Resource
} from 'react-icons/fa';
// --- React Icons ---

const SearchIcon = () => <FaSearch />;

const ChevronDownIcon = () => <FaChevronDown />;

const BarsIcon = () => <FaBars />;

const TimesIcon = () => <FaTimes />;

const EnvelopeIcon = () => <FaEnvelope />; // New: Message/Envelope Icon
import MessageWindow from './MessageWindow'; // Assuming MessageWindow.js is in the same folder


// --- Navigation Items ---
const defaultHeaderList = [
    { title: "Home", path: "/" },
    { title: "Courses", path: "/courses" },
    { title: "Sessions", path: "/sessions" },
]
const coordinatorHeaderList = [
    { title: "Analyze Data", path: "/analyze" },
    { title: "Optimize Resources", path: "/optimize" },
    { title: "Awarding", path: "/awarding" },
]


export default function Header() {

    // ----- USER SAMPLE -----
    const user = {
        username: "test_student",
        email: "student@example.com",
        role: "student"
    };
    const isAuthenticated = true;
    const loading = false;
    const handleLogout = () => {
        console.log("Logout clicked! (This is a test function)");
        // In a real app, this would change the state
    };

    const navigate = useNavigate();
    const navItems = defaultHeaderList; // This can be modified to switch between different header lists
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [showUserMenu, setShowUserMenu] = useState(false);

    //Add state for the message window ---
    const [isMessageWindowOpen, setIsMessageWindowOpen] = useState(false);


    const linkClassName = ({ isActive }) =>
        `text-base font-bold uppercase tracking-wider hover:bg-secondary transition-colors px-3 py-2 rounded-md ${
            isActive ? "bg-secondary" : "" // Add "bg-secondary" class if the link is active
        }`;
    
    const mobileLinkClassName = ({ isActive }) =>
        `block text-base font-bold uppercase tracking-wider hover:bg-secondary transition-colors px-3 py-2 rounded-md ${
            isActive ? "bg-secondary" : "" // Add "bg-secondary" class if the link is active
        }`;


    return (
    // Set position to relative to contain the absolute mobile menu
    <header className="bg-primary text-white shadow-md relative">
        <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
            <div className="flex items-center justify-between h-16">
            
                {/* 1. Logo */}
                <div className="shrink-0">
                    <Link to="/" className="text-[32px] font-bold">
                        TutorConnect
                    </Link>
                </div>

                {/* 2. Navigation Menu (Desktop) */}
                {/* Hidden on small screens, visible from md breakpoint up */}
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
                {/* Hidden on small screens, visible from md breakpoint up */}
                <div className="hidden md:flex items-center space-x-4">
                    {/* Language Selector */}
                    <button className="flex items-center text-sm hover:text-cyan-100 transition-colors">
                        <span>En</span>
                        <ChevronDownIcon />
                    </button>

                    {/* Vertical Separator */}
                    <span className="text-white cursor-default">|</span>

                    {/* Search Button */}
                    <button className="hover:text-cyan-100 transition-colors">
                        <span className="sr-only">Search</span>
                        <SearchIcon />
                    </button>

                    {/*Add Message Button & logic --- */}
                    <button
                        onClick={() => {
                            setIsMessageWindowOpen(!isMessageWindowOpen);
                            setIsMobileMenuOpen(false); // Close mobile menu if open
                        }}
                        className="hover:text-cyan-100 transition-colors relative"
                    >
                        <span className="sr-only">Messages</span>
                        <EnvelopeIcon />
                        {/* Optional: You can add a notification dot here if needed */}
                        {/* <span className="absolute -top-1 -right-1 bg-red-500 rounded-full w-3 h-3 ..."></span> */}
                    </button>
                    {/* --- End Change --- */}

                    {/* User Avatar */}
                    <button className="shrink-0 cursor-pointer" onClick={() => setShowUserMenu(!showUserMenu)}>
                        <span className="sr-only">My Account</span>
                        <img
                        className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                        src="https://placehold.co/40x40/E2E8F0/A0AEC0?text=User"
                        alt="User avatar"
                        />
                    </button>
                </div>

                {/* 4. Mobile Menu Button (Burger Icon) */}
                {/* Visible on small screens, hidden from md breakpoint up */}
                <div className="md:hidden flex items-center">
                    {/* --- Add Mobile Message Button & logic --- */}
                    <button
                        onClick={() => {
                            setIsMessageWindowOpen(!isMessageWindowOpen);
                            setIsMobileMenuOpen(false); // Close mobile menu if open
                        }}
                        className="text-white hover:text-cyan-100 p-2 rounded-md mr-2 relative"
                        aria-label="Toggle messages"
                    >
                        <EnvelopeIcon />
                        {/* <span className="absolute top-1 right-1 bg-red-500 ..."></span> */}
                    </button>

                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white hover:text-cyan-100 p-2 rounded-md"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <TimesIcon /> : <BarsIcon />}
                    </button>
                    {/* --- End Change --- */}
                </div>

            </div>
        </nav>

        {/* 5. Mobile Menu (Dropdown) */}
        {/* Shown only on small screens (md:hidden) and when isMobileMenuOpen is true */}
        <div
            className={`
                md:hidden absolute top-full left-0 w-full bg-primary shadow-lg px-4 pt-2 pb-4 space-y-4
                transition-all duration-300 ease-in-out z-10
                ${isMobileMenuOpen
                    ? 'opacity-100 translate-y-0 pointer-events-auto'
                    : 'opacity-0 -translate-y-60 pointer-events-none'
                }
            `}
        >

            {/* Mobile Nav Links */}
            <div className="flex flex-col space-y-2">
                {navItems.map((item) => (
                    <NavLink
                        key={item.title}
                        to={item.path}
                        className={mobileLinkClassName}
                        onClick={() => setIsMobileMenuOpen(false)} // Close menu on click
                    >
                        {item.title}
                    </NavLink>
                ))}
            </div>

            {/* Divider */}
            <div className="border-t border-cyan-600 my-4"></div>

            {/* Mobile Controls */}
            <div className="flex items-center justify-between space-x-4">
                {/* Language Selector */}
                <button className="flex items-center text-sm hover:text-cyan-100 transition-colors">
                    <span>En</span>
                    <ChevronDownIcon />
                </button>

                {/* Search Button */}
                <button className="hover:text-cyan-100 transition-colors">
                    <span className="sr-only">Search</span>
                    <SearchIcon />
                </button>

                {/* User Avatar */}
                <button className="shrink-0 cursor-pointer flex items-center space-x-2" onClick={() => setShowUserMenu(!showUserMenu)}>
                    <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                    src="https://placehold.co/40x40/E2E8F0/A0AEC0?text=User"
                    alt="User avatar"
                    />
                    <span className="text-sm">My Account</span>
                </button>
            </div>
        </div>

        {/* --- Render the new component --- */}
        <MessageWindow 
            isOpen={isMessageWindowOpen} 
            onClose={() => setIsMessageWindowOpen(false)} 
        />
        {/* --- End Change --- */}

        {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 shadow-lg rounded-lg overflow-hidden z-50">
                    <ul className="py-1 text-sm text-gray-700">
                    {loading ? (
                        <li className="px-4 py-2 text-center text-gray-500">
                        Loading...
                        </li>
                    ) : !isAuthenticated ? (
                        // Show only Login and Sign Up when not authenticated
                        <>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/login');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaSignInAlt className="h-5 w-5" /> Login
                            </button>
                        </li>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/signup');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaUserPlus className="h-5 w-5" /> Sign Up
                            </button>
                        </li>
                        </>
                    ) : (
                        // Show user menu when authenticated
                        <>
                        {/* Welcome message */}
                        <li className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                            Welcome, {user?.username || user?.email}
                        </li>
                        
                        <li>
                            <button
                            onClick={() => {
                                navigate('/profile');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaUser className="h-5 w-5" /> Profile
                            </button>
                        </li>
                        
                        <li>
                            <button
                            onClick={() => {
                                navigate('/user/private');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaFolder className="h-5 w-5" /> Private Storage
                            </button>
                        </li>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/awarding');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaTrophy className="h-5 w-5" /> Awarding
                            </button>
                        </li>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/student-progress/:studentId');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaIdCard className="h-5 w-5" /> Student Profile Page
                            </button>
                        </li>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/analyze');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaChartPie className="h-5 w-5" /> Analyze Data
                            </button>
                        </li>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/optimize');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaChartBar className="h-5 w-5" /> Optimize Resource
                            </button>
                        </li>
                        <li>
                            <button
                            onClick={() => {
                                navigate('/evaluation/:studentId');
                                setShowUserMenu(false);
                            }}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                            <FaClipboardList className="h-5 w-5" /> Write Evaluation
                            </button>
                        </li>

                        {/* Show admin dashboard only for admin role */}
                        {user?.role === 'admin' && (
                            <li>
                            <button
                                onClick={() => {
                                navigate('/admin');
                                setShowUserMenu(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                                <FaCog className="h-5 w-5" /> Admin Dashboard
                            </button>
                            </li>
                        )}

                        {/* Show tutor dashboard only for tutor role */}
                        {user?.role === 'tutor' && (
                            <li>
                            <button
                                onClick={() => {
                                navigate('/tutor');
                                setShowUserMenu(false);
                                }}
                                className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 w-full text-left"
                            >
                                <FaIdCard className="h-5 w-5" /> Tutor Dashboard
                            </button>
                            </li>
                        )}

                        {/* Logout button */}
                        <li className="border-t border-gray-200 mt-1 pt-1">
                            <button
                            onClick={handleLogout}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-50 w-full text-left text-red-600 hover:text-red-700"
                            >
                            <FaSignOutAlt className="h-5 w-5" /> Log Out
                            </button>
                        </li>
                        </>
                    )}
                    </ul>
                </div>
                )}
            
    </header>
    );
}