/**
 * Placeholder Image Utilities
 * Provides fallback images for missing content
 */

// Food placeholder with inline SVG - Beautiful restaurant plate design
export const foodPlaceholder = `data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='grad1' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fef3c7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23fed7aa;stop-opacity:1' /%3E%3C/linearGradient%3E%3CradialGradient id='grad2' cx='50%25' cy='50%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%23ffffff;stop-opacity:0.5' /%3E%3Cstop offset='100%25' style='stop-color:%23f3f4f6;stop-opacity:1' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='400' height='400' fill='url(%23grad1)'/%3E%3Ccircle cx='200' cy='200' r='140' fill='white' opacity='0.9'/%3E%3Ccircle cx='200' cy='200' r='130' fill='url(%23grad2)' stroke='%23e5e7eb' stroke-width='3'/%3E%3Ccircle cx='200' cy='180' r='45' fill='%23ff5200' opacity='0.2'/%3E%3Cpath d='M 200 145 Q 185 155 180 170 Q 175 185 180 200 Q 185 215 200 220 Q 215 215 220 200 Q 225 185 220 170 Q 215 155 200 145 Z' fill='%23ff5200' opacity='0.3'/%3E%3Ccircle cx='190' cy='175' r='6' fill='%23fbbf24'/%3E%3Ccircle cx='210' cy='175' r='6' fill='%23fbbf24'/%3E%3Ccircle cx='185' cy='190' r='4' fill='%2310b981'/%3E%3Ccircle cx='200' cy='192' r='4' fill='%2310b981'/%3E%3Ccircle cx='215' cy='190' r='4' fill='%2310b981'/%3E%3Cpath d='M 150 230 Q 160 225 170 230 L 230 230 Q 240 225 250 230' stroke='%23d1d5db' stroke-width='2' fill='none'/%3E%3Ctext x='200' y='290' font-family='Inter, Arial, sans-serif' font-size='14' font-weight='600' fill='%239ca3af' text-anchor='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E`;

// Generic placeholder
export const genericPlaceholder = `data:image/svg+xml,%3Csvg width='400' height='400' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='400' height='400' fill='%23e5e7eb'/%3E%3Cpath d='M 150 120 L 250 120 L 280 200 L 200 280 L 120 200 Z' fill='%239ca3af' opacity='0.3'/%3E%3Ctext x='200' y='220' font-family='Arial, sans-serif' font-size='18' fill='%236b7280' text-anchor='middle'%3ENo Image Available%3C/text%3E%3C/svg%3E`;

// Phone mockup placeholder - Modern gradient design, responsive sizing
export const phonePlaceholder = `data:image/svg+xml,%3Csvg width='280' height='560' viewBox='0 0 280 560' xmlns='http://www.w3.org/2000/svg'%3E%3Cdefs%3E%3ClinearGradient id='phoneGrad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%231f2937;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23374151;stop-opacity:1' /%3E%3C/linearGradient%3E%3ClinearGradient id='screenGrad' x1='0%25' y1='0%25' x2='0%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%23fef3c7;stop-opacity:1' /%3E%3Cstop offset='100%25' style='stop-color:%23ffffff;stop-opacity:1' /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='280' height='560' rx='35' fill='url(%23phoneGrad)'/%3E%3Crect x='12' y='12' width='256' height='536' rx='28' fill='%23000000' opacity='0.5'/%3E%3Crect x='16' y='50' width='248' height='460' rx='20' fill='url(%23screenGrad)'/%3E%3Crect x='100' y='20' width='80' height='20' rx='10' fill='%23000000' opacity='0.8'/%3E%3Ccircle cx='140' cy='30' r='4' fill='%23374151'/%3E%3Cg transform='translate(140, 250)'%3E%3Ccircle r='50' fill='%23ff5200' opacity='0.2'/%3E%3Cpath d='M -15 -10 L -15 -5 Q -15 0 -10 0 L 10 0 Q 15 0 15 -5 L 15 -10 Q 15 -15 10 -15 L -10 -15 Q -15 -15 -15 -10 Z' fill='%23ff5200'/%3E%3Cpath d='M -8 -8 L -8 -3 L 8 -3 L 8 -8 M -5 -3 L -5 5 M 0 -3 L 0 5 M 5 -3 L 5 5' stroke='%23ffffff' stroke-width='2' fill='none'/%3E%3C/g%3E%3Ctext x='140' y='330' font-family='Inter, sans-serif' font-size='18' font-weight='bold' fill='%23ff5200' text-anchor='middle'%3EBiteDash%3C/text%3E%3Ctext x='140' y='355' font-family='Inter, sans-serif' font-size='11' fill='%239ca3af' text-anchor='middle'%3ESmart Corporate Dining%3C/text%3E%3Crect x='50' y='520' width='180' height='28' rx='14' fill='%23000000' opacity='0.3'/%3E%3C/svg%3E`;

