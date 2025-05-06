/**
 * AWS S3 utility functions
 * Handles file uploads to S3 bucket
 */
const AWS = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const path = require('path');
const config = require('../config');

// Configure AWS SDK
AWS.config.update({
  accessKeyId: config.aws.accessKeyId,
  secretAccessKey: config.aws.secretAccessKey,
  region: config.aws.region
});

// Create S3 instance
const s3 = new AWS.S3();

// Check if S3 credentials are configured
const isS3Configured = () => {
  return config.aws.accessKeyId && config.aws.secretAccessKey && config.aws.bucket;
};

// Configure multer for S3 uploads
const uploadToS3 = multer({
  storage: isS3Configured() ? multerS3({
    s3: s3,
    bucket: config.aws.bucket,
    acl: 'public-read',
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${path.basename(file.originalname)}`;
      const folderPath = req.query.folder || 'products';
      cb(null, `${folderPath}/${fileName}`);
    }
  }) : multer.diskStorage({
    // Fallback to local storage if S3 is not configured
    destination: (req, file, cb) => {
      cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${Math.random().toString(36).substring(2, 15)}_${path.basename(file.originalname)}`);
    }
  }),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only images
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only image files are allowed!'));
  }
});

/**
 * Delete file from S3 bucket
 * @param {string} fileUrl - URL of the file to delete
 * @returns {Promise<Object>} - Deletion result
 */
const deleteFileFromS3 = async (fileUrl) => {
  if (!isS3Configured()) {
    console.log('S3 not configured, skipping delete');
    return { success: false, message: 'S3 not configured' };
  }

  try {
    // Extract key from URL
    const key = fileUrl.split(`${config.aws.bucket}/`)[1];
    
    if (!key) {
      return { success: false, message: 'Invalid file URL' };
    }

    const params = {
      Bucket: config.aws.bucket,
      Key: key
    };

    await s3.deleteObject(params).promise();
    return { success: true };
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get S3 file URL
 * @param {string} key - S3 object key
 * @returns {string} - S3 file URL
 */
const getS3FileUrl = (key) => {
  if (!isS3Configured()) {
    return `/uploads/${key}`;
  }
  return `https://${config.aws.bucket}.s3.${config.aws.region}.amazonaws.com/${key}`;
};

module.exports = {
  uploadToS3,
  deleteFileFromS3,
  getS3FileUrl,
  isS3Configured
};