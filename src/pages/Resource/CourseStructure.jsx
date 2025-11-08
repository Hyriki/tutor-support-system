import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CourseSection from '../../components/course/CourseSection';
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
    FaFolderOpen      // Folder icon for implementation
} from 'react-icons/fa';

// ----- SAMPLE -----
const courseTitle = "Software Engineering";
const courseID = "C03001";
const lecturer = "Tran Truong Tan Phat";
const className = "CC04 - CC05";

const sectionSamples = [
    {
        "sectionId": "sec_01",
        "title": "Module 1: Version Control with Git",
        "items": [
            {
            "id": "item_101",
            "title": "Introduction to Git",
            "type": "mp4",
            "description": ["Core concepts: repositories, commits, and branches."]
            },
            {
            "id": "item_102",
            "title": "Git Cheat Sheet",
            "type": "pdf",
            "description": ["Common commands for branching, merging, and rebasing."]
            },
            {
            "id": "item_103",
            "title": "Project: 'MyFirstRepo'",
            "type": "folder",
            "description": ["Practice repository for completing the module exercises."]
            }
        ]
    },
    {
        "sectionId": "sec_02",
        "title": "Module 2: Data Structures & Algorithms",
        "items": [
            {
            "id": "item_201",
            "title": "Lecture 2.1: Arrays vs. Linked Lists",
            "type": "mp4",
            "description": [
                "Understanding time complexity.",
                "Big O notation for common operations."
            ]
            },
            {
            "id": "item_202",
            "title": "Whiteboard: 'Binary Tree Traversal'",
            "type": "png",
            "description": ["Diagram showing Pre-order, In-order, and Post-order traversal."]
            },
            {
            "id": "item_203",
            "title": "Reading: 'Hash Maps'",
            "type": "default",
            "description": ["How hash maps handle collisions.", "Performance characteristics."]
            }
        ]
    },
    {
        "sectionId": "sec_03",
        "title": "Module 3: Database Fundamentals (SQL)",
        "items": [
            {
            "id": "item_301",
            "title": "Lecture 3.1: Relational Algebra",
            "type": "mp4",
            "description": ["Introduction to SELECT, PROJECT, and JOIN operations."]
            },
            {
            "id": "item_302",
            "title": "Database Schema: 'ER Diagram'",
            "type": "svg",
            "description": ["Entity-Relationship diagram for the course project."]
            }
        ]
    }
]


export default function CourseStructure() {
    // State to manage section expansion (for interactivity)

    return (
        <div>
            <Header/>
            <div className="font-sans min-h-screen p-8 text-gray-800">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-primary">{courseTitle} ({courseID})</h1>
                        <p className="text-lg font-medium text-gray-700">{lecturer} [{className}]</p>
                    </div>
                    <button className="px-5 py-2 bg-primary text-white font-semibold rounded-lg hover:bg-secondary transition duration-200">
                        Create Section
                    </button>
                </div>
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    {sectionSamples.map((section) => (
                        <CourseSection key={section.sectionId} title={section.title} items={section.items}/>
                    ))}
                </div>
            </div>
            <Footer/>
        </div>
    );
}
