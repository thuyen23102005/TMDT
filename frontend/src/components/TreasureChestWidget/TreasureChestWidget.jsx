import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './TreasureChestWidget.css'; 

const STORAGE_KEY_POS = 'treasure_widget_pos';
const API_URL = `${import.meta.env.VITE_API_URL}/api/tasks`; // Chú ý đường dẫn API

const TreasureChestWidget = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [totalPoints, setTotalPoints] = useState(0);
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);  

  const [position, setPosition] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY_POS);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.x < window.innerWidth && parsed.y < window.innerHeight) return parsed;
      } catch (e) {}
    }
    return { x: window.innerWidth - 90, y: window.innerHeight - 150 };
  });

  const dragInfo = useRef({ dragging: false, moved: false, offsetX: 0, offsetY: 0 });

  useEffect(() => { localStorage.setItem(STORAGE_KEY_POS, JSON.stringify(position)); }, [position]);

  const getToken = () => localStorage.getItem('token');
  const isLoggedIn = !!getToken();

  // === LẤY DỮ LIỆU TỪ BACKEND ===
  const fetchTaskStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/status`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();
      
      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem('token'); 
        setIsOpen(false); 
        navigate('/login'); 
        return;
      }
      if (res.ok) {
        setTasks(data.tasks); 
        setTotalPoints(data.totalPoints);
      }
    } catch (err) {
      console.error('Lỗi kết nối máy chủ', err);
    } finally {
      setIsLoading(false);
    }
  };

  // === XỬ LÝ NÚT NHẬN ĐIỂM ===
  const handleClaim = async (task) => {
    if (task.status !== 'available') return;
    try {
      const res = await fetch(`${API_URL}/${task.MaNV}/claim`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${getToken()}` }
      });
      const data = await res.json();

      if (res.status === 401 || res.status === 403) {
        alert('Phiên đăng nhập đã hết hạn.');
        localStorage.removeItem('token'); 
        setIsOpen(false); navigate('/login'); return;
      }

      if (!res.ok) {
        alert(data.message || 'Nhận điểm thất bại'); return;
      }

      setTotalPoints(data.totalPoints);
      setTasks((prev) => prev.map((t) => (t.MaNV === task.MaNV ? { ...t, status: 'claimed' } : t)));
    } catch (err) {
      alert('Không thể kết nối tới máy chủ');
    }
  };

  const startDrag = (clientX, clientY) => {
    dragInfo.current.dragging = true; dragInfo.current.moved = false;
    dragInfo.current.offsetX = clientX - position.x; dragInfo.current.offsetY = clientY - position.y;
  };
  const moveDrag = (clientX, clientY) => {
    if (!dragInfo.current.dragging) return;
    dragInfo.current.moved = true;
    let newX = clientX - dragInfo.current.offsetX; let newY = clientY - dragInfo.current.offsetY;
    newX = Math.max(8, Math.min(window.innerWidth - 72 - 8, newX));
    newY = Math.max(8, Math.min(window.innerHeight - 72 - 8, newY));
    setPosition({ x: newX, y: newY });
  };
  const endDrag = () => { dragInfo.current.dragging = false; };
  const handleMouseDown = (e) => { e.preventDefault(); startDrag(e.clientX, e.clientY); };
  const handleTouchStart = (e) => { const t = e.touches[0]; startDrag(t.clientX, t.clientY); };

  useEffect(() => {
    const handleMouseMove = (e) => moveDrag(e.clientX, e.clientY);
    const handleTouchMove = (e) => { const t = e.touches[0]; moveDrag(t.clientX, t.clientY); };
    const handleUp = () => endDrag();
    window.addEventListener('mousemove', handleMouseMove); window.addEventListener('mouseup', handleUp);
    window.addEventListener('touchmove', handleTouchMove, { passive: false }); window.addEventListener('touchend', handleUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove); window.removeEventListener('mouseup', handleUp);
      window.removeEventListener('touchmove', handleTouchMove); window.removeEventListener('touchend', handleUp);
    };
  }, [position]);

  const handleClick = () => {
    if (!dragInfo.current.moved) {
      setIsOpen(true);
      if (isLoggedIn) fetchTaskStatus();
    }
  };

  const completedCount = tasks.filter((t) => t.status === 'available').length;

  return (
    <>
      <div className="treasure-chest-widget" style={{ left: position.x, top: position.y }} onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={handleClick}>
        <span className="treasure-chest-icon">🎁</span>
        {completedCount > 0 && <span className="treasure-chest-badge">{completedCount}</span>}
      </div>

      {isOpen && (
        <div className="treasure-modal-overlay" onClick={() => setIsOpen(false)}>
          <div className="treasure-modal" onClick={(e) => e.stopPropagation()}>
            <div className="treasure-modal-header">
              <h3>🏆 Nhiệm vụ tích điểm</h3>
              <button className="treasure-modal-close" onClick={() => setIsOpen(false)}>✕</button>
            </div>
            
            {!isLoggedIn ? (
              <div style={{ textAlign: 'center', padding: '30px 20px' }}>
                <p style={{ fontSize: '16px', color: '#555', marginBottom: '20px' }}>Bạn vui lòng đăng nhập để làm nhiệm vụ nhé! 😉</p>
                <button className="treasure-task-btn" onClick={() => { setIsOpen(false); navigate('/login'); }}>Đăng nhập ngay</button>
              </div>
            ) : (
              <>
                <div className="treasure-points-summary">
                  <span className="treasure-points-label">Điểm của bạn</span>
                  <span className="treasure-points-value">{totalPoints} điểm</span>
                </div>

                {isLoading ? (
                   <p style={{ textAlign: 'center', padding: 20 }}>⏳ Đang tải nhiệm vụ...</p>
                ) : (
                  <div className="treasure-task-list">
                    {tasks.map((task) => (
                      <div key={task.MaNV} className={`treasure-task-item ${task.status === 'claimed' ? 'done' : ''}`}>
                        <div className="treasure-task-info">
                          <h4>{task.TenNV}</h4><p>{task.MoTa}</p>
                        </div>
                        <div className="treasure-task-action">
                          <span className="treasure-task-points">+{task.SoDiemThuong}</span>
                          <button 
                            className="treasure-task-btn" 
                            disabled={task.status !== 'available'} 
                            onClick={() => handleClaim(task)}
                          >
                            {task.status === 'claimed' ? 'Đã nhận' : task.status === 'available' ? 'Nhận điểm' : 'Chưa thực hiện'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default TreasureChestWidget;