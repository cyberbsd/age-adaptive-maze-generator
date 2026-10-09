import React, { useRef, useEffect } from 'react';
import { ILLUSTRATION_SETS } from '../assets/illustrations';
import { AGE_LEVELS } from '../utils/mazeGenerator';
import { Printer, Download } from 'lucide-react';
import { exportToPDF, triggerBrowserPrint } from '../utils/pdfExporter';
import { renderMazeOnCanvas } from '../utils/canvasRenderer';

export default function PrintView({
  maze,
  currentAgeKey,
  illustrationSetId,
  worksheetTitle,
  worksheetPrompt,
  includeAnswerKey
}) {
  const printContainerRef = useRef(null);
  const mazeCanvasRef = useRef(null);
  const answerCanvasRef = useRef(null);

  const currentSet = ILLUSTRATION_SETS[illustrationSetId] || ILLUSTRATION_SETS['rabbit-carrot'];
  const ageInfo = AGE_LEVELS[currentAgeKey.toUpperCase()] || AGE_LEVELS.TODDLER;

  // Render high-res print canvas for both Question page and Answer page
  useEffect(() => {
    if (!maze) return;

    const renderMazeToCanvas = (canvas, drawSolution = false) => {
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      const size = 1200; // High resolution 300 DPI for A4
      canvas.width = size;
      canvas.height = size;

      renderMazeOnCanvas(ctx, maze, {
        displaySize: size,
        wallColor: '#111827',
        bgColor: '#FFFFFF',
        wallWidthRatio: ageInfo.wallWidthRatio,
        lineStyle: maze.lineStyle || ageInfo.defaultLineStyle || 'rounded',
        solutionColor: '#EF4444',
        showSolution: drawSolution,
        isPrint: true
      });
    };

    renderMazeToCanvas(mazeCanvasRef.current, false);
    if (includeAnswerKey) {
      renderMazeToCanvas(answerCanvasRef.current, true);
    }
  }, [maze, ageInfo, includeAnswerKey]);

  const handleDownloadPDF = () => {
    exportToPDF('a4-print-sheet', `${worksheetTitle || 'maze-worksheet'}.pdf`);
  };

  return (
    <div className="glass-panel" style={{ padding: '1.25rem' }}>
      
      {/* Print Controls Bar */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
        paddingBottom: '0.85rem',
        borderBottom: '1px solid var(--panel-border)'
      }}>
        <div>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>🖨️ A4 學習單列印預覽</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
            可選擇直接列印或匯出高解析度 300 DPI PDF 檔案
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.65rem' }}>
          <button className="btn btn-secondary" onClick={handleDownloadPDF}>
            <Download size={18} /> 下載 PDF
          </button>
          <button className="btn btn-primary" onClick={triggerBrowserPrint}>
            <Printer size={18} /> 一鍵列印
          </button>
        </div>
      </div>

      {/* A4 Sheet Container */}
      <div
        id="a4-print-sheet"
        style={{
          background: '#FFFFFF',
          color: '#111827',
          padding: '2rem',
          borderRadius: '12px',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
          maxWidth: '780px',
          margin: '0 auto'
        }}
      >
        {/* Page 1: Worksheet */}
        <div style={{ minHeight: '900px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          
          {/* Header */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
              <div>
                <h1 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.03em' }}>
                  {worksheetTitle || '線上迷宮學習單'}
                </h1>
                <p style={{ fontSize: '0.95rem', color: '#4B5563', marginTop: '0.25rem' }}>
                  {worksheetPrompt || currentSet.prompt}
                </p>
              </div>

              <div style={{ textAlign: 'right', fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
                <div>年齡層: {ageInfo.name}</div>
                <div>尺寸: {maze.cols} × {maze.rows}</div>
              </div>
            </div>

            {/* Name / Date Fields */}
            <div style={{
              display: 'flex',
              gap: '2rem',
              fontSize: '0.95rem',
              fontWeight: 700,
              padding: '0.5rem 0',
              borderBottom: '2px solid #E5E7EB',
              marginBottom: '1.25rem'
            }}>
              <div>班級 / 姓名：____________________</div>
              <div>日期：____________________</div>
            </div>
          </div>

          {/* Maze Canvas Wrapper */}
          <div style={{ display: 'flex', justifyContent: 'center', position: 'relative', margin: '1rem 0' }}>
            <div style={{ position: 'relative', width: '100%', maxWidth: '520px', aspectRatio: '1/1' }}>
              <canvas ref={mazeCanvasRef} style={{ width: '100%', height: '100%', borderRadius: '4px' }} />

              {/* Start Badge */}
              <div style={{
                position: 'absolute',
                top: '-16px',
                left: '-16px',
                background: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                {currentSet.renderStart(44)}
              </div>

              {/* End Badge */}
              <div style={{
                position: 'absolute',
                bottom: '-16px',
                right: '-16px',
                background: '#FFFFFF',
                border: '2px solid #E5E7EB',
                borderRadius: '50%',
                padding: '4px',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)'
              }}>
                {currentSet.renderEnd(44)}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: '#9CA3AF',
            borderTop: '1px solid #E5E7EB',
            paddingTop: '0.75rem'
          }}>
            <span>MazeCraft Printable Maze Generator</span>
            <span>頁碼: 1 / {includeAnswerKey ? '2' : '1'}</span>
          </div>

        </div>

        {/* Page 2: Optional Answer Key */}
        {includeAnswerKey && (
          <div style={{
            minHeight: '900px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginTop: '3rem',
            paddingTop: '2rem',
            borderTop: '2px dashed #D1D5DB'
          }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#EF4444' }}>
                  🔑 解答頁 (Answer Key)
                </h2>
                <span style={{ fontSize: '0.85rem', color: '#6B7280', fontWeight: 600 }}>
                  {worksheetTitle || '迷宮學習單'}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', margin: '1rem 0' }}>
              <div style={{ position: 'relative', width: '100%', maxWidth: '480px', aspectRatio: '1/1' }}>
                <canvas ref={answerCanvasRef} style={{ width: '100%', height: '100%', borderRadius: '4px' }} />
              </div>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '0.75rem',
              color: '#9CA3AF',
              borderTop: '1px solid #E5E7EB',
              paddingTop: '0.75rem'
            }}>
              <span>MazeCraft Printable Maze Generator</span>
              <span>頁碼: 2 / 2</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
