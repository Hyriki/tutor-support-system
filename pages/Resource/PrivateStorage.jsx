import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import ResourceCard from "../../components/resource/ResourceCard";
import { Link, useNavigate } from "react-router-dom";
import {
    FaRegCommentDots,
    FaSearch,
    FaFilter,
    FaFolderPlus,
    FaBars,
    FaTh,
    FaUpload,
    FaFolder,
    FaFilePdf,
    FaFileVideo,
    FaFileImage,
    FaEllipsisV,
    FaEye,
    FaDownload,
    FaShareAlt,
} from 'react-icons/fa';

const sampleFiles = [
    {
        "title": "Untitled.pdf",
        "type": "pdf",
        "size": "34",
        "size_unit": "KB"
    },
    {
        "title": "Project Files",
        "type": "folder",
        "size": null,
        "size_unit": null
    },
    {
        "title": "Final_Report_v2.docx",
        "type": "docx",
        "size": "1.2",
        "size_unit": "MB"
    },
    {
        "title": "mountains_wallpaper.jpg",
        "type": "jpg",
        "size": "4.5",
        "size_unit": "MB"
    },
    {
        "title": "user_data.json",
        "type": "json",
        "size": "88",
        "size_unit": "KB"
    },
    {
        "title": "Archived Photos",
        "type": "folder",
        "size": null,
        "size_unit": null
    },
    {
        "title": "app.js",
        "type": "js",
        "size": "15",
        "size_unit": "KB"
    },
    {
        "title": "video_backup.zip",
        "type": "zip",
        "size": "1.8",
        "size_unit": "GB"
    },
    {
        "title": "notes.txt",
        "type": "txt",
        "size": "5",
        "size_unit": "KB"
    },
    {
        "title": "company_logo.svg",
        "type": "svg",
        "size": "12",
        "size_unit": "KB"
    }
]



const PrivateStorage = () => {
    const storageUsed = 123.07;
    const totalStorage = 300.00;
    const storagePercentage = (storageUsed / totalStorage) * 100;

    return (
        <div className="">
            <Header />
                <div className="font-sans text-gray-900 bg-white p-8 max-w-7xl mx-auto">
                            
                    {/* ---- 1. Header: Profile & Messages ---- */}
                    <header className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-200 rounded-full">
                                {/* Avatar placeholder */}
                            </div>
                            <div>
                                <h1 className="text-xl font-bold tracking-wide">JOHN DOE</h1>
                            </div>
                        </div>
                        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200">
                            <FaRegCommentDots className="w-5 h-5" />
                            Messages
                        </button>
                    </header>

                    {/* ---- 2. Storage Info ---- */}
                    <section className="mb-8">
                        <h2 className="text-lg font-semibold mb-3">Private Files</h2>
                        <div className="bg-primary-light border border-border-primary rounded-lg p-5">
                            <div className="flex justify-between text-sm font-medium text-gray-700 mb-2">
                                <span>Storage Used: {storageUsed} MB of {totalStorage} MB</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-2.5">
                                <div 
                                    className="bg-secondary h-2.5 rounded-full" 
                                    style={{ width: `${storagePercentage}%` }}
                                ></div>
                            </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-3">
                            Maximum file size for new uploads: 200 MB, total storage limit: 300 MB
                        </p>
                    </section>

                    {/* ---- 3. Tabs Navigation ---- */}
                    <nav className="flex border-b border-gray-200 mb-6">
                        <button className="cursor-pointer py-3 px-5 text-sm font-semibold text-primary border-b-2 border-primary">
                            My Files
                        </button>
                        {/* <button className="py-3 px-5 text-sm font-semibold text-gray-500 hover:text-gray-800">
                            Shared Files
                        </button> */}
                        <button className="cursor-pointer py-3 px-5 text-sm font-semibold text-gray-500 hover:text-gray-800">
                            Recent
                        </button>
                    </nav>

                    {/* ---- 4. Action Bar: Search, Filter, Buttons ---- */}
                    <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
                        <div className="relative w-full md:w-auto">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                                <FaSearch className="w-5 h-5 text-gray-400" />
                            </span>
                            <input
                                type="search"
                                placeholder="Search Files..."
                                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm w-full md:w-80 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100 rounded-lg">
                                <FaFilter className="w-5 h-5" />
                                Filter
                            </button>
                            <button className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg cursor-pointer hover:bg-secondary">
                                <FaFolderPlus className="w-5 h-5" />
                                New Folder
                            </button>
                            <div className="flex items-center gap-1 ml-2">
                                <button className="p-2 text-gray-500 rounded-lg cursor-pointer hover:bg-gray-100">
                                    <FaBars className="w-6 h-6" />
                                </button>
                                <button className="p-2 text-primary cursor-pointer bg-gray-100 rounded-lg">
                                    <FaTh className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ---- 5. Upload Area ---- */}
                    <section className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center mb-8">
                        <div className="flex items-center justify-center w-16 h-16 mx-auto bg-gray-100 rounded-full mb-4">
                            <FaUpload className="w-8 h-8 text-gray-500" />
                        </div>
                        <p className="text-gray-600 mb-2">Add files by dragging and dropping them here</p>
                        <p className="text-sm text-gray-400 mb-4">OR</p>
                        <button className="flex items-center gap-2 px-6 py-2.5 mx-auto text-sm font-semibold text-white bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-900">
                            <FaUpload className="w-5 h-5" />
                            Choose Files
                        </button>
                    </section>

                    {/* ---- 6. File Grid ---- */}
                    <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {sampleFiles.map((item, index) => {
                            return <ResourceCard key={index} type={item.type} size={item.size} size_unit={item.size_unit} title={item.title} />
                        })}
                        

                    </section>

                    {/* ---- 7. Footer Actions ---- */}
                    <footer className="flex items-center gap-4">
                        <button className="px-8 py-2.5 font-semibold text-white bg-primary rounded-lg cursor-pointer hover:bg-secondary">
                            Save Changes
                        </button>
                        <button className="px-8 py-2.5 font-semibold text-primary bg-white border border-primary rounded-lg cursor-pointer hover:bg-teal-50">
                            Cancel
                        </button>
                    </footer>

                </div>
            <Footer />
        </div>
    )
}
export default PrivateStorage;