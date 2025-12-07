import { S3Client, DeleteObjectCommand, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

function getS3Client() {
  const S3_REGION = process.env.S3_REGION || "ap-southeast-2";
  const AWS_ACCESS_KEY_ID = process.env.AWS_ACCESS_KEY_ID;
  const AWS_SECRET_ACCESS_KEY = process.env.AWS_SECRET_ACCESS_KEY;

  console.log("AWS Credentials Check:", {
    hasAccessKey: !!AWS_ACCESS_KEY_ID,
    hasSecretKey: !!AWS_SECRET_ACCESS_KEY
  });

  return new S3Client({
    region: S3_REGION,
    credentials: {
      accessKeyId: AWS_ACCESS_KEY_ID || "",
      secretAccessKey: AWS_SECRET_ACCESS_KEY || ""
    }
  });
}

/**
 * Get presigned URL for uploading file to S3
 * @param {string} fileName - Name of file
 * @param {string} fileType - MIME type
 * @param {string} folder - Folder in S3
 */
export async function getPresignedUploadUrl(fileName, fileType, folder = "uploads") {
  try {
    const S3_BUCKET = process.env.S3_BUCKET || "tutor-support";
    const S3_REGION = process.env.S3_REGION || "ap-southeast-2";
    const timestamp = Date.now();
    const fileKey = `${folder}/${timestamp}-${fileName}`;

    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey,
      ContentType: fileType
    });

    const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 });

    return {
      presignedUrl,
      key: fileKey,
      url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileKey}`,
      expiresIn: 3600
    };
  } catch (error) {
    console.error("Presigned URL Error:", error);
    throw error;
  }
}

/**
 * Upload file directly to S3 (server-side)
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} fileName - Original file name
 * @param {string} fileType - MIME type
 * @param {string} folder - Folder in S3
 */
export async function uploadToS3(fileBuffer, fileName, fileType, folder = "uploads") {
  try {
    const S3_BUCKET = process.env.S3_BUCKET || "tutor-support";
    const S3_REGION = process.env.S3_REGION || "ap-southeast-2";
    const timestamp = Date.now();
    const fileKey = `${folder}/${timestamp}-${fileName}`;

    const s3Client = getS3Client();
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey,
      Body: fileBuffer,
      ContentType: fileType
    });

    await s3Client.send(command);
    console.log(`File uploaded to S3: ${fileKey}`);

    return {
      key: fileKey,
      url: `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileKey}`
    };
  } catch (error) {
    console.error("S3 Upload Error:", error);
    throw error;
  }
}

/**
 * Delete file from S3
 * @param {string} fileKey - S3 object key
 */
export async function deleteFromS3(fileKey) {
  try {
    const S3_BUCKET = process.env.S3_BUCKET || "tutor-support";
    const s3Client = getS3Client();
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey
    });

    await s3Client.send(command);
    console.log(`File deleted from S3: ${fileKey}`);
    return { success: true, key: fileKey };
  } catch (error) {
    console.error("S3 Delete Error:", error);
    throw error;
  }
}

/**
 * Get S3 file URL
 * @param {string} fileKey - S3 object key
 */
export function getS3FileUrl(fileKey) {
  if (!fileKey) return null;
  const S3_BUCKET = process.env.S3_BUCKET || "tutor-support";
  const S3_REGION = process.env.S3_REGION || "ap-southeast-2";
  return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${fileKey}`;
}

const getMimeType = (fileName) => {
    if (!fileName) return 'application/octet-stream';
    const ext = fileName.split('.').pop().toLowerCase();
    const mimeMap = {
        'pdf': 'application/pdf',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
        'gif': 'image/gif',
        'webp': 'image/webp',
        'txt': 'text/plain',
        'html': 'text/html',
        'mp4': 'video/mp4'
    };
    return mimeMap[ext] || 'application/octet-stream';
};

/**
 * Get presigned download URL for S3 file
 * @param {string} fileKey - S3 object key
 */
export async function getDownloadUrl(fileKey, fileName, isPreview = false) {
  try {
    const S3_BUCKET = process.env.S3_BUCKET || "tutor-support";
    const S3_REGION = process.env.S3_REGION || "ap-southeast-2";
    
    console.log(`Generating presigned URL for: ${fileKey}`);
    console.log(`Region: ${S3_REGION}, Bucket: ${S3_BUCKET}`);
    console.log(`isPreview: ${isPreview}, fileName: ${fileName}`);

    const downloadFileName = fileName || fileKey.split('/').pop() || 'downloaded-file';
    const s3Client = getS3Client();
    const contentType = isPreview ? getMimeType(downloadFileName) : 'application/octet-stream';
    console.log(`Determined content type: ${contentType}`);
    const dispositionType = isPreview ? 'inline' : 'attachment';
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: fileKey,
      ResponseContentDisposition: `${dispositionType}; filename="${encodeURIComponent(downloadFileName)}"`,
      ResponseContentType: contentType
    });

    // Use longer expiry time and explicit configuration
    const downloadUrl = await getSignedUrl(s3Client, command, { 
      expiresIn: 3600  // 1 hour
    });
    
    console.log(`Generated presigned URL successfully for: ${fileKey}`);
    console.log(`URL length: ${downloadUrl.length}`);
    
    return downloadUrl;
  } catch (error) {
    console.error("Download URL Error:", error);
    throw error;
  }
}
