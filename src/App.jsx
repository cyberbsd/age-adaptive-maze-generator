import React, { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import Header from './components/Header';
import AgeSelector from './components/AgeSelector';
import ControlPanel from './components/ControlPanel';
import MazeCanvas from './components/MazeCanvas';
import PrintView from './components/PrintView';
import HistoryModal from './components/HistoryModal';
import VictoryModal from './components/VictoryModal';
import Maze3DView from './components/Maze3DView';

import { generateMaze, AGE_LEVELS } from './utils/mazeGenerator';
import { ILLUSTRATION_SETS } from './assets/illustrations';
import { saveMazeToHistory, getHistoryList } from './utils/storage';
import { defaultTopicForAge, WORLD_TOPICS } from './utils/worldTopics';

const getAgeInfo = (key) => AGE_LEVELS[key.toUpperCase()] || AGE_LEVELS.TODDLER;

const SIZE_DEBOUNCE_MS = 300;

export default function App() {
  const [activeTab, setActiveTab] = useState('generator'); // 'generator' | 'print' | 'walk'
  const [currentAgeKey, setCurrentAgeKey] = useState('toddler');
  const [worldTopic, setWorldTopic] = useState(() => defaultTopicForAge('toddler'));
  const [topicPinned, setTopicPinned] = useState(false);

  // Maze Configuration State
  const defaultAgeInfo = AGE_LEVELS.TODDLER;
  const [gridSize, setGridSize] = useState(defaultAgeInfo.defaultCols);
  const [mazeShape, setMazeShape] = useState(defaultAgeInfo.defaultShape || 'circle');
  const [lineStyle, setLineStyle] = useState(defaultAgeInfo.defaultLineStyle || 'rounded');
  const [illustrationSetId, setIllustrationSetId] = useState(defaultAgeInfo.defaultIllustrationSet);
  const [showSolution, setShowSolution] = useState(false);

  // Worksheet Text Customization
  const [worksheetTitle, setWorksheetTitle] = useState('圓弧小兔尋找胡蘿蔔迷宮大冒險');
  const [worksheetPrompt, setWorksheetPrompt] = useState('順著平滑柔和的圓弧通道，幫助可愛小兔找到胡蘿蔔！');
  const [includeAnswerKey, setIncludeAnswerKey] = useState(true);
  const [showDpad, setShowDpad] = useState(true);

  // Maze State
  const [maze, setMaze] = useState(null);
  const [historyList, setHistoryList] = useState([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Victory State
  const [victoryStats, setVictoryStats] = useState(null);
  const [isVictoryOpen, setIsVictoryOpen] = useState(false);

  // Latest settings ref to avoid stale closures
  const settingsRef = useRef({});
  settingsRef.current = {
    currentAgeKey,
    gridSize,
    mazeShape,
    lineStyle,
    illustrationSetId,
    worksheetTitle,
    worksheetPrompt,
    worldTopic
  };

  const debounceRef = useRef(null);
  const didInitRef = useRef(false);
  const topicPinnedRef = useRef(false);
  topicPinnedRef.current = topicPinned;

  const cancelPendingRegen = () => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
  };

  // Generate maze
  const handleGenerateMaze = useCallback((overrides = {}) => {
    cancelPendingRegen();
    const s = { ...settingsRef.current, ...overrides };
    const ageInfo = getAgeInfo(s.currentAgeKey);
    const setInfo = ILLUSTRATION_SETS[s.illustrationSetId] || ILLUSTRATION_SETS['rabbit-carrot'];

    const topic = topicPinnedRef.current
      ? (s.worldTopic || defaultTopicForAge(s.currentAgeKey))
      : (overrides.worldTopic || defaultTopicForAge(s.currentAgeKey));
    setWorldTopic(topic);

    const newMaze = generateMaze(
      s.gridSize,
      s.gridSize,
      ageInfo.braidRatio,
      s.mazeShape || 'square',
      s.lineStyle || 'rounded'
    );
    setMaze(newMaze);

    saveMazeToHistory({
      title: s.worksheetTitle || `${ageInfo.name}迷宮`,
      ageLevel: s.currentAgeKey,
      ageLevelName: ageInfo.name,
      cols: newMaze.cols,
      rows: newMaze.rows,
      illustrationSetId: s.illustrationSetId,
      mazeData: newMaze,
      prompt: s.worksheetPrompt || setInfo.prompt,
      worldTopic: topic
    });
    setHistoryList(getHistoryList());
  }, []);

  // Initial load
  useEffect(() => {
    if (didInitRef.current) return;
    didInitRef.current = true;
    setHistoryList(getHistoryList());
    handleGenerateMaze();
  }, [handleGenerateMaze]);

  useEffect(() => cancelPendingRegen, []);

  // Sync body theme class with selected age group
  useLayoutEffect(() => {
    document.body.className = `theme-${currentAgeKey}`;
  }, [currentAgeKey]);

  // Size change handler with debounce
  const handleSizeChange = (size) => {
    setGridSize(size);
    cancelPendingRegen();
    debounceRef.current = setTimeout(() => handleGenerateMaze({ gridSize: size }), SIZE_DEBOUNCE_MS);
  };

  // Shape change handler
  const handleShapeChange = (shape) => {
    setMazeShape(shape);
    handleGenerateMaze({ mazeShape: shape });
  };

  // Line style change handler
  const handleLineStyleChange = (style) => {
    setLineStyle(style);
    handleGenerateMaze({ lineStyle: style });
  };

  // Age group selection change handler
  const handleSelectAge = (newAgeKey) => {
    const ageInfo = getAgeInfo(newAgeKey);
    const setId = ageInfo.defaultIllustrationSet;
    const setInfo = ILLUSTRATION_SETS[setId] || ILLUSTRATION_SETS['rabbit-carrot'];
    const title = `${ageInfo.name}迷宮學習單`;
    const targetShape = ageInfo.defaultShape || 'square';
    const targetLineStyle = ageInfo.defaultLineStyle || 'rounded';

    setCurrentAgeKey(newAgeKey);
    setGridSize(ageInfo.defaultCols);
    setMazeShape(targetShape);
    setLineStyle(targetLineStyle);
    setIllustrationSetId(setId);
    setWorksheetTitle(title);
    setWorksheetPrompt(setInfo.prompt);
    const nextTopic = defaultTopicForAge(newAgeKey);
    topicPinnedRef.current = false;
    setTopicPinned(false);
    setWorldTopic(nextTopic);

    handleGenerateMaze({
      currentAgeKey: newAgeKey,
      gridSize: ageInfo.defaultCols,
      mazeShape: targetShape,
      lineStyle: targetLineStyle,
      illustrationSetId: setId,
      worksheetTitle: title,
      worksheetPrompt: setInfo.prompt,
      worldTopic: nextTopic
    });
  };

  const handleTopicChange = (topicId) => {
    if (!WORLD_TOPICS[topicId]) return;
    topicPinnedRef.current = true;
    setTopicPinned(true);
    setWorldTopic(topicId);
    settingsRef.current.worldTopic = topicId;
  };

  // Load historical maze snapshot
  const handleLoadHistoryMaze = (historyItem) => {
    if (!historyItem || !historyItem.mazeData) return;
    cancelPendingRegen();
    setCurrentAgeKey(historyItem.ageLevel || 'toddler');
    setGridSize(historyItem.cols);
    setIllustrationSetId(historyItem.illustrationSetId || 'rabbit-carrot');
    setWorksheetTitle(historyItem.title || '迷宮學習單');
    if (historyItem.prompt) setWorksheetPrompt(historyItem.prompt);
    if (historyItem.mazeData.shape) setMazeShape(historyItem.mazeData.shape);
    if (historyItem.mazeData.lineStyle) setLineStyle(historyItem.mazeData.lineStyle);
    if (historyItem.worldTopic && WORLD_TOPICS[historyItem.worldTopic]) {
      setWorldTopic(historyItem.worldTopic);
      setTopicPinned(true);
    } else {
      setWorldTopic(defaultTopicForAge(historyItem.ageLevel));
      setTopicPinned(false);
    }
    setMaze(historyItem.mazeData);
  };

  const handleVictory = useCallback((stats) => {
    setVictoryStats(stats);
    setIsVictoryOpen(true);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentAgeKey={currentAgeKey}
        onRegenerate={() => handleGenerateMaze()}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={historyList.length}
      />

      {/* Main Content Area */}
      <main className={`main-content${activeTab === 'walk' ? ' walk-tab' : ''}`}>
        
        {/* Age Level Selector Card */}
        <div className="no-print age-panel">
          <AgeSelector
            currentAgeKey={currentAgeKey}
            onSelectAge={handleSelectAge}
          />
        </div>

        {/* Tab View: Generator & Play vs A4 Print Preview */}
        {activeTab !== 'print' ? (
          <div className={`workspace-grid${activeTab === 'walk' ? ' walk-mode' : ''}`}>
            {/* Control Panel */}
            <div className="no-print workspace-controls">
              <ControlPanel
                currentAgeKey={currentAgeKey}
                gridSize={gridSize}
                onSizeChange={handleSizeChange}
                mazeShape={mazeShape}
                onShapeChange={handleShapeChange}
                lineStyle={lineStyle}
                onLineStyleChange={handleLineStyleChange}
                illustrationSetId={illustrationSetId}
                setIllustrationSetId={setIllustrationSetId}
                showSolution={showSolution}
                setShowSolution={setShowSolution}
                worksheetTitle={worksheetTitle}
                setWorksheetTitle={setWorksheetTitle}
                worksheetPrompt={worksheetPrompt}
                setWorksheetPrompt={setWorksheetPrompt}
                includeAnswerKey={includeAnswerKey}
                setIncludeAnswerKey={setIncludeAnswerKey}
                showDpad={showDpad}
                setShowDpad={setShowDpad}
                worldTopic={worldTopic}
                onTopicChange={handleTopicChange}
              />
            </div>

            {/* Interactive Maze Canvas or first-person walk */}
            <div className="workspace-view">
              {maze && activeTab === 'walk' && (
                <Maze3DView
                  maze={maze}
                  topicId={worldTopic}
                  illustrationSetId={illustrationSetId}
                  currentAgeKey={currentAgeKey}
                  onVictory={handleVictory}
                  onExit3D={() => setActiveTab('generator')}
                />
              )}
              {maze && activeTab !== 'walk' && (
                <MazeCanvas
                  maze={maze}
                  currentAgeKey={currentAgeKey}
                  illustrationSetId={illustrationSetId}
                  showSolution={showSolution}
                  onVictory={handleVictory}
                  showDpad={showDpad}
                />
              )}
            </div>
          </div>
        ) : (
          /* A4 Print View */
          <div>
            {maze && (
              <PrintView
                maze={maze}
                currentAgeKey={currentAgeKey}
                illustrationSetId={illustrationSetId}
                worksheetTitle={worksheetTitle}
                worksheetPrompt={worksheetPrompt}
                includeAnswerKey={includeAnswerKey}
              />
            )}
          </div>
        )}

      </main>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        historyList={historyList}
        onLoadMaze={handleLoadHistoryMaze}
        onRefreshHistory={() => setHistoryList(getHistoryList())}
      />

      {/* Victory Celebration Modal */}
      <VictoryModal
        isOpen={isVictoryOpen}
        onClose={() => setIsVictoryOpen(false)}
        stats={victoryStats}
        onRegenerate={() => handleGenerateMaze()}
        onGoToPrint={() => setActiveTab('print')}
      />

    </div>
  );
}
