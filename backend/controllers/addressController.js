const Address = require('../models/addressModel');

// @desc    Lấy danh sách địa chỉ của user đang đăng nhập
// @route   GET /api/addresses
// @access  Private
const getAddresses = async (req, res) => {
    try {
        const addresses = await Address.find({ user: req.user._id }).sort({ isDefault: -1, createdAt: -1 });
        res.json(addresses);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi lấy danh sách địa chỉ' });
    }
};

// @desc    Thêm địa chỉ mới
// @route   POST /api/addresses
// @access  Private
const createAddress = async (req, res) => {
    const { recipientName, phone, address, city, isDefault } = req.body;

    try {
        // Kiểm tra xem User này đã có địa chỉ nào chưa
        const count = await Address.countDocuments({ user: req.user._id });
        let newIsDefault = isDefault || false;

        // Nếu là địa chỉ đầu tiên, hoặc được chọn làm mặc định
        if (count === 0) {
            newIsDefault = true;
        }

        if (newIsDefault && count > 0) {
            // Gỡ mặc định các địa chỉ cũ
            await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
        }

        const newAddress = new Address({
            user: req.user._id,
            recipientName,
            phone,
            address,
            city,
            isDefault: newIsDefault
        });

        const createdAddress = await newAddress.save();
        res.status(201).json(createdAddress);
    } catch (error) {
        res.status(400).json({ message: 'Dữ liệu không hợp lệ' });
    }
};

// @desc    Cập nhật địa chỉ
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = async (req, res) => {
    const { recipientName, phone, address, city, isDefault } = req.body;

    try {
        const existingAddress = await Address.findById(req.params.id);

        if (!existingAddress) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        if (existingAddress.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Không có quyền sửa địa chỉ này' });
        }

        if (isDefault && !existingAddress.isDefault) {
            // Gỡ mặc định các địa chỉ cũ
            await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });
        }

        existingAddress.recipientName = recipientName || existingAddress.recipientName;
        existingAddress.phone = phone || existingAddress.phone;
        existingAddress.address = address || existingAddress.address;
        existingAddress.city = city || existingAddress.city;
        
        // Cập nhật trạng thái mặc định (nếu request truyền false cho địa chỉ đang true thì sao? Tránh mất mặc định nếu chỉ có 1)
        if (isDefault !== undefined) {
             existingAddress.isDefault = isDefault;
        }

        const updatedAddress = await existingAddress.save();
        res.json(updatedAddress);
    } catch (error) {
        res.status(400).json({ message: 'Lỗi khi cập nhật địa chỉ' });
    }
};

// @desc    Xóa địa chỉ
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Không có quyền xóa địa chỉ này' });
        }

        await address.deleteOne();

        // Nếu xóa địa chỉ mặc định, set địa chỉ cũ nhất còn lại thành mặc định
        if (address.isDefault) {
            const remainingAddress = await Address.findOne({ user: req.user._id }).sort({ createdAt: 1 });
            if (remainingAddress) {
                remainingAddress.isDefault = true;
                await remainingAddress.save();
            }
        }

        res.json({ message: 'Đã xóa địa chỉ' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server khi xóa địa chỉ' });
    }
};

// @desc    Thiết lập địa chỉ mặc định
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = async (req, res) => {
    try {
        const address = await Address.findById(req.params.id);

        if (!address) {
            return res.status(404).json({ message: 'Không tìm thấy địa chỉ' });
        }

        if (address.user.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: 'Không có quyền thao tác' });
        }

        // Gỡ tất cả thành false
        await Address.updateMany({ user: req.user._id }, { $set: { isDefault: false } });

        // Set cái này thành true
        address.isDefault = true;
        await address.save();

        res.json({ message: 'Đã đặt làm địa chỉ mặc định', address });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server' });
    }
};

module.exports = {
    getAddresses,
    createAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress
};
