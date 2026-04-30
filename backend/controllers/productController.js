const Product = require('../models/productModel'); // Import quyển sổ (Model) chứa Sản phẩm
const cloudinary = require('../config/cloudinary');

// 1. Hàm: Lấy TẤT CẢ điện thoại
// Mục đích: Phục vụ cho Trang Chủ (Hiển thị tất cả sản phẩm)
// Đường dẫn (Route): GET /api/products
const getProducts = async (req, res) => {
    try {
        // Lấy TẤT CẢ dữ liệu nhưng bỏ qua các sản phẩm đang bị ẩn
        const products = await Product.find({ isHidden: { $ne: true } });
        
        // Gói dữ liệu lại bằng JSON và gửi trả về cho Frontend (React)
        res.json(products);
    } catch (error) {
        // Nếu có lỗi, trả về mã 500 (Lỗi máy chủ)
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

// 2. Hàm: Lấy CHI TIẾT MỘT cái điện thoại
// Mục đích: Phục vụ cho Trang Chi Tiết Sản Phẩm (Khi khách click vào 1 hình điện thoại)
// Đường dẫn (Route): GET /api/products/:id (Trong đó :id là mã của điện thoại đó, ví dụ /api/products/123)
const getProductById = async (req, res) => {
    try {
        // Chờ anh bồi bàn chạy vào kho, tìm đúng 1 sản phẩm có mã ID (req.params.id) khớp với mã khách gửi lên
        const product = await Product.findById(req.params.id);

        if (product) {
            // Nếu tìm thấy, gửi dữ liệu đó về cho khách
            res.json(product);
        } else {
            // Nếu ông khách gõ bậy mã ID hoặc mã đó đã bị xoá, báo lỗi 404 (Không tìm thấy)
            res.status(404).json({ message: 'Không tìm thấy sản phẩm này!' });
        }
    } catch (error) {
        // Xử lý lỗi trong trường hợp định dạng ID của MongoDB bị sai (không đủ 24 ký tự)
        res.status(500).json({ message: 'Lỗi khi lấy thông tin sản phẩm', error: error.message });
    }
};

// 3. Hàm: Tìm kiếm sản phẩm theo từ khóa
// Mục đích: Khi khách gõ trên thanh tìm kiếm, gợi ý sản phẩm phù hợp
// Đường dẫn (Route): GET /api/products/search?keyword=iphone
const searchProducts = async (req, res) => {
    try {
        // Lấy từ khóa từ URL query: ?keyword=iphone
        const keyword = req.query.keyword;

        if (!keyword) {
            return res.json([]); // Không có từ khóa → trả mảng rỗng
        }

        // Dùng RegExp (biểu thức chính quy) để tìm kiếm "gần đúng"
        // 'i' = không phân biệt chữ HOA/thường (iPhone = iphone = IPHONE)
        // Ví dụ: keyword = "iphone" → tìm tất cả sản phẩm có chữ "iphone" trong tên
        // limit có thể truyền qua query: ?limit=6 (cho dropdown gợi ý), mặc định 50
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

// 4. Hàm: Tạo sản phẩm mới (Cho Admin)
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, countInStock, discount, specs, isHidden, tags, colorVariants, storageVariants } = req.body;

        const product = new Product({
            name: name || 'Sản phẩm mới',
            price: price || 0,
            image: image || '/images/sample.jpg',
            brand: brand || 'Chưa rõ',
            countInStock: countInStock || 0,
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

// 5. Hàm: Cập nhật thông tin sản phẩm (Cho Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
    try {
        const { name, price, description, image, brand, countInStock, discount, specs, isHidden, tags, colorVariants, storageVariants } = req.body;
        const product = await Product.findById(req.params.id);

        if (product) {
            product.name = name || product.name;
            product.price = price || product.price;
            product.description = description || product.description;
            product.image = image || product.image;
            product.brand = brand || product.brand;
            product.countInStock = countInStock !== undefined ? countInStock : product.countInStock;
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

// 6. Hàm: Xóa sản phẩm (Cho Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
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
