import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CourseSectionStudent from '../../components/course/CourseSectionStudent';
import FileDetails from './FileDetails';
import { useState, useRef, useEffect } from 'react';

const COURSE_STORAGE_KEY = "tss_course_sections_v1";
const COURSE_FILEDATA_PREFIX = "tss_course_file_";

// Deduplicate items within each section by id
const dedupeSections = (sections) =>
    (sections || []).map(sec => {
        const seen = new Set();
        const items = (sec.items || []).filter(item => {
            if (!item?.id) return true;
            if (seen.has(item.id)) return false;
            seen.add(item.id);
            return true;
        });
        return { ...sec, items };
    });

const courseTitle = "Software Engineering";
const courseID = "C03001";
const lecturer = "Tran Truong Tan Phat";
const className = "CC04 - CC05";

export default function CourseStructureStudent() {
    const [sections, setSections] = useState([]);
    const [selectedItem, setSelectedItem] = useState(null);
    const fileDataRef = useRef({});
    // Load sections + file data from localStorage and keep in sync
    useEffect(() => {
        const loadFromStorage = () => {
            const saved = JSON.parse(localStorage.getItem(COURSE_STORAGE_KEY) || "null");
            const data = saved && saved.length > 0 ? saved : [];
            const deduped = dedupeSections(data);
            setSections(deduped);

            const fileData = {};
            deduped?.forEach(section => {
                section.items?.forEach(item => {
                    if (item.id) {
                        const key = `${COURSE_FILEDATA_PREFIX}${item.id}`;
                        const stored = localStorage.getItem(key);
                        if (stored) fileData[item.id] = stored;
                    }
                });
            });
            fileDataRef.current = fileData;
        };

        loadFromStorage();

        const handleStorage = (e) => {
            if (!e.key) return;
            if (e.key === COURSE_STORAGE_KEY || e.key.startsWith(COURSE_FILEDATA_PREFIX)) {
                loadFromStorage();
            }
        };

        const handleFocus = () => loadFromStorage();
        const intervalId = setInterval(loadFromStorage, 2000);

        window.addEventListener('storage', handleStorage);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('storage', handleStorage);
            window.removeEventListener('focus', handleFocus);
            clearInterval(intervalId);
        };
    }, []);

    const handleViewDetails = (item) => {
        if (item.type?.toLowerCase() === 'folder') {
            return;
        }
        const dataUrl = fileDataRef.current[item.id];
        setSelectedItem({ ...item, dataUrl });
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleDownload = (item) => {
        const dataUrl = fileDataRef.current[item.id];
        if (dataUrl) {
            const link = document.createElement('a');
            link.href = dataUrl;
            link.download = item.title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

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
                </div>
                <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    {sections.map((section) => (
                        <CourseSectionStudent
                            key={section.sectionId}
                            sectionId={section.sectionId}
                            title={section.title} 
                            description={section.description || ""}
                            items={section.items} 
                            onViewDetails={handleViewDetails}
                            onDownload={handleDownload}
                        />
                    ))}
                </div>
            </div>
            <Footer/>

            {/* File Details Modal */}
            {selectedItem && (
                <FileDetails 
                    file={selectedItem} 
                    comments={selectedItem.comments || []}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}
