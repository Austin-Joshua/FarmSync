// Utility function to get crop-specific icons
export const getCropIcon = (cropName: string): string => {
  const normalizedName = cropName.toLowerCase().trim();
  
  const cropIconMap: Record<string, string> = {
    // Grains
    'rice': '🌾',
    'wheat': '🌾',
    'maize': '🌽',
    'corn': '🌽',
    'barley': '🌾',
    'oats': '🌾',
    
    // Pulses/Legumes
    'lentil': '🫘',
    'chickpea': '🫘',
    'chickpe': '🫘', // Handle ChickPea variation
    'chick': '🫘', // Handle ChickPea variation
    'blackgram': '🫘',
    'blackgra': '🫘', // Handle Blackgram variation
    'black': '🫘', // Handle Blackgram variation
    'mungbean': '🫘',
    'mothbeans': '🫘',
    'pigeonpeas': '🫘',
    'kidneybeans': '🫘',
    'beans': '🫘',
    
    // Vegetables
    'tomato': '🍅',
    'potato': '🥔',
    'onion': '🧅',
    'carrot': '🥕',
    'cucumber': '🥒',
    'cauliflower': '🥬',
    'cabbage': '🥬',
    'brinjal': '🍆',
    'eggplant': '🍆',
    'okra': '🫛',
    'ladyfinger': '🫛',
    
    // Fruits
    'apple': '🍎',
    'banana': '🍌',
    'mango': '🥭',
    'orange': '🍊',
    'papaya': '🍈',
    'watermelon': '🍉',
    'muskmelon': '🍈',
    'pomegranate': '🍎',
    'grapes': '🍇',
    'coconut': '🥥',
    
    // Commercial crops
    // Commercial crops / Fiber
    'cotton': '🌿',
    'sugarcane': '🎋',
    'jute': '🌿',
    
    // Beverages
    'coffee': '☕',
    'tea': '🍃',
    
    // Oilseeds
    'sunflower': '🌻',
    'mustard': '🟡',
    'groundnut': '🥜',
    'peanut': '🥜',
    'sesame': '🟡',
    'soybean': '🫘',
    
    // Spices
    'turmeric': '🟡',
    'ginger': '🟤',
    'chili': '🌶️',
    'pepper': '🌶️',
    'cardamom': '🟢',
    'cumin': '🟤',
    
    // Default fallback
    'default': '🌱',
  };
  
  // Direct match
  if (cropIconMap[normalizedName]) {
    return cropIconMap[normalizedName];
  }
  
  // Partial match - check if normalized name contains any key or vice versa
  for (const [key, icon] of Object.entries(cropIconMap)) {
    if (key === 'default') continue; // Skip default in partial matching
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return icon;
    }
  }
  
  // Additional checks for common variations
  // Handle "ChickPea" -> "chickpea"
  if (normalizedName.includes('chickpea') || normalizedName.includes('chickpe')) {
    return cropIconMap['chickpea'] || cropIconMap.default;
  }
  
  // Handle "Blackgram" -> "blackgram"
  if (normalizedName.includes('blackgram') || normalizedName.includes('blackgra')) {
    return cropIconMap['blackgram'] || cropIconMap.default;
  }
  
  // Return default icon
  return cropIconMap.default;
};

// Alternative: Get crop icon as JSX/Lucide icon component name
export const getCropIconComponent = (cropName: string): string => {
  const normalizedName = cropName.toLowerCase().trim();
  
  const cropIconComponentMap: Record<string, string> = {
    'rice': 'Wheat',
    'wheat': 'Wheat',
    'maize': 'Wheat',
    'cotton': 'TreePine',
    'coffee': 'Coffee',
    'sugarcane': 'TreePine',
    'apple': 'Apple',
    'banana': 'Banana',
    'mango': 'Banana',
    'tomato': 'Cherry',
    'potato': 'CircleDot',
    // Add more mappings as needed
  };
  
  if (cropIconComponentMap[normalizedName]) {
    return cropIconComponentMap[normalizedName];
  }
  
  return 'Sprout'; // Default Lucide icon
};
