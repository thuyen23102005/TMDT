import { useState, useRef, useEffect } from "react";

function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            role: "bot",
            content: "Xin chào! Mình là trợ lý ảo của Nông Sản Shop. Bạn cần tư vấn sản phẩm hay hỗ trợ gì không? 🌱"
        }
    ]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);

    const messagesEndRef = useRef(null);

    // Câu hỏi gợi ý hiển thị khi khách mới mở chat
    const suggestedQuestions = [
        "Shop có xoài không?",
        "Rau củ VietGAP giá bao nhiêu?  ",
        "Chính sách đổi trả như thế nào?",
        "Phí vận chuyển bao nhiêu?"
    ];

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isOpen]);

    const handleSend = async (customText) => {
        const trimmed = (customText ?? input).trim();
        if (!trimmed || loading) return;

        const newMessages = [...messages, { role: "user", content: trimmed }];
        setMessages(newMessages);
        setInput("");
        setLoading(true);

        try {
            const res = await fetch("http://localhost:5000/api/chatbot/ask", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    message: trimmed,
                    // Gửi kèm vài tin nhắn gần nhất để chatbot hiểu ngữ cảnh
                    history: newMessages.slice(-6),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setMessages((prev) => [
                    ...prev,
                    { role: "bot", content: data.message || "Xin lỗi, mình đang gặp sự cố. Bạn thử lại sau nhé." }
                ]);
                return;
            }

            setMessages((prev) => [
                ...prev,
                { role: "bot", content: data.reply }
            ]);

        } catch (err) {
            console.error(err);
            setMessages((prev) => [
                ...prev,
                { role: "bot", content: "Không thể kết nối tới máy chủ. Bạn kiểm tra lại kết nối mạng nhé." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div style={{ position: "fixed", bottom: "100px", right: "24px", zIndex: 1000 }}>

            {isOpen && (
                <div
                    className="shadow rounded-4 bg-white d-flex flex-column"
                    style={{
                        width: "340px",
                        height: "460px",
                        marginBottom: "12px",
                        overflow: "hidden",
                    }}
                >
                    {/* Header */}
                    <div
                        className="d-flex align-items-center justify-content-between px-3 py-2"
                        style={{ background: "#2e7d32", color: "#fff" }}
                    >
                        <strong>🤖 Trợ lý Nông Sản Shop</strong>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="btn btn-sm text-white"
                            style={{ background: "transparent", border: "none", fontSize: "18px", lineHeight: 1 }}
                        >
                            ×
                        </button>
                    </div>

                    {/* Messages */}
                    <div
                        className="flex-grow-1 px-3 py-2"
                        style={{ overflowY: "auto", background: "#f7f9f7" }}
                    >
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className="d-flex mb-2"
                                style={{ justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}
                            >
                                <div
                                    style={{
                                        maxWidth: "80%",
                                        padding: "8px 12px",
                                        borderRadius: "14px",
                                        fontSize: "14px",
                                        whiteSpace: "pre-wrap",
                                        background: msg.role === "user" ? "#2e7d32" : "#e9ecef",
                                        color: msg.role === "user" ? "#fff" : "#212529",
                                    }}
                                >
                                    {msg.content}
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="d-flex mb-2" style={{ justifyContent: "flex-start" }}>
                                <div
                                    style={{
                                        padding: "8px 12px",
                                        borderRadius: "14px",
                                        fontSize: "14px",
                                        background: "#e9ecef",
                                        color: "#6c757d",
                                    }}
                                >
                                    Đang trả lời...
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Câu hỏi gợi ý - chỉ hiện khi mới bắt đầu chat */}
                    {messages.length === 1 && !loading && (
                        <div className="d-flex flex-wrap gap-2 px-3 py-2 border-top">
                            {suggestedQuestions.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(q)}
                                    className="btn btn-sm"
                                    style={{
                                        background: "#e9f5e9",
                                        color: "#2e7d32",
                                        border: "1px solid #a5d6a7",
                                        borderRadius: "16px",
                                        fontSize: "12px",
                                        padding: "4px 10px",
                                    }}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="d-flex p-2 border-top">
                        <input
                            type="text"
                            className="form-control form-control-sm me-2"
                            placeholder="Nhập câu hỏi..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={handleKeyDown}
                            disabled={loading}
                        />
                        <button
                            className="btn btn-sm"
                            style={{ background: "#2e7d32", color: "#fff" }}
                            onClick={() => handleSend()}
                            disabled={loading}
                        >
                            Gửi
                        </button>
                    </div>
                </div>
            )}

            {/* Nút mở/đóng chat */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`chatbot-fab rounded-circle d-flex align-items-center justify-content-center shadow ${isOpen ? "chatbot-fab-open" : ""}`}
                style={{
                    width: "58px",
                    height: "58px",
                    background: "linear-gradient(145deg, #388e3c, #1b5e20)",
                    color: "#fff",
                    border: "none",
                    fontSize: "26px",
                    marginLeft: "auto",
                    position: "relative",
                }}
                aria-label={isOpen ? "Đóng khung chat" : "Mở trợ lý ảo"}
            >
                {isOpen ? "×" : "🤖"}
                {!isOpen && <span className="chatbot-fab-ring" />}
            </button>

            <style>{`
                @keyframes chatbot-float {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                @keyframes chatbot-ring-pulse {
                    0% { transform: scale(1); opacity: 0.55; }
                    100% { transform: scale(1.6); opacity: 0; }
                }

                .chatbot-fab {
                    animation: chatbot-float 3s ease-in-out infinite;
                    transition: transform 0.2s ease, box-shadow 0.2s ease;
                }

                .chatbot-fab:hover {
                    animation-play-state: paused;
                    transform: translateY(-4px) scale(1.06);
                    box-shadow: 0 10px 22px rgba(27, 94, 32, 0.35) !important;
                }

                .chatbot-fab-open {
                    animation: none;
                }

                .chatbot-fab-ring {
                    position: absolute;
                    inset: 0;
                    border-radius: 50%;
                    border: 2px solid rgba(56, 142, 60, 0.55);
                    animation: chatbot-ring-pulse 2.4s ease-out infinite;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
}

export default ChatWidget;