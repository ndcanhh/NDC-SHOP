const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');

// Lấy TẤT CẢ điện thoại
// GET /api/products
const getProducts = async (req, res) => {
    try {
        const products = await Product.find({ isHidden: { $ne: true } });
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm', error: error.message });
    }
};

// Hàm lấy TẤT CẢ sản phẩm (Cả ẩn và hiện) cho Admin
const getAdminProducts = async (req, res) => {
    try {
        const products = await Product.find({});
        res.json(products);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi lấy danh sách sản phẩm cho Admin', error: error.message });
    }
};

// Lấy CHI TIẾT MỘT cái điện thoại
// GET /api/products/:id
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

// Tìm kiếm sản phẩm theo từ khóa
// GET /api/products/search?keyword=iphone
const searchProducts = async (req, res) => {
    try {
        const keyword = req.query.keyword;

        if (!keyword) {
            return res.json([]);
        }

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
// POST /api/products
// access: Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, discount, specs, isHidden, tags, colorVariants, storageVariants } = req.body;

        const product = new Product({
            name: name || 'Sản phẩm mới',
            price: price || 0,
            image: image || '/images/sample.jpg',
            brand: brand || 'Chưa rõ',

            discount: discount || 0,
            tags: tags || [],
            colorVariants: colorVariants || [],
            storageVariants: storageVariants || [],
            isHidden: isHidden || false,
            description: description || '',
            specs: specs || { ram: '', rom: '', chip: '', battery: '' }
        });

        const createdProduct = await product.save();
        res.status(201).json(createdProduct);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi tạo sản phẩm', error: error.message });
    }
};

// Cập nhật thông tin sản phẩm
// PUT /api/products/:id
// access: Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, discount, specs, isHidden, tags, colorVariants, storageVariants } = req.body;
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
            if (colorVariants !== undefined) product.colorVariants = colorVariants;
            if (storageVariants !== undefined) product.storageVariants = storageVariants;
            if (specs) product.specs = { ...product.specs, ...specs };

            const updatedProduct = await product.save();
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Không tìm thấy sản phẩm' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Lỗi khi cập nhật sản phẩm', error: error.message });
    }
};

// Xóa sản phẩm
// DELETE /api/products/:id
// access: Private/Admin
const deleteProduct = async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);

        if (product) {
            // Xóa ảnh trên Cloudinary nếu sản phẩm dùng ảnh Cloudinary
            if (product.image && product.image.includes('cloudinary.com')) {
                try {
                    const urlParts = product.image.split('/');
                    const fileNameWithExt = urlParts.pop(); // vd: abc.jpg
                    const folderName = urlParts.pop(); // vd: ndc_shop
                    const fileName = fileNameWithExt.split('.')[0]; // lấy tên bỏ đuôi
                    const publicId = `${folderName}/${fileName}`;
                    
                    await cloudinary.uploader.destroy(publicId);
                    console.log('Đã xóa ảnh trên Cloudinary:', publicId);
                } catch (cloudErr) {
                    console.error('Lỗi khi xóa ảnh trên Cloudinary:', cloudErr);
                }
            }

            await Product.deleteOne({ _id: product._id });
            res.json({ message: 'Đã xóa sản phẩm thành công!' });
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
