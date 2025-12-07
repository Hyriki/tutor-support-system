import React from 'react';
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import CourseSectionStudent from '../../components/course/CourseSectionStudent';
import FileDetails from './FileDetails';
import { getDownloadUrl } from '../../lib/s3Client';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const COURSE_STORAGE_KEY = "tss_course_sections_v1";

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
    const navigate = useNavigate();
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
            // S3 URLs are stored directly in items, no need to load from localStorage
        };

        loadFromStorage();

        const handleStorage = (e) => {
            if (!e.key) return;
            if (e.key === COURSE_STORAGE_KEY) {
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

    const handleViewDetails = (incomingItem) => {
        let fullItem = null;

        // Duyệt qua các section để tìm item
        for (const section of sections) {
            if (section.items) {
                const found = section.items.find(i => i.id === incomingItem.id);
                if (found) {
                    fullItem = found;
                    break; 
                }
            }
        }
        
        // Nếu không tìm thấy (hiếm), dùng tạm item gửi lên
        const itemToView = fullItem || incomingItem;

        if (itemToView.type?.toLowerCase() === 'folder') {
            return;
        }

        // [FIX QUAN TRỌNG]: Chỉ lấy dataUrl từ fileDataRef (file vừa upload từ máy lên)
        // KHÔNG dùng item.s3Url vì đó là link chưa ký (sẽ bị 403 Forbidden)
        // Khi dataUrl là null, component FileDetails sẽ tự động dùng s3Key để lấy link xịn.
        const dataUrl = fileDataRef.current[itemToView.id];
        
        setSelectedItem({ ...itemToView, dataUrl });
    };

    const handleCloseModal = () => {
        setSelectedItem(null);
    };

    const handleDownload = async (item) => {
        try {
            // Get presigned download URL from backend
            if (item.s3Key) {
                const downloadUrl = await getDownloadUrl(item.s3Key);
                
                const link = document.createElement('a');
                link.href = downloadUrl;
                link.download = item.title;
                link.target = '_blank';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        } catch (error) {
            console.error("Download error:", error);
            alert("Failed to download file");
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
                    <button 
                        onClick={() => navigate("/courses")}
                        className='px-5 py-2 bg-gray-100 cursor-pointer'
                    >
                    </button>
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
