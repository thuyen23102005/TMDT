import { useEffect, useState } from "react";

function StatusModal({

    order,
    onSave,
    onClose

}) {

    const [status, setStatus] = useState("");

    useEffect(() => {

        if (order) {

            setStatus(order.TrangThaiDonHang);

        }

    }, [order]);

    const handleSubmit = (e) => {

        e.preventDefault();

        onSave(

            order.MaDH,

            {

                TrangThaiDonHang: status

            }

        );

    };

    if (!order) return null;

    return (

        <div
            className="modal d-block"
            style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >

            <div className="modal-dialog">

                <div className="modal-content">

                    <div className="modal-header">

                        <h5 className="modal-title">

                            Cập nhật trạng thái đơn hàng

                        </h5>

                        <button

                            className="btn-close"

                            onClick={onClose}

                        ></button>

                    </div>

                    <form onSubmit={handleSubmit}>

                        <div className="modal-body">

                            <div className="mb-3">

                                <label className="form-label">

                                    Trạng thái

                                </label>

                                <select

                                    className="form-select"

                                    value={status}

                                    onChange={(e) => setStatus(e.target.value)}

                                >

                                    <option value="Chờ xác nhận">

                                        Chờ xác nhận

                                    </option>

                                    <option value="Đã xác nhận">

                                        Đã xác nhận

                                    </option>

                                    <option value="Đang giao">

                                        Đang giao

                                    </option>

                                    <option value="Đã giao">

                                        Đã giao

                                    </option>

                                    <option value="Đã hủy">

                                        Đã hủy

                                    </option>

                                </select>

                            </div>

                        </div>

                        <div className="modal-footer">

                            <button

                                type="button"

                                className="btn btn-secondary"

                                onClick={onClose}

                            >

                                Đóng

                            </button>

                            <button

                                type="submit"

                                className="btn btn-primary"

                            >

                                Lưu

                            </button>

                        </div>

                    </form>

                </div>

            </div>

        </div>

    );

}

export default StatusModal;