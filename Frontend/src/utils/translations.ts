// Translation utilities for dynamic content like crop names, fertilizer types, etc.
import i18n from '../i18n/config';

// Crop name translations
const cropTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Rice': { en: 'Rice', ta: 'அரிசி', hi: 'चावल' },
  'Wheat': { en: 'Wheat', ta: 'கோதுமை', hi: 'गेहूं' },
  'Maize': { en: 'Maize', ta: 'சோளம்', hi: 'मक्का' },
  'Cotton': { en: 'Cotton', ta: 'பருத்தி', hi: 'कपास' },
  'Banana': { en: 'Banana', ta: 'வாழைப்பழம்', hi: 'केला' },
  'Mango': { en: 'Mango', ta: 'மாங்காய்', hi: 'आम' },
  'ChickPea': { en: 'Chickpea', ta: 'கொண்டைக்கடலை', hi: 'चना' },
  'Blackgram': { en: 'Black Gram', ta: 'உளுந்து', hi: 'उड़द दाल' },
  'Coffee': { en: 'Coffee', ta: 'காபி', hi: 'कॉफी' },
  'Grapes': { en: 'Grapes', ta: 'திராட்சை', hi: 'अंगूर' },
};

// Fertilizer type translations
const fertilizerTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Urea': { en: 'Urea', ta: 'யூரியா', hi: 'यूरिया' },
  'NPK (19:19:19)': { en: 'NPK (19:19:19)', ta: 'NPK (19:19:19)', hi: 'NPK (19:19:19)' },
  'DAP': { en: 'DAP', ta: 'DAP', hi: 'DAP' },
  'Insecticide - Imidacloprid': { en: 'Insecticide - Imidacloprid', ta: 'பூச்சிக்கொல்லி - இமிடாகுளோபிரிட்', hi: 'कीटनाशक - इमिडाक्लोप्रिड' },
  'Fungicide - Mancozeb': { en: 'Fungicide - Mancozeb', ta: 'பூஞ்சைக்கொல்லி - மேன்கோசெப்', hi: 'कवकनाशक - मैंकोज़ेब' },
  'Herbicide - Glyphosate': { en: 'Herbicide - Glyphosate', ta: 'களைக்கொல்லி - கிளைஃபோசேட்', hi: 'खरपतवार नाशक - ग्लाइफोसेट' },
};

// Category translations
const categoryTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Grains': { en: 'Grains', ta: 'தானியங்கள்', hi: 'अनाज' },
  'Fiber': { en: 'Fiber', ta: 'நார்', hi: 'रेशा' },
  'Fruits': { en: 'Fruits', ta: 'பழங்கள்', hi: 'फल' },
  'Pulses': { en: 'Pulses', ta: 'பருப்பு வகைகள்', hi: 'दालें' },
  'Beverages': { en: 'Beverages', ta: 'பானங்கள்', hi: 'पेय' },
};

// Season translations
const seasonTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Kharif': { en: 'Kharif', ta: 'காரிப் பருவம்', hi: 'खरीफ' },
  'Rabi': { en: 'Rabi', ta: 'ரபி பருவம்', hi: 'रबी' },
  'Year-round': { en: 'Year-round', ta: 'முழு ஆண்டு', hi: 'साल भर' },
};

// Soil type translations
const soilTypeTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Alluvial': { en: 'Alluvial', ta: 'வண்டல் மண்', hi: 'जलोढ़ मिट्टी' },
  'Red Soil': { en: 'Red Soil', ta: 'சிவப்பு மண்', hi: 'लाल मिट्टी' },
  'Black Soil': { en: 'Black Soil', ta: 'கருப்பு மண்', hi: 'काली मिट्टी' },
  'Sandy': { en: 'Sandy', ta: 'மணல் மண்', hi: 'बलुई मिट्टी' },
  'Clay': { en: 'Clay', ta: 'களிமண்', hi: 'मिट्टी' },
};

export const translateCrop = (cropName: string): string => {
  const lang = i18n.language || 'en';
  const translation = cropTranslations[cropName];
  if (!translation) return cropName;
  return translation[lang as 'en' | 'ta' | 'hi'] || translation.en;
};

export const translateFertilizer = (fertilizerType: string): string => {
  const lang = i18n.language || 'en';
  const translation = fertilizerTranslations[fertilizerType];
  if (!translation) return fertilizerType;
  return translation[lang as 'en' | 'ta' | 'hi'] || translation.en;
};

export const translateCategory = (category: string): string => {
  const lang = i18n.language || 'en';
  const translation = categoryTranslations[category];
  if (!translation) return category;
  return translation[lang as 'en' | 'ta' | 'hi'] || translation.en;
};

export const translateSeason = (season: string): string => {
  const lang = i18n.language || 'en';
  const translation = seasonTranslations[season];
  if (!translation) return season;
  return translation[lang as 'en' | 'ta' | 'hi'] || translation.en;
};

export const translateSoilType = (soilType: string): string => {
  const lang = i18n.language || 'en';
  const translation = soilTypeTranslations[soilType];
  if (!translation) return soilType;
  return translation[lang as 'en' | 'ta' | 'hi'] || translation.en;
};
