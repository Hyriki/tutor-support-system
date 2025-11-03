import React, { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { FaSearch, FaChevronDown, FaBars, FaTimes } from 'react-icons/fa';
// --- React Icons ---

const SearchIcon = () => <FaSearch />;

const ChevronDownIcon = () => <FaChevronDown />;

const BarsIcon = () => <FaBars />;

const TimesIcon = () => <FaTimes />;


// --- Navigation Items ---
const defaultHeaderList = [
    { title: "Home", path: "/home" },
    { title: "Courses", path: "/courses" },
    { title: "Sessions", path: "/sessions" },
]
const coordinatorHeaderList = [
    { title: "Analyze Data", path: "/analyze" },
    { title: "Optimize Resources", path: "/optimize" },
    { title: "Awarding", path: "/awarding" },
]


export default function Header() {
    const navItems = defaultHeaderList; // This can be modified to switch between different header lists
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="bg-primary text-white shadow-md mb-4 relative">
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

                    {/* User Avatar */}
                    <button className="shrink-0 cursor-pointer">
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
                    <button 
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="text-white hover:text-cyan-100 p-2 rounded-md"
                        aria-label="Toggle menu"
                    >
                        {isMobileMenuOpen ? <TimesIcon /> : <BarsIcon />}
                    </button>
                </div>

            </div>
        </nav>

        {/* 5. Mobile Menu (Dropdown) */}
        {/* Shown only on small screens (md:hidden) and when isMobileMenuOpen is true */}
        <div 
            className={`
                md:hidden absolute top-full left-0 w-full bg-red-800 shadow-lg px-4 pt-2 pb-4 space-y-4
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
                <button className="shrink-0 cursor-pointer flex items-center space-x-2">
                    <img
                    className="h-9 w-9 rounded-full object-cover ring-2 ring-white"
                    src="https://placehold.co/40x40/E2E8F0/A0AEC0?text=User"
                    alt="User avatar"
                    />
                    <span className="text-sm">My Account</span>
                </button>
            </div>
        </div>
    </header>
    );
}

