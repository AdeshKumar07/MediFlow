const multer = require('multer');
const path = require('path');
const fs = require('fs');

// ─── Report Upload (PDF + Images) ────────────────────────────────────────────
const reportStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'reports');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, `report-${uniqueSuffix}${ext}`);
  }
});

const reportFileFilter = (req, file, cb) => {
  // Allow PDF, PNG, JPG, JPEG
  const allowedExts = ['.pdf', '.png', '.jpg', '.jpeg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only PDF and images (.png, .jpg, .jpeg) are allowed.'), false);
  }
};

const upload = multer({
  storage: reportStorage,
  fileFilter: reportFileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

// ─── Hospital Gallery Upload (Images only) ────────────────────────────────────
const hospitalImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '..', 'uploads', 'hospital-images');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `hospital-${uniqueSuffix}${ext}`);
  }
});

const imageOnlyFilter = (req, file, cb) => {
  const allowedExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExts.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images (.png, .jpg, .jpeg, .webp, .gif) are allowed.'), false);
  }
};

const hospitalImageUpload = multer({
  storage: hospitalImageStorage,
  fileFilter: imageOnlyFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10 MB
});

module.exports = upload;
module.exports.hospitalImageUpload = hospitalImageUpload;
