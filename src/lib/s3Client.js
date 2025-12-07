// Backend API configuration
const BACKEND_API = import.meta.env.VITE_BACKEND_API || "http://localhost:5000";

/**
 * Get presigned URL for uploading file to S3 (via backend API)
 * @param {string} fileName - Name of the file
 * @param {string} fileType - MIME type of the file
 * @param {string} folder - Folder path in S3
 * @returns {Promise<{presignedUrl: string, key: string, url: string}>}
 */
export async function getPresignedUploadUrl(fileName, fileType, folder = "uploads") {
  try {
    const response = await fetch(`${BACKEND_API}/api/upload/presigned-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        fileName,
        fileType,
        folder
      })
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return {
      presignedUrl: data.presignedUrl,
      key: data.key,
      url: data.url
    };
  } catch (error) {
    console.error("Presigned URL Error:", error);
    throw new Error(`Failed to get presigned URL: ${error.message}`);
  }
}

/**
 * Upload file using backend endpoint (solves CORS issue)
 * @param {File} file - File object
 * @param {string} folder - S3 folder path (default: "course-files")
 * @returns {Promise<{key: string, url: string}>}
 */
export async function uploadFileWithPresignedUrl(file, folder = "course-files") {
  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("folder", folder);

    const response = await fetch(`${BACKEND_API}/api/upload/file`, {
      method: "POST",
      body: formData
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }

    const data = await response.json();
    return {
      key: data.key,
      url: data.url
    };
  } catch (error) {
    console.error("Upload Error:", error);
    throw error;
  }
}

/**
 * Delete file from S3 (via backend API)
 * @param {string} fileKey - S3 object key
 * @returns {Promise<void>}
 */
export async function deleteFromS3(fileKey) {
  try {
    const encodedKey = encodeURIComponent(fileKey);
    const response = await fetch(`${BACKEND_API}/api/upload/${encodedKey}`, {
      method: "DELETE"
    });

    if (!response.ok) {
      throw new Error(`Backend error: ${response.status} ${response.statusText}`);
    }

    console.log(`File deleted from S3: ${fileKey}`);
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Get presigned download URL from backend
 * @param {string} fileKey - S3 file key
 * @returns {Promise<string>} - Presigned download URL
 */
export async function getDownloadUrl(fileKey, fileName = null, isPreview = false) {
  try {
    if (!fileKey) throw new Error("fileKey is required");
    
    const encodedKey = encodeURIComponent(fileKey);
    const queryParams = new URLSearchParams({
        fileName: fileName || "", // Nếu không có thì gửi chuỗi rỗng
        isPreview: isPreview.toString() // Chuyển boolean sang string "true"/"false"
    }).toString();
    const response = await fetch(`${BACKEND_API}/api/download/${encodedKey}?${queryParams}`);

    if (!response.ok) {
      throw new Error(`Failed to get download URL: ${response.status}`);
    }

    const data = await response.json();
    return data.downloadUrl;
  } catch (error) {
    console.error("Download URL Error:", error);
    throw error;
  }
}

/**
 * Get S3 file URL (already stored in item metadata)
 * Note: URLs are now generated and stored by backend during upload
 * @param {string} fileKey - S3 object key
 * @returns {string} - S3 file URL
 */
export function getS3FileUrl(fileKey) {
  if (!fileKey) return null;
  // URL should be passed from item metadata (item.s3Url)
  // This function is kept for backwards compatibility
  return fileKey;
}

/**
 * Download folder as ZIP
 * @param {string} folderName - Name for ZIP file
 * @param {Array<string>} fileKeys - Array of S3 file keys to ZIP
 * @returns {Promise<Blob>} - ZIP file blob
 */
export async function downloadFolderAsZip(folderName, fileKeys) {
  try {
    if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
      throw new Error("fileKeys must be a non-empty array");
    }

    const response = await fetch(`${BACKEND_API}/api/download/folder`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        folderName,
        fileKeys
      })
    });

    if (!response.ok) {
      throw new Error(`Failed to create ZIP: ${response.status}`);
    }

    // Get ZIP as blob directly
    const zipBlob = await response.blob();
    console.log(`ZIP received: ${zipBlob.size} bytes`);
    
    // Create download link and trigger
    const downloadUrl = URL.createObjectURL(zipBlob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${folderName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(downloadUrl);
    
    return zipBlob;
  } catch (error) {
    console.error("Folder ZIP error:", error);
    throw error;
  }
}

/**
 * Check if file is stored on S3
 * @param {string} url - File URL
 * @returns {boolean}
 */
export function isS3File(url) {
  return url && url.includes("amazonaws.com");
}
