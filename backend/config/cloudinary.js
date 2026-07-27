const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Check if credentials are provided
const isCloudinaryConfigured = 
  process.env.CLOUDINARY_CLOUD_NAME && 
  process.env.CLOUDINARY_API_KEY && 
  process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  // Configure Cloudinary
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

// Upload directory is now in the backend root, not inside public
const uploadDir = path.join(__dirname, '..', 'uploads');

// Ensure upload directory exists for local fallback
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Custom Fallback Multer Storage Engine to catch Cloudinary errors dynamically
class FallbackStorage {
  async _handleFile(req, file, cb) {
    try {
      // 1. Buffer the file stream in memory
      const chunks = [];
      for await (const chunk of file.stream) {
        chunks.push(chunk);
      }
      const buffer = Buffer.concat(chunks);

      // 2. If Cloudinary config exists, try uploading from memory uploader
      if (isCloudinaryConfigured) {
        try {
          const cloudinaryUrl = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
              {
                folder: 'campusloop',
                allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
                transformation: [{ width: 800, height: 600, crop: 'limit' }],
              },
              (error, result) => {
                if (error) {
                  reject(error);
                } else {
                  resolve(result.secure_url);
                }
              }
            );
            uploadStream.end(buffer);
          });

          // Cloudinary success: return file object with path property
          return cb(null, {
            path: cloudinaryUrl,
            size: buffer.length,
          });
        } catch (cloudinaryErr) {
          console.warn('Cloudinary upload failed (possibly invalid or expired credentials). Falling back to local disk storage.', cloudinaryErr.message || cloudinaryErr);
        }
      }

      // 3. Local Fallback Disk Storage in root backend/uploads
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const filename = file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname);
      const destPath = path.join(uploadDir, filename);

      await fs.promises.writeFile(destPath, buffer);

      // Local success: return file object with filename property
      cb(null, {
        filename: filename,
        size: buffer.length,
      });
    } catch (err) {
      cb(err);
    }
  }

  _removeFile(req, file, cb) {
    if (file.filename) {
      const filePath = path.join(uploadDir, file.filename);
      fs.unlink(filePath, cb);
    } else {
      cb(null);
    }
  }
}

const storage = new FallbackStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images (JPEG, JPG, PNG, WEBP) are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB limit
  fileFilter: fileFilter,
});

module.exports = {
  upload,
  isCloudinaryConfigured,
  cloudinary
};
