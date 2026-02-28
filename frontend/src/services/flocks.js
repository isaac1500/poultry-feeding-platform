// src/services/flocks.js - FIRESTORE VERSION WITH OFFLINE SUPPORT
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { auth } from '../utils/firebase';

// Offline storage keys
const OFFLINE_FLOCKS_KEY = 'offline_flocks';
const OFFLINE_ACTIONS_KEY = 'offline_actions';

export const flockService = {
  
  // Get all flocks (online + offline)
  getFlocks: async () => {
    try {
      const isOnline = navigator.onLine;
      
      if (!isOnline) {
        console.log('📴 OFFLINE: Getting cached flocks');
        // Get cached online data
        const cachedFlocks = JSON.parse(localStorage.getItem('cached_flocks') || '[]');
        // Get offline data
        const offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
        return [...cachedFlocks, ...offlineFlocks];
      }
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const flocksRef = collection(db, 'flocks');
      const q = query(
        flocksRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const flocks = [];
      
      querySnapshot.forEach((doc) => {
        flocks.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      // Cache for offline use
      localStorage.setItem('cached_flocks', JSON.stringify(flocks));
      console.log('✅ Online: Flocks cached for offline');
      
      return flocks;
    } catch (error) {
      console.error('Error getting flocks:', error);
      
      // Fallback to cache if online fails
      const cachedFlocks = JSON.parse(localStorage.getItem('cached_flocks') || '[]');
      const offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
      return [...cachedFlocks, ...offlineFlocks];
    }
  },
  
  // Get single flock
  getFlock: async (id) => {
    try {
      // Check offline flocks first
      const offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
      const offlineFlock = offlineFlocks.find(f => f.id === id);
      if (offlineFlock) return offlineFlock;
      
      const docRef = doc(db, 'flocks', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        throw new Error('Flock not found');
      }
    } catch (error) {
      console.error('Error getting flock:', error);
      throw error;
    }
  },
  
  // Create new flock (with offline support)
  createFlock: async (flockData) => {
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const flockWithMetadata = {
        ...flockData,
        userId: user.uid,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        online: navigator.onLine
      };
      
      if (!navigator.onLine) {
        console.log('📴 OFFLINE: Saving flock locally');
        // Generate offline ID
        const offlineId = `offline_${Date.now()}`;
        const offlineFlock = {
          ...flockWithMetadata,
          id: offlineId,
          offline: true,
          synced: false
        };
        
        // Save to offline storage
        const offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
        offlineFlocks.push(offlineFlock);
        localStorage.setItem(OFFLINE_FLOCKS_KEY, JSON.stringify(offlineFlocks));
        
        // Save action for sync
        const offlineActions = JSON.parse(localStorage.getItem(OFFLINE_ACTIONS_KEY) || '[]');
        offlineActions.push({
          type: 'CREATE_FLOCK',
          data: flockWithMetadata,
          offlineId,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(offlineActions));
        
        return offlineFlock;
      }
      
      // Online: Save to Firestore
      const docRef = await addDoc(collection(db, 'flocks'), flockWithMetadata);
      
      return {
        id: docRef.id,
        ...flockWithMetadata
      };
    } catch (error) {
      console.error('Error creating flock:', error);
      throw error;
    }
  },
  
  // Update flock
  updateFlock: async (id, flockData) => {
    try {
      const docRef = doc(db, 'flocks', id);
      const updateData = {
        ...flockData,
        updatedAt: new Date().toISOString()
      };
      
      if (!navigator.onLine && id.startsWith('offline_')) {
        console.log('📴 OFFLINE: Updating local flock');
        const offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
        const index = offlineFlocks.findIndex(f => f.id === id);
        if (index !== -1) {
          offlineFlocks[index] = { ...offlineFlocks[index], ...updateData };
          localStorage.setItem(OFFLINE_FLOCKS_KEY, JSON.stringify(offlineFlocks));
          
          // Save action for sync
          const offlineActions = JSON.parse(localStorage.getItem(OFFLINE_ACTIONS_KEY) || '[]');
          offlineActions.push({
            type: 'UPDATE_FLOCK',
            data: updateData,
            id,
            timestamp: new Date().toISOString()
          });
          localStorage.setItem(OFFLINE_ACTIONS_KEY, JSON.stringify(offlineActions));
        }
        return { id, ...updateData };
      }
      
      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Error updating flock:', error);
      throw error;
    }
  },
  
  // Delete flock
  deleteFlock: async (id) => {
    try {
      if (!navigator.onLine && id.startsWith('offline_')) {
        console.log('📴 OFFLINE: Deleting local flock');
        let offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
        offlineFlocks = offlineFlocks.filter(f => f.id !== id);
        localStorage.setItem(OFFLINE_FLOCKS_KEY, JSON.stringify(offlineFlocks));
        return { success: true, offline: true };
      }
      
      await deleteDoc(doc(db, 'flocks', id));
      return { success: true };
    } catch (error) {
      console.error('Error deleting flock:', error);
      throw error;
    }
  },
  
  // NEW: Sync offline flocks when online
  syncOfflineFlocks: async () => {
    try {
      if (!navigator.onLine) {
        console.log('Cannot sync: Offline');
        return { synced: 0 };
      }
      
      const offlineActions = JSON.parse(localStorage.getItem(OFFLINE_ACTIONS_KEY) || '[]');
      const offlineFlocks = JSON.parse(localStorage.getItem(OFFLINE_FLOCKS_KEY) || '[]');
      
      let syncedCount = 0;
      
      for (const action of offlineActions) {
        try {
          if (action.type === 'CREATE_FLOCK') {
            const docRef = await addDoc(collection(db, 'flocks'), action.data);
            console.log(`✅ Synced flock: ${docRef.id}`);
          } else if (action.type === 'UPDATE_FLOCK') {
            const docRef = doc(db, 'flocks', action.id);
            await updateDoc(docRef, action.data);
          }
          syncedCount++;
        } catch (syncError) {
          console.error('Sync error:', syncError);
        }
      }
      
      // Clear synced actions
      localStorage.removeItem(OFFLINE_ACTIONS_KEY);
      localStorage.removeItem(OFFLINE_FLOCKS_KEY);
      
      console.log(`✅ Synced ${syncedCount} offline actions`);
      return { synced: syncedCount };
    } catch (error) {
      console.error('Error syncing offline flocks:', error);
      return { synced: 0, error: error.message };
    }
  }
};