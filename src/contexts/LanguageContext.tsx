import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'ta';

interface Translations {
  [key: string]: {
    en: string;
    ta: string;
  };
}

const translations: Translations = {
  // Common
  appName: { en: 'AgroMart', ta: 'அக்ரோ மார்ட்' },
  tagline: { en: 'Your Farming Partner', ta: 'உங்கள் விவசாய நண்பன்' },
  welcome: { en: 'Welcome', ta: 'வரவேற்கிறோம்' },
  login: { en: 'Login', ta: 'உள்நுழை' },
  signup: { en: 'Sign Up', ta: 'பதிவு செய்' },
  logout: { en: 'Logout', ta: 'வெளியேறு' },
  profile: { en: 'Profile', ta: 'சுயவிவரம்' },
  settings: { en: 'Settings', ta: 'அமைப்புகள்' },
  language: { en: 'Language', ta: 'மொழி' },

  // Navigation
  home: { en: 'Home', ta: 'முகப்பு' },
  cart: { en: 'Cart', ta: 'வண்டி' },
  orders: { en: 'Orders', ta: 'ஆர்டர்கள்' },
  account: { en: 'Account', ta: 'கணக்கு' },
  wishlist: { en: 'Wishlist', ta: 'விருப்பம்' },

  // Categories
  seeds: { en: 'Seeds', ta: 'விதைகள்' },
  fertilizers: { en: 'Fertilizers', ta: 'உரங்கள்' },
  pesticides: { en: 'Pesticides', ta: 'பூச்சிக்கொல்லி' },
  tools: { en: 'Tools', ta: 'கருவிகள்' },

  // Products
  products: { en: 'Products', ta: 'பொருட்கள்' },
  price: { en: 'Price', ta: 'விலை' },
  inStock: { en: 'In Stock', ta: 'கையிருப்பு' },
  outOfStock: { en: 'Out of Stock', ta: 'இல்லை' },
  addToCart: { en: 'Add to Cart', ta: 'வண்டியில் சேர்' },
  buyNow: { en: 'Buy Now', ta: 'இப்போதே வாங்கு' },
  usage: { en: 'How to Use', ta: 'பயன்படுத்தும் முறை' },
  suitableFor: { en: 'Suitable for', ta: 'இதற்கு ஏற்றது' },

  // Cart
  yourCart: { en: 'Your Cart', ta: 'உங்கள் வண்டி' },
  emptyCart: { en: 'Your cart is empty', ta: 'வண்டி காலியாக உள்ளது' },
  total: { en: 'Total', ta: 'மொத்தம்' },
  checkout: { en: 'Checkout', ta: 'பணம் செலுத்து' },
  quantity: { en: 'Quantity', ta: 'எண்ணிக்கை' },
  remove: { en: 'Remove', ta: 'நீக்கு' },

  // Orders
  orderHistory: { en: 'Order History', ta: 'ஆர்டர் வரலாறு' },
  orderPlaced: { en: 'Order Placed!', ta: 'ஆர்டர் செய்யப்பட்டது!' },
  orderSuccess: { en: 'Your order has been placed successfully', ta: 'உங்கள் ஆர்டர் வெற்றிகரமாக செய்யப்பட்டது' },
  pending: { en: 'Pending', ta: 'நிலுவை' },
  delivered: { en: 'Delivered', ta: 'டெலிவரி ஆனது' },
  
  // Auth
  mobileNumber: { en: 'Mobile Number', ta: 'கைபேசி எண்' },
  email: { en: 'Email', ta: 'மின்னஞ்சல்' },
  password: { en: 'Password', ta: 'கடவுச்சொல்' },
  name: { en: 'Name', ta: 'பெயர்' },
  continueWith: { en: 'Continue', ta: 'தொடரவும்' },
  
  // Admin
  admin: { en: 'Admin', ta: 'நிர்வாகி' },
  dashboard: { en: 'Dashboard', ta: 'டாஷ்போர்டு' },
  totalProducts: { en: 'Total Products', ta: 'மொத்த பொருட்கள்' },
  totalOrders: { en: 'Total Orders', ta: 'மொத்த ஆர்டர்கள்' },
  todaySales: { en: "Today's Sales", ta: 'இன்றைய விற்பனை' },
  manageProducts: { en: 'Manage Products', ta: 'பொருட்கள் நிர்வகி' },
  manageOrders: { en: 'Manage Orders', ta: 'ஆர்டர்கள் நிர்வகி' },
  stock: { en: 'Stock', ta: 'கையிருப்பு' },
  salesReport: { en: 'Sales Report', ta: 'விற்பனை அறிக்கை' },
  
  // Offers
  offers: { en: 'Special Offers', ta: 'சிறப்பு சலுகைகள்' },
  farmingTips: { en: 'Farming Tips', ta: 'விவசாய குறிப்புகள்' },
  
  // Actions
  save: { en: 'Save', ta: 'சேமி' },
  cancel: { en: 'Cancel', ta: 'ரத்து' },
  confirm: { en: 'Confirm', ta: 'உறுதிசெய்' },
  back: { en: 'Back', ta: 'பின்' },
  continueShopping: { en: 'Continue Shopping', ta: 'தொடர்ந்து வாங்கு' },
  shopNow: { en: 'Shop Now', ta: 'இப்போது வாங்கு' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const STORAGE_KEY = 'agromart_language';

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window === 'undefined') return 'en';
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'ta' || saved === 'en' ? saved : 'en';
  });

  // Apply language to <html lang="..."> so our Tamil typography CSS kicks in
  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch {
      /* ignore */
    }
  }, [language]);

  const setLanguage = (lang: Language) => setLanguageState(lang);

  const t = (key: string): string => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
