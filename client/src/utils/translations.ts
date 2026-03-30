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
  'Sugarcane': { en: 'Sugarcane', ta: 'கரும்பு', hi: 'गन्ना' },
  'Potato': { en: 'Potato', ta: 'உருளைக்கிழங்கு', hi: 'आलू' },
  'Onion': { en: 'Onion', ta: 'வெங்காயம்', hi: 'प्याज' },
  'Tomato': { en: 'Tomato', ta: 'தக்காளி', hi: 'टमाटर' },
  'Coconut': { en: 'Coconut', ta: 'தேங்காய்', hi: 'नारियल' },
  'Groundnut': { en: 'Groundnut', ta: 'நிலக்கடலை', hi: 'मूंगफली' },
  'Soybean': { en: 'Soybean', ta: 'சோயாபீன்', hi: 'सोयाबीन' },
  'Sunflower': { en: 'Sunflower', ta: 'சூரியகாந்தி', hi: 'सूरजमुखी' },
  'Mustard': { en: 'Mustard', ta: 'கடுகு', hi: 'सरसों' },
  'Turmeric': { en: 'Turmeric', ta: 'மஞ்சள்', hi: 'हल्दी' },
};

// Fertilizer type translations
const fertilizerTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Urea': { en: 'Urea', ta: 'யூரியா', hi: 'यूरिया' },
  'NPK (19:19:19)': { en: 'NPK (19:19:19)', ta: 'NPK (19:19:19)', hi: 'NPK (19:19:19)' },
  'NPK (12:32:16)': { en: 'NPK (12:32:16)', ta: 'NPK (12:32:16)', hi: 'NPK (12:32:16)' },
  'DAP': { en: 'DAP', ta: 'DAP', hi: 'DAP' },
  'MOP (Muriate of Potash)': { en: 'MOP (Muriate of Potash)', ta: 'MOP (பொட்டாசியம் முரியேட்)', hi: 'MOP (पोटैशियम म्यूरिएट)' },
  'SSP (Single Super Phosphate)': { en: 'SSP (Single Super Phosphate)', ta: 'SSP (சிங்கிள் சூப்பர் பாஸ்பேட்)', hi: 'SSP (सिंगल सुपर फॉस्फेट)' },
  'Zinc Sulphate': { en: 'Zinc Sulphate', ta: 'துத்தநாக சல்பேட்', hi: 'जिंक सल्फेट' },
  'Organic Compost': { en: 'Organic Compost', ta: 'கரிம உரம்', hi: 'जैविक खाद' },
  'Vermicompost': { en: 'Vermicompost', ta: 'மண்புழு உரம்', hi: 'वर्मीकम्पोस्ट' },
  'Bone Meal': { en: 'Bone Meal', ta: 'எலும்பு உரம்', hi: 'बोन मील' },
  'Insecticide - Imidacloprid': { en: 'Insecticide - Imidacloprid', ta: 'பூச்சிக்கொல்லி - இமிடாகுளோபிரிட்', hi: 'कीटनाशक - इमिडाक्लोप्रिड' },
  'Insecticide - Chlorpyriphos': { en: 'Insecticide - Chlorpyriphos', ta: 'பூச்சிக்கொல்லி - குளோர்பைரிபாஸ்', hi: 'कीटनाशक - क्लोरपाइरिफोस' },
  'Insecticide - Cypermethrin': { en: 'Insecticide - Cypermethrin', ta: 'பூச்சிக்கொல்லி - சைப்பர்மெத்ரின்', hi: 'कीटनाशक - साइपरमेथ्रिन' },
  'Fungicide - Mancozeb': { en: 'Fungicide - Mancozeb', ta: 'பூஞ்சைக்கொல்லி - மேன்கோசெப்', hi: 'कवकनाशक - मैंकोज़ेब' },
  'Fungicide - Copper Oxychloride': { en: 'Fungicide - Copper Oxychloride', ta: 'பூஞ்சைக்கொல்லி - தாமிர ஆக்ஸிகுளோரைடு', hi: 'कवकनाशक - कॉपर ऑक्सीक्लोराइड' },
  'Fungicide - Carbendazim': { en: 'Fungicide - Carbendazim', ta: 'பூஞ்சைக்கொல்லி - கார்பென்டாசிம்', hi: 'कवकनाशक - कार्बेंडाजिम' },
  'Herbicide - Glyphosate': { en: 'Herbicide - Glyphosate', ta: 'களைக்கொல்லி - கிளைஃபோசேட்', hi: 'खरपतवार नाशक - ग्लाइफोसेट' },
  'Herbicide - 2,4-D': { en: 'Herbicide - 2,4-D', ta: 'களைக்கொல்லி - 2,4-D', hi: 'खरपतवार नाशक - 2,4-D' },
  'Herbicide - Atrazine': { en: 'Herbicide - Atrazine', ta: 'களைக்கொல்லி - அட்ரசைன்', hi: 'खरपतवार नाशक - एट्राज़ीन' },
  'Neem Oil (Organic)': { en: 'Neem Oil (Organic)', ta: 'வேம்பு எண்ணெய் (கரிம)', hi: 'नीम तेल (जैविक)' },
  'Biological - Bacillus Thuringiensis': { en: 'Biological - Bacillus Thuringiensis', ta: 'உயிரியல் - பேசிலஸ் தூரிங்கியன்சிஸ்', hi: 'जैविक - बैसिलस थुरिंगिएन्सिस' },
  'Organic - Garlic Extract': { en: 'Organic - Garlic Extract', ta: 'கரிம - பூண்டு சாறு', hi: 'जैविक - लहसुन का अर्क' },
};

// Category translations
const categoryTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Grains': { en: 'Grains', ta: 'தானியங்கள்', hi: 'अनाज' },
  'Fiber': { en: 'Fiber', ta: 'நார்', hi: 'रेशा' },
  'Fruits': { en: 'Fruits', ta: 'பழங்கள்', hi: 'फल' },
  'Pulses': { en: 'Pulses', ta: 'பருப்பு வகைகள்', hi: 'दालें' },
  'Beverages': { en: 'Beverages', ta: 'பானங்கள்', hi: 'पेय' },
  'Vegetables': { en: 'Vegetables', ta: 'காய்கறிகள்', hi: 'सब्जियां' },
  'Spices': { en: 'Spices', ta: 'மசாலாப் பொருட்கள்', hi: 'मसाले' },
  'Oilseeds': { en: 'Oilseeds', ta: 'எண்ணெய் விதைகள்', hi: 'तिलहन' },
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

// District name translations
const districtTranslations: Record<string, { en: string; ta: string; hi: string }> = {
  'Coimbatore': { en: 'Coimbatore', ta: 'கோயம்புத்தூர்', hi: 'कोयंबटूर' },
  'Chennai': { en: 'Chennai', ta: 'சென்னை', hi: 'चेन्नई' },
  'Madurai': { en: 'Madurai', ta: 'மதுரை', hi: 'मदुरई' },
  'Tirunelveli': { en: 'Tirunelveli', ta: 'திருநெல்வேலி', hi: 'तिरुनलवेली' },
  'Salem': { en: 'Salem', ta: 'சேலம்', hi: 'सेलम' },
  'Erode': { en: 'Erode', ta: 'ஈரோடு', hi: 'ईरोड' },
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

export const translateDistrict = (district: string): string => {
  const lang = i18n.language || 'en';
  const translation = districtTranslations[district];
  if (!translation) return district;
  return translation[lang as 'en' | 'ta' | 'hi'] || translation.en;
};
