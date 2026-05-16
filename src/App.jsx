import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Award,
  Box,
  ChefHat,
  ChevronRight,
  Globe,
  GraduationCap,
  LogOut,
  Mail,
  Plus,
  RefreshCcw,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Star,
  Soup,
  Timer,
  TrendingUp,
  User,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { auth, db, isFirebaseConfigured } from './firebase';
import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signInWithRedirect,
  signOut,
} from 'firebase/auth';
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  writeBatch,
} from 'firebase/firestore';

const appId = 'mess-voting-app-v5';

const COMMON_RAW_MATERIALS = [
  { name: 'Tomato', unit: 'kg', zone: 'Zone A', icon: '🍅' },
  { name: 'Onion', unit: 'kg', zone: 'Zone A', icon: '🧅' },
  { name: 'Potato', unit: 'kg', zone: 'Zone B', icon: '🥔' },
  { name: 'Rice', unit: 'kg', zone: 'Zone B', icon: '🍚' },
  { name: 'Chicken', unit: 'kg', zone: 'Zone C', icon: '🍗' },
  { name: 'Milk', unit: 'L', zone: 'Cold Room', icon: '🥛' },
  { name: 'Paneer', unit: 'kg', zone: 'Cold Room', icon: '🧀' },
  { name: 'Spices', unit: 'kg', zone: 'Safe 01', icon: '🌶️' },
];

const PANTRY_MATERIALS = [
  { key: 'tomato', name: 'Tomato', hindi: 'टमाटर', unit: 'kg', zone: 'Zone A', icon: 'Tom', aliases: ['tomato', 'tamatar', 'tomoto'], hindiAliases: ['टमाटर'] },
  { key: 'onion', name: 'Onion', hindi: 'प्याज', unit: 'kg', zone: 'Zone A', icon: 'Oni', aliases: ['onion', 'pyaaz', 'pyaz'], hindiAliases: ['प्याज', 'पियाज'] },
  { key: 'potato', name: 'Potato', hindi: 'आलू', unit: 'kg', zone: 'Zone B', icon: 'Pot', aliases: ['potato', 'aloo'], hindiAliases: ['आलू'] },
  { key: 'rice', name: 'Rice', hindi: 'चावल', unit: 'kg', zone: 'Zone B', icon: 'Ric', aliases: ['rice', 'chawal'], hindiAliases: ['चावल'] },
  { key: 'chicken', name: 'Chicken', hindi: 'चिकन', unit: 'kg', zone: 'Zone C', icon: 'Chk', aliases: ['chicken'], hindiAliases: ['चिकन'] },
  { key: 'milk', name: 'Milk', hindi: 'दूध', unit: 'L', zone: 'Cold Room', icon: 'Mlk', aliases: ['milk', 'doodh'], hindiAliases: ['दूध'] },
  { key: 'paneer', name: 'Paneer', hindi: 'पनीर', unit: 'kg', zone: 'Cold Room', icon: 'Pan', aliases: ['paneer'], hindiAliases: ['पनीर'] },
  { key: 'spices', name: 'Spices', hindi: 'मसाला', unit: 'kg', zone: 'Safe 01', icon: 'Spc', aliases: ['spices', 'masala'], hindiAliases: ['मसाला'] },
  { key: 'garlic', name: 'Garlic', hindi: 'लहसुन', unit: 'kg', zone: 'Zone A', icon: 'Gar', aliases: ['garlic', 'lahsun', 'lasun'], hindiAliases: ['लहसुन'] },
  { key: 'ginger', name: 'Ginger', hindi: 'अदरक', unit: 'kg', zone: 'Zone A', icon: 'Gin', aliases: ['ginger', 'adrak'], hindiAliases: ['अदरक'] },
  { key: 'curd', name: 'Curd', hindi: 'दही', unit: 'kg', zone: 'Cold Room', icon: 'Cur', aliases: ['curd', 'dahi', 'yogurt'], hindiAliases: ['दही'] },
  { key: 'lentils', name: 'Lentils', hindi: 'दाल', unit: 'kg', zone: 'Zone B', icon: 'Dal', aliases: ['lentils', 'dal', 'daal'], hindiAliases: ['दाल'] },
  { key: 'flour', name: 'Flour', hindi: 'आटा', unit: 'kg', zone: 'Zone B', icon: 'Flo', aliases: ['flour', 'atta', 'wheat flour'], hindiAliases: ['आटा'] },
  { key: 'peas', name: 'Peas', hindi: 'मटर', unit: 'kg', zone: 'Cold Room', icon: 'Pea', aliases: ['peas', 'matar'], hindiAliases: ['मटर'] },
  { key: 'carrot', name: 'Carrot', hindi: 'गाजर', unit: 'kg', zone: 'Zone A', icon: 'Car', aliases: ['carrot', 'gajar'], hindiAliases: ['गाजर'] },
  { key: 'capsicum', name: 'Capsicum', hindi: 'शिमला मिर्च', unit: 'kg', zone: 'Zone A', icon: 'Cap', aliases: ['capsicum', 'bell pepper', 'shimla mirch'], hindiAliases: ['शिमला मिर्च'] },
  { key: 'cabbage', name: 'Cabbage', hindi: 'पत्ता गोभी', unit: 'kg', zone: 'Zone A', icon: 'Cab', aliases: ['cabbage', 'cabage', 'patta gobi', 'patta gobhi'], hindiAliases: ['पत्ता गोभी', 'पत्ता गोभी'] },
  { key: 'cauliflower', name: 'Cauliflower', hindi: 'फूल गोभी', unit: 'kg', zone: 'Zone A', icon: 'Cau', aliases: ['cauliflower', 'gobi', 'gobhi', 'phool gobi'], hindiAliases: ['फूल गोभी'] },
  { key: 'beans', name: 'Beans', hindi: 'बीन्स', unit: 'kg', zone: 'Zone A', icon: 'Bea', aliases: ['beans', 'green beans', 'french beans'], hindiAliases: ['बीन्स'] },
  { key: 'egg', name: 'Egg', hindi: 'अंडा', unit: 'pcs', zone: 'Cold Room', icon: 'Egg', aliases: ['egg', 'eggs', 'anda'], hindiAliases: ['अंडा', 'अंडे'] },
  { key: 'oil', name: 'Oil', hindi: 'तेल', unit: 'L', zone: 'Store', icon: 'Oil', aliases: ['oil', 'cooking oil', 'tel'], hindiAliases: ['तेल'] },
  { key: 'salt', name: 'Salt', hindi: 'नमक', unit: 'kg', zone: 'Store', icon: 'Sal', aliases: ['salt', 'namak'], hindiAliases: ['नमक'] },
  { key: 'sugar', name: 'Sugar', hindi: 'चीनी', unit: 'kg', zone: 'Store', icon: 'Sug', aliases: ['sugar', 'chini'], hindiAliases: ['चीनी'] },
  { key: 'bread', name: 'Bread', hindi: 'ब्रेड', unit: 'pkt', zone: 'Store', icon: 'Bre', aliases: ['bread'], hindiAliases: ['ब्रेड'] },
  { key: 'roti', name: 'Roti', hindi: 'रोटी', unit: 'pcs', zone: 'Service', icon: 'Rot', aliases: ['roti', 'chapati'], hindiAliases: ['रोटी', 'चपाती'] },
  { key: 'lemon', name: 'Lemon', hindi: 'नींबू', unit: 'kg', zone: 'Zone A', icon: 'Lem', aliases: ['lemon', 'nimbu'], hindiAliases: ['नींबू'] },
  { key: 'coriander', name: 'Coriander', hindi: 'धनिया', unit: 'kg', zone: 'Zone A', icon: 'Cor', aliases: ['coriander', 'dhaniya', 'cilantro'], hindiAliases: ['धनिया'] },
  { key: 'green-chilli', name: 'Green Chilli', hindi: 'हरी मिर्च', unit: 'kg', zone: 'Zone A', icon: 'Chi', aliases: ['green chilli', 'green chili', 'hari mirch'], hindiAliases: ['हरी मिर्च'] },
  { key: 'broccoli', name: 'Broccoli', hindi: 'ब्रोकली', unit: 'kg', zone: 'Zone A', icon: 'Bro', aliases: ['broccoli', 'brocoli', 'brokoli'], hindiAliases: ['ब्रोकली'] },
  { key: 'spinach', name: 'Spinach', hindi: 'पालक', unit: 'kg', zone: 'Zone A', icon: 'Spi', aliases: ['spinach', 'palak'], hindiAliases: ['पालक'] },
  { key: 'fenugreek', name: 'Fenugreek Leaves', hindi: 'मेथी', unit: 'kg', zone: 'Zone A', icon: 'Met', aliases: ['fenugreek', 'methi', 'methi leaves'], hindiAliases: ['मेथी'] },
  { key: 'mint', name: 'Mint', hindi: 'पुदीना', unit: 'kg', zone: 'Zone A', icon: 'Min', aliases: ['mint', 'pudina'], hindiAliases: ['पुदीना'] },
  { key: 'cucumber', name: 'Cucumber', hindi: 'खीरा', unit: 'kg', zone: 'Zone A', icon: 'Cuc', aliases: ['cucumber', 'kheera', 'khira'], hindiAliases: ['खीरा'] },
  { key: 'beetroot', name: 'Beetroot', hindi: 'चुकंदर', unit: 'kg', zone: 'Zone A', icon: 'Bee', aliases: ['beetroot', 'beet', 'chukandar'], hindiAliases: ['चुकंदर'] },
  { key: 'radish', name: 'Radish', hindi: 'मूली', unit: 'kg', zone: 'Zone A', icon: 'Rad', aliases: ['radish', 'mooli', 'muli'], hindiAliases: ['मूली'] },
  { key: 'brinjal', name: 'Brinjal', hindi: 'बैंगन', unit: 'kg', zone: 'Zone A', icon: 'Bri', aliases: ['brinjal', 'eggplant', 'baingan'], hindiAliases: ['बैंगन'] },
  { key: 'okra', name: 'Okra', hindi: 'भिंडी', unit: 'kg', zone: 'Zone A', icon: 'Okr', aliases: ['okra', 'bhindi', 'lady finger'], hindiAliases: ['भिंडी'] },
  { key: 'pumpkin', name: 'Pumpkin', hindi: 'कद्दू', unit: 'kg', zone: 'Zone A', icon: 'Pum', aliases: ['pumpkin', 'kaddu'], hindiAliases: ['कद्दू'] },
  { key: 'bottle-gourd', name: 'Bottle Gourd', hindi: 'लौकी', unit: 'kg', zone: 'Zone A', icon: 'Lou', aliases: ['bottle gourd', 'lauki', 'dudhi'], hindiAliases: ['लौकी'] },
  { key: 'ridge-gourd', name: 'Ridge Gourd', hindi: 'तुरई', unit: 'kg', zone: 'Zone A', icon: 'Tur', aliases: ['ridge gourd', 'turai', 'tori'], hindiAliases: ['तुरई'] },
  { key: 'bitter-gourd', name: 'Bitter Gourd', hindi: 'करेला', unit: 'kg', zone: 'Zone A', icon: 'Kar', aliases: ['bitter gourd', 'karela'], hindiAliases: ['करेला'] },
  { key: 'sweet-corn', name: 'Sweet Corn', hindi: 'स्वीट कॉर्न', unit: 'kg', zone: 'Zone B', icon: 'Cor', aliases: ['sweet corn', 'corn', 'makka'], hindiAliases: ['स्वीट कॉर्न', 'मक्का'] },
  { key: 'mushroom', name: 'Mushroom', hindi: 'मशरूम', unit: 'kg', zone: 'Cold Room', icon: 'Mus', aliases: ['mushroom'], hindiAliases: ['मशरूम'] },
  { key: 'tofu', name: 'Tofu', hindi: 'टोफू', unit: 'kg', zone: 'Cold Room', icon: 'Tof', aliases: ['tofu'], hindiAliases: ['टोफू'] },
  { key: 'soya-chunks', name: 'Soya Chunks', hindi: 'सोया चंक्स', unit: 'kg', zone: 'Zone B', icon: 'Soy', aliases: ['soya chunks', 'soy chunks', 'soya'], hindiAliases: ['सोया चंक्स', 'सोया'] },
  { key: 'fish', name: 'Fish', hindi: 'मछली', unit: 'kg', zone: 'Cold Room', icon: 'Fis', aliases: ['fish', 'machli'], hindiAliases: ['मछली'] },
  { key: 'mutton', name: 'Mutton', hindi: 'मटन', unit: 'kg', zone: 'Cold Room', icon: 'Mut', aliases: ['mutton'], hindiAliases: ['मटन'] },
  { key: 'prawns', name: 'Prawns', hindi: 'झींगा', unit: 'kg', zone: 'Cold Room', icon: 'Pra', aliases: ['prawns', 'shrimp', 'jhinga'], hindiAliases: ['झींगा'] },
  { key: 'cheese', name: 'Cheese', hindi: 'चीज़', unit: 'kg', zone: 'Cold Room', icon: 'Che', aliases: ['cheese'], hindiAliases: ['चीज़', 'चीज'] },
  { key: 'butter', name: 'Butter', hindi: 'मक्खन', unit: 'kg', zone: 'Cold Room', icon: 'But', aliases: ['butter', 'makkhan'], hindiAliases: ['मक्खन'] },
  { key: 'ghee', name: 'Ghee', hindi: 'घी', unit: 'L', zone: 'Store', icon: 'Ghe', aliases: ['ghee'], hindiAliases: ['घी'] },
  { key: 'cream', name: 'Cream', hindi: 'क्रीम', unit: 'L', zone: 'Cold Room', icon: 'Cre', aliases: ['cream', 'malai'], hindiAliases: ['क्रीम', 'मलाई'] },
  { key: 'coconut', name: 'Coconut', hindi: 'नारियल', unit: 'pcs', zone: 'Store', icon: 'Coc', aliases: ['coconut', 'nariyal'], hindiAliases: ['नारियल'] },
  { key: 'coconut-milk', name: 'Coconut Milk', hindi: 'नारियल दूध', unit: 'L', zone: 'Store', icon: 'Com', aliases: ['coconut milk'], hindiAliases: ['नारियल दूध'] },
  { key: 'peanuts', name: 'Peanuts', hindi: 'मूंगफली', unit: 'kg', zone: 'Store', icon: 'Pea', aliases: ['peanuts', 'groundnut', 'moongfali'], hindiAliases: ['मूंगफली'] },
  { key: 'cashew', name: 'Cashew', hindi: 'काजू', unit: 'kg', zone: 'Store', icon: 'Cas', aliases: ['cashew', 'kaju'], hindiAliases: ['काजू'] },
  { key: 'almonds', name: 'Almonds', hindi: 'बादाम', unit: 'kg', zone: 'Store', icon: 'Alm', aliases: ['almonds', 'badam'], hindiAliases: ['बादाम'] },
  { key: 'raisins', name: 'Raisins', hindi: 'किशमिश', unit: 'kg', zone: 'Store', icon: 'Rai', aliases: ['raisins', 'kishmish'], hindiAliases: ['किशमिश'] },
  { key: 'besan', name: 'Besan', hindi: 'बेसन', unit: 'kg', zone: 'Zone B', icon: 'Bes', aliases: ['besan', 'gram flour'], hindiAliases: ['बेसन'] },
  { key: 'maida', name: 'Maida', hindi: 'मैदा', unit: 'kg', zone: 'Zone B', icon: 'Mai', aliases: ['maida', 'refined flour'], hindiAliases: ['मैदा'] },
  { key: 'semolina', name: 'Semolina', hindi: 'सूजी', unit: 'kg', zone: 'Zone B', icon: 'Suj', aliases: ['semolina', 'sooji', 'suji', 'rava'], hindiAliases: ['सूजी', 'रवा'] },
  { key: 'poha', name: 'Poha', hindi: 'पोहा', unit: 'kg', zone: 'Zone B', icon: 'Poh', aliases: ['poha', 'flattened rice'], hindiAliases: ['पोहा'] },
  { key: 'oats', name: 'Oats', hindi: 'ओट्स', unit: 'kg', zone: 'Zone B', icon: 'Oat', aliases: ['oats'], hindiAliases: ['ओट्स'] },
  { key: 'vermicelli', name: 'Vermicelli', hindi: 'सेवई', unit: 'kg', zone: 'Zone B', icon: 'Sev', aliases: ['vermicelli', 'sevai', 'sewai'], hindiAliases: ['सेवई'] },
  { key: 'noodles', name: 'Noodles', hindi: 'नूडल्स', unit: 'kg', zone: 'Zone B', icon: 'Noo', aliases: ['noodles'], hindiAliases: ['नूडल्स'] },
  { key: 'pasta', name: 'Pasta', hindi: 'पास्ता', unit: 'kg', zone: 'Zone B', icon: 'Pas', aliases: ['pasta'], hindiAliases: ['पास्ता'] },
  { key: 'corn-flour', name: 'Corn Flour', hindi: 'कॉर्न फ्लोर', unit: 'kg', zone: 'Zone B', icon: 'Cfl', aliases: ['corn flour', 'cornflour'], hindiAliases: ['कॉर्न फ्लोर'] },
  { key: 'urad-dal', name: 'Urad Dal', hindi: 'उड़द दाल', unit: 'kg', zone: 'Zone B', icon: 'Urd', aliases: ['urad dal', 'udad dal'], hindiAliases: ['उड़द दाल'] },
  { key: 'moong-dal', name: 'Moong Dal', hindi: 'मूंग दाल', unit: 'kg', zone: 'Zone B', icon: 'Moo', aliases: ['moong dal', 'mung dal'], hindiAliases: ['मूंग दाल'] },
  { key: 'chana-dal', name: 'Chana Dal', hindi: 'चना दाल', unit: 'kg', zone: 'Zone B', icon: 'Cha', aliases: ['chana dal'], hindiAliases: ['चना दाल'] },
  { key: 'rajma', name: 'Rajma', hindi: 'राजमा', unit: 'kg', zone: 'Zone B', icon: 'Raj', aliases: ['rajma', 'kidney beans'], hindiAliases: ['राजमा'] },
  { key: 'chickpeas', name: 'Chickpeas', hindi: 'छोले', unit: 'kg', zone: 'Zone B', icon: 'Cho', aliases: ['chickpeas', 'chole', 'kabuli chana'], hindiAliases: ['छोले', 'काबुली चना'] },
  { key: 'turmeric', name: 'Turmeric Powder', hindi: 'हल्दी', unit: 'kg', zone: 'Store', icon: 'Hal', aliases: ['turmeric', 'haldi'], hindiAliases: ['हल्दी'] },
  { key: 'chilli-powder', name: 'Chilli Powder', hindi: 'लाल मिर्च', unit: 'kg', zone: 'Store', icon: 'Lal', aliases: ['chilli powder', 'chili powder', 'lal mirch'], hindiAliases: ['लाल मिर्च'] },
  { key: 'cumin', name: 'Cumin', hindi: 'जीरा', unit: 'kg', zone: 'Store', icon: 'Jee', aliases: ['cumin', 'jeera'], hindiAliases: ['जीरा'] },
  { key: 'mustard-seeds', name: 'Mustard Seeds', hindi: 'राई', unit: 'kg', zone: 'Store', icon: 'Rai', aliases: ['mustard seeds', 'rai', 'sarson'], hindiAliases: ['राई', 'सरसों'] },
  { key: 'garam-masala', name: 'Garam Masala', hindi: 'गरम मसाला', unit: 'kg', zone: 'Store', icon: 'Gms', aliases: ['garam masala'], hindiAliases: ['गरम मसाला'] },
  { key: 'black-pepper', name: 'Black Pepper', hindi: 'काली मिर्च', unit: 'kg', zone: 'Store', icon: 'Pep', aliases: ['black pepper', 'pepper', 'kali mirch'], hindiAliases: ['काली मिर्च'] },
  { key: 'tea', name: 'Tea', hindi: 'चाय पत्ती', unit: 'kg', zone: 'Store', icon: 'Tea', aliases: ['tea', 'tea leaves', 'chai patti'], hindiAliases: ['चाय पत्ती'] },
  { key: 'coffee', name: 'Coffee', hindi: 'कॉफी', unit: 'kg', zone: 'Store', icon: 'Cof', aliases: ['coffee'], hindiAliases: ['कॉफी'] },
  { key: 'jaggery', name: 'Jaggery', hindi: 'गुड़', unit: 'kg', zone: 'Store', icon: 'Gud', aliases: ['jaggery', 'gud'], hindiAliases: ['गुड़'] },
  { key: 'banana', name: 'Banana', hindi: 'केला', unit: 'dozen', zone: 'Store', icon: 'Ban', aliases: ['banana', 'kela'], hindiAliases: ['केला'] },
  { key: 'apple', name: 'Apple', hindi: 'सेब', unit: 'kg', zone: 'Store', icon: 'App', aliases: ['apple', 'seb'], hindiAliases: ['सेब'] },
  { key: 'orange', name: 'Orange', hindi: 'संतरा', unit: 'kg', zone: 'Store', icon: 'Ora', aliases: ['orange', 'santra'], hindiAliases: ['संतरा'] },
];

