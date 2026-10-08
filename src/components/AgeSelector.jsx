import React from 'react';
import { Baby, Compass, Cpu, Crown } from 'lucide-react';
import { AGE_LEVELS } from '../utils/mazeGenerator';

export default function AgeSelector({ currentAgeKey, onSelectAge }) {
  const levels = [
    { key: 'toddler', data: AGE_LEVELS.TODDLER, icon: Baby, color: '#FF6B8B' },
    { key: 'kids', data: AGE_LEVELS.KIDS, icon: Compass, color: '#059669' },
    { key: 'teens', data: AGE_LEVELS.TEENS, icon: Cpu, color: '#38BDF8' },
    { key: 'adult', data: AGE_LEVELS.ADULT, icon: Crown, color: '#F59E0B' }
  ];

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🎯 選擇適用年齡與難度層級
        </h2>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>點擊即時切換演算法與主題</span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '0.75rem'
      }}>
        {levels.map(({ key, data, icon: IconComponent, color }) => {
          const isSelected = currentAgeKey === key;

          return (
            <div
              key={key}
              onClick={() => onSelectAge(key)}
              style={{
                padding: '0.85rem 1rem',
                borderRadius: 'var(--card-radius)',
                background: isSelected ? 'var(--primary-light)' : 'rgba(255, 255, 255, 0.05)',
                border: isSelected ? `2px solid ${color}` : '1px solid var(--panel-border)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {isSelected && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '24px',
                  height: '24px',
                  background: color,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderBottomLeftRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 900
                }}>
                  ✓
                </div>
              )}

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.35rem' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: color,
                  color: '#FFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <IconComponent size={18} />
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: '0.95rem', color: isSelected ? color : 'var(--text-main)' }}>
                    {data.name}
                  </div>
                  <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {data.ageRange}
                  </div>
                </div>
              </div>

              <p style={{
                fontSize: '0.75rem',
                color: 'var(--text-muted)',
                lineHeight: '1.3',
                margin: 0
              }}>
                {data.description}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
