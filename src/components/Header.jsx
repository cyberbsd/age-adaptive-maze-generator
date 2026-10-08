import React from 'react';
import { Compass, Printer, History, RefreshCw, Sparkles, Layers } from 'lucide-react';
import { AGE_LEVELS } from '../utils/mazeGenerator';

export default function Header({
  activeTab,
  setActiveTab,
  currentAgeKey,
  onRegenerate,
  onOpenHistory,
  historyCount
}) {
  const ageLevelInfo = AGE_LEVELS[currentAgeKey.toUpperCase()] || AGE_LEVELS.TODDLER;

  return (
    <header className="glass-panel no-print" style={{ padding: '0.85rem 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        
        {/* Brand & Active Level */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'var(--primary)',
            color: '#FFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-sm)'
          }}>
            <Compass size={24} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                MazeCraft 線上迷宮產生器
              </h1>
              <span className="badge">
                {ageLevelInfo.name} ({ageLevelInfo.ageRange})
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              適性難度算法 • A4 高畫質列印 • 學習單解答與歷史紀錄
            </p>
          </div>
        </div>

        {/* Center Tabs */}
        <div style={{
          display: 'flex',
          background: 'var(--primary-light)',
          padding: '4px',
          borderRadius: 'var(--btn-radius)',
          border: '1px solid var(--panel-border)'
        }}>
          <button
            className={`btn btn-sm ${activeTab === 'generator' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('generator')}
            style={{ border: 'none' }}
          >
            <Sparkles size={16} /> 迷宮繪製與遊玩
          </button>

          <button
            className={`btn btn-sm ${activeTab === 'print' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('print')}
            style={{ border: 'none' }}
          >
            <Printer size={16} /> A4 學習單列印
          </button>
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={onRegenerate}
            title="生成全新迷宮"
          >
            <RefreshCw size={16} /> 重新生成
          </button>

          <button
            className="btn btn-outline btn-sm"
            onClick={onOpenHistory}
            style={{ position: 'relative' }}
          >
            <History size={16} /> 歷史紀錄
            {historyCount > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: 'var(--primary)',
                color: '#FFF',
                borderRadius: '10px',
                padding: '2px 6px',
                fontSize: '0.65rem',
                fontWeight: 800
              }}>
                {historyCount}
              </span>
            )}
          </button>
        </div>

      </div>
    </header>
  );
}