const LOCAL_INVENTORY_KEY = 'cravebox_local_inventory_v3';
const LOCAL_SOCIAL_POSTS_KEY = 'cravebox_social_posts';
const LOCAL_MENU_BY_SESSION_KEY = 'cravebox_menu_by_session_v1';
const LOCAL_VOTES_BY_SESSION_KEY = 'cravebox_votes_by_session_v1';
const LOCAL_STUDENT_VOTES_BY_SESSION_KEY = 'cravebox_student_votes_by_session_v1';
const STUDENT_REGISTRY_COLLECTION = 'registered_students_v2';
const LOW_STOCK_MINIMUM_PAR_LEVEL = 10;

const createStarterInventory = () => [];
const getParLevel = () => LOW_STOCK_MINIMUM_PAR_LEVEL;
const getEffectiveParLevel = (item) => Math.max(Number(item.parLevel || 0), LOW_STOCK_MINIMUM_PAR_LEVEL);

const getLocalInventory = () => {
  const savedInventory = window.localStorage.getItem(LOCAL_INVENTORY_KEY);

  if (!savedInventory) {
    return createStarterInventory();
  }

  try {
    const parsedInventory = JSON.parse(savedInventory);
    return Array.isArray(parsedInventory) && parsedInventory.length > 0
      ? mergeInventoryItems(parsedInventory)
      : createStarterInventory();
  } catch {
    window.localStorage.removeItem(LOCAL_INVENTORY_KEY);
    return createStarterInventory();
  }
};

const saveLocalInventory = (nextInventory) => {
  window.localStorage.setItem(LOCAL_INVENTORY_KEY, JSON.stringify(mergeInventoryItems(nextInventory)));
};

const QUICK_MATERIAL_KEYS = ['tomato', 'onion', 'rice', 'potato', 'chicken', 'paneer'];

const DISH_CATALOG = [
  {
    id: 1,
    name: 'Paneer Butter Rice',
    votes: 1205,
    rating: 4.9,
    description: 'Creamy paneer gravy with rice and masala that works well for a big lunch service.',
    img: 'https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=900&q=80',
    ingredients: ['paneer', 'tomato', 'onion', 'rice', 'spices'],
  },
  {
    id: 2,
    name: 'Chicken Curry Bowl',
    votes: 842,
    rating: 4.8,
    description: 'Campus-style chicken curry served over rice with onion-tomato masala.',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
    ingredients: ['chicken', 'tomato', 'onion', 'rice', 'spices'],
  },
  {
    id: 3,
    name: 'Aloo Masala Rice',
    votes: 621,
    rating: 4.7,
    description: 'Potato masala tossed with rice for a quick, filling service-friendly meal.',
    img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    ingredients: ['potato', 'onion', 'rice', 'spices'],
  },
  {
    id: 4,
    name: 'Tomato Paneer Curry',
    votes: 560,
    rating: 4.6,
    description: 'Rich tomato-paneer curry that works well with both rice and roti service.',
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    ingredients: ['paneer', 'tomato', 'onion', 'spices'],
  },
  {
    id: 5,
    name: 'Masala Doodh Rice',
    votes: 415,
    rating: 4.4,
    description: 'A mild milk-rice option with warm masala notes for breakfast or night service.',
    img: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
    ingredients: ['milk', 'rice', 'spices'],
  },
  {
    id: 6,
    name: 'Homestyle Chicken Masala',
    votes: 504,
    rating: 4.5,
    description: 'Chicken, onion, and masala cooked into a dependable mess-style main dish.',
    img: 'https://images.unsplash.com/photo-1604908554165-e3f7d06b79b2?auto=format&fit=crop&w=900&q=80',
    ingredients: ['chicken', 'onion', 'tomato', 'spices'],
  },
  {
    id: 7,
    name: 'Garlic Jeera Rice',
    votes: 386,
    rating: 4.5,
    description: 'Fast rice service with garlic, spices, and a light onion tempering.',
    img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    ingredients: ['rice', 'garlic', 'onion', 'spices'],
  },
  {
    id: 8,
    name: 'Dal Tadka Rice',
    votes: 735,
    rating: 4.8,
    description: 'Lentils finished with tomato, garlic, and spices for a reliable mess favorite.',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
    ingredients: ['lentils', 'tomato', 'garlic', 'rice', 'spices'],
  },
  {
    id: 9,
    name: 'Paneer Peas Masala',
    votes: 612,
    rating: 4.6,
    description: 'Paneer and peas in a tomato-onion masala that works for lunch or dinner.',
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    ingredients: ['paneer', 'peas', 'tomato', 'onion', 'spices'],
  },
  {
    id: 10,
    name: 'Curd Rice Bowl',
    votes: 468,
    rating: 4.4,
    description: 'Cooling curd rice option for days when students want something lighter.',
    img: 'https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=900&q=80',
    ingredients: ['curd', 'rice', 'milk', 'spices'],
  },
  {
    id: 11,
    name: 'Veg Pulao',
    votes: 690,
    rating: 4.7,
    description: 'Rice cooked with carrot, peas, capsicum, onion, and warm spices.',
    img: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=900&q=80',
    ingredients: ['rice', 'carrot', 'peas', 'capsicum', 'onion', 'spices'],
  },
  {
    id: 12,
    name: 'Aloo Paratha Plate',
    votes: 548,
    rating: 4.5,
    description: 'Potato and flour based plate with curd support for breakfast service.',
    img: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=900&q=80',
    ingredients: ['potato', 'flour', 'curd', 'spices'],
  },
  {
    id: 13,
    name: 'Ginger Garlic Chicken Rice',
    votes: 577,
    rating: 4.6,
    description: 'Chicken rice with ginger-garlic base and onion-tomato masala.',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
    ingredients: ['chicken', 'rice', 'ginger', 'garlic', 'onion', 'spices'],
  },
  {
    id: 14,
    name: 'Tomato Garlic Dal',
    votes: 512,
    rating: 4.5,
    description: 'A dal-focused option when tomato, garlic, lentils, and spices are available.',
    img: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=900&q=80',
    ingredients: ['lentils', 'tomato', 'garlic', 'spices'],
  },
  {
    id: 15,
    name: 'Cabbage Peas Sabzi',
    votes: 436,
    rating: 4.3,
    description: 'Cabbage and peas cooked with onion, garlic, and simple mess-style spices.',
    img: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=900&q=80',
    ingredients: ['cabbage', 'peas', 'onion', 'garlic', 'spices'],
  },
  {
    id: 16,
    name: 'Cauliflower Potato Curry',
    votes: 498,
    rating: 4.4,
    description: 'Gobi-aloo style curry with tomato, ginger, and warm spices.',
    img: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
    ingredients: ['cauliflower', 'potato', 'tomato', 'ginger', 'spices'],
  },
  {
    id: 17,
    name: 'Egg Curry Rice',
    votes: 650,
    rating: 4.6,
    description: 'Egg curry with rice, onion-tomato masala, and basic pantry spices.',
    img: 'https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=900&q=80',
    ingredients: ['egg', 'rice', 'onion', 'tomato', 'spices'],
  },
];

