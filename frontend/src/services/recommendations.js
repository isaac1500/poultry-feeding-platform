// frontend/src/services/recommendations.js - COMPLETE FIXED VERSION
import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy 
} from 'firebase/firestore';
import { db } from '../utils/firebase';
import { auth } from '../utils/firebase';

// Helper function to convert camelCase to snake_case
const convertToSnakeCase = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  if (Array.isArray(data)) {
    return data.map(item => convertToSnakeCase(item));
  }
  
  const result = {};
  
  for (const [key, value] of Object.entries(data)) {
    // Convert camelCase to snake_case
    const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
    
    // Recursively convert nested objects
    if (value && typeof value === 'object') {
      result[snakeKey] = convertToSnakeCase(value);
    } else {
      result[snakeKey] = value;
    }
  }
  
  return result;
};

// Helper function to convert recommendation data format
const convertRecommendationData = (rec) => {
  if (!rec) return null;
  
  // Default structure
  const defaultData = {
    id: rec.id,
    flock_name: rec.flockName || rec.flock_name || 'Unknown Flock',
    flock_id: rec.flockId || rec.flock_id || '',
    feed_type: rec.feedType || rec.feed_type || 'starter',
    formulation_objective: rec.formulationObjective || rec.formulation_objective || 'minimize_cost',
    total_cost: rec.totalCost || rec.total_cost || 0,
    cost_per_kg: rec.costPerKg || rec.cost_per_kg || 0,
    status: rec.status || 'completed',
    created_at: rec.createdAt || rec.created_at || new Date().toISOString(),
    ingredients: [],
    nutritional_analysis: {}
  };
  
  // Handle ingredients
  if (rec.ingredients && Array.isArray(rec.ingredients)) {
    defaultData.ingredients = rec.ingredients.map(ing => ({
      ingredient_id: ing.ingredient_id || ing.ingredientId || '',
      ingredient_name: ing.ingredient_name || ing.ingredientName || 'Unknown',
      percentage: ing.percentage || 0,
      amount_kg: ing.amount_kg || ing.amountKg || 0,
      cost: ing.cost || 0
    }));
  } else {
    // Default ingredients if none provided
    defaultData.ingredients = [
      { ingredient_id: '1', ingredient_name: 'Maize', percentage: 55, amount_kg: 55, cost: 82500 },
      { ingredient_id: '2', ingredient_name: 'Soya Bean Meal', percentage: 35, amount_kg: 35, cost: 98000 },
      { ingredient_id: '3', ingredient_name: 'Fish Meal', percentage: 10, amount_kg: 10, cost: 50000 }
    ];
  }
  
  // Handle nutritional analysis
  if (rec.nutritional_analysis && typeof rec.nutritional_analysis === 'object') {
    defaultData.nutritional_analysis = rec.nutritional_analysis;
  } else if (rec.nutritionalAnalysis && typeof rec.nutritionalAnalysis === 'object') {
    defaultData.nutritional_analysis = convertToSnakeCase(rec.nutritionalAnalysis);
  } else {
    // Default nutritional analysis
    defaultData.nutritional_analysis = {
      protein: { actual: 20.5, min_required: 18, max_allowed: 22, status: 'adequate' },
      energy: { actual: 3000, min_required: 2800, max_allowed: 3200, status: 'adequate' },
      calcium: { actual: 1.0, min_required: 0.8, max_allowed: 1.2, status: 'adequate' },
      phosphorus: { actual: 0.45, min_required: 0.4, max_allowed: 0.6, status: 'adequate' }
    };
  }
  
  return defaultData;
};

export const recommendationService = {
  
  // Get all recommendations for current user
  getRecommendations: async (flockId = null) => {
    try {
      console.log('Getting recommendations...');
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      const recommendationsRef = collection(db, 'recommendations');
      
      // Build query
      let q = query(
        recommendationsRef, 
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );
      
      // Optional: Filter by flock
      if (flockId) {
        q = query(q, where('flockId', '==', flockId));
      }
      
      const querySnapshot = await getDocs(q);
      const recommendations = [];
      
      querySnapshot.forEach((doc) => {
        const data = {
          id: doc.id,
          ...doc.data()
        };
        
        // Convert data format for frontend
        recommendations.push(convertRecommendationData(data));
      });
      
      console.log(`Found ${recommendations.length} recommendations`);
      return recommendations;
      
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  },
  
  // Get single recommendation
  getRecommendation: async (id) => {
    try {
      console.log(`Getting recommendation with ID: ${id}`);
      
      const docRef = doc(db, 'recommendations', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const data = {
          id: docSnap.id,
          ...docSnap.data()
        };
        
        console.log('Raw Firestore data:', data);
        
        // Convert data format for frontend
        const convertedData = convertRecommendationData(data);
        console.log('Converted data:', convertedData);
        
        return convertedData;
        
      } else {
        throw new Error('Recommendation not found');
      }
    } catch (error) {
      console.error('Error getting recommendation:', error);
      throw error;
    }
  },
  
  // Create new recommendation
  createRecommendation: async (recommendationData) => {
    try {
      console.log('Creating recommendation...');
      
      const user = auth.currentUser;
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Prepare data for Firestore
      const firestoreData = {
        // Copy all data
        ...recommendationData,
        // Add metadata
        userId: user.uid,
        userEmail: user.email,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Ensure status
        status: recommendationData.status || 'completed'
      };
      
      console.log('Data to save:', firestoreData);
      
      // Save to Firestore
      const docRef = await addDoc(collection(db, 'recommendations'), firestoreData);
      
      console.log('Recommendation created with ID:', docRef.id);
      
      // Return formatted response
      return convertRecommendationData({
        id: docRef.id,
        ...firestoreData
      });
      
    } catch (error) {
      console.error('Error creating recommendation:', error);
      throw error;
    }
  },
  
  // Delete recommendation
  deleteRecommendation: async (id) => {
    try {
      console.log(`Deleting recommendation: ${id}`);
      
      await deleteDoc(doc(db, 'recommendations', id));
      
      console.log('Recommendation deleted successfully');
      return { success: true, message: 'Recommendation deleted' };
      
    } catch (error) {
      console.error('Error deleting recommendation:', error);
      throw error;
    }
  },
  
  // Generate AI recommendation (simulated)
  generateRecommendation: async (flockData, parameters) => {
    try {
      console.log('Generating AI recommendation...');
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const simulatedRecommendation = {
        flockId: flockData.id,
        flockName: flockData.name,
        birdType: flockData.birdType,
        formulation: {
          maize: 55,
          soyaBeanMeal: 35,
          fishMeal: 5,
          premix: 5
        },
        nutritionalAnalysis: {
          protein: 20.5,
          energy: 3000,
          calcium: 1.0,
          phosphorus: 0.45
        },
        cost: {
          perKg: 2035,
          total: 3663000
        },
        savings: {
          percentage: 18.6,
          amount: 837000
        },
        notes: "AI-optimized formulation for Ugandan market prices",
        status: "completed"
      };
      
      console.log('AI recommendation generated');
      return simulatedRecommendation;
      
    } catch (error) {
      console.error('Error generating recommendation:', error);
      throw error;
    }
  }
};