/**
 * Storage Utility for Maze Archives & History Logging.
 */

const STORAGE_KEY = 'age_adaptive_maze_history_v1';
const MAX_HISTORY_ITEMS = 50;

export function getHistoryList() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (err) {
    console.error('Failed to load history from LocalStorage:', err);
    return [];
  }
}

export function saveMazeToHistory(mazeRecord) {
  try {
    const list = getHistoryList();
    const newRecord = {
      id: mazeRecord.id || `maze_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      createdAt: new Date().toISOString(),
      title: mazeRecord.title || '線上迷宮學習單',
      ageLevel: mazeRecord.ageLevel || 'toddler',
      ageLevelName: mazeRecord.ageLevelName || '幼兒啟蒙',
      cols: mazeRecord.cols,
      rows: mazeRecord.rows,
      illustrationSetId: mazeRecord.illustrationSetId || 'rabbit-carrot',
      mazeData: mazeRecord.mazeData,
      thumbnail: mazeRecord.thumbnail || null, // Base64 data URL
      prompt: mazeRecord.prompt || '',
      worldTopic: mazeRecord.worldTopic || ''
    };

    // Prepend to list
    const updatedList = [newRecord, ...list.filter(item => item.id !== newRecord.id)];

    // Cap at MAX_HISTORY_ITEMS
    if (updatedList.length > MAX_HISTORY_ITEMS) {
      updatedList.length = MAX_HISTORY_ITEMS;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
    return newRecord;
  } catch (err) {
    console.error('Failed to save maze to history:', err);
    return null;
  }
}

export function deleteHistoryItem(id) {
  try {
    const list = getHistoryList();
    const filtered = list.filter(item => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (err) {
    console.error('Failed to delete history item:', err);
    return false;
  }
}

export function clearAllHistory() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return true;
  } catch (err) {
    console.error('Failed to clear history:', err);
    return false;
  }
}