// Avatar placeholder generator
export const getAvatarPlaceholder = (name = 'User', size = 100) => {
  const initial = name.charAt(0).toUpperCase();
  const colors = ['ff5200', '3b82f6', '10b981', 'f59e0b', 'ef4444', '8b5cf6'];
  const color = colors[name.length % colors.length];

  return `data:image/svg+xml,%3Csvg width='${size}' height='${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Ccircle cx='${size/2}' cy='${size/2}' r='${size/2}' fill='%23${color}'/%3E%3Ctext x='50%25' y='50%25' font-family='Arial, sans-serif' font-size='${size/2}' fill='white' text-anchor='middle' dy='.35em' font-weight='bold'%3E${initial}%3C/text%3E%3C/svg%3E`;
};

// Food image from Unsplash (free to use, high quality)
export const getFoodImage = (category = 'food', seed = 1) => {
  const queries = {
    food: 'photo-1546069901-ba9599a7e63c',
    pizza: 'photo-1565299624946-b28f40a0ae38',
    burger: 'photo-1568901346375-23c9450c58cd',
    salad: 'photo-1512621776951-a57141f2eefd',
    dessert: 'photo-1551024506-0bccd828d307',
    beverage: 'photo-1461023058943-07fcbe16d735',
    breakfast: 'photo-1484723091739-30a097e8f929',
    pasta: 'photo-1621996346565-e3dbc646d9a9',
    sandwich: 'photo-1559847844-5315695dadae',
    asian: 'photo-1504674900247-0877df9cc836',
    indian: 'photo-1563379926898-05f4575a45d8',
    mexican: 'photo-1551782450-a2132b4ba21d',
    sushi: 'photo-1587314168485-3236d6710814',
    chicken: 'photo-1603133872878-684f208fb84b',
    seafood: 'photo-1571997478779-2adcbbe9ab2f',
    noodles: 'photo-1565557623262-b51c2513a641',
    ramen: 'photo-1567620905732-2d1ec7ab7445',
    wrap: 'photo-1606728035253-49e8a23146de',
    coffee: 'photo-1496412705862-e0088f16f791',
    smoothie: 'photo-1461023058943-07fcbe16d735',
  };

  const photoId = queries[category.toLowerCase()] || queries.food;
  return `https://images.unsplash.com/${photoId}?w=800&q=85`;
};

// Helper function to get image with fallback
export const getImageWithFallback = (imageUrl, type = 'food') => {
  if (!imageUrl || imageUrl === '/placeholder.jpg' || imageUrl === '/placeholder-food.jpg') {
    return type === 'food' ? foodPlaceholder : genericPlaceholder;
  }
  return imageUrl;
};

// Sample food images from Unsplash (all free to use, high quality)
export const sampleFoodImages = [
  'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=85', // Gourmet Burger
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800&q=85', // Fresh Pizza
  'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=85', // Healthy Bowl
  'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&q=85', // Vegetable Salad
  'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&q=85', // Asian Food
  'https://images.unsplash.com/photo-1484723091739-30a097e8f929?w=800&q=85', // Pancakes
  'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=800&q=85', // Fresh Salad
  'https://images.unsplash.com/photo-1559847844-5315695dadae?w=800&q=85', // Sandwich
  'https://images.unsplash.com/photo-1563379926898-05f4575a45d8?w=800&q=85', // Indian Curry
  'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800&q=85', // Ramen
  'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=800&q=85', // Noodles
  'https://images.unsplash.com/photo-1551782450-a2132b4ba21d?w=800&q=85', // Tacos
  'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&q=85', // Grilled Chicken
  'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f?w=800&q=85', // Salmon
  'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800&q=85', // Pasta
  'https://images.unsplash.com/photo-1551024506-0bccd828d307?w=800&q=85', // Cake
  'https://images.unsplash.com/photo-1587314168485-3236d6710814?w=800&q=85', // Sushi
  'https://images.unsplash.com/photo-1606728035253-49e8a23146de?w=800&q=85', // Wraps
  'https://images.unsplash.com/photo-1496412705862-e0088f16f791?w=800&q=85', // Coffee
  'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&q=85', // Smoothie
];

export default {
  foodPlaceholder,
  genericPlaceholder,
  phonePlaceholder,
  getAvatarPlaceholder,
  getFoodImage,
  getImageWithFallback,
  sampleFoodImages,
};
