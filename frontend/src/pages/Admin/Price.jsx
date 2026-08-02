import { useEffect, useState } from "react";
import { getPrices } from "../../services/Admin/priceApi";
import PriceTable from "../../components/Price/PriceTable";
import PriceModal from "../../components/Price/PriceModal";

function Price() {

    const [prices, setPrices] = useState([]);
    const [editingProduct, setEditingProduct] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchPrices = async () => {

        try {

            setLoading(true);

            const res = await getPrices();

            setPrices(res.data);

        } catch (err) {

            console.log(err);

            alert("Không thể tải danh sách giá sản phẩm.");

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {

        fetchPrices();

    }, []);

    return (

        <div className="container-fluid">

            <div className="d-flex justify-content-between align-items-center mb-4">

                <div>

                    <h2 className="fw-bold mb-1">
                        Quản lý giá sản phẩm
                    </h2>

                    <small className="text-muted">
                        Quản lý giá gốc và mức giảm tối đa của sản phẩm
                    </small>

                </div>

            </div>

            <div className="card shadow-sm">

                <div className="card-body">

                    {
                        loading ? (

                            <div className="text-center py-5">

                                <div className="spinner-border text-success"></div>

                            </div>

                        ) : (

                            <PriceTable
                                prices={prices}
                                onEdit={setEditingProduct}
                            />

                        )
                    }

                </div>

            </div>

            {
                editingProduct && (

                    <PriceModal

                        product={editingProduct}

                        onClose={() => setEditingProduct(null)}

                        reload={() => {

                            fetchPrices();

                            setEditingProduct(null);

                        }}

                    />

                )
            }

        </div>

    );

}

export default Price;