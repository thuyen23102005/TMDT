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
module.exports={
    getAllOrders,
    getOrderDetail
}