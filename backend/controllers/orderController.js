const orderModel = require("../models/orderModel");

const getAllOrders = async (req, res) => {

    try {

        const orders = await orderModel.getAllOrders();

        res.status(200).json(orders);

    } catch (error) {

        console.log(error);

        res.status(500).json({
            message: "Lỗi server"
        });

    }

};

const getOrderDetail = async (req,res)=>{

    try{

        const detail = await orderModel.getOrderDetail(req.params.id);

        res.json(detail);

    }catch(err){

        console.log(err);

        res.status(500).json(err);

    }

};
const updateStatus = async (req, res) => {
    try {
        const orderId = req.params.id;
        const newStatus = req.body.TrangThaiDonHang;

        // 1. Lấy trạng thái hiện tại của đơn hàng từ Database
        const currentOrder = await orderModel.getOrderStatusById(orderId);
        
        if (!currentOrder) {
            return res.status(404).json({ message: "Không tìm thấy đơn hàng" });
        }

        const currentStatus = currentOrder.TrangThaiDonHang;

        // 2. Khai báo luồng trạng thái (State Machine) đồng bộ với Frontend
        const allowedTransitions = {
            "Chờ xác nhận": ["Chờ xác nhận", "Đã xác nhận", "Đã hủy"],
            "Đã xác nhận": ["Đã xác nhận", "Đang giao", "Đã hủy"],
            "Đang giao": ["Đang giao", "Đã giao", "Đã hủy"],
            "Đã giao": ["Đã giao"], // Trạng thái cuối, không thể đổi
            "Đã hủy": ["Đã hủy"]    // Trạng thái cuối, không thể đổi
        };

        // 3. Kiểm tra tính hợp lệ của thao tác chuyển đổi
        const validOptions = allowedTransitions[currentStatus] || [currentStatus];
        
        if (!validOptions.includes(newStatus)) {
            return res.status(400).json({ 
                message: `Lỗi thao tác: Không thể chuyển trạng thái đơn hàng từ '${currentStatus}' sang '${newStatus}'` 
            });
        }

        // 4. Nếu hợp lệ, tiến hành thực thi câu lệnh UPDATE
        await orderModel.updateStatus(orderId, newStatus);
        
        res.json({ message: "Cập nhật thành công" });

    } catch (err) {
        console.log(err);
        res.status(500).json({ message: "Lỗi hệ thống khi cập nhật trạng thái" });
    }
};

const getOrdersByUser = async (req, res) => {
    try {
        const orders = await orderModel.getOrdersByUser(req.params.maTK);
        res.status(200).json(orders);
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Lỗi server" });
    }
};

module.exports={
    getAllOrders,
    getOrderDetail,
    updateStatus,
    getOrdersByUser
}