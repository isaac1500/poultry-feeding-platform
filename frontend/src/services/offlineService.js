// frontend/src/services/offlineService.js
const OFFLINE_PREFIX = 'offline_';

export const saveOfflineData = (key, data) => {
  try {
    const offlineData = JSON.parse(localStorage.getItem(`${OFFLINE_PREFIX}${key}`) || '[]');
    offlineData.push({
      ...data,
      offlineId: Date.now(),
      synced: false,
      timestamp: new Date().toISOString()
    });
    localStorage.setItem(`${OFFLINE_PREFIX}${key}`, JSON.stringify(offlineData));
    return true;
  } catch (error) {
    console.error('Error saving offline data:', error);
    return false;
  }
};

export const getOfflineData = (key) => {
  try {
    return JSON.parse(localStorage.getItem(`${OFFLINE_PREFIX}${key}`) || '[]');
  } catch (error) {
    console.error('Error getting offline data:', error);
    return [];
  }
};

export const syncOfflineData = async (key, syncFunction) => {
  if (!navigator.onLine) return false;
  
  const offlineData = getOfflineData(key);
  const unsynced = offlineData.filter(item => !item.synced);
  
  for (const item of unsynced) {
    try {
      await syncFunction(item);
      item.synced = true;
    } catch (error) {
      console.error(`Failed to sync ${key}:`, error);
    }
  }
  
  localStorage.setItem(`${OFFLINE_PREFIX}${key}`, JSON.stringify(offlineData));
  return true;
};