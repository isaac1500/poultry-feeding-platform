// frontend/src/services/offlineSync.js
import { db } from '../utils/firebase';
import { collection, addDoc, getDocs, setDoc, doc } from 'firebase/firestore';

class OfflineSync {
  constructor() {
    this.queue = [];
    this.isOnline = navigator.onLine;
    this.syncInterval = null;
    
    this.init();
  }
  
  init() {
    // Load pending operations from localStorage
    this.loadQueue();
    
    // Set up online/offline listeners
    window.addEventListener('online', this.handleOnline.bind(this));
    window.addEventListener('offline', this.handleOffline.bind(this));
    
    // Start sync interval
    this.syncInterval = setInterval(this.syncQueue.bind(this), 30000); // Every 30 seconds
  }
  
  handleOnline() {
    this.isOnline = true;
    console.log('Device is online, syncing pending operations...');
    this.syncQueue();
  }
  
  handleOffline() {
    this.isOnline = false;
    console.log('Device is offline, operations will be queued');
  }
  
  loadQueue() {
    try {
      const savedQueue = localStorage.getItem('offlineQueue');
      if (savedQueue) {
        this.queue = JSON.parse(savedQueue);
        console.log(`Loaded ${this.queue.length} pending operations from queue`);
      }
    } catch (error) {
      console.error('Error loading offline queue:', error);
      this.queue = [];
    }
  }
  
  saveQueue() {
    try {
      localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    } catch (error) {
      console.error('Error saving offline queue:', error);
    }
  }
  
  async addToQueue(operation) {
    const operationWithMetadata = {
      ...operation,
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      status: 'pending'
    };
    
    this.queue.push(operationWithMetadata);
    this.saveQueue();
    
    console.log('Added operation to queue:', operationWithMetadata);
    
    // Try to sync immediately if online
    if (this.isOnline) {
      await this.syncQueue();
    }
    
    return operationWithMetadata;
  }
  
  async syncQueue() {
    if (!this.isOnline || this.queue.length === 0) {
      return;
    }
    
    console.log(`Syncing ${this.queue.length} pending operations...`);
    
    const successfulOps = [];
    const failedOps = [];
    
    for (const operation of [...this.queue]) {
      try {
        await this.executeOperation(operation);
        successfulOps.push(operation);
        
        // Remove from queue
        this.queue = this.queue.filter(op => op.id !== operation.id);
      } catch (error) {
        console.error('Failed to sync operation:', operation, error);
        operation.retries = (operation.retries || 0) + 1;
        operation.lastError = error.message;
        
        if (operation.retries >= 3) {
          // Too many retries, mark as failed
          operation.status = 'failed';
          failedOps.push(operation);
          this.queue = this.queue.filter(op => op.id !== operation.id);
        }
      }
    }
    
    this.saveQueue();
    
    if (successfulOps.length > 0) {
      console.log(`Successfully synced ${successfulOps.length} operations`);
      
      // Show success notification
      this.showNotification(
        'Data Synced',
        `Successfully synced ${successfulOps.length} pending ${successfulOps.length === 1 ? 'operation' : 'operations'}`
      );
    }
    
    if (failedOps.length > 0) {
      console.error(`Failed to sync ${failedOps.length} operations`);
    }
  }
  
  async executeOperation(operation) {
    switch (operation.type) {
      case 'create_flock':
        await addDoc(collection(db, 'flocks'), operation.data);
        break;
        
      case 'update_flock':
        await setDoc(doc(db, 'flocks', operation.flockId), operation.data, { merge: true });
        break;
        
      case 'create_recommendation':
        await addDoc(collection(db, 'recommendations'), operation.data);
        break;
        
      case 'delete_recommendation':
        // Note: For safety, we don't queue deletions
        // They should only happen when online
        break;
        
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
    
    operation.status = 'completed';
    operation.completedAt = new Date().toISOString();
  }
  
  showNotification(title, message) {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return;
    }
    
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    } else if (Notification.permission !== 'denied') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          new Notification(title, { body: message });
        }
      });
    }
  }
  
  getQueueLength() {
    return this.queue.length;
  }
  
  getQueue() {
    return [...this.queue];
  }
  
  clearQueue() {
    this.queue = [];
    this.saveQueue();
  }
  
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
    
    window.removeEventListener('online', this.handleOnline);
    window.removeEventListener('offline', this.handleOffline);
  }
}

// Create singleton instance
const offlineSync = new OfflineSync();

export default offlineSync;