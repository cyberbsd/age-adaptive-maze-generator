import React, { useState } from 'react';
import { X, Trash2, ExternalLink, Calendar, Search, Layers, AlertCircle } from 'lucide-react';
import { deleteHistoryItem, clearAllHistory } from '../utils/storage';
import { AGE_LEVELS } from '../utils/mazeGenerator';

export default function HistoryModal({
  isOpen,
  onClose,
  historyList,
  onLoadMaze,
  onRefreshHistory
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAge, setFilterAge] = useState('all');

  if (!isOpen) return null;

  const filteredList = historyList.filter(item => {
    const matchesSearch = (item.title || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesAge = filterAge === 'all' || item.ageLevel === filterAge;
    return matchesSearch && matchesAge;
  });

  const handleDelete = (id, e) => {
    e.stopPropagation();
    if (window.confirm('確定要刪除此筆迷宮歷史紀錄嗎？')) {
      deleteHistoryItem(id);
      onRefreshHistory();
    }
  };

  const handleClearAll = () => {
    if (window.confirm('確定要清空所有歷史紀錄嗎？此動作不可撤銷。')) {
      clearAllHistory();
      onRefreshHistory();
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" onClick={e => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📚 迷宮歷史紀錄與翻查
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              翻查先前生成的迷宮，可隨時載入重玩或匯出 A4 PDF
            </p>
          </div>

          <button
            onClick={onClose}
            className="btn btn-outline btn-sm"
            style={{ borderRadius: '50%', width: '36px', height: '36px', padding: 0 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Search & Filter Bar */}
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '180px', position: 'relative' }}>
            <input
              type="text"
              placeholder="搜尋學習單標題..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem 0.55rem 2.2rem',
                borderRadius: 'var(--btn-radius)',
                border: '1px solid var(--panel-border)',
                background: 'var(--panel-bg)',
                color: 'var(--text-main)',
                fontSize: '0.85rem'
              }}
            />
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)' }} />
          </div>

          <select
            value={filterAge}
            onChange={e => setFilterAge(e.target.value)}
            style={{
              padding: '0.55rem 0.85rem',
              borderRadius: 'var(--btn-radius)',
              border: '1px solid var(--panel-border)',
              background: 'var(--panel-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem',
              fontWeight: 600
            }}
          >
            <option value="all">所有年齡層</option>
            <option value="toddler">幼兒啟蒙</option>
            <option value="kids">兒童探險</option>
            <option value="teens">青少年挑戰</option>
            <option value="adult">成人極限</option>
          </select>

          {historyList.length > 0 && (
            <button className="btn btn-outline btn-sm" onClick={handleClearAll} style={{ color: '#EF4444' }}>
              <Trash2 size={16} /> 清空紀錄
            </button>
          )}
        </div>

        {/* History Item Cards */}
        {filteredList.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <AlertCircle size={40} style={{ marginBottom: '0.5rem', opacity: 0.5 }} />
            <p style={{ fontWeight: 600 }}>尚無相關歷史紀錄</p>
            <p style={{ fontSize: '0.8rem' }}>每次重新生成或編輯迷宮時都會自動儲存於此處</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '420px', overflowY: 'auto', paddingRight: '4px' }}>
            {filteredList.map(item => {
              const ageConfig = AGE_LEVELS[item.ageLevel.toUpperCase()] || AGE_LEVELS.TODDLER;
              const formattedDate = new Date(item.createdAt).toLocaleString('zh-TW', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              });

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    onLoadMaze(item);
                    onClose();
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.85rem 1rem',
                    borderRadius: 'var(--card-radius)',
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--panel-border)',
                    cursor: 'pointer',
                    transition: 'var(--transition-smooth)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '8px',
                      background: 'var(--primary-light)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--primary)',
                      fontWeight: 800,
                      fontSize: '0.85rem'
                    }}>
                      {item.cols}x{item.rows}
                    </div>

                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>
                        {item.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginTop: '0.25rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                        <span className="badge">{ageConfig.name}</span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {formattedDate}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <button className="btn btn-secondary btn-sm" title="載入此迷宮">
                      <ExternalLink size={14} /> 載入
                    </button>
                    <button
                      className="btn btn-outline btn-sm"
                      onClick={(e) => handleDelete(item.id, e)}
                      title="刪除紀錄"
                      style={{ color: '#EF4444' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
