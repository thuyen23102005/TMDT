import React, { useState, useRef, useEffect } from 'react';
import './TreasureChestWidget.css';

// ====== DỮ LIỆU NHIỆM VỤ MẪU (thay bằng API thật sau) ======
const DEFAULT_TASKS = [
  { id: 1, title: 'Đăng nhập mỗi ngày', desc: 'Ghé thăm cửa hàng hôm nay', points: 10 },
  { id: 2, title: 'Xem 3 sản phẩm bất kỳ', desc: 'Khám phá thêm nông sản mới', points: 15 },
  { id: 3, title: 'Thêm sản phẩm vào giỏ hàng', desc: 'Chuẩn bị cho đơn hàng của bạn', points: 20 },
  { id: 4, title: 'Đặt hàng thành công', desc: 'Hoàn tất một đơn hàng bất kỳ', points: 50 },
  { id: 5, title: 'Đánh giá sản phẩm', desc: 'Chia sẻ cảm nhận của bạn', points: 25 },
];

const STORAGE_KEY_POS = 'treasure_widget_pos';
const STORAGE_KEY_CLAIMED = 'treasure_widget_claimed';
const STORAGE_KEY_POINTS = 'treasure_widget_points';

const TreasureChestWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_POS);
    return saved ? JSON.parse(saved) : { x: window.innerWidth - 100, y: window.innerHeight - 160 };
  });
  const [claimed, setClaimed] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_CLAIMED);
    return saved ? JSON.parse(saved) : [];
  });
  const [totalPoints, setTotalPoints] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_POINTS);
    return saved ? Number(saved) : 0;
  });

  const dragInfo = useRef({ dragging: false, moved: false, offsetX: 0, offsetY: 0 });
  const widgetRef = useRef(null);

  // Lưu vị trí mỗi khi thay đổi
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(position));
  }, [position]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CLAIMED, JSON.stringify(claimed));
  }, [claimed]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_POINTS, String(totalPoints));
  }, [totalPoints]);

  // ====== KÉO THẢ ======
  const startDrag = (clientX, clientY) => {
    dragInfo.current.dragging = true;
    dragInfo.current.moved = false;
    dragInfo.current.offsetX = clientX - position.x;
    dragInfo.current.offsetY = clientY - position.y;
  };

  const moveDrag = (clientX, clientY) => {
    if (!dragInfo.current.dragging) return;
    dragInfo.current.moved = true;

    const chestSize = 72;
    let newX = clientX - dragInfo.current.offsetX;
    let newY = clientY - dragInfo.current.offsetY;

    newX = Math.max(8, Math.min(window.innerWidth - chestSize - 8, newX));
    newY = Math.max(8, Math.min(window.innerHeight - chestSize - 8, newY));

    setPosition({ x: newX, y: newY });
  };

  const endDrag = () => {
    dragInfo.current.dragging = false;
  };

  const handleMouseDown = (e) => {
    e.preventDefault();
    startDrag(e.clientX, e.clientY);
  };
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    startDrag(touch.clientX, touch.clientY);
  };

  useEffect(() => {
    const handleMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const handleTouchMove = (e) => {
      const touch = e.touches[0];
      moveDrag(touch.clientX, touch.clientY);
    };
    const handleUp = () => endDrag();

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [position]);

  const handleClick = () => {
    // Chỉ mở popup nếu người dùng không kéo (tránh mở nhầm khi kéo thả)
    if (!dragInfo.current.moved) {
      setIsOpen(true);
    }
  };

  // ====== NHẬN ĐIỂM NHIỆM VỤ ======
  const handleClaim = (task) => {
    if (claimed.includes(task.id)) return;
    setClaimed((prev) => [...prev, task.id]);
    setTotalPoints((prev) => prev + task.points);
  };

  const completedCount = claimed.length;

  return (
    <>
      {/* NÚT RƯƠNG KHO BÁU - KÉO THẢ ĐƯỢC */}
      <div
        ref={widgetRef}
        className="treasure-chest-widget"
        style={{ left: position.x, top: position.y }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={handleClick}
        title="Nhiệm vụ tích điểm"
      >
        <span className="treasure-chest-icon">🎁</span>
        {completedCount > 0 && (
          <span className="treasure-chest-badge">{completedCount}</span>
        )}
      </div>

      {/* POPUP NHIỆM VỤ TÍCH ĐIỂM */}
      {isOpen && (
        <div className="treasure-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="treasure-modal" onClick={(e) => e.stopPropagation()}>

            <div className="treasure-modal-header">
              <h3>🏆 Nhiệm vụ tích điểm</h3>
              <button className="treasure-modal-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>

            <div className="treasure-points-summary">
              <span className="treasure-points-label">Điểm của bạn</span>
              <span className="treasure-points-value">{totalPoints} điểm</span>
            </div>

            <div className="treasure-task-list">
              {DEFAULT_TASKS.map((task) => {
                const isDone = claimed.includes(task.id);
                return (
                  <div key={task.id} className={`treasure-task-item ${isDone ? 'done' : ''}`}>
                    <div className="treasure-task-info">
                      <h4>{task.title}</h4>
                      <p>{task.desc}</p>
                    </div>
                    <div className="treasure-task-action">
                      <span className="treasure-task-points">+{task.points}</span>
                      <button
                        className="treasure-task-btn"
                        disabled={isDone}
                        onClick={() => handleClaim(task)}
                      >
                        {isDone ? 'Đã nhận' : 'Nhận điểm'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>
      )}
    </>
  );
};

export default TreasureChestWidget;