const SOCIAL_POSTS = [
  {
    id: 1,
    user: 'Jordan S.',
    time: '2h ago',
    place: 'Main Hall',
    content: 'The new bowl actually lives up to the hype. Sauce ratio is perfect and it still feels light.',
    likes: 124,
    comments: 12,
    tag: 'Must Try',
  },
  {
    id: 2,
    user: 'Alex M.',
    time: '5h ago',
    place: 'North Block',
    content: 'Loved the crunch on the toast, but I wish the serving was a little bigger during peak hours.',
    likes: 42,
    comments: 28,
    tag: 'Review',
  },
];

const WALL_STYLES = [
  'bg-[#ff5ca8] text-white rotate-[-4deg] shadow-[0_0_24px_rgba(255,92,168,0.34)]',
  'bg-[#33d6ff] text-[#102033] rotate-[3deg] shadow-[0_0_24px_rgba(51,214,255,0.32)]',
  'bg-[#ffe066] text-[#3d2d00] rotate-[-2deg] shadow-[0_0_24px_rgba(255,224,102,0.28)]',
  'bg-[#8aff80] text-[#103315] rotate-[2deg] shadow-[0_0_24px_rgba(138,255,128,0.28)]',
  'bg-[#c79bff] text-white rotate-[-3deg] shadow-[0_0_24px_rgba(199,155,255,0.3)]',
  'bg-[#ff9966] text-white rotate-[4deg] shadow-[0_0_24px_rgba(255,153,102,0.3)]',
];

const MEAL_SESSIONS = [
  { id: 'breakfast', label: 'Breakfast', hindi: 'नाश्ता' },
  { id: 'lunch', label: 'Lunch', hindi: 'दोपहर का खाना' },
  { id: 'dinner', label: 'Dinner', hindi: 'रात का खाना' },
];

const DEFAULT_SESSION_MENUS = {
  breakfast: [5, 10, 12],
  lunch: [1, 2, 3],
  dinner: [4, 6, 8],
};

const BASE_MEAL_VOTES = DISH_CATALOG.reduce((acc, meal) => ({ ...acc, [meal.id]: meal.votes }), {});

const ROLE_META = {
  student: {
    label: 'Student',
    title: 'Student Hub',
    icon: GraduationCap,
    accent: 'bg-primary-fixed',
    helper: 'Vote, react, and follow the live food pulse.',
    tabs: [
      { id: 'vote', label: 'Vote', icon: TrendingUp },
      { id: 'social', label: 'Social', icon: Globe },
      { id: 'rankings', label: 'Rankings', icon: Award },
    ],
  },
  chef: {
    label: 'Chef',
    title: 'Pantry Vault',
    icon: ChefHat,
    accent: 'bg-secondary-fixed',
    helper: 'Track ingredients and push fresh stock updates.',
    tabs: [
      { id: 'vault', label: 'Vault', icon: Box },
      { id: 'results', label: 'Results', icon: Award },
    ],
  },
  admin: {
    label: 'Admin',
    title: 'Campus Pulse',
    icon: ShieldCheck,
    accent: 'bg-error-container',
    helper: 'Monitor alerts, engagement, and low-stock pressure.',
    tabs: [
      { id: 'insights', label: 'Insights', icon: Sparkles },
      { id: 'admin-social', label: 'Social', icon: Globe },
    ],
  },
};

const formatQuantity = (value) => {
  const num = Number(value || 0);
  return Number.isInteger(num) ? String(num) : num.toFixed(1);
};

const getCurrentMealSession = () => {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 11) return 'breakfast';
  if (hour >= 11 && hour < 16) return 'lunch';
  return 'dinner';
};

const getRoleStartTab = (selectedRole) => ROLE_META[selectedRole]?.tabs[0]?.id ?? 'vote';
const getSessionInfo = (sessionId) =>
  MEAL_SESSIONS.find((session) => session.id === sessionId) ?? MEAL_SESSIONS[1];
const readLocalJson = (key, fallback) => {
  try {
    const savedValue = window.localStorage.getItem(key);
    return savedValue ? JSON.parse(savedValue) : fallback;
  } catch {
    window.localStorage.removeItem(key);
    return fallback;
  }
};
const saveLocalJson = (key, value) => {
  window.localStorage.setItem(key, JSON.stringify(value));
};
const getSessionMenuIds = () => ({
  ...DEFAULT_SESSION_MENUS,
  ...readLocalJson(LOCAL_MENU_BY_SESSION_KEY, {}),
});
const getMealsForSession = (sessionId, menuIdsBySession) => {
  const ids = menuIdsBySession[sessionId] ?? DEFAULT_SESSION_MENUS[sessionId] ?? DEFAULT_SESSION_MENUS.lunch;
  const meals = DISH_CATALOG.filter((dish) => ids.includes(dish.id));
  return meals.length > 0
    ? meals
    : DISH_CATALOG.filter((dish) => DEFAULT_SESSION_MENUS.lunch.includes(dish.id));
};
const toVoteArray = (value) => {
  if (Array.isArray(value)) return value.filter(Boolean);
  return value ? [value] : [];
};
const normalizeSearch = (value) => value.trim().toLowerCase();
const getCurrentHost = () => (typeof window === 'undefined' ? 'this app domain' : window.location.hostname);
const getGoogleAuthErrorMessage = (error) => {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code.includes('unauthorized-domain')) {
    return `Google login is blocked by Firebase for ${getCurrentHost()}. Add this exact domain in Firebase Authorized domains.`;
  }

  if (code.includes('operation-not-allowed')) {
    return 'Google login is not enabled yet in Firebase Authentication.';
  }

  return code
    ? `Google sign-in could not be started: ${code}`
    : `Google sign-in could not be started${message ? `: ${message}` : ''}. You can still enter your name and continue.`;
};
const toMaterialKey = (value) =>
  normalizeSearch(value)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
const getStudentKey = (name) => toMaterialKey(name) || 'student';

