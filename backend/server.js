import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import archiver from "archiver";
import { PassThrough } from "stream";
import { S3Client, GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { getPresignedUploadUrl, deleteFromS3, getS3FileUrl, uploadToS3, getDownloadUrl } from "./s3Utils.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure multer for file uploads
const upload = multer({ storage: multer.memoryStorage() });

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
  credentials: true
}));
app.use(express.json());

// Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Backend is running" });
});

// Helper: Get S3 client for this module
function getS3Client() {
  const S3_REGION = process.env.S3_REGION || "ap-southeast-2";
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

  return new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID || "",
      secretAccessKey: AWS_SECRET_ACCESS_KEY || ""
    }
  });
}

/**
 * POST /api/upload/presigned-url
 * Get presigned URL for uploading file to S3
 * Body: { fileName, fileType, folder? }
 */
app.post("/api/upload/presigned-url", async (req, res) => {
  try {
    const { fileName, fileType, folder = "course-files" } = req.body;

    if (!fileName || !fileType) {
      return res.status(400).json({ error: "fileName and fileType are required" });
    }

    const result = await getPresignedUploadUrl(fileName, fileType, folder);
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/upload/file
 * Upload file directly to S3 via backend (solves CORS issue)
 * Body: FormData with 'file' field
 */
app.post("/api/upload/file", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const folder = req.body.folder || "course-files";
    const fileName = req.file.originalname;
    const fileBuffer = req.file.buffer;
    const fileType = req.file.mimetype;

    // Upload to S3 via backend (no CORS issues)
    const result = await uploadToS3(fileBuffer, fileName, fileType, folder);

    res.json({
      success: true,
      key: result.key,
      url: result.url
    });
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/upload/:fileKey
 * Delete file from S3
 * Params: fileKey (URL-encoded S3 key)
 */
app.delete("/api/upload/:fileKey", async (req, res) => {
  try {
    const fileKey = decodeURIComponent(req.params.fileKey);

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    const result = await deleteFromS3(fileKey);
    res.json(result);
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/upload/url/:fileKey
 * Get public URL for S3 file
 * Params: fileKey (URL-encoded S3 key)
 */
app.get("/api/upload/url/:fileKey", (req, res) => {
  try {
    const fileKey = decodeURIComponent(req.params.fileKey);

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    const url = getS3FileUrl(fileKey);
    res.json({ url, key: fileKey });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/download/:fileKey
 * Get presigned download URL for file
 * Params: fileKey (URL-encoded S3 key)
 */
app.get("/api/download/:fileKey", async (req, res) => {
  try {
    const fileKey = decodeURIComponent(req.params.fileKey);
    const fileName = req.query.fileName; 
    const isPreview = req.query.isPreview === 'true'; // Convert string "true" về boolean

    if (!fileKey) {
      return res.status(400).json({ error: "fileKey is required" });
    }

    const downloadUrl = await getDownloadUrl(fileKey, fileName, isPreview);
    res.json({ downloadUrl, key: fileKey });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/download/folder
 * Create ZIP file of folder and stream it directly to client
 * Body: { folderName, fileKeys: ["key1", "key2", ...] }
 */
app.post("/api/download/folder", async (req, res) => {
  try {
    const { folderName = "folder", fileKeys = [] } = req.body;

    if (!Array.isArray(fileKeys) || fileKeys.length === 0) {
      return res.status(400).json({ error: "fileKeys array is required and must not be empty" });
    }

    const S3_BUCKET = process.env.S3_BUCKET || "tutor-support";
    const s3Client = getS3Client();
    
    // Create archive
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    // Handle errors
    archive.on('error', (err) => {
      console.error("Archive error:", err);
      res.status(500).json({ error: "ZIP creation failed" });
    });

    // Pipe archive directly to response
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${folderName}.zip"`);
    archive.pipe(res);

    // Add all files from S3 to archive
    console.log(`Starting to add ${fileKeys.length} files to archive...`);
    for (const fileKey of fileKeys) {
      try {
        console.log(`Fetching from S3: ${fileKey}`);
        const command = new GetObjectCommand({
          Bucket: S3_BUCKET,
          Key: fileKey
        });

        const s3Object = await s3Client.send(command);
        
        // Convert stream to buffer
        const s3Chunks = [];
        for await (const chunk of s3Object.Body) {
          s3Chunks.push(chunk);
        }
        const fileBuffer = Buffer.concat(s3Chunks);
        
        const fileName = fileKey.split('/').pop();
        archive.append(fileBuffer, { name: fileName });
        console.log(`Added to archive: ${fileName} (${fileBuffer.length} bytes)`);
      } catch (err) {
        console.error(`Failed to get file ${fileKey}:`, err.message);
      }
    }

    // Finalize archive
    console.log(`Finalizing archive...`);
    archive.finalize();

  } catch (error) {
    console.error("Folder download error:", error);
    if (!res.headersSent) {
      res.status(500).json({ error: error.message });
    }
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Backend server running on http://localhost:${PORT}`);
  console.log(`📝 API Documentation:`);
  console.log(`   POST   /api/upload/file          - Upload file to S3 (FormData)`);
  console.log(`   POST   /api/upload/presigned-url - Get presigned URL for upload`);
  console.log(`   DELETE /api/upload/:fileKey      - Delete file from S3`);
  console.log(`   GET    /api/upload/url/:fileKey  - Get public URL`);
  console.log(`   GET    /api/download/:fileKey    - Get presigned download URL`);
  console.log(`   POST   /api/download/folder      - Create ZIP of folder and get download URL`);
});
