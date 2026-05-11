const Product = require('../models/productModel');
const { deleteFromCloudinary } = require('../utils/cloudinaryUtils');

// Lấy TẤT CẢ điện thoại
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isHidden: { $ne: true } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
    }
};

// Hàm lấy TẤT CẢ sản phẩm cho Admin
const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm cho Admin', error: error.message });
    }
};

// Lấy CHI TIẾT MỘT sản phẩm
const getProductById = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            res.json(product);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm này!' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message });
    }
};

// Tìm kiếm sản phẩm
const searchProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword;
        if (!keyword) return res.json([]);

        const limit = parseInt(req.query.limit) || 50;
        const products = await Product.find({
            name: { $regex: keyword, $options: 'i' },
            isHidden: { $ne: true }
        }).limit(limit);

        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tìm kiếm sản phẩm', error: error.message });
    }
};

// Tạo sản phẩm mới
const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, discount, specs, isHidden, tags, variants } = req.body;

        const product = new Product({
            name: name || 'Sản phẩm mới',
            price: price || 0,
            image: image || '/images/sample.jpg',
            brand: brand || 'Chưa rõ',
            discount: discount || 0,
            tags: tags || [],
            variants: variants || [],
            isHidden: isHidden || false,
            description: description || '',
            specs: specs || { ram: '', rom: '', chip: '', battery: '' }
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        console.error('Lỗi tạo sản phẩm:', error);
        res.status(400).json({ 
            message: 'Dữ liệu sản phẩm không hợp lệ!', 
            error: error.message,
            details: error.errors
        });
    }
};

// Cập nhật thông tin sản phẩm
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, discount, specs, isHidden, tags, variants } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.image = image || product.image;
            product.brand = brand || product.brand;
            product.discount = discount !== undefined ? discount : product.discount;
            product.isHidden = isHidden !== undefined ? isHidden : product.isHidden;
            
            if (tags !== undefined) product.tags = tags;
            if (variants !== undefined) product.variants = variants;
            if (specs) product.specs = { ...product.specs, ...specs };

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        console.error('Lỗi cập nhật sản phẩm:', error);
        res.status(400).json({ 
            message: 'Cập nhật thất bại, dữ liệu không hợp lệ!', 
            error: error.message,
            details: error.errors 
        });
    }
};

// Xóa sản phẩm
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (product) {
            // 1. Xóa ảnh chính
            if (product.image && product.image.includes('cloudinary.com')) {
                await deleteFromCloudinary(product.image);
            }

            // 2. Xóa tất cả ảnh trong các biến thể
            if (product.variants && product.variants.length > 0) {
                const variantImages = [...new Set(product.variants.map(v => v.image))];
                for (const imgUrl of variantImages) {
                    if (imgUrl && imgUrl !== product.image && imgUrl.includes('cloudinary.com')) {
                        await deleteFromCloudinary(imgUrl);
                    }
                }
            }

            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Đã xóa sản phẩm và toàn bộ ảnh liên quan!' });
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi xóa sản phẩm', error: error.message });
    }
};

module.exports = {
    getProducts,
    getAdminProducts,
    getProductById,
    searchProducts,
    createProduct,
    updateProduct,
    deleteProduct
};
