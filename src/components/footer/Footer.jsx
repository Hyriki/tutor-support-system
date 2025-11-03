import React from 'react';
import { FaYoutube, FaInstagramSquare, FaFacebook } from "react-icons/fa";

// --- React Icons ---

const YoutubeIcon = () => <FaYoutube />;

const InstagramIcon = () => <FaInstagramSquare  />;

const FacebookIcon = () => <FaFacebook />;

const logoUrl = "/src/assets/logo.png"; 


export default function Footer() {
    return (
        <footer className="bg-primary text-white">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-16">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-12">

                    {/* Column 1: Logo and Description */}
                    <div className="flex flex-col items-center text-center md:text-left">
                        <img src={logoUrl} alt="TutorConnect Logo" className="w-16 h-16 mb-4"/>
                        <h2 className="text-2xl font-bold mb-4">TutorConnect</h2>
                    </div>

                    {/* Column 2: About Program */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">About Program</h3>
                        <p className="text-sm text-cyan-100 leading-relaxed">
                            Empowering students and tutors to connect, learn, and grow together. Find your perfect match today.
                        </p>
                    </div>

                    {/* Column 3: Quick Links (Example) */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Company</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">About Us</a></li>
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">Careers</a></li>
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">Press</a></li>
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Support Links (Example) */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Support</h3>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">Help Center</a></li>
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">Contact Us</a></li>
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">FAQ</a></li>
                            <li><a href="#" className="text-sm hover:text-cyan-200 transition-colors">Privacy Policy</a></li>
                        </ul>
                    </div>

                    {/* Column 5: Follow Us */}
                    <div className="flex flex-col items-center md:items-start">
                        <h3 className="text-lg font-semibold mb-4 uppercase tracking-wider">Follow Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" aria-label="YouTube" className="text-white hover:text-cyan-200 transition-colors">
                                <YoutubeIcon />
                            </a>
                            <a href="#" aria-label="Instagram" className="text-white hover:text-cyan-200 transition-colors">
                                <InstagramIcon />
                            </a>
                            <a href="#" aria-label="Facebook" className="text-white hover:text-cyan-200 transition-colors">
                                <FacebookIcon />
                            </a>
                        </div>
                    </div>

                </div>
                
                {/* Optional: Copyright line at the bottom */}
                <div className="border-t border-cyan-600 mt-10 pt-6 text-center text-sm text-cyan-200">
                    © {new Date().getFullYear()} TutorConnect. All rights reserved.
                </div>

            </div>
        </footer>
    );
}

