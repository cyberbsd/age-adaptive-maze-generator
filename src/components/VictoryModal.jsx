import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, RefreshCw, Printer, X, Zap, Clock } from 'lucide-react';

export default function VictoryModal({
  isOpen,
  onClose,
  stats,
  onRegenerate,
  onGoToPrint
}) {
  useEffect(() => {
    if (isOpen) {
      // Fire confetti burst
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch (err) {
        console.error('Confetti error:', err);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card glass-panel" style={{ textAlign: 'center' }} onClick={e => e.stopPropagation()}>
        
        <div style={{
          width: '72px',
          height: '72px',
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #FFD93D 0%, #FF85A2 100%)',
          color: '#FFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1rem auto',
          boxShadow: 'var(--shadow-lg)'
        }}>
          <Trophy size={40} />
        </div>

        <h2 style={{ fontSize: '1.6rem', fontWeight: 900, marginBottom: '0.35rem' }}>
          🎉 恭喜通關成功！
        </h2>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          你憑著出色敏銳的方向感順利穿過了迷宮！
        </p>

        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '1rem',
          marginBottom: '1.75rem'
        }}>
          <div style={{
            padding: '0.85rem',
            borderRadius: 'var(--card-radius)',
            background: 'var(--primary-light)',
            border: '1px solid var(--panel-border)'
          }}>
            <Zap size={20} color="var(--primary)" style={{ marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>總移動步數</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
              {stats ? stats.steps : 0} 步
            </div>
          </div>

          <div style={{
            padding: '0.85rem',
            borderRadius: 'var(--card-radius)',
            background: 'var(--primary-light)',
            border: '1px solid var(--panel-border)'
          }}>
            <Clock size={20} color="var(--primary)" style={{ marginBottom: '0.25rem' }} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>花費時間</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--primary)' }}>
              {stats ? stats.duration : 0} 秒
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => { onClose(); onRegenerate(); }}>
            <RefreshCw size={18} /> 再玩一個新迷宮
          </button>
          
          <button className="btn btn-secondary" onClick={() => { onClose(); onGoToPrint(); }}>
            <Printer size={18} /> 列印此迷宮
          </button>
        </div>

      </div>
    </div>
  );
}
