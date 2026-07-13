import { useEffect, useState } from "react";

import { getOrders } from "../../services/Admin/orderApi";

import OrderTable from "../../components/Order/OrderTable";

import { getOrderDetail } from "../../services/Admin/orderApi";

import OrderDetailModal from "../../components/Order/OrderDetailModal";

import StatusModal from "../../components/Order/StatusModal";

import { updateOrderStatus } from "../../services/Admin/orderApi";

function Order() {

    const [orders, setOrders] = useState([]);
    const [details, setDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);

    useEffect(() => {

        fetchOrders();

    }, []);

    async function fetchOrders() {

        try {

            const res = await getOrders();

            setOrders(res.data);

        } catch (error) {

            console.log(error);

        }

    }

    const handleDetail = async (id) => {

        try {

            const res = await getOrderDetail(id);

            setDetails(res.data);

            setShowModal(true);

        } catch (error) {

            console.log(error);

        }

    };

    const handleUpdateStatus = async (id, data) => {

        try {

            await updateOrderStatus(id, data);

            alert("Cập nhật thành công!");

            setEditingOrder(null);

            fetchOrders();

        } catch (error) {

            console.log(error);

        }

    };
    return (

        <div className="container-fluid">

            <h2 className="mb-4">

                Quản lý đơn hàng

            </h2>

            <OrderTable

                orders={orders}

                onDetail={handleDetail}

                onUpdate={setEditingOrder}

            />
            {
                showModal && (

                    <OrderDetailModal

                        details={details}

                        onSave={handleUpdateStatus}

                        onClose={() => setShowModal(false)}

                    />

                )
            }
            
            {
                editingOrder && (
                    <StatusModal
                        order={editingOrder}
                        onSave={handleUpdateStatus}
                        onClose={() => setEditingOrder(null)}
                    />
                )
            }
        </div>

    );

}

export default Order;