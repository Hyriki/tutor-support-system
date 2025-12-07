// import React, { useMemo, useState, useEffect } from "react";
// import mammoth from "mammoth";
// import {
//     FaTimes,
//     FaDownload,
//     FaPrint,
//     FaChevronLeft,
//     FaChevronRight
// } from "react-icons/fa";

// const sampleFile = {
//     title: "SE - CHAPTER 6",
//     type: "pdf",
//     size: "2.5 MB",
//     lastModified: "2024-07-25 10:30 AM",
//     totalPages: 1,
//     previewUrl: "https://i.imgur.com/bWSIKk8.png"
// };

// const sampleComments = [
//     { id: 1, author: "John Doe", timestamp: "2 hours ago", text: "This has some nice notes!", isOnline: true },
//     { id: 2, author: "Jane Doe", timestamp: "1 day ago", text: "Love the lessons!", isOnline: false }
// ];

// const isImage = (ext) => ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext);
// const isPdf = (ext) => ext === "pdf";
// const isTextLike = (ext) => ["txt", "md", "json", "js", "ts", "tsx", "csv", "log"].includes(ext);
// const isDocLike = (ext) => ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);

// const getExt = (file) => {
//     if (!file) return "";
//     if (file.type && !file.type.includes(" ") && file.type.indexOf('/') === -1) return file.type.toLowerCase();
//     if (file.title && file.title.includes('.')) {
//         return file.title.split('.').pop().toLowerCase();
//     }
//     return "";
// };

// export default function FileDetails({ file = sampleFile, onClose, onDownload }) {
//     const ext = useMemo(() => getExt(file), [file]);
//     const title = file?.title || "Untitled";
//     const size = file?.size || "";
//     const sizeUnit = file?.size_unit || "MB";
//     const lastModified = file?.lastModified || "";
//     const dataUrl = file?.dataUrl || file?.previewUrl || "";
//     const totalPages = file?.totalPages || 1;
    
//     const [docxContent, setDocxContent] = useState(null);
//     const [docxLoading, setDocxLoading] = useState(false);
//     const [pdfBlobUrl, setPdfBlobUrl] = useState(null);

//     // Convert DOCX to HTML using mammoth
//     useEffect(() => {
//         if (dataUrl && (ext === "docx" || ext === "doc")) {
//             setDocxLoading(true);
//             // Convert data URL to blob
//             fetch(dataUrl)
//                 .then(res => res.blob())
//                 .then(blob => {
//                     return mammoth.convertToHtml({ arrayBuffer: blob });
//                 })
//                 .then(result => {
//                     setDocxContent(result.value);
//                     setDocxLoading(false);
//                 })
//                 .catch(err => {
//                     console.error("Error converting DOCX:", err);
//                     setDocxLoading(false);
//                 });
//         }
//     }, [dataUrl, ext]);

//     // Convert PDF data URL to blob URL for better iframe compatibility
//     useEffect(() => {
//         if (dataUrl && isPdf(ext)) {
//             fetch(dataUrl)
//                 .then(res => res.blob())
//                 .then(blob => {
//                     const blobUrl = URL.createObjectURL(blob);
//                     setPdfBlobUrl(blobUrl);
//                 })
//                 .catch(err => {
//                     console.error("Error creating PDF blob:", err);
//                 });
//         }
        
//         // Cleanup blob URL when component unmounts
//         return () => {
//             if (pdfBlobUrl) {
//                 URL.revokeObjectURL(pdfBlobUrl);
//             }
//         };
//     }, [dataUrl, ext]);

//     const renderPreview = () => {
//         if (dataUrl && isPdf(ext)) {
//             if (!pdfBlobUrl) {
//                 return (
//                     <div className="text-center text-gray-600 text-sm p-8">
//                         Loading PDF...
//                     </div>
//                 );
//             }
//             return (
//                 <iframe 
//                     src={`${pdfBlobUrl}#toolbar=0`}
//                     title="PDF preview" 
//                     className="w-full h-[60vh] rounded-md border bg-white"
//                     style={{ border: 'none' }}
//                 />
//             );
//         }
//         if (dataUrl && isImage(ext)) {
//             return (
//                 <img src={dataUrl} alt="File preview" className="object-contain max-h-[60vh] w-full rounded-md border shadow-sm bg-white" />
//             );
//         }
//         if (dataUrl && isTextLike(ext)) {
//             return (
//                 <iframe src={dataUrl} title="Text preview" className="w-full h-[60vh] rounded-md border bg-white" />
//             );
//         }
//         if (dataUrl && (ext === "docx" || ext === "doc")) {
//             if (docxLoading) {
//                 return (
//                     <div className="text-center text-gray-600 text-sm p-8">
//                         Loading Word document...
//                     </div>
//                 );
//             }
//             if (docxContent) {
//                 return (
//                     <div 
//                         className="w-full h-[60vh] rounded-md border bg-white p-6 overflow-auto prose prose-sm max-w-none"
//                         dangerouslySetInnerHTML={{ __html: docxContent }}
//                     />
//                 );
//             }
//             return (
//                 <div className="text-center text-gray-600 text-sm">
//                     Could not preview Word document. Please download to open.
//                 </div>
//             );
//         }
//         if (isDocLike(ext)) {
//             return (
//                 <div className="text-center text-gray-600 text-sm">
//                     Preview for Word/Excel/PowerPoint is not available offline. Please download to open locally.
//                 </div>
//             );
//         }
//         if (dataUrl) {
//             return (
//                 <iframe src={dataUrl} title="File preview" className="w-full h-[60vh] rounded-md border bg-white" />
//             );
//         }
//         return (
//             <div className="text-center text-gray-500 text-sm">No preview available. Try downloading the file.</div>
//         );
//     };

//     const handleDownload = () => {
//         if (dataUrl) {
//             const link = document.createElement("a");
//             link.href = dataUrl;
//             link.download = title;
//             document.body.appendChild(link);
//             link.click();
//             document.body.removeChild(link);
//             return;
//         }
//         if (onDownload) onDownload(file);
//     };

//     return (
//         <div>
//             <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20">
//                 <div className="relative w-full max-w-6xl p-6 bg-white rounded-lg shadow-xl m-8">
//                     <div className="flex items-start justify-between pb-4 border-b">
//                         <div>
//                             <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
//                             <p className="text-sm text-gray-500">
//                                 {ext || file.type || "file"} {size ? `| ${size}` : ""} {lastModified ? `| Last modified: ${lastModified}` : ""}
//                             </p>
//                         </div>
//                         <div className="flex items-center gap-4 text-gray-600">
//                             <FaDownload className="w-5 h-5 cursor-pointer hover:text-primary" title="Download" onClick={handleDownload} />
//                             <FaPrint className="w-5 h-5 cursor-pointer hover:text-primary" title="Print" onClick={() => window.print()} />
//                             <FaTimes className="w-6 h-6 cursor-pointer hover:text-red-500" title="Close" onClick={onClose} />
//                         </div>
//                     </div>

//                     <div className="flex flex-col md:flex-row gap-6 pt-6">
//                         <div className="grow bg-gray-100 rounded-lg p-4 flex flex-col justify-between">
//                             <div className="grow flex items-center justify-center">
//                                 {renderPreview()}
//                             </div>
//                             <div className="flex items-center justify-between p-4 bg-white rounded-md mt-4 shadow-inner">
//                                 <button 
//                                     className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-default cursor-pointer" 
//                                     disabled
//                                 >
//                                     <FaChevronLeft />
//                                     Previous
//                                 </button>
//                                 <span className="text-sm text-gray-600">
//                                     Page <span className="font-semibold">1</span> of {totalPages}
//                                 </span>
//                                 <button 
//                                     className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-default cursor-pointer" 
//                                     disabled
//                                 >
//                                     Next
//                                     <FaChevronRight />
//                                 </button>
//                             </div>
//                         </div>

//                         <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6">
//                             <div className="p-4 bg-gray-50 border rounded-lg">
//                                 <h3 className="text-lg font-semibold text-gray-800 mb-3">File Information</h3>
//                                 <div className="space-y-3 text-sm">
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-500">Name:</span>
//                                         <span className="font-medium text-gray-800 wrap-break-words text-right ml-2">{title}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-500">Type:</span>
//                                         <span className="font-medium text-gray-800">{ext || file.type || "file"}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-500">Size:</span>
//                                         <span className="font-medium text-gray-800">{size} {sizeUnit || ""}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-500">Modified:</span>
//                                         <span className="font-medium text-gray-800">{lastModified || "—"}</span>
//                                     </div>
//                                     <div className="flex justify-between">
//                                         <span className="text-gray-500">Pages:</span>
//                                         <span className="font-medium text-gray-800">{totalPages}</span>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }


import React, { useMemo, useState, useEffect } from "react";
import mammoth from "mammoth";
import { getDownloadUrl } from "../../lib/s3Client"; 
import {
    FaTimes,
    FaDownload,
    FaPrint,
    FaChevronLeft,
    FaChevronRight
} from "react-icons/fa";

const sampleFile = {
    title: "SE - CHAPTER 6",
    type: "pdf",
    size: "2.5 MB",
    lastModified: "2024-07-25 10:30 AM",
    totalPages: 1,
    previewUrl: ""
};

