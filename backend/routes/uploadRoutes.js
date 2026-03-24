// File này là "Cửa nhận hàng" — nơi Backend nhận file ảnh từ Frontend
// rồi chuyển phát nhanh lên kho Cloudinary trên đám mây

const express = require('express');
const router = express.Router();
const cloudinary = require('../config/cloudinary');
const multer = require('multer');

// Cấu hình multer: lưu ảnh tạm trong bộ nhớ RAM trước khi đẩy lên cloud
// (Giống như nhân viên bưu điện cầm bưu kiện trên tay trong lúc chờ xe tải đến)
const storage = multer.memoryStorage();

// Bộ lọc: chỉ cho phép upload file ảnh (jpg, png, webp), từ chối file khác
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);  // ✅ Đây là ảnh → cho phép
    } else {
        cb(new Error('Chỉ được upload file ảnh!'), false); // ❌ Không phải ảnh → từ chối
    }
};

const upload = multer({ storage, fileFilter });

// POST /api/upload — Nhận 1 file ảnh, upload lên Cloudinary, trả về URL
router.post('/', upload.single('image'), async (req, res) => {
    try {
        // Nếu không có file nào được gửi lên
        if (!req.file) {
            return res.status(400).json({ message: 'Vui lòng chọn một file ảnh!' });
        }

        // Chuyển đổi file từ buffer (dữ liệu thô trong RAM) sang dạng base64
        // để Cloudinary có thể đọc hiểu và lưu trữ
        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        // Upload lên Cloudinary — folder "ndc_shop" để gom ảnh vào 1 thư mục trên cloud
        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'ndc_shop',           // Thư mục trên Cloudinary
            resource_type: 'image',       // Loại file: ảnh
        });

        // Trả về URL ảnh đã upload thành công cho Frontend
        res.json({
            message: 'Upload ảnh thành công!',
            url: result.secure_url,       // Đường link HTTPS an toàn của ảnh trên cloud
            public_id: result.public_id   // ID định danh ảnh (dùng để xóa sau này)
        });
    } catch (error) {
        console.error('Lỗi upload ảnh:', error);
        res.status(500).json({ message: 'Upload ảnh thất bại!', error: error.message });
    }
});

module.exports = router;
