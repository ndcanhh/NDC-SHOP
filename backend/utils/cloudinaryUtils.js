const cloudinary = require('../config/cloudinary');


const deleteFromCloudinary = async (imageUrl) => {
    if (!imageUrl) return;
    
    try {
        const parts = imageUrl.split('/');
        const fileNameWithExtension = parts[parts.length - 1];
        const publicIdWithoutExtension = fileNameWithExtension.split('.')[0];
        
        // Lấy tên thư mục
        const folderName = parts[parts.length - 2];
        const publicId = `${folderName}/${publicIdWithoutExtension}`;

        await cloudinary.uploader.destroy(publicId);
        console.log(`Deleted image from Cloudinary: ${publicId}`);
    } catch (error) {
        console.error('Cloudinary delete error:', error);
    }
};

module.exports = { deleteFromCloudinary };