const titleCase = (value) =>
  normalizeSearch(value)
    .split(/[\s-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

const getMaterialForName = (name) => {
  const key = toMaterialKey(name);
  return PANTRY_MATERIALS.find(
    (entry) =>
      entry.key === key ||
      normalizeSearch(entry.name) === normalizeSearch(name) ||
      normalizeSearch(entry.hindi) === normalizeSearch(name) ||
      entry.aliases?.some((alias) => toMaterialKey(alias) === key)
  );
};

const createCustomMaterial = (rawName) => {
  const key = toMaterialKey(rawName);
  const name = titleCase(rawName);

  return {
    key,
    name,
    hindi: 'Add manually',
    unit: 'kg',
    zone: 'Kitchen',
    icon: name.slice(0, 3).toUpperCase(),
    aliases: [normalizeSearch(rawName)],
    hindiAliases: [],
    custom: true,
  };
};

const mergeInventoryItems = (items) => {
  const merged = new Map();

  items.forEach((item) => {
    const material = getMaterialForName(item.name);
    const key = material?.key ?? toMaterialKey(item.name);
    if (!key) return;
    const existing = merged.get(key);
    const quantity = Number(item.quantity || 0);
    const parLevel = Number(item.parLevel || 8);

    if (existing) {
      merged.set(key, {
        ...existing,
        quantity: Number(existing.quantity || 0) + quantity,
        parLevel: Math.max(Number(existing.parLevel || 0), parLevel),
      });
      return;
    }

    merged.set(key, {
      id: item.id ?? `local-${key}`,
      name: material?.name ?? titleCase(item.name),
      quantity,
      unit: item.unit ?? material?.unit ?? 'kg',
      parLevel,
    });
  });

  return Array.from(merged.values()).sort((a, b) => a.name.localeCompare(b.name));
};

const getMaterialSearchText = (material) =>
  [
    material.name,
    material.hindi,
    ...(material.aliases ?? []),
    ...(material.hindiAliases ?? []),
  ]
    .join(' ')
    .toLowerCase();

const getDishRecommendations = (stockMap) =>
  DISH_CATALOG
    .map((dish) => {
      const matchedIngredients = dish.ingredients.filter(
        (ingredientKey) => Number(stockMap[ingredientKey] || 0) > 0
      );
      const coverage = matchedIngredients.length / dish.ingredients.length;
      const missingIngredients = dish.ingredients.filter(
        (ingredientKey) => Number(stockMap[ingredientKey] || 0) <= 0
      );

      return {
        ...dish,
        coverage,
        matchedIngredients,
        missingIngredients,
        recommendationScore: coverage * 100 + matchedIngredients.length * 4 + dish.rating,
      };
    })
    .filter((dish) => dish.matchedIngredients.length >= 2 || dish.coverage === 1)
    .sort((a, b) => b.recommendationScore - a.recommendationScore)
    .slice(0, 10);

const getVoteButtonClass = (isSelected) =>
  `inline-flex min-h-[56px] items-center justify-center gap-3 rounded-full px-6 py-3 text-label-bold font-black uppercase tracking-[0.18em] transition-all ${
    isSelected
      ? 'bg-secondary text-white shadow-[0_10px_24px_rgba(58,103,82,0.28)]'
      : 'border border-primary/20 bg-white text-primary hover:bg-primary hover:text-white'
  }`;

const getVoteButtonLabel = (isSelected) => (isSelected ? 'Remove Vote' : 'Vote');

function FoodImage({ src, alt, className }) {
  const [imageFailed, setImageFailed] = useState(false);

  if (!src || imageFailed) {
    return (
      <div className={`flex items-center justify-center bg-primary-container text-primary ${className}`}>
        <Soup className="h-8 w-8" aria-label={alt} />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setImageFailed(true)}
      className={className}
    />
  );
}

function App() {
  const [view, setView] = useState('role-select');
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [pin, setPin] = useState('');
  const [activeTab, setActiveTab] = useState('vote');
  const [inventory, setInventory] = useState(() => getLocalInventory());
  const [basket, setBasket] = useState([]);
  const [quantityDrafts, setQuantityDrafts] = useState(() =>
    Object.fromEntries(PANTRY_MATERIALS.map((item) => [item.key, '']))
  );
  const [selectedDishIds, setSelectedDishIds] = useState([]);
  const [chefLanguage, setChefLanguage] = useState('english');
  const [inventorySearch, setInventorySearch] = useState('');
  const [newPost, setNewPost] = useState('');
  const [socialPosts, setSocialPosts] = useState(() => {
    const savedPosts = window.localStorage.getItem(LOCAL_SOCIAL_POSTS_KEY);
    if (!savedPosts) return SOCIAL_POSTS;

    try {
      const parsedPosts = JSON.parse(savedPosts);
      return Array.isArray(parsedPosts) ? parsedPosts : SOCIAL_POSTS;
    } catch {
      window.localStorage.removeItem(LOCAL_SOCIAL_POSTS_KEY);
      return SOCIAL_POSTS;
    }
  });
  const [inventoryError, setInventoryError] = useState('');
  const [stockActionError, setStockActionError] = useState('');
  const [menuPublishMessage, setMenuPublishMessage] = useState('');
  const [isSubmittingStock, setIsSubmittingStock] = useState(false);
  const [activeMealSession, setActiveMealSession] = useState(() => getCurrentMealSession());
  const [chefPublishSession, setChefPublishSession] = useState(() => getCurrentMealSession());
  const [menuIdsBySession, setMenuIdsBySession] = useState(() => getSessionMenuIds());
  const [votesBySession, setVotesBySession] = useState(() => readLocalJson(LOCAL_VOTES_BY_SESSION_KEY, {}));
  const [studentVotesBySession, setStudentVotesBySession] = useState(() =>
    readLocalJson(LOCAL_STUDENT_VOTES_BY_SESSION_KEY, {})
  );
  const [registeredStudents, setRegisteredStudents] = useState([]);
  const [currentStudent, setCurrentStudent] = useState(() => auth?.currentUser ?? null);
  const [isStudentSigningIn, setIsStudentSigningIn] = useState(false);
  const [studentAuthError, setStudentAuthError] = useState('');
  const [isClearingStudentRegistry, setIsClearingStudentRegistry] = useState(false);
  const [studentRegistryMessage, setStudentRegistryMessage] = useState('');
  const [pendingPublishMenu, setPendingPublishMenu] = useState(null);
  const [voteFeedback, setVoteFeedback] = useState(null);

  useEffect(() => {
    if (!db) {
      setInventory(getLocalInventory());
      setInventoryError('Firebase is not configured for this deployment, so the prototype is using local pantry data.');
      return undefined;
    }

    const inventoryQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', 'inventory'),
      orderBy('name')
    );

    return onSnapshot(
      inventoryQuery,
      async (snapshot) => {
        const data = mergeInventoryItems(snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() })));
        setInventory(data);
        saveLocalInventory(data);
        setInventoryError('');

        if (data.length === 0) {
          saveLocalInventory([]);
        }
      },
      () => {
        const localInventory = getLocalInventory();
        setInventory(localInventory);
        setInventoryError('Live inventory is unavailable, so the prototype is using local pantry data.');
      }
    );
  }, []);

  useEffect(() => {
    if (!auth) return undefined;

    return onAuthStateChanged(auth, (student) => {
      setCurrentStudent(student);

      if (!student) {
        setStudentEmail('');
        return;
      }

      const nextName = student.displayName || student.email?.split('@')[0] || 'Student';
      setUserName(nextName);
      setStudentEmail(student.email || '');

      if (role === 'student' || view === 'student-auth' || view === 'role-select') {
        setRole('student');
        setView('app');
        setActiveTab(getRoleStartTab('student'));
      }
    });
  }, [role, view]);

  useEffect(() => {
    if (!currentStudent || !db) return;

    const name = currentStudent.displayName || currentStudent.email?.split('@')[0] || 'Student';
    saveStudentRegistration({
      id: currentStudent.uid,
      name,
      email: currentStudent.email || '',
      authUid: currentStudent.uid,
    }).catch(() => {
      setStudentAuthError('Google login worked, but saving the student record failed.');
    });
  }, [currentStudent]);

  useEffect(() => {
    if (!auth) return;

    getRedirectResult(auth).catch((error) => {
      setStudentAuthError(getGoogleAuthErrorMessage(error));
    });
  }, []);

  useEffect(() => {
    if (!db) {
      setRegisteredStudents([]);
      return undefined;
    }

    const studentsQuery = query(
      collection(db, 'artifacts', appId, 'public', 'data', STUDENT_REGISTRY_COLLECTION),
      orderBy('name')
    );

    return onSnapshot(
      studentsQuery,
      (snapshot) => {
        const students = snapshot.docs.map((entry) => ({ id: entry.id, ...entry.data() }));
        setRegisteredStudents(students);
      },
      () => {
        setRegisteredStudents([]);
      }
    );
  }, []);

  const lowStockItems = useMemo(
    () => inventory.filter((item) => Number(item.quantity) <= getEffectiveParLevel(item)),
    [inventory]
  );

  const inventoryByKey = useMemo(() => {
    const nextMap = {};

    inventory.forEach((item) => {
      const material = getMaterialForName(item.name);
      const key = material?.key ?? toMaterialKey(item.name);
      if (!key) return;
      nextMap[key] = Number(nextMap[key] || 0) + Number(item.quantity || 0);
    });

    return nextMap;
  }, [inventory]);

  const projectedStockByKey = useMemo(() => {
    const nextMap = { ...inventoryByKey };

    basket.forEach((item) => {
      nextMap[item.key] = Number(nextMap[item.key] || 0) + Number(item.quantity || 0);
    });

    return nextMap;
  }, [basket, inventoryByKey]);

  const filteredMaterials = useMemo(() => {
    const term = normalizeSearch(inventorySearch);
    if (!term) return PANTRY_MATERIALS.filter((item) => QUICK_MATERIAL_KEYS.includes(item.key));
    const matches = PANTRY_MATERIALS.filter((item) => getMaterialSearchText(item).includes(term));
    const exactMatch = matches.some((item) => toMaterialKey(item.name) === toMaterialKey(term));

    if (matches.length > 0 || !toMaterialKey(term) || chefLanguage === 'hindi' || exactMatch) {
      return matches;
    }

    return [createCustomMaterial(term)];
  }, [chefLanguage, inventorySearch]);

  const filteredInventory = useMemo(() => {
    return inventory;
  }, [inventory]);

  const recommendedDishes = useMemo(
    () => getDishRecommendations(projectedStockByKey),
    [projectedStockByKey]
  );

  const availableMeals = useMemo(
    () => getMealsForSession(activeMealSession, menuIdsBySession),
    [activeMealSession, menuIdsBySession]
  );

  const sessionInfo = getSessionInfo(activeMealSession);
  const chefPublishSessionInfo = getSessionInfo(chefPublishSession);
  const studentKey = currentStudent?.uid ?? getStudentKey(studentEmail || userName);
  const sessionVotes = votesBySession[activeMealSession] ?? {};
  const mealVotes = useMemo(
    () => ({ ...BASE_MEAL_VOTES, ...sessionVotes }),
    [sessionVotes]
  );

  useEffect(() => {
    if (role !== 'chef' || recommendedDishes.length === 0) return;
    const recommendedIds = recommendedDishes.map((dish) => dish.id);

    setSelectedDishIds((prev) => {
      const stillPossible = prev.filter((dishId) => recommendedIds.includes(dishId));
      return stillPossible.length > 0 ? stillPossible : recommendedIds.slice(0, 3);
    });
  }, [recommendedDishes, role]);

  useEffect(() => {
    if (role !== 'chef' || recommendedDishes.length > 0) return;
    setSelectedDishIds(getMealsForSession(chefPublishSession, menuIdsBySession).map((meal) => meal.id));
  }, [chefPublishSession, menuIdsBySession, recommendedDishes.length, role]);

  useEffect(() => {
    const selectedForStudent = toVoteArray(studentVotesBySession[activeMealSession]?.[studentKey]);
    if (selectedForStudent.length === 0) return;

    const validVoteIds = selectedForStudent.filter((voteId) =>
      availableMeals.some((meal) => meal.id === voteId)
    );

    if (validVoteIds.length === selectedForStudent.length) return;

    setStudentVotesBySession((prev) => {
      const nextSessionVotes = { ...(prev[activeMealSession] ?? {}) };
      if (validVoteIds.length > 0) {
        nextSessionVotes[studentKey] = validVoteIds;
      } else {
        delete nextSessionVotes[studentKey];
      }
      const nextVotes = { ...prev, [activeMealSession]: nextSessionVotes };
      saveLocalJson(LOCAL_STUDENT_VOTES_BY_SESSION_KEY, nextVotes);
      return nextVotes;
    });
  }, [activeMealSession, availableMeals, studentKey, studentVotesBySession]);

  const sortedMeals = useMemo(
    () =>
      [...availableMeals]
        .map((meal) => ({
          ...meal,
          votes: mealVotes[meal.id] ?? meal.votes,
        }))
        .sort((a, b) => b.votes - a.votes),
    [availableMeals, mealVotes]
  );

  const totalQuantity = useMemo(
    () => inventory.reduce((sum, item) => sum + Number(item.quantity || 0), 0),
    [inventory]
  );

  const chefResultsBySession = useMemo(
    () =>
      MEAL_SESSIONS.map((session) => {
        const sessionMeals = getMealsForSession(session.id, menuIdsBySession)
          .map((meal) => ({
            ...meal,
            votes: (votesBySession[session.id] ?? {})[meal.id] ?? BASE_MEAL_VOTES[meal.id] ?? meal.votes,
          }))
          .sort((a, b) => b.votes - a.votes);

        return {
          ...session,
          meals: sessionMeals,
          leader: sessionMeals[0] ?? null,
        };
      }),
    [menuIdsBySession, votesBySession]
  );

  const roleInfo = role ? ROLE_META[role] : null;
  const RoleIcon = roleInfo?.icon ?? User;
  const heroMeal = sortedMeals[0];
  const selectedVoteIds = toVoteArray(studentVotesBySession[activeMealSession]?.[studentKey]);
  const hasVoted = selectedVoteIds.length > 0;
  const votedStudentCount = new Set(
    Object.values(studentVotesBySession).flatMap((sessionVoteMap) =>
      Object.entries(sessionVoteMap ?? {})
        .filter(([, voteValue]) => toVoteArray(voteValue).length > 0)
        .map(([studentId]) => studentId)
    )
  ).size;
  const participationStats = {
    total: registeredStudents.length,
    voted: votedStudentCount,
    notVoted: Math.max(registeredStudents.length - votedStudentCount, 0),
  };
  const sentimentScore = Math.max(72, Math.min(96, 88 - lowStockItems.length * 3));
  const engagementBars = [42, 64, 56, 90, 76, 34, 28];

  const resetToRoleSelect = () => {
    if (role === 'student' && auth) {
      signOut(auth).catch(() => {});
    }
    setView('role-select');
    setRole(null);
    setPin('');
    setUserName('');
    setStudentEmail('');
    setStudentAuthError('');
    setActiveTab('vote');
  };

  const saveStudentRegistration = async ({ id, name, email = '', authUid = '' }) => {
    if (!db) return;

    await setDoc(
      doc(db, 'artifacts', appId, 'public', 'data', STUDENT_REGISTRY_COLLECTION, id),
      {
        uid: authUid,
        email,
        name,
        lastLoginAt: serverTimestamp(),
        role: 'student',
      },
      { merge: true }
    );
  };

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
    setActiveTab(getRoleStartTab(selectedRole));
    setView(selectedRole === 'student' ? 'student-auth' : 'pin-entry');
  };

  const handleAuth = async () => {
    if (role === 'student') {
      if (!currentStudent) {
        setStudentAuthError('Please sign in with Google Mail before entering the student portal.');
        return;
      }

      const name = currentStudent.displayName || currentStudent.email?.split('@')[0] || userName.trim() || 'Student';

      try {
        await saveStudentRegistration({
          id: currentStudent.uid,
          name,
          email: currentStudent.email || studentEmail,
          authUid: currentStudent.uid,
        });
      } catch {
        setStudentAuthError('Student details could not be saved right now. Please try again.');
        return;
      }

      setView('app');
      return;
    }

    const validChef = role === 'chef' && pin === '1111';
    const validAdmin = role === 'admin' && pin === '0000';

    if (validChef || validAdmin) {
      setView('app');
      return;
    }

    setPin('');
  };

  const handleStudentSignIn = async () => {
    setStudentAuthError('');

    if (!isFirebaseConfigured || !auth) {
      setStudentAuthError('Google login needs Firebase environment variables in Vercel first.');
      return;
    }

    setIsStudentSigningIn(true);
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: 'select_account' });

    try {
      const result = await signInWithPopup(auth, provider);
      if (result?.user) {
        const nextName = result.user.displayName || result.user.email?.split('@')[0] || 'Student';
        setCurrentStudent(result.user);
        setUserName(nextName);
        setStudentEmail(result.user.email || '');
        setRole('student');
        setView('app');
        setActiveTab(getRoleStartTab('student'));
      }
      setIsStudentSigningIn(false);
    } catch (error) {
      const code = error?.code || '';

      if (!code || code.includes('popup-blocked') || code.includes('popup-closed-by-user') || code.includes('cancelled-popup-request')) {
        try {
          await signInWithRedirect(auth, provider);
          return;
        } catch (redirectError) {
          setStudentAuthError(getGoogleAuthErrorMessage(redirectError));
        }
      } else {
        setStudentAuthError(getGoogleAuthErrorMessage(error));
      }

      setIsStudentSigningIn(false);
    }
  };

  const clearStudentRegistry = async () => {
    setIsClearingStudentRegistry(true);
    setStudentRegistryMessage('');

    try {
      if (!db) {
        setStudentRegistryMessage('Firebase is not configured, so there is no online student registry to clear.');
        return;
      }

      const snapshot = await getDocs(
        collection(db, 'artifacts', appId, 'public', 'data', STUDENT_REGISTRY_COLLECTION)
      );

      await Promise.all(snapshot.docs.map((entry) => deleteDoc(entry.ref)));
      setStudentVotesBySession({});
      saveLocalJson(LOCAL_STUDENT_VOTES_BY_SESSION_KEY, {});
      setStudentRegistryMessage('Student login registry cleared for a fresh start.');
    } catch {
      setStudentRegistryMessage('Student registry could not be cleared right now.');
    } finally {
      setIsClearingStudentRegistry(false);
    }
  };

  const handleVote = (mealId) => {
    const currentVotes = toVoteArray(studentVotesBySession[activeMealSession]?.[studentKey]);
    const isRemoving = currentVotes.includes(mealId);

    setVotesBySession((prev) => {
      const nextSessionVotes = { ...(prev[activeMealSession] ?? {}) };
      const currentTotal = nextSessionVotes[mealId] ?? BASE_MEAL_VOTES[mealId] ?? 0;
      nextSessionVotes[mealId] = isRemoving
        ? Math.max(0, currentTotal - 1)
        : currentTotal + 1;
      const nextVotes = { ...prev, [activeMealSession]: nextSessionVotes };
      saveLocalJson(LOCAL_VOTES_BY_SESSION_KEY, nextVotes);
      return nextVotes;
    });

    setStudentVotesBySession((prev) => {
      const nextVoteIds = isRemoving
        ? currentVotes.filter((voteId) => voteId !== mealId)
        : [...currentVotes, mealId];
      const nextSessionVotes = { ...(prev[activeMealSession] ?? {}) };

      if (nextVoteIds.length > 0) {
        nextSessionVotes[studentKey] = nextVoteIds;
      } else {
        delete nextSessionVotes[studentKey];
      }

      const nextVotes = { ...prev, [activeMealSession]: nextSessionVotes };
      saveLocalJson(LOCAL_STUDENT_VOTES_BY_SESSION_KEY, nextVotes);
      return nextVotes;
    });
    setVoteFeedback({ mealId, action: isRemoving ? 'removed' : 'added' });
    window.setTimeout(() => setVoteFeedback(null), 1800);
  };

  const handleQuantityDraftChange = (materialKey, value) => {
    if (!/^\d*\.?\d*$/.test(value)) return;
    setQuantityDrafts((prev) => ({ ...prev, [materialKey]: value }));
  };

  const addToBasket = (item) => {
    const rawQuantity = Number(quantityDrafts[item.key] || 0);
    if (rawQuantity <= 0) {
      setStockActionError(`Enter a valid quantity for ${item.name}.`);
      return;
    }

    setStockActionError('');
    setBasket((prev) => {
      const materialKey = item.key ?? toMaterialKey(item.name);
      const existingItem = prev.find((entry) => entry.key === materialKey);
      if (existingItem) {
        return prev.map((entry) =>
          entry.key === materialKey
            ? { ...entry, quantity: Number(entry.quantity) + rawQuantity }
            : entry
        );
      }

      return [...prev, { ...item, key: materialKey, quantity: rawQuantity, id: materialKey }];
    });
    setQuantityDrafts((prev) => ({ ...prev, [item.key]: '' }));
  };

  const removeFromBasket = (id) => {
    setBasket((prev) => prev.filter((item) => item.id !== id));
  };

  const handleStockBasket = async () => {
    if (!basket.length || isSubmittingStock) return;

    setIsSubmittingStock(true);
    setStockActionError('');

    const nextInventory = [...inventory];

    basket.forEach((item) => {
      const itemKey = item.key ?? toMaterialKey(item.name);
      const existingIndex = nextInventory.findIndex((entry) => {
        const entryMaterial = getMaterialForName(entry.name);
        return (entryMaterial?.key ?? toMaterialKey(entry.name)) === itemKey;
      });
      const nextQuantity =
        existingIndex >= 0
          ? Number(nextInventory[existingIndex].quantity || 0) + Number(item.quantity || 0)
          : Number(item.quantity || 0);
      const nextItem = {
        id: existingIndex >= 0 ? nextInventory[existingIndex].id : `local-${item.key}`,
        name: item.name,
        quantity: nextQuantity,
        unit: item.unit,
        parLevel: getParLevel(nextQuantity),
      };

      if (existingIndex >= 0) {
        nextInventory[existingIndex] = nextItem;
      } else {
        nextInventory.push(nextItem);
      }
    });

    try {
      const batch = writeBatch(db);
      basket.forEach((item) => {
        const itemKey = item.key ?? toMaterialKey(item.name);
        const existingItem = inventory.find((entry) => {
          const entryMaterial = getMaterialForName(entry.name);
          return (entryMaterial?.key ?? toMaterialKey(entry.name)) === itemKey;
        });
        const ref = existingItem
          ? doc(db, 'artifacts', appId, 'public', 'data', 'inventory', existingItem.id)
          : doc(collection(db, 'artifacts', appId, 'public', 'data', 'inventory'));
        const nextQuantity = existingItem
          ? Number(existingItem.quantity || 0) + Number(item.quantity || 0)
          : Number(item.quantity || 0);

        batch.set(ref, {
          name: item.name,
          quantity: nextQuantity,
          unit: item.unit,
          parLevel: getParLevel(nextQuantity),
        });
      });

      await batch.commit();
      saveLocalInventory(nextInventory);
      setBasket([]);
    } catch {
      setInventory(nextInventory);
      saveLocalInventory(nextInventory);
      setBasket([]);
      setStockActionError('Live sync failed, but this prototype saved the stock locally.');
    } finally {
      setIsSubmittingStock(false);
    }
  };

  const toggleDishSelection = (dishId) => {
    setMenuPublishMessage('');
    setSelectedDishIds((prev) => {
      if (prev.includes(dishId)) {
        return prev.filter((item) => item !== dishId);
      }

      if (prev.length >= 6) {
        return prev;
      }

      return [...prev, dishId];
    });
  };

  const publishChefMenu = () => {
    if (selectedDishIds.length < 1) {
      setMenuPublishMessage('Pick at least 1 dish for the student menu.');
      return;
    }

    setPendingPublishMenu({
      dishIds: selectedDishIds,
      sessionId: chefPublishSession,
    });
  };

  const confirmPublishMenu = () => {
    if (!pendingPublishMenu) return;
    const publishSession = getSessionInfo(pendingPublishMenu.sessionId);

    setMenuIdsBySession((prev) => {
      const nextMenus = { ...prev, [pendingPublishMenu.sessionId]: pendingPublishMenu.dishIds };
      saveLocalJson(LOCAL_MENU_BY_SESSION_KEY, nextMenus);
      return nextMenus;
    });
    setMenuPublishMessage(`${pendingPublishMenu.dishIds.length} dishes published for ${publishSession.label}.`);
    setPendingPublishMenu(null);
  };

  const submitPost = () => {
    const content = newPost.trim();
    if (!content) return;

    setSocialPosts((prev) => {
      const nextPosts = [
        {
          id: Date.now(),
          user: userName || 'Campus Voice',
          time: 'Just now',
          place: 'Wall Drop',
          content,
          likes: 0,
          comments: 0,
          tag: 'Fresh',
        },
        ...prev,
      ];

      window.localStorage.setItem(LOCAL_SOCIAL_POSTS_KEY, JSON.stringify(nextPosts));
      return nextPosts;
    });
    setNewPost('');
  };

  if (view === 'role-select') {
    return (
      <div className="min-h-screen overflow-hidden bg-background px-4 py-8 text-cocoa sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,219,202,0.55),_transparent_24%),radial-gradient(circle_at_bottom,_rgba(250,221,206,0.42),_transparent_32%)]" />
        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-xl items-center justify-center">
          <motion.section
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="w-full rounded-[2.75rem] border border-[#f0ddd3] bg-[rgba(255,253,251,0.94)] p-6 shadow-[0_24px_80px_rgba(137,80,46,0.14)] backdrop-blur sm:p-8"
          >
            <div className="mb-8 text-center">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 3.2, ease: 'easeInOut' }}
                className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-primary-container text-on-primary-container shadow-[0_16px_40px_rgba(255,179,138,0.32)]"
              >
                <Soup className="h-11 w-11" />
              </motion.div>
              <h1 className="text-[clamp(2.5rem,7vw,4.25rem)] font-black italic leading-none tracking-[-0.07em] text-cocoa">
                CRAVE<span className="text-primary">BOX</span>
              </h1>
              <p className="mt-4 text-label-sm font-black uppercase tracking-[0.45em] text-cocoa/35">
                Campus Dining Hub
              </p>
            </div>

            <div className="mb-6 rounded-[2rem] bg-surface-container-low px-6 py-5 text-center">
              <h2 className="text-headline-lg text-primary">Choose your portal</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Pick the role you want to enter.
              </p>
            </div>

            <div className="space-y-4">
              {Object.entries(ROLE_META).map(([key, item]) => {
                const Icon = item.icon;
                return (
                  <button
                    key={key}
                    onClick={() => handleRoleSelect(key)}
                    style={{ '--lip-color': '#d7c2b9' }}
                    className="lip-button flex w-full items-center gap-4 rounded-[1.9rem] border border-outline-variant/30 bg-background p-5 text-left transition-all hover:scale-[1.01]"
                  >
                    <div className={`flex h-16 w-16 items-center justify-center rounded-[1.5rem] ${item.accent} text-cocoa shadow-inner-soft`}>
                      <Icon className="h-8 w-8" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-headline-md text-cocoa">{item.label}</p>
                      <p className="mt-1 text-label-sm uppercase tracking-[0.18em] text-cocoa/50">{item.helper}</p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-cocoa/35" />
                  </button>
                );
              })}
            </div>
          </motion.section>
        </div>
      </div>
    );
  }

  if (view === 'student-auth' || view === 'pin-entry') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6 py-10 text-cocoa">
        <button
          onClick={resetToRoleSelect}
          className="absolute left-6 top-6 inline-flex items-center gap-2 rounded-full border border-outline-variant/30 bg-white px-4 py-2 text-label-sm font-black uppercase tracking-[0.2em] text-primary"
        >
          <X className="h-4 w-4" />
          Back
        </button>

        <div className="w-full max-w-md rounded-[2rem] border border-outline-variant/30 bg-white p-8 shadow-premium">
          <div className="mb-8 text-center">
            <div className={`mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-[1.5rem] ${roleInfo?.accent} text-cocoa shadow-inner-soft`}>
              <RoleIcon className="h-8 w-8" />
            </div>
            <h2 className="text-headline-lg text-primary">
              {view === 'student-auth' ? 'Enter your name' : 'Enter secure PIN'}
            </h2>
            <p className="mt-2 text-body-md text-on-surface-variant">{roleInfo?.helper}</p>
          </div>

          {view === 'student-auth' ? (
            <div className="space-y-5">
              <input
                autoFocus
                value={userName}
                onChange={(event) => setUserName(event.target.value)}
                placeholder="e.g. Jordan"
                className="w-full rounded-[1.5rem] border border-outline-variant/40 bg-background px-6 py-5 text-center text-xl font-black text-primary outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/10"
              />

              <button
                disabled={!currentStudent}
                onClick={handleAuth}
                className="w-full rounded-full bg-primary px-6 py-4 text-label-bold font-black uppercase tracking-[0.25em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
              >
                {currentStudent ? 'Access Portal' : 'Google Login Required'}
              </button>

              <button
                onClick={handleStudentSignIn}
                disabled={isStudentSigningIn}
                className="mt-2 flex w-full items-center justify-center gap-3 rounded-full border border-outline-variant/25 bg-white px-6 py-4 text-label-bold font-black uppercase tracking-[0.14em] text-primary shadow-sm transition-all hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="#EA4335"
                      d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6s2.7-6 6-6c1.9 0 3.2.8 3.9 1.5l2.7-2.6C17 3.3 14.8 2.4 12 2.4 6.9 2.4 2.8 6.5 2.8 11.6S6.9 20.8 12 20.8c6.9 0 9.1-4.8 9.1-7.3 0-.5 0-.8-.1-1.1H12Z"
                    />
                    <path
                      fill="#34A853"
                      d="M2.8 11.6c0 1.6.4 3.1 1.2 4.4l3.6-2.8c-.2-.5-.4-1-.4-1.6s.1-1.1.4-1.6L4 7.2c-.8 1.3-1.2 2.8-1.2 4.4Z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M12 20.8c2.5 0 4.6-.8 6.1-2.3l-3-2.5c-.8.6-1.9 1-3.1 1-2.4 0-4.5-1.6-5.2-3.8L3.1 16c1.7 3.3 5.1 4.8 8.9 4.8Z"
                    />
                    <path
                      fill="#4285F4"
                      d="M18.1 18.5c1.8-1.6 3-4 3-6.9 0-.5 0-.8-.1-1.1H12v3.9h5.5c-.2 1-.8 2.4-2.4 3.5l3 2.6Z"
                    />
                  </svg>
                </span>
                <span>{isStudentSigningIn ? 'Signing In...' : 'Continue With Google Mail'}</span>
              </button>

              {currentStudent?.email && (
                <div className="inline-flex items-center gap-2 rounded-full bg-background px-4 py-2 text-label-sm font-black uppercase tracking-[0.12em] text-primary">
                  <Mail className="h-4 w-4" />
                  {currentStudent.email}
                </div>
              )}

              {studentAuthError && (
                <p className="rounded-[1.25rem] bg-error-container px-4 py-3 text-body-md text-on-error-container">
                  {studentAuthError}
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className={`h-4 w-4 rounded-full border-2 border-primary/20 transition-all ${
                      pin.length >= item ? 'scale-110 bg-primary' : 'bg-transparent'
                    }`}
                  />
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 'C', 0, 'X'].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      if (num === 'C') setPin('');
                      else if (num === 'X') setPin((prev) => prev.slice(0, -1));
                      else if (pin.length < 4) setPin((prev) => prev + num);
                    }}
                    className="tactile-button flex h-16 items-center justify-center rounded-[1.5rem] border border-outline-variant/20 bg-background text-xl font-black text-primary"
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          {view === 'pin-entry' && (
            <button
              disabled={pin.length < 4}
              onClick={handleAuth}
              className="mt-8 w-full rounded-full bg-primary px-6 py-4 text-label-bold font-black uppercase tracking-[0.25em] text-white transition-all disabled:cursor-not-allowed disabled:opacity-40"
            >
              Access Portal
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-32 text-cocoa">
      <AnimatePresence mode="wait">
        <motion.div
          key={`${role}-${activeTab}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.24 }}
        >
          <header className="sticky top-0 z-50 border-b border-outline-variant/30 bg-background/85 backdrop-blur-xl">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-[1.2rem] ${roleInfo?.accent} shadow-inner-soft`}>
                  <RoleIcon className="h-6 w-6" />
                </div>
                <div>
                  <span className="block text-headline-md leading-none text-primary">CraveBox</span>
                  <span className="mt-1 block text-label-sm uppercase tracking-[0.2em] text-cocoa/45">
                    {roleInfo?.title}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="hidden rounded-full bg-white px-4 py-2 text-label-sm font-black uppercase tracking-[0.16em] text-cocoa/60 sm:inline-flex">
                  {role === 'student' ? userName || 'Student' : roleInfo?.label}
                </span>
                <button
                  onClick={resetToRoleSelect}
                  className="rounded-full border border-outline-variant/30 bg-white p-3 text-cocoa/60 transition-colors hover:text-error"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            </div>
          </header>

          <main className="mx-auto max-w-6xl px-4 pt-6 sm:px-6">
            {role === 'student' && (
              <StudentView
                activeTab={activeTab}
                activeMealSession={activeMealSession}
                hasVoted={hasVoted}
                heroMeal={heroMeal}
                meals={sortedMeals}
                newPost={newPost}
                onMealSessionChange={setActiveMealSession}
                posts={socialPosts}
                selectedVoteIds={selectedVoteIds}
                sessionInfo={sessionInfo}
                setNewPost={setNewPost}
                submitPost={submitPost}
                voteFeedback={voteFeedback}
                onVote={handleVote}
              />
            )}

            {role === 'chef' && (
              <ChefWorkspace
                activeTab={activeTab}
                basket={basket}
                chefLanguage={chefLanguage}
                filteredMaterials={filteredMaterials}
                filteredInventory={filteredInventory}
                inventory={inventory}
                inventoryError={inventoryError}
                inventorySearch={inventorySearch}
                isSubmittingStock={isSubmittingStock}
                menuPublishMessage={menuPublishMessage}
                chefPublishSession={chefPublishSession}
                chefPublishSessionInfo={chefPublishSessionInfo}
                chefResultsBySession={chefResultsBySession}
                onAddToBasket={addToBasket}
                onBasketSubmit={handleStockBasket}
                onClearBasket={() => setBasket([])}
                onDishToggle={toggleDishSelection}
                onLanguageChange={setChefLanguage}
                onChefPublishSessionChange={setChefPublishSession}
                onRemoveBasketItem={removeFromBasket}
                onSearch={setInventorySearch}
                onPublishMenu={publishChefMenu}
                onQuantityDraftChange={handleQuantityDraftChange}
                publishedMeals={sortedMeals}
                quantityDrafts={quantityDrafts}
                recommendedDishes={recommendedDishes}
                selectedDishIds={selectedDishIds}
                stockActionError={stockActionError}
                totalQuantity={totalQuantity}
              />
            )}

            {role === 'admin' && (
              <AdminView
                clearStudentRegistry={clearStudentRegistry}
                engagementBars={engagementBars}
                inventory={inventory}
                isClearingStudentRegistry={isClearingStudentRegistry}
                lowStockItems={lowStockItems}
                participationStats={participationStats}
                posts={socialPosts}
                activeTab={activeTab}
                studentRegistryMessage={studentRegistryMessage}
                sentimentScore={sentimentScore}
              />
            )}
          </main>
        </motion.div>
      </AnimatePresence>

      {pendingPublishMenu && (
        <PublishConfirmModal
          dishIds={pendingPublishMenu.dishIds}
          sessionInfo={getSessionInfo(pendingPublishMenu.sessionId)}
          onCancel={() => setPendingPublishMenu(null)}
          onConfirm={confirmPublishMenu}
        />
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-outline-variant/30 bg-background/90 px-4 py-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl items-center justify-around gap-2">
          {roleInfo?.tabs.map((tab) => {
            const TabIcon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex min-w-[88px] flex-col items-center gap-1 rounded-full px-4 py-2 text-label-sm font-black transition-all ${
                  active ? 'scale-105 bg-primary-container text-on-primary-container shadow-premium' : 'text-cocoa/45'
                }`}
              >
                <TabIcon className="h-5 w-5" />
                <span>{tab.label}</span>
              </button>
            );
          })}

        </div>
      </nav>
    </div>
  );
}

function SessionPicker({ value, onChange, label = 'Meal Session' }) {
  return (
    <div className="rounded-[1.6rem] border border-outline-variant/25 bg-white p-3 shadow-sm">
      <p className="mb-2 px-2 text-label-sm font-black uppercase tracking-[0.14em] text-cocoa/45">{label}</p>
      <div className="flex flex-wrap gap-2">
        {MEAL_SESSIONS.map((session) => {
          const active = value === session.id;
          return (
            <button
              key={session.id}
              onClick={() => onChange(session.id)}
              className={`rounded-full px-4 py-2 text-label-bold font-black uppercase tracking-[0.12em] transition-all ${
                active ? 'bg-primary text-white shadow-sm' : 'bg-background text-cocoa/55'
              }`}
            >
              {session.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PublishConfirmModal({ dishIds, sessionInfo, onCancel, onConfirm }) {
  const dishes = DISH_CATALOG.filter((dish) => dishIds.includes(dish.id));

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-cocoa/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-lg rounded-[2rem] border border-outline-variant/30 bg-white p-6 shadow-premium">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-label-sm font-black uppercase tracking-[0.18em] text-secondary">Confirm Publish</p>
            <h2 className="mt-2 text-headline-lg text-primary">
              {dishIds.length} dishes for {sessionInfo.label}
            </h2>
          </div>
          <button onClick={onCancel} className="rounded-full bg-background p-3 text-cocoa/50 hover:text-error">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="rounded-[1.5rem] bg-background p-4">
          <p className="text-body-md text-cocoa">
            These {dishIds.length} dishes will go live for {sessionInfo.label} voting.
          </p>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Ye {dishIds.length} dish {sessionInfo.label} voting ke liye live hongi.
          </p>
        </div>

        <div className="mt-4 grid gap-2">
          {dishes.map((dish) => (
            <div key={dish.id} className="rounded-[1rem] border border-outline-variant/20 px-4 py-3 text-label-bold text-cocoa">
              {dish.name}
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <button
            onClick={onCancel}
            className="flex-1 rounded-full border border-outline-variant/30 bg-white px-5 py-3 text-label-bold font-black uppercase tracking-[0.14em] text-cocoa/60"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-full bg-secondary px-5 py-3 text-label-bold font-black uppercase tracking-[0.14em] text-white"
          >
            Publish / Live Karo
          </button>
        </div>
      </section>
    </div>
  );
}

function StudentView({
  activeTab,
  activeMealSession,
  hasVoted,
  heroMeal,
  meals,
  newPost,
  onMealSessionChange,
  posts,
  selectedVoteIds,
  sessionInfo,
  setNewPost,
  submitPost,
  voteFeedback,
  onVote,
}) {
  const exploreMeals = meals.filter((meal) => meal.id !== heroMeal?.id);

  if (activeTab === 'social') {
    return (
      <div className="space-y-6 pb-24">
        <section className="rounded-[2rem] border border-outline-variant/30 bg-white p-6 shadow-premium">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-lg text-primary">Campus Food Wall</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Drop a short message and let it land on the wall like a loud graffiti tag.
              </p>
            </div>
            <div className="rounded-full bg-primary-container px-4 py-2 text-label-sm font-black uppercase tracking-[0.16em] text-on-primary-container">
              Wall Mode
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2.5rem] border-[8px] border-[#1f2c48] bg-[#171717] p-4 shadow-[0_24px_70px_rgba(23,23,23,0.34)] sm:p-6">
          <div className="graffiti-wall min-h-[420px] rounded-[2rem] p-4 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className={`inline-flex max-w-[240px] flex-col rounded-[1.8rem] border border-white/10 px-4 py-3 uppercase tracking-[0.04em] ${WALL_STYLES[index % WALL_STYLES.length]}`}
                >
                  <span className="text-[11px] font-black opacity-75">{post.user}</span>
                  <p className="text-graffiti mt-2 text-[clamp(1.05rem,2.5vw,1.65rem)] leading-[1.05] normal-case tracking-[0.02em]">
                    {post.content}
                  </p>
                  <span className="mt-3 text-[10px] font-black uppercase opacity-70">
                    {post.time} | {post.place}
                  </span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="rounded-[2.5rem] border border-outline-variant/25 bg-white p-4 shadow-premium">
          <div className="flex items-center gap-3">
            <input
              value={newPost}
              onChange={(event) => setNewPost(event.target.value.slice(0, 60))}
              placeholder="Tag the wall..."
              className="h-16 flex-1 rounded-[1.6rem] bg-[#f6f8fc] px-5 text-lg font-black uppercase tracking-[0.04em] text-cocoa outline-none placeholder:text-[#90a0bc]"
            />
            <button
              onClick={submitPost}
              className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#17213c] text-white shadow-[0_12px_30px_rgba(23,33,60,0.28)]"
            >
              <TrendingUp className="h-6 w-6 -rotate-45" />
            </button>
          </div>
        </section>
      </div>
    );
  }

  if (activeTab === 'rankings') {
    return (
      <div className="space-y-6 pb-24">
        <section className="rounded-[2rem] border border-outline-variant/30 bg-white p-6 shadow-premium">
          <h2 className="text-headline-lg text-primary">Live Rankings</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            A stitched-style podium and ranked list backed by the current vote totals.
          </p>
        </section>

        <section className="rounded-[2rem] bg-surface-container p-6 shadow-premium">
          <div className="flex h-[280px] items-end justify-center gap-4">
            <PodiumCard rank={2} meal={meals[1]} height="h-44" tone="bg-white" />
            <PodiumCard rank={1} meal={meals[0]} height="h-60" tone="bg-primary-container" highlight />
            <PodiumCard rank={3} meal={meals[2]} height="h-36" tone="bg-surface-container-low" />
          </div>
        </section>

        <section className="overflow-hidden rounded-[2rem] border border-outline-variant/25 bg-white shadow-sm">
          {meals.map((meal, index) => (
            <div
              key={meal.id}
              className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                index !== meals.length - 1 ? 'border-b border-outline-variant/15' : ''
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black ${index === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-background text-cocoa/55'}`}>
                  {index + 1}
                </div>
                <FoodImage src={meal.img} alt={meal.name} className="h-16 w-16 rounded-2xl object-cover" />
                <div>
                  <p className="text-headline-md text-cocoa">{meal.name}</p>
                  <div className="mt-1 flex items-center gap-3 text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                    <span className="inline-flex items-center gap-1 text-primary">
                      <Star className="h-3.5 w-3.5 fill-primary" />
                      {meal.rating}
                    </span>
                    <span>{meal.votes} votes</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onVote(meal.id)}
                className={getVoteButtonClass(selectedVoteIds.includes(meal.id))}
              >
                {getVoteButtonLabel(selectedVoteIds.includes(meal.id))}
              </button>
            </div>
          ))}
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <SessionPicker value={activeMealSession} onChange={onMealSessionChange} label={`Voting Session: ${sessionInfo.label}`} />

      <section className="overflow-hidden rounded-[2rem] border border-outline-variant/30 bg-white shadow-premium">
        <div className="grid lg:grid-cols-[1fr_1.05fr]">
          <div className="p-5 sm:p-7">
            <span className="inline-flex rounded-full bg-secondary-container px-4 py-2 text-label-sm font-black uppercase tracking-[0.2em] text-on-secondary-container">
              {sessionInfo.label} Live Voting
            </span>
            <h2 className="mt-4 text-headline-xl text-primary">{heroMeal.name}</h2>
            <p className="mt-3 max-w-lg text-body-lg text-on-surface-variant">{heroMeal.description}</p>

            <div className="mt-5 flex flex-wrap items-center gap-3 text-label-sm uppercase tracking-[0.16em] text-cocoa/45">
              <span className="rounded-full bg-background px-4 py-2">{heroMeal.votes} global votes</span>
              <span className="rounded-full bg-background px-4 py-2">Rated {heroMeal.rating}</span>
            </div>

            <p className="mt-5 text-label-bold uppercase tracking-[0.14em] text-cocoa/50">
              {hasVoted
                ? 'You can vote for multiple dishes. Tap a selected dish again to remove that vote.'
                : 'Tap one or more dishes to add your votes for this meal session.'}
            </p>

            <button
              onClick={() => onVote(heroMeal.id)}
              style={{ '--lip-color': selectedVoteIds.includes(heroMeal.id) ? '#214f3b' : '#6d3919' }}
              className={`lip-button mt-6 ${getVoteButtonClass(selectedVoteIds.includes(heroMeal.id))}`}
            >
              {selectedVoteIds.includes(heroMeal.id) ? <Sparkles className="h-5 w-5" /> : <TrendingUp className="h-5 w-5" />}
              {selectedVoteIds.includes(heroMeal.id) ? 'Remove Vote' : 'Vote For This'}
            </button>

            {voteFeedback && (
              <p className="mt-4 text-label-bold text-secondary">
                {meals.find((meal) => meal.id === voteFeedback.mealId)?.name} vote {voteFeedback.action}.
              </p>
            )}
          </div>

          <div className="relative min-h-[260px]">
            <FoodImage src={heroMeal.img} alt={heroMeal.name} className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-cocoa/75 via-cocoa/15 to-transparent" />
          </div>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div>
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-headline-lg text-primary">Explore Menu</h3>
              <p className="mt-2 text-body-md text-on-surface-variant">Vote from the dishes currently published by the chef.</p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2">
            {exploreMeals.map((meal) => (
              <article key={meal.id} className="overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white shadow-sm transition-all hover:shadow-premium">
                <div className="relative h-56 overflow-hidden">
                  <FoodImage src={meal.img} alt={meal.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                  <div className="absolute right-4 top-4 rounded-full bg-white/92 px-3 py-1 text-label-sm font-black text-primary shadow-sm">
                    <span className="inline-flex items-center gap-1">
                      <Star className="h-3.5 w-3.5 fill-primary" />
                      {meal.rating}
                    </span>
                  </div>
                </div>
                <div className="p-5">
                  <h4 className="text-headline-md text-cocoa">{meal.name}</h4>
                  <p className="mt-2 text-body-md text-on-surface-variant">{meal.description}</p>
                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="rounded-full bg-background px-4 py-2 text-label-sm font-black uppercase tracking-[0.14em] text-cocoa/50">
                      {meal.votes} votes
                    </span>
                    <button
                      onClick={() => onVote(meal.id)}
                      className={getVoteButtonClass(selectedVoteIds.includes(meal.id))}
                    >
                      {getVoteButtonLabel(selectedVoteIds.includes(meal.id))}
                    </button>
                  </div>
                </div>
              </article>
            ))}
            {exploreMeals.length === 0 && (
              <div className="rounded-[2rem] border border-dashed border-outline-variant/35 bg-white p-8 text-center text-on-surface-variant">
                No other dishes are published yet.
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-5">
          <div className="rounded-[2rem] bg-primary-container p-6 shadow-premium">
            <h3 className="text-headline-md text-on-primary-container">Top Trending</h3>
            <div className="mt-4 space-y-3">
              {meals.slice(0, 3).map((meal, index) => (
                <div key={meal.id} className="flex items-center justify-between rounded-[1.25rem] bg-white/75 px-4 py-3">
                  <div>
                    <p className="text-label-bold text-cocoa">#{index + 1} {meal.name}</p>
                    <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">{meal.votes} votes</p>
                  </div>
                  <TrendingUp className="h-5 w-5 text-primary" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] bg-secondary-container p-6 shadow-sm">
            <h3 className="text-headline-md text-on-secondary-container">Voting Rule</h3>
            <p className="mt-2 text-body-md text-on-secondary-container/80">
              Students can support multiple dishes in a meal session, and tapping a selected dish again removes that one vote.
            </p>
          </div>
        </aside>
      </section>
    </div>
  );
}

function ChefView({
  basket,
  filteredMaterials,
  filteredInventory,
  inventory,
  inventoryError,
  inventorySearch,
  isSubmittingStock,
  menuPublishMessage,
  onAddToBasket,
  onBasketSubmit,
  onClearBasket,
  onDishToggle,
  onRemoveBasketItem,
  onPublishMenu,
  onQuantityDraftChange,
  onSearch,
  quantityDrafts,
  recommendedDishes,
  selectedDishIds,
  stockActionError,
  totalQuantity,
}) {
  return (
    <div className="space-y-6 pb-24">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryPanel icon={Box} title="Stock Items" value={String(inventory.length)} description="Raw materials already logged" tone="peach" />
        <SummaryPanel icon={Timer} title="Total Quantity" value={formatQuantity(totalQuantity)} description="Combined quantity across the kitchen" tone="sage" />
        <SummaryPanel icon={ChefHat} title="Dish Suggestions" value={String(recommendedDishes.length)} description="Meals possible from current stock" tone="peach" />
      </section>

      <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-premium">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-headline-lg text-primary">Raw Material Entry</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Add all raw materials with the right quantity, in English and Hindi, then send the full stock together.
            </p>
          </div>

          <div className="relative w-full max-w-xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cocoa/35" />
            <input
              value={inventorySearch}
              onChange={(event) => onSearch(event.target.value)}
              placeholder={
                chefLanguage === 'hindi'
                  ? 'टमाटर, प्याज, चावल खोजें...'
                  : 'Search tomato, onion, rice...'
              }
              className="w-full rounded-full border border-outline-variant/30 bg-background py-4 pl-14 pr-5 text-body-md outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        <div className="mt-4 inline-flex rounded-full bg-background p-1 shadow-inner-soft">
          <button
            onClick={() => onLanguageChange('english')}
            className={`rounded-full px-4 py-2 text-label-bold uppercase tracking-[0.14em] ${
              chefLanguage === 'english' ? 'bg-primary text-white' : 'text-cocoa/55'
            }`}
          >
            ENG
          </button>
          <button
            onClick={() => onLanguageChange('hindi')}
            className={`rounded-full px-4 py-2 text-label-bold uppercase tracking-[0.14em] ${
              chefLanguage === 'hindi' ? 'bg-primary text-white' : 'text-cocoa/55'
            }`}
          >
            हिंदी
          </button>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredMaterials.map((item) => (
            <article key={item.key} className="rounded-[1.8rem] border border-outline-variant/20 bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-fixed text-sm font-black uppercase tracking-[0.08em] text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-label-bold text-cocoa">{item.name}</p>
                  <p className="text-body-md text-on-surface-variant">{item.hindi}</p>
                  <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                    Unit: {item.unit}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  value={quantityDrafts[item.key] ?? ''}
                  onChange={(event) => onQuantityDraftChange(item.key, event.target.value)}
                  inputMode="decimal"
                  placeholder={chefLanguage === 'hindi' ? `मात्रा ${item.unit} में` : `Qty in ${item.unit}`}
                  className="w-full rounded-[1rem] border border-outline-variant/25 bg-white px-4 py-3 text-body-md outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  onClick={() => onAddToBasket(item)}
                  className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant/35 bg-background p-6 text-center text-on-surface-variant">
            No raw material matches that search yet.
          </div>
        )}

        {inventoryError && (
          <div className="mt-5 rounded-[1.25rem] bg-error-container px-4 py-3 text-body-md text-on-error-container">
            {inventoryError}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <section className="grid gap-4 md:grid-cols-2">
          {filteredInventory.length > 0 ? (
            filteredInventory.map((item, index) => {
              const lowStock = Number(item.quantity) <= getEffectiveParLevel(item);
              const material = PANTRY_MATERIALS.find((entry) => entry.name === item.name);
              return (
                <article
                  key={item.id}
                  className="flex flex-col gap-4 rounded-[2rem] border border-outline-variant/20 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-4">
                      <div className="flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-primary-fixed text-2xl">
                        {material?.icon ?? '📦'}
                      </div>
                      <div>
                        <h3 className="text-headline-md text-cocoa">{item.name}</h3>
                        <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                          {formatQuantity(item.quantity)} {item.unit}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-label-sm font-black uppercase tracking-[0.12em] ${
                        lowStock
                          ? 'bg-error-container text-on-error-container'
                          : 'bg-secondary-container text-on-secondary-container'
                      }`}
                    >
                      {lowStock ? 'Low Stock' : 'In Stock'}
                    </span>
                  </div>

                  <div className="rounded-[1.25rem] bg-background p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-label-bold text-cocoa">
                        Quantity: {formatQuantity(item.quantity)} {item.unit}
                      </p>
                      <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                        Alert below: {formatQuantity(getEffectiveParLevel(item))} {item.unit}
                      </p>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
                      <div
                        className={`h-full rounded-full ${lowStock ? 'bg-error' : 'bg-secondary'}`}
                        style={{
                          width: `${Math.min(100, (Number(item.quantity) / Math.max(getEffectiveParLevel(item), 1)) * 55)}%`,
                        }}
                      />
                    </div>
                  </div>
                </article>
              );
            })
          ) : (
            <div className="rounded-[2rem] border border-dashed border-outline-variant/40 bg-white p-8 text-center text-on-surface-variant md:col-span-2">
              No inventory items match your search.
            </div>
          )}
        </section>

        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 text-headline-md text-primary">
                <ShoppingCart className="h-5 w-5" />
                Stock Basket
              </h3>
              {basket.length > 0 && (
                <button onClick={onClearBasket} className="text-label-sm font-black uppercase tracking-[0.14em] text-error">
                  Clear
                </button>
              )}
            </div>

            {basket.length > 0 ? (
              <div className="space-y-3">
                {basket.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] bg-background px-4 py-3">
                    <div>
                      <p className="text-label-bold text-cocoa">{item.name}</p>
                      <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                        {item.quantity} {item.unit}
                      </p>
                    </div>
                    <button onClick={() => onRemoveBasketItem(item.id)} className="rounded-full p-2 text-cocoa/40 hover:text-error">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={onBasketSubmit}
                  style={{ '--lip-color': '#6d3919' }}
                  disabled={isSubmittingStock}
                  className="lip-button flex w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-4 text-label-bold font-black uppercase tracking-[0.18em] text-white"
                >
                  <RefreshCcw className="h-5 w-5 animate-spin-slow" />
                  {isSubmittingStock ? 'Pushing...' : 'Push to Vault'}
                </button>
                {stockActionError && (
                  <p className="text-body-md text-on-error-container">{stockActionError}</p>
                )}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">
                Tap the quick-add ingredients above to build a batch before sending it to Firestore.
              </p>
            )}
          </div>

          <div className="rounded-[2rem] bg-error-container p-5 shadow-sm">
            <h3 className="text-headline-md text-on-error-container">Attention Needed</h3>
            <p className="mt-2 text-body-md text-on-error-container/80">
              {lowStockItems.length > 0
                ? `${lowStockItems.length} items need restocking soon.`
                : 'All tracked ingredients are safely above par right now.'}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function ChefWorkspace({
  activeTab,
  basket,
  chefLanguage,
  chefPublishSession,
  chefPublishSessionInfo,
  chefResultsBySession,
  filteredMaterials,
  filteredInventory,
  inventory,
  inventoryError,
  inventorySearch,
  isSubmittingStock,
  menuPublishMessage,
  onAddToBasket,
  onBasketSubmit,
  onChefPublishSessionChange,
  onClearBasket,
  onDishToggle,
  onLanguageChange,
  onRemoveBasketItem,
  onPublishMenu,
  onQuantityDraftChange,
  onSearch,
  publishedMeals,
  quantityDrafts,
  recommendedDishes,
  selectedDishIds,
  stockActionError,
  totalQuantity,
}) {
  if (activeTab === 'results') {
    return (
      <div className="space-y-6 pb-24">
        <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-premium">
          <h2 className="text-headline-lg text-primary">Chef Voting Results</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            Each meal session keeps its own menu, so you can quickly see what is live for breakfast, lunch, and dinner.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          <SummaryPanel icon={Award} title="Breakfast Menu" value={String(chefResultsBySession[0]?.meals.length ?? 0)} description={chefResultsBySession[0]?.leader?.name ?? 'No breakfast dish yet'} tone="peach" />
          <SummaryPanel icon={TrendingUp} title="Lunch Menu" value={String(chefResultsBySession[1]?.meals.length ?? 0)} description={chefResultsBySession[1]?.leader?.name ?? 'No lunch dish yet'} tone="sage" />
          <SummaryPanel icon={ChefHat} title="Dinner Menu" value={String(chefResultsBySession[2]?.meals.length ?? 0)} description={chefResultsBySession[2]?.leader?.name ?? 'No dinner dish yet'} tone="peach" />
        </section>

        <div className="space-y-5">
          {chefResultsBySession.map((session) => (
            <section key={session.id} className="overflow-hidden rounded-[2rem] border border-outline-variant/20 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-outline-variant/15 px-5 py-4">
                <div>
                  <h3 className="text-headline-md text-primary">{session.label}</h3>
                  <p className="mt-1 text-body-md text-on-surface-variant">
                    {session.leader ? `${session.leader.name} is currently leading.` : 'No dishes published yet for this session.'}
                  </p>
                </div>
                <span className="rounded-full bg-background px-4 py-2 text-label-sm font-black uppercase tracking-[0.14em] text-cocoa/45">
                  {session.meals.length} dishes
                </span>
              </div>

              {session.meals.length > 0 ? (
                session.meals.map((meal, index) => (
                  <div
                    key={`${session.id}-${meal.id}`}
                    className={`flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between ${
                      index !== session.meals.length - 1 ? 'border-b border-outline-variant/15' : ''
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-2xl font-black ${index === 0 ? 'bg-primary-container text-on-primary-container' : 'bg-background text-cocoa/55'}`}>
                        {index + 1}
                      </div>
                      <FoodImage src={meal.img} alt={meal.name} className="h-16 w-16 rounded-2xl object-cover" />
                      <div>
                        <p className="text-headline-md text-cocoa">{meal.name}</p>
                        <p className="mt-1 text-body-md text-on-surface-variant">{meal.description}</p>
                      </div>
                    </div>

                    <div className="rounded-full bg-secondary-container px-5 py-3 text-label-bold font-black uppercase tracking-[0.16em] text-on-secondary-container">
                      {meal.votes} votes
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-5 text-body-md text-on-surface-variant">
                  Publish dishes for {session.label.toLowerCase()} to start voting here.
                </div>
              )}
            </section>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryPanel icon={Box} title="Stock Items" value={String(inventory.length)} description="Raw materials already logged" tone="peach" />
        <SummaryPanel icon={Timer} title="Total Quantity" value={formatQuantity(totalQuantity)} description="Combined quantity across the kitchen" tone="sage" />
        <SummaryPanel icon={ChefHat} title="Dish Suggestions" value={String(recommendedDishes.length)} description="Meals possible from current stock" tone="peach" />
      </section>

      <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-premium">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-headline-lg text-primary">Raw Material Entry</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Add all raw materials with the right quantity, in English and Hindi, then submit the kitchen stock together.
            </p>
          </div>

          <div className="relative w-full max-w-xl">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-cocoa/35" />
            <input
              value={inventorySearch}
              onChange={(event) => onSearch(event.target.value)}
              placeholder="Search English or Hindi: cabbage, पत्ता गोभी, dal..."
              className="w-full rounded-full border border-outline-variant/30 bg-background py-4 pl-14 pr-5 text-body-md outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
            />
          </div>
        </div>

        {!inventorySearch && (
          <p className="mt-4 text-label-sm font-black uppercase tracking-[0.14em] text-cocoa/45">
            Quick picks shown. Search in English or Hindi to find more raw materials.
          </p>
        )}

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {filteredMaterials.map((item) => (
            <article key={item.key} className="rounded-[1.8rem] border border-outline-variant/20 bg-background p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary-fixed text-sm font-black uppercase tracking-[0.08em] text-primary">
                  {item.icon}
                </div>
                <div>
                  <p className="text-label-bold text-cocoa">{item.name}</p>
                  <p className="text-body-md text-on-surface-variant">{item.hindi}</p>
                  <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                    Unit: {item.unit}
                  </p>
                  {item.custom && (
                    <p className="mt-1 text-label-sm font-black uppercase tracking-[0.12em] text-secondary">
                      Add manually
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3">
                <input
                  value={quantityDrafts[item.key] ?? ''}
                  onChange={(event) => onQuantityDraftChange(item.key, event.target.value)}
                  inputMode="decimal"
                  placeholder={`Qty in ${item.unit}`}
                  className="w-full rounded-[1rem] border border-outline-variant/25 bg-white px-4 py-3 text-body-md outline-none focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
                <button
                  onClick={() => onAddToBasket(item)}
                  className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-primary text-white shadow-sm"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>

        {filteredMaterials.length === 0 && (
          <div className="mt-6 rounded-[1.5rem] border border-dashed border-outline-variant/35 bg-background p-6 text-center text-on-surface-variant">
            Type any ingredient name to create a new raw material, then enter quantity and add it.
          </div>
        )}

        {inventoryError && (
          <div className="mt-5 rounded-[1.25rem] bg-error-container px-4 py-3 text-body-md text-on-error-container">
            {inventoryError}
          </div>
        )}
      </section>

      <div className="grid gap-6 xl:grid-cols-[340px_1fr]">
        <aside className="space-y-4">
          <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="inline-flex items-center gap-2 text-headline-md text-primary">
                <ShoppingCart className="h-5 w-5" />
                Batch To Submit
              </h3>
              {basket.length > 0 && (
                <button onClick={onClearBasket} className="text-label-sm font-black uppercase tracking-[0.14em] text-error">
                  Clear
                </button>
              )}
            </div>

            {basket.length > 0 ? (
              <div className="space-y-3">
                {basket.map((item) => (
                  <div key={item.id} className="flex items-center justify-between rounded-[1.25rem] bg-background px-4 py-3">
                    <div>
                      <p className="text-label-bold text-cocoa">{item.name}</p>
                      <p className="text-body-md text-on-surface-variant">{item.hindi}</p>
                      <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                        {formatQuantity(item.quantity)} {item.unit}
                      </p>
                    </div>
                    <button onClick={() => onRemoveBasketItem(item.id)} className="rounded-full p-2 text-cocoa/40 hover:text-error">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={onBasketSubmit}
                  style={{ '--lip-color': '#6d3919' }}
                  disabled={isSubmittingStock}
                  className="lip-button flex w-full items-center justify-center gap-3 rounded-full bg-primary px-5 py-4 text-label-bold font-black uppercase tracking-[0.18em] text-white"
                >
                  <RefreshCcw className="h-5 w-5 animate-spin-slow" />
                  {isSubmittingStock ? 'Saving Stock...' : 'Submit Full Stock'}
                </button>
                {stockActionError && (
                  <p className="text-body-md text-on-error-container">{stockActionError}</p>
                )}
              </div>
            ) : (
              <p className="text-body-md text-on-surface-variant">
                Add raw materials above first. Dish recommendations update after you submit this batch.
              </p>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-6 shadow-sm">
            <div className="mb-5 flex items-center justify-between gap-4">
              <div>
                <h3 className="text-headline-md text-primary">Current Stock List</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">What the kitchen currently has available.</p>
              </div>
              <span className="rounded-full bg-background px-4 py-2 text-label-sm font-black uppercase tracking-[0.14em] text-cocoa/45">
                {filteredInventory.length} visible
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => {
                  const material = getMaterialForName(item.name);
                  return (
                    <article key={item.id} className="rounded-[1.7rem] border border-outline-variant/20 bg-background p-5">
                      <div className="flex items-start gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-[1rem] bg-primary-fixed text-sm font-black uppercase tracking-[0.08em] text-primary">
                          {material?.icon ?? 'Box'}
                        </div>
                        <div>
                          <h4 className="text-headline-md text-cocoa">{item.name}</h4>
                          <p className="text-body-md text-on-surface-variant">{material?.hindi ?? 'Raw material'}</p>
                          <p className="text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                            {formatQuantity(item.quantity)} {item.unit}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[2rem] border border-dashed border-outline-variant/40 bg-background p-8 text-center text-on-surface-variant md:col-span-2">
                  No stock items match your search.
                </div>
              )}
            </div>
          </div>

          <div className="rounded-[2rem] border border-outline-variant/20 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-headline-md text-primary">Suggested Dishes</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">
                  Pick 1 to 6 dishes from the current stock and publish them for a meal session.
                </p>
              </div>
              <button
                onClick={onPublishMenu}
                disabled={selectedDishIds.length === 0}
                className="rounded-full bg-secondary px-5 py-3 text-label-bold font-black uppercase tracking-[0.16em] text-white disabled:cursor-not-allowed disabled:opacity-45"
              >
                Review Publish
              </button>
            </div>
            <div className="mt-4 max-w-xl">
              <SessionPicker
                value={chefPublishSession}
                onChange={onChefPublishSessionChange}
                label={`Publish For: ${chefPublishSessionInfo.label}`}
              />
            </div>
            <p className="mt-3 text-label-sm font-black uppercase tracking-[0.14em] text-cocoa/45">
              {selectedDishIds.length} selected for {chefPublishSessionInfo.label} voting
            </p>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              {recommendedDishes.length > 0 ? (
                recommendedDishes.map((dish) => {
                  const selected = selectedDishIds.includes(dish.id);
                  return (
                    <button
                      key={dish.id}
                      onClick={() => onDishToggle(dish.id)}
                      className={`rounded-[1.8rem] border p-4 text-left transition-all ${
                        selected
                          ? 'border-secondary bg-secondary-container text-on-secondary-container'
                          : 'border-outline-variant/25 bg-background text-cocoa'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-headline-md">{dish.name}</p>
                          <p className="mt-2 text-body-md opacity-80">{dish.description}</p>
                          <p className="mt-3 text-label-sm font-black uppercase tracking-[0.14em] opacity-70">
                            {dish.matchedIngredients.length}/{dish.ingredients.length} ingredients ready
                          </p>
                          {dish.missingIngredients.length > 0 && (
                            <p className="mt-1 text-label-sm uppercase tracking-[0.12em] opacity-60">
                              Missing: {dish.missingIngredients.join(', ')}
                            </p>
                          )}
                        </div>
                        <span className="rounded-full bg-white/70 px-3 py-1 text-label-sm font-black uppercase tracking-[0.14em] text-secondary">
                          {selected ? 'Chosen' : 'Pick'}
                        </span>
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="rounded-[1.8rem] border border-dashed border-outline-variant/35 bg-background p-8 text-center text-on-surface-variant md:col-span-2">
                  Add stock first. Dish suggestions will appear from the ingredients you enter.
                </div>
              )}
            </div>

            {menuPublishMessage && (
              <p className="mt-4 text-label-bold uppercase tracking-[0.14em] text-secondary">{menuPublishMessage}</p>
            )}
          </div>
        </section>

      </div>
    </div>
  );
}

function AdminView({
  activeTab,
  clearStudentRegistry,
  engagementBars,
  inventory,
  isClearingStudentRegistry,
  lowStockItems,
  participationStats,
  posts,
  sentimentScore,
  studentRegistryMessage,
}) {
  if (activeTab === 'admin-social') {
    return (
      <div className="space-y-6 pb-24">
        <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-premium">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-lg text-primary">Student Social Feed</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Live comments from the student graffiti wall. New student posts appear here too.
              </p>
            </div>
            <span className="rounded-full bg-primary-container px-4 py-2 text-label-sm font-black uppercase tracking-[0.14em] text-on-primary-container">
              {posts.length} posts
            </span>
          </div>
        </section>

        <section className="overflow-hidden rounded-[2.5rem] border-[8px] border-[#1f2c48] bg-[#171717] p-4 shadow-[0_24px_70px_rgba(23,23,23,0.34)] sm:p-6">
          <div className="graffiti-wall min-h-[420px] rounded-[2rem] p-4 sm:p-6">
            <div className="flex flex-wrap items-start gap-4">
              {posts.map((post, index) => (
                <article
                  key={post.id}
                  className={`inline-flex max-w-[260px] flex-col rounded-[1.8rem] border border-white/10 px-4 py-3 uppercase tracking-[0.04em] ${WALL_STYLES[index % WALL_STYLES.length]}`}
                >
                  <span className="text-[11px] font-black opacity-75">{post.user}</span>
                  <p className="text-graffiti mt-2 text-[clamp(1.05rem,2.5vw,1.65rem)] leading-[1.05] normal-case tracking-[0.02em]">
                    {post.content}
                  </p>
                  <span className="mt-3 text-[10px] font-black uppercase opacity-70">
                    {post.time} | {post.place}
                  </span>
                </article>
              ))}
              {posts.length === 0 && (
                <div className="rounded-[1.5rem] border border-dashed border-white/20 px-5 py-4 text-white/70">
                  No student wall posts yet.
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-sm">
          <h3 className="text-headline-md text-cocoa">Readable Comments</h3>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {posts.map((post) => (
              <article key={post.id} className="rounded-[1.5rem] border border-outline-variant/20 bg-background p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <p className="text-label-bold text-cocoa">{post.user}</p>
                  <span className="rounded-full bg-white px-3 py-1 text-label-sm font-black uppercase tracking-[0.12em] text-primary">
                    {post.tag}
                  </span>
                </div>
                <p className="text-body-md text-on-surface-variant">{post.content}</p>
                <p className="mt-3 text-label-sm uppercase tracking-[0.14em] text-cocoa/45">
                  {post.time} | {post.place} | {post.likes} likes
                </p>
              </article>
            ))}
            {posts.length === 0 && (
              <div className="rounded-[1.5rem] border border-dashed border-outline-variant/30 bg-background p-6 text-center text-on-surface-variant md:col-span-2">
                Student comments will appear here after they post on the Social wall.
              </div>
            )}
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryPanel
          icon={GraduationCap}
          title="Registered Students"
          value={String(participationStats.total)}
          description="Students saved in the login registry"
          tone="peach"
        />
        <SummaryPanel
          icon={TrendingUp}
          title="Students Voted"
          value={`${participationStats.voted} / ${participationStats.total}`}
          description="Overall students who have voted in any meal session"
          tone="sage"
        />
        <SummaryPanel
          icon={User}
          title="Not Voted Yet"
          value={String(participationStats.notVoted)}
          description="Registered students still waiting to vote"
          tone="rose"
        />
      </section>

      <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-headline-md text-cocoa">Student Login Registry</h3>
            <p className="mt-1 text-body-md text-on-surface-variant">
              Use this when you want to start fresh with a clean student registration list.
            </p>
          </div>
          <button
            onClick={clearStudentRegistry}
            disabled={isClearingStudentRegistry}
            className="rounded-full border border-outline-variant/30 bg-background px-5 py-3 text-label-bold font-black uppercase tracking-[0.14em] text-primary disabled:cursor-not-allowed disabled:opacity-45"
          >
            {isClearingStudentRegistry ? 'Clearing...' : 'Clear Student Registry'}
          </button>
        </div>
        {studentRegistryMessage && (
          <p className="mt-4 text-body-md text-secondary">{studentRegistryMessage}</p>
        )}
      </section>

      <section className="rounded-[2rem] border border-outline-variant/25 bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <h3 className="text-headline-md text-cocoa">Daily Participation</h3>
              <p className="mt-1 text-body-md text-on-surface-variant">Weekly student engagement trend</p>
            </div>
            <div className="inline-flex items-center gap-1 text-label-bold text-secondary">
              <TrendingUp className="h-4 w-4" />
              +5% vs last week
            </div>
          </div>

          <div className="flex h-56 items-end gap-3">
            {engagementBars.map((value, index) => (
              <div key={value + index} className="flex flex-1 flex-col items-center gap-2">
                <div
                  className={`w-full rounded-t-full ${index === 3 ? 'bg-primary' : 'bg-secondary-container'}`}
                  style={{ height: `${Math.max(18, value * 1.8)}px` }}
                />
                <span className={`text-label-sm ${index === 3 ? 'font-black text-primary' : 'text-cocoa/55'}`}>
                  {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                </span>
              </div>
            ))}
          </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-[1rem] bg-error-container p-2">
              <AlertTriangle className="h-5 w-5 text-error" />
            </div>
            <h3 className="text-headline-md text-cocoa">Critical Stock Alerts</h3>
          </div>
          <span className="text-label-bold text-cocoa/55">{lowStockItems.length} urgent actions</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {lowStockItems.length > 0 ? (
            lowStockItems.map((item) => (
              <article
                key={item.id}
                className="flex flex-col justify-between rounded-[2rem] border border-error/10 bg-white p-5 shadow-sm"
              >
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div>
                    <p className="text-label-sm font-black uppercase tracking-[0.14em] text-error">Low Inventory</p>
                    <h4 className="mt-1 text-headline-md text-cocoa">{item.name}</h4>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] border border-outline-variant/25 bg-background">
                    <Box className="h-5 w-5 text-primary" />
                  </div>
                </div>

                <div>
                  <p className="text-body-md text-on-surface-variant">
                    Only {formatQuantity(item.quantity)} {item.unit} remaining.
                  </p>
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-container">
                    <div
                      className="h-full rounded-full bg-error"
                      style={{ width: `${Math.max(8, (Number(item.quantity) / Math.max(getEffectiveParLevel(item) * 2, 1)) * 100)}%` }}
                    />
                  </div>
                </div>

                <button className="mt-5 rounded-full bg-primary px-5 py-3 text-label-bold font-black uppercase tracking-[0.16em] text-white">
                  Restock
                </button>
              </article>
            ))
          ) : (
            <div className="rounded-[2rem] border border-outline-variant/25 bg-white p-8 text-center text-on-surface-variant md:col-span-2 xl:col-span-3">
              No critical stock alerts right now. All {inventory.length} tracked items are stable.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function StatCard({ title, value, tone }) {
  const toneClass =
    tone === 'sage'
      ? 'bg-secondary-container text-on-secondary-container'
      : tone === 'rose'
        ? 'bg-error-container text-on-error-container'
        : 'bg-primary-container text-on-primary-container';

  return (
    <div className={`rounded-[1.75rem] p-5 shadow-sm ${toneClass}`}>
      <p className="text-label-sm font-black uppercase tracking-[0.16em] opacity-70">{title}</p>
      <p className="mt-3 text-headline-lg">{value}</p>
    </div>
  );
}

function SummaryPanel({ icon: Icon, title, value, description, tone }) {
  const toneClass =
    tone === 'sage'
      ? 'bg-secondary-container text-on-secondary-container'
      : tone === 'rose'
        ? 'bg-error-container text-on-error-container'
        : 'bg-primary-container text-on-primary-container';

  return (
    <div className={`rounded-[2rem] p-6 shadow-premium ${toneClass}`}>
      <Icon className="h-8 w-8" />
      <p className="mt-4 text-label-sm font-black uppercase tracking-[0.18em] opacity-75">{title}</p>
      <p className="mt-2 text-headline-xl">{value}</p>
      <p className="mt-2 text-body-md opacity-80">{description}</p>
    </div>
  );
}

function PodiumCard({ rank, meal, height, tone, highlight = false }) {
  if (!meal) return null;

  return (
    <div className={`flex flex-1 items-end ${highlight ? 'scale-[1.04]' : ''}`}>
      <div className={`flex w-full flex-col items-center rounded-t-[2.2rem] p-5 shadow-sm ${tone} ${height}`}>
        {highlight && <Star className="mb-2 h-10 w-10 fill-primary text-primary" />}
        <span className="text-headline-md text-primary">#{rank}</span>
        <p className="mt-2 text-center text-label-bold text-cocoa">{meal.name}</p>
        <p className="mt-2 text-label-sm uppercase tracking-[0.14em] text-cocoa/50">{meal.votes} votes</p>
      </div>
    </div>
  );
}

export default App;