const isImage = (ext) => ["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext);
const isPdf = (ext) => ext === "pdf";
const isTextLike = (ext) => ["txt", "md", "json", "js", "ts", "tsx", "csv", "log"].includes(ext);
const isDocLike = (ext) => ["doc", "docx", "xls", "xlsx", "ppt", "pptx"].includes(ext);

const getExt = (file) => {
    if (!file) return "";
    if (file.type && !file.type.includes(" ") && file.type.indexOf('/') === -1) return file.type.toLowerCase();
    if (file.title && file.title.includes('.')) {
        return file.title.split('.').pop().toLowerCase();
    }
    return "";
};

export default function FileDetails({ file = sampleFile, onClose, onDownload }) {
    const ext = useMemo(() => getExt(file), [file]);
    const title = file?.title || "Untitled";
    const size = file?.size || "";
    const sizeUnit = file?.size_unit || "MB";
    const lastModified = file?.lastModified || "";
    const totalPages = file?.totalPages || 1;
    
    // --- State URL ---
    const [s3Url, setS3Url] = useState(null);
    const [isLoadingS3, setIsLoadingS3] = useState(false);

    // URL cuối cùng để hiển thị
    const effectiveUrl = file?.dataUrl || file?.previewUrl || s3Url || "";

    const [docxContent, setDocxContent] = useState(null);
    const [docxLoading, setDocxLoading] = useState(false);

    // --- 1. Lấy Link S3 ---
    useEffect(() => {
        const fetchS3Url = async () => {
            if (!file?.dataUrl && !file?.previewUrl && file?.s3Key) {
                console.log("Title:", file.title);
                try {
                    setIsLoadingS3(true);
                    const url = await getDownloadUrl(file.s3Key, title, true);
                    setS3Url(url);
                } catch (error) {
                    console.error("Failed to fetch preview URL:", error);
                } finally {
                    setIsLoadingS3(false);
                }
            }
        };
        fetchS3Url();
        return () => {
            setS3Url(null);
            setDocxContent(null);
        };
    }, [file]);

    // --- 2. Convert DOCX (Giữ nguyên) ---
    useEffect(() => {
        if (effectiveUrl && (ext === "docx" || ext === "doc")) {
            setDocxLoading(true);
            fetch(effectiveUrl)
                .then(res => res.blob())
                .then(blob => mammoth.convertToHtml({ arrayBuffer: blob }))
                .then(result => {
                    setDocxContent(result.value);
                    setDocxLoading(false);
                })
                .catch(err => {
                    console.error("Error converting DOCX:", err);
                    setDocxLoading(false);
                });
        }
    }, [effectiveUrl, ext]);

    // --- 3. Đã XÓA đoạn fetch PDF Blob gây lỗi ---

    const renderPreview = () => {
        if (isLoadingS3) {
             return <div className="text-center text-gray-600 text-sm p-8">Getting file from server...</div>;
        }

        // --- FIX: Hiển thị PDF trực tiếp bằng Link S3 ---
        if (effectiveUrl && isPdf(ext)) {
            // Dùng Google Docs Viewer làm fallback nếu iframe native không chạy (tuỳ chọn)
            // Hoặc dùng iframe trực tiếp:
            return (
                <iframe 
                    src={`${effectiveUrl}#toolbar=0&navpanes=0&scrollbar=0`}
                    title="PDF preview" 
                    className="w-full h-[60vh] rounded-md border bg-white"
                    style={{ border: 'none' }}
                />
            );
        }

        if (effectiveUrl && isImage(ext)) {
            return (
                <img src={effectiveUrl} alt="File preview" className="object-contain max-h-[60vh] w-full rounded-md border shadow-sm bg-white" />
            );
        }

        if (effectiveUrl && isTextLike(ext)) {
            return (
                <iframe src={effectiveUrl} title="Text preview" className="w-full h-[60vh] rounded-md border bg-white" />
            );
        }

        if (effectiveUrl && (ext === "docx" || ext === "doc")) {
            if (docxLoading) {
                return <div className="text-center text-gray-600 text-sm p-8">Loading Word document...</div>;
            }
            if (docxContent) {
                return (
                    <div 
                        className="w-full h-[60vh] rounded-md border bg-white p-6 overflow-auto prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: docxContent }}
                    />
                );
            }
            return (
                <div className="text-center text-gray-600 text-sm">
                    Could not preview Word document. Please download to open.
                </div>
            );
        }

        if (isDocLike(ext)) {
            return (
                <div className="text-center text-gray-600 text-sm">
                    Preview for Office files is not available. Please download to view.
                </div>
            );
        }

        if (effectiveUrl) {
            return (
                <iframe src={effectiveUrl} title="File preview" className="w-full h-[60vh] rounded-md border bg-white" />
            );
        }

        return (
            <div className="text-center text-gray-500 text-sm">No preview available. Try downloading the file.</div>
        );
    };

    const handleDownload = () => {
        if (onDownload) {
            onDownload(file);
            return;
        }
        if (effectiveUrl) {
            const link = document.createElement("a");
            link.href = effectiveUrl;
            link.download = title;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };

    return (
        <div>
            <div className="fixed inset-0 z-10 flex items-center justify-center bg-black/20" onClick={onClose}>
                <div className="relative w-full max-w-6xl p-6 bg-white rounded-lg shadow-xl m-8" onClick={e => e.stopPropagation()}>
                    <div className="flex items-start justify-between pb-4 border-b">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
                            <p className="text-sm text-gray-500">
                                {ext || file.type || "file"} {size ? `| ${size}` : ""} {lastModified ? `| Last modified: ${lastModified}` : ""}
                            </p>
                        </div>
                        <div className="flex items-center gap-4 text-gray-600">
                            <FaDownload className="w-5 h-5 cursor-pointer hover:text-primary" title="Download" onClick={handleDownload} />
                            <FaPrint className="w-5 h-5 cursor-pointer hover:text-primary" title="Print" onClick={() => window.print()} />
                            <FaTimes className="w-6 h-6 cursor-pointer hover:text-red-500" title="Close" onClick={onClose} />
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 pt-6">
                        <div className="grow bg-gray-100 rounded-lg p-4 flex flex-col justify-between">
                            <div className="grow flex items-center justify-center">
                                {renderPreview()}
                            </div>
                            <div className="flex items-center justify-between p-4 bg-white rounded-md mt-4 shadow-inner">
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-default" disabled>
                                    <FaChevronLeft /> Previous
                                </button>
                                <span className="text-sm text-gray-600">Page <span className="font-semibold">1</span> of {totalPages}</span>
                                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50 disabled:cursor-default" disabled>
                                    Next <FaChevronRight />
                                </button>
                            </div>
                        </div>

                        <div className="w-full md:w-80 lg:w-96 shrink-0 flex flex-col gap-6">
                            <div className="p-4 bg-gray-50 border rounded-lg">
                                <h3 className="text-lg font-semibold text-gray-800 mb-3">File Information</h3>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between"><span className="text-gray-500">Name:</span><span className="font-medium text-gray-800 text-right ml-2 break-all">{title}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Type:</span><span className="font-medium text-gray-800">{ext}</span></div>
                                    <div className="flex justify-between"><span className="text-gray-500">Size:</span><span className="font-medium text-gray-800">{size} {sizeUnit}</span></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}