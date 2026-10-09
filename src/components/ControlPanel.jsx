import React from 'react';
import { Image as ImageIcon, Eye, FileText, CheckSquare, Sliders, Gamepad2, Shapes, Sparkles } from 'lucide-react';
import { ILLUSTRATION_SETS } from '../assets/illustrations';
import { AGE_LEVELS, MAZE_SHAPES, LINE_STYLES } from '../utils/mazeGenerator';
import WorldTopicPicker from './WorldTopicPicker';

export default function ControlPanel({
  currentAgeKey,
  gridSize,
  onSizeChange,
  mazeShape,
  onShapeChange,
  lineStyle,
  onLineStyleChange,
  illustrationSetId,
  setIllustrationSetId,
  showSolution,
  setShowSolution,
  worksheetTitle,
  setWorksheetTitle,
  worksheetPrompt,
  setWorksheetPrompt,
  includeAnswerKey,
  setIncludeAnswerKey,
  showDpad,
  setShowDpad,
  worldTopic,
  onTopicChange
}) {
  const currentAgeInfo = AGE_LEVELS[currentAgeKey.toUpperCase()] || AGE_LEVELS.TODDLER;

  // Show illustration sets for the current age group first, then the rest
  const allSets = Object.values(ILLUSTRATION_SETS);
  const matchingSets = allSets.filter(set => set.ageGroup === currentAgeKey);
  const otherSets = allSets.filter(set => set.ageGroup !== currentAgeKey);

  return (
    <div className="glass-panel" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--panel-border)', paddingBottom: '0.75rem' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Sliders size={18} color="var(--primary)" /> 迷宮造型與參數設定
        </h3>
      </div>

      <WorldTopicPicker worldTopic={worldTopic} onTopicChange={onTopicChange} />

      {/* 1. 迷宮外觀造型 (Shape) */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Shapes size={16} color="var(--primary)" /> 迷宮外觀造型 (Shape)
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.5rem' }}>
          {Object.values(MAZE_SHAPES).map(shape => {
            const isSelected = (mazeShape || 'square') === shape.id;
            return (
              <button
                key={shape.id}
                type="button"
                onClick={() => onShapeChange(shape.id)}
                style={{
                  padding: '0.55rem 0.75rem',
                  borderRadius: 'var(--btn-radius)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--panel-border)',
                  background: isSelected ? 'var(--primary-light)' : 'var(--panel-bg)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '2px',
                  transition: 'var(--transition-smooth)'
                }}
              >
                <span>{shape.name}</span>
                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 400 }}>{shape.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. 線條與拐角風格 (Line Style) */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <Sparkles size={16} color="var(--primary)" /> 線條風格 (圓弧 / 波浪 / 直線)
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {Object.values(LINE_STYLES).map(style => {
            const isSelected = (lineStyle || 'rounded') === style.id;
            return (
              <button
                key={style.id}
                type="button"
                onClick={() => onLineStyleChange(style.id)}
                style={{
                  flex: 1,
                  padding: '0.5rem 0.4rem',
                  borderRadius: 'var(--btn-radius)',
                  border: isSelected ? '2px solid var(--primary)' : '1px solid var(--panel-border)',
                  background: isSelected ? 'var(--primary-light)' : 'var(--panel-bg)',
                  color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: 700,
                  fontSize: '0.78rem',
                  cursor: 'pointer',
                  textAlign: 'center',
                  transition: 'var(--transition-smooth)'
                }}
              >
                {style.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Grid Dimensions */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>
          <span>迷宮密度尺寸 ({gridSize} × {gridSize})</span>
          <span style={{ color: 'var(--text-muted)' }}>難度範圍: {currentAgeInfo.minGrid} ~ {currentAgeInfo.maxGrid}</span>
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <input
            type="range"
            min={currentAgeInfo.minGrid}
            max={currentAgeInfo.maxGrid}
            value={gridSize}
            onChange={(e) => onSizeChange(parseInt(e.target.value, 10))}
            style={{ flex: 1, accentColor: 'var(--primary)' }}
          />
        </div>
      </div>

      {/* 4. Illustration Set Picker */}
      <div>
        <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
          <ImageIcon size={16} color="var(--primary)" /> 起終點主題圖案
        </label>
        <select
          value={illustrationSetId}
          onChange={(e) => setIllustrationSetId(e.target.value)}
          style={{
            width: '100%',
            padding: '0.6rem 0.85rem',
            borderRadius: 'var(--btn-radius)',
            border: '1px solid var(--panel-border)',
            background: 'var(--panel-bg)',
            color: 'var(--text-main)',
            fontWeight: 600,
            fontSize: '0.9rem'
          }}
        >
          <optgroup label="適合此年齡層">
            {matchingSets.map(set => (
              <option key={set.id} value={set.id}>
                {set.name} ({set.startName} → {set.endName})
              </option>
            ))}
          </optgroup>
          <optgroup label="其他主題">
            {otherSets.map(set => (
              <option key={set.id} value={set.id}>
                {set.name} ({set.startName} → {set.endName})
              </option>
            ))}
          </optgroup>
        </select>
      </div>

      {/* 5. Worksheet Custom Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.35rem' }}>
            <FileText size={16} color="var(--primary)" /> A4 學習單標題
          </label>
          <input
            type="text"
            value={worksheetTitle}
            onChange={(e) => setWorksheetTitle(e.target.value)}
            placeholder="例如：小兔尋找胡蘿蔔迷宮大冒險"
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--btn-radius)',
              border: '1px solid var(--panel-border)',
              background: 'var(--panel-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
        </div>

        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.35rem', display: 'block' }}>
            學習單提示語
          </label>
          <input
            type="text"
            value={worksheetPrompt}
            onChange={(e) => setWorksheetPrompt(e.target.value)}
            placeholder="例如：請幫助小兔子劃出正確線路找到胡蘿蔔吧！"
            style={{
              width: '100%',
              padding: '0.55rem 0.75rem',
              borderRadius: 'var(--btn-radius)',
              border: '1px solid var(--panel-border)',
              background: 'var(--panel-bg)',
              color: 'var(--text-main)',
              fontSize: '0.85rem'
            }}
          />
        </div>
      </div>

      {/* 6. Checkbox Toggles */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem', borderTop: '1px solid var(--panel-border)', paddingTop: '0.85rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showSolution}
            onChange={(e) => setShowSolution(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
          <Eye size={16} color="var(--primary)" /> 線上顯示解答路線 (Solution Path)
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={includeAnswerKey}
            onChange={(e) => setIncludeAnswerKey(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
          <CheckSquare size={16} color="var(--primary)" /> PDF 列印附加「解答頁 (Answer Key)」
        </label>

        <label style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={showDpad}
            onChange={(e) => setShowDpad(e.target.checked)}
            style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }}
          />
          <Gamepad2 size={16} color="var(--primary)" /> 顯示手機端虛擬方向盤
        </label>
      </div>

    </div>
  );
}
