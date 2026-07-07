import { useEffect, useState } from "react";

import { getOrders } from "../../services/orderApi";

import OrderTable from "../../components/Order/OrderTable";

import { getOrderDetail } from "../../services/orderApi";

import OrderDetailModal from "../../components/Order/OrderDetailModal";

function Order() {

    const [orders, setOrders] = useState([]);
    const [details, setDetails] = useState([]);
    const [showModal, setShowModal] = useState(false);

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
    return (

        <div className="container-fluid">

            <h2 className="mb-4">

                Quản lý đơn hàng

            </h2>

            <OrderTable

                orders={orders}

                onDetail={handleDetail}

            />
            {
                showModal && (

                    <OrderDetailModal

                        details={details}

                        onClose={() => setShowModal(false)}

                    />

                )
            }
        </div>

    );

}

export default Order;