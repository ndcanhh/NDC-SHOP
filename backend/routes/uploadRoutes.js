const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// lưu ảnh tạm trong bộ nhớ RAM trước khi đẩy lên cloud
const storage = multer.memoryStorage();

// chỉ cho phép upload file ảnh (jpg, png, webp), từ chối file khác
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false);
    }
};

const upload = multer({ storage, fileFilter });

// POST /api/upload — Nhận 1 file ảnh, upload lên Cloudinary, trả về URL
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh!' });
        }

        // Chuyển đổi file từ buffer (dữ liệu thô trong RAM) sang dạng base64
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'ndc_shop',           
            resource_type: 'image',       
        });

        res.json({
            message: 'Upload ảnh thành công!',
            url: result.secure_url,       
            public_id: result.public_id   
        });
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({ message: 'Upload ảnh thất bại!', error: error.message });
    }
});

module.exports = router;
