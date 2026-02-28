import { useState, useEffect } from 'react';

const useOfflineData = (key, initialData = []) => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : initialData;
  });
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem(key, JSON.stringify(newData));
  };

  const clearData = () => {
    setData(initialData);
    localStorage.removeItem(key);
  };

  return {
    data,
    setData: saveData,
    clearData,
    isOnline,
    hasOfflineData: data.length > 0 || Object.keys(data).length > 0
  };
};

export default useOfflineData;