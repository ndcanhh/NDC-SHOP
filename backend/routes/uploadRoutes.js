const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');
const streamifier = require('streamifier');

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false);
    }
};

const upload = multer({ storage, fileFilter });

// POST /api/upload
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh!' });
        }

        // Sử dụng Upload Stream để đẩy trực tiếp buffer lên Cloudinary
        let streamUpload = (req) => {
            return new Promise((resolve, reject) => {
                let stream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'ndc_shop',
                    },
                    (error, result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(error);
                        }
                    }
                );
                streamifier.createReadStream(req.file.buffer).pipe(stream);
            });
        };

        async function upload(req) {
            let result = await streamUpload(req);
            return result;
        }

        const result = await upload(req);

        res.json({
            message: 'Upload ảnh thành công!',
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({ 
            message: 'Upload ảnh thất bại!', 
            error: error.message || 'Lỗi server khi upload' 
        });
    }
});

module.exports = router;
