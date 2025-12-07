# Backend for Tutor Support System

Backend Node.js API server cho upload files lên AWS S3.

## Setup

1. **Cài đặt dependencies:**
   ```bash
   cd backend
   npm install
   ```

2. **Cấu hình AWS credentials** - Edit `.env`:
   ```
   AWS_ACCESS_KEY_ID=your_key
   AWS_SECRET_ACCESS_KEY=your_secret
   S3_BUCKET=tutor-support
   S3_REGION=ap-southeast-2
   PORT=5000
   ```

3. **Chạy server:**
   ```bash
   npm start       # Production
   npm run dev     # Development (với nodemon)
   ```

## API Endpoints

### 1. Lấy Presigned URL để upload
```
POST /api/upload/presigned-url
Body: {
  "fileName": "document.pdf",
  "fileType": "application/pdf",
  "folder": "course-files"  // optional, default: "course-files"
}

Response: {
  "presignedUrl": "https://...",
  "key": "course-files/1234567890-document.pdf",
  "url": "https://tutor-support.s3.ap-southeast-2.amazonaws.com/course-files/...",
  "expiresIn": 3600
}
```

### 2. Xóa file khỏi S3
```
DELETE /api/upload/course-files%2F1234567890-document.pdf
(fileKey được URL-encoded)

Response: {
  "success": true,
  "key": "course-files/1234567890-document.pdf"
}
```

### 3. Lấy URL public của file
```
GET /api/upload/url/course-files%2F1234567890-document.pdf

Response: {
  "url": "https://tutor-support.s3.ap-southeast-2.amazonaws.com/course-files/...",
  "key": "course-files/1234567890-document.pdf"
}
```

## Cách hoạt động

1. **Frontend** gọi `/api/upload/presigned-url` để lấy signed URL
2. **Frontend** upload file trực tiếp lên S3 qua signed URL
3. **Frontend** lưu S3 key + URL vào localStorage/database
4. **Khi delete**, gọi `/api/upload/:fileKey` để xóa khỏi S3

## CORS Configuration

Backend cho phép requests từ:
- http://localhost:5173 (Vite dev server)
- http://localhost:3000
- http://127.0.0.1:5173

Để thêm domain khác, edit `server.js` phần CORS.
