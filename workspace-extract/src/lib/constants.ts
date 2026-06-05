import { SITE_NAME, SITE_TAGLINE } from "@/lib/site-config";

export const APP_NAME = SITE_NAME;
export const APP_DESCRIPTION = `${SITE_TAGLINE} — Gamified Self-Growth Platform`;
export const APP_VERSION = "2.0.0";

export const NAV_ITEMS = [
  { nameKey: "nav.home", href: "/home", icon: "Home" },
  { nameKey: "nav.learning", href: "/learn", icon: "BookOpen" },
  { nameKey: "nav.fitness", href: "/fitness", icon: "Dumbbell" },
  { nameKey: "nav.content", href: "/content", icon: "PenTool" },
  { nameKey: "nav.time", href: "/time", icon: "Clock" },
  { nameKey: "nav.feed", href: "/feed", icon: "Rss" },
  { nameKey: "nav.discover", href: "/discover", icon: "Compass" },
  { nameKey: "nav.leaderboard", href: "/leaderboard", icon: "Trophy" },
  { nameKey: "nav.analytics", href: "/analytics", icon: "BarChart3" },
  { nameKey: "nav.settings", href: "/settings", icon: "Settings" },
];

export const MOBILE_TABS = [
  { nameKey: "nav.home", href: "/home", icon: "Home" },
  { nameKey: "nav.feed", href: "/feed", icon: "Rss" },
  { nameKey: "nav.discover", href: "/discover", icon: "Compass" },
  { nameKey: "nav.messages", href: "/messages", icon: "MessageCircle" },
  { nameKey: "nav.more", href: "/more", icon: "Menu" },
];

export const CATEGORIES = ["learning", "fitness", "content", "time", "social"] as const;

// ── Food Database (all values per 100g) ──
// Every entry stores macros per 100g for consistent multiplier math.
// multiplier = userGrams / 100
export const FOOD_DATABASE = [
  // ─── Grains & Staples ───
  { name: "Rice", calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4 },           // white, cooked
  { name: "Brown Rice", calories: 112, protein: 2.6, carbs: 24, fat: 0.9, fiber: 1.8 },        // cooked
  { name: "Basmati Rice", calories: 130, protein: 3.6, carbs: 27.5, fat: 0.2, fiber: 0.5 },    // cooked
  { name: "Jeera Rice", calories: 155, protein: 3.0, carbs: 26, fat: 4.5, fiber: 0.5 },        // cooked with cumin/ghee
  { name: "Pulao", calories: 145, protein: 3.2, carbs: 24, fat: 4.2, fiber: 0.6 },             // cooked pilaf
  { name: "Biryani", calories: 165, protein: 6.5, carbs: 22, fat: 6.0, fiber: 0.8 },           // chicken biryani
  { name: "Chapati", calories: 240, protein: 7.0, carbs: 36, fat: 8.0, fiber: 4.0 },           // whole wheat, per 100g
  { name: "Roti", calories: 240, protein: 7.0, carbs: 36, fat: 8.0, fiber: 4.0 },              // same as chapati
  { name: "Paratha", calories: 300, protein: 6.5, carbs: 34, fat: 15, fiber: 3.5 },             // stuffed/plain
  { name: "Naan", calories: 280, protein: 8.0, carbs: 44, fat: 7.5, fiber: 2.5 },
  { name: "Puri", calories: 340, protein: 6.0, carbs: 40, fat: 17, fiber: 2.0 },
  { name: "Dosa", calories: 170, protein: 4.0, carbs: 26, fat: 5.5, fiber: 1.5 },              // plain
  { name: "Idli", calories: 112, protein: 3.2, carbs: 24.5, fat: 0.2, fiber: 1.0 },           // steamed (PDF verified)
  { name: "Upma", calories: 150, protein: 3.5, carbs: 22, fat: 5.5, fiber: 1.5 },
  { name: "Poha", calories: 180, protein: 3.0, carbs: 32, fat: 4.5, fiber: 1.0 },              // flattened rice (PDF verified)
  { name: "Pasta", calories: 131, protein: 5.0, carbs: 25, fat: 1.1, fiber: 1.8 },             // cooked
  { name: "Bread", calories: 265, protein: 9.0, carbs: 49, fat: 3.2, fiber: 2.7 },             // white
  { name: "Whole Wheat Bread", calories: 247, protein: 13, carbs: 41, fat: 3.4, fiber: 7.0 },
  { name: "Oats", calories: 389, protein: 16.9, carbs: 66.3, fat: 6.9, fiber: 10.6 },          // raw/dry
  { name: "Oatmeal", calories: 68, protein: 2.4, carbs: 12, fat: 1.4, fiber: 1.7 },            // cooked with water
  { name: "Quinoa", calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8 },          // cooked
  { name: "Couscous", calories: 112, protein: 3.8, carbs: 23.2, fat: 0.2, fiber: 1.4 },        // cooked
  { name: "Noodles", calories: 140, protein: 4.5, carbs: 26, fat: 2.0, fiber: 1.0 },            // cooked
  { name: "Maggi Noodles", calories: 410, protein: 9.0, carbs: 55, fat: 17, fiber: 1.5 },       // dry, with tastemaker
  { name: "Vermicelli", calories: 155, protein: 3.5, carbs: 28, fat: 3.5, fiber: 0.8 },         // cooked (semiya)
  { name: "Ragi Mudde", calories: 130, protein: 3.0, carbs: 27, fat: 0.5, fiber: 4.0 },        // finger millet ball
  { name: "Jowar Roti", calories: 210, protein: 6.5, carbs: 38, fat: 4.5, fiber: 5.0 },
  { name: "Bajra Roti", calories: 215, protein: 6.0, carbs: 37, fat: 5.0, fiber: 4.5 },

  // ─── Proteins (Meat, Poultry, Seafood) ───
  { name: "Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { name: "Chicken Thigh", calories: 209, protein: 26, carbs: 0, fat: 10.9, fiber: 0 },
  { name: "Chicken Curry", calories: 145, protein: 14, carbs: 5, fat: 7.5, fiber: 1.0 },
  { name: "Tandoori Chicken", calories: 165, protein: 27, carbs: 2, fat: 5.5, fiber: 0.5 },
  { name: "Butter Chicken", calories: 245, protein: 14.5, carbs: 4.5, fat: 19, fiber: 0.8 },   // (PDF verified)
  { name: "Fish Curry", calories: 120, protein: 15, carbs: 5, fat: 4.5, fiber: 0.8 },
  { name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { name: "Tuna", calories: 132, protein: 28, carbs: 0, fat: 1.3, fiber: 0 },                  // fresh
  { name: "Shrimp", calories: 99, protein: 24, carbs: 0.2, fat: 0.3, fiber: 0 },
  { name: "Turkey Breast", calories: 135, protein: 30, carbs: 0, fat: 1, fiber: 0 },
  { name: "Egg", calories: 155, protein: 13, carbs: 1.1, fat: 11, fiber: 0 },                   // whole, raw
  { name: "Egg White", calories: 52, protein: 11, carbs: 0.7, fat: 0.2, fiber: 0 },
  { name: "Mutton Curry", calories: 195, protein: 22, carbs: 4, fat: 9, fiber: 0.8 },
  { name: "Keema", calories: 210, protein: 20, carbs: 6, fat: 11, fiber: 1.0 },                 // minced meat
  { name: "Prawns Masala", calories: 125, protein: 20, carbs: 4, fat: 3.5, fiber: 0.8 },

  // ─── Legumes & Lentils (Indian Dal) ───
  { name: "Dal", calories: 120, protein: 8, carbs: 18, fat: 2.5, fiber: 5.0 },                  // generic cooked dal
  { name: "Dal Tadka", calories: 130, protein: 7.5, carbs: 17, fat: 4.0, fiber: 4.5 },          // tempered
  { name: "Toor Dal", calories: 120, protein: 8.0, carbs: 18, fat: 2.0, fiber: 5.5 },           // cooked
  { name: "Moong Dal", calories: 105, protein: 7.0, carbs: 19, fat: 0.3, fiber: 4.5 },          // cooked (PDF verified)
  { name: "Masoor Dal", calories: 116, protein: 9.0, carbs: 20, fat: 0.4, fiber: 5.0 },         // red lentil, cooked (PDF verified)
  { name: "Chana Dal", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 6.0 },          // cooked (PDF verified)
  { name: "Urad Dal", calories: 120, protein: 9.0, carbs: 17, fat: 2.0, fiber: 5.0 },           // cooked
  { name: "Rajma", calories: 140, protein: 9.0, carbs: 25, fat: 0.6, fiber: 6.5 },              // kidney beans, cooked (PDF verified)
  { name: "Chole", calories: 140, protein: 8.5, carbs: 23, fat: 3.0, fiber: 6.5 },              // chickpea curry
  { name: "Chickpeas", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 7.6 },          // cooked
  { name: "Lentils", calories: 116, protein: 9.0, carbs: 20, fat: 0.4, fiber: 7.9 },            // cooked
  { name: "Black Beans", calories: 132, protein: 8.9, carbs: 24, fat: 0.5, fiber: 8.7 },        // cooked
  { name: "Kidney Beans", calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4 },     // cooked
  { name: "Sambhar", calories: 95, protein: 5.0, carbs: 13, fat: 2.5, fiber: 3.5 },
  { name: "Rasam", calories: 35, protein: 1.5, carbs: 5, fat: 1.0, fiber: 1.0 },

  // ─── Vegetables ───
  { name: "Broccoli", calories: 34, protein: 2.8, carbs: 7, fat: 0.4, fiber: 2.6 },
  { name: "Spinach", calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2 },
  { name: "Potato", calories: 77, protein: 2.0, carbs: 17, fat: 0.1, fiber: 2.2 },              // boiled
  { name: "Sweet Potato", calories: 86, protein: 1.6, carbs: 20, fat: 0.1, fiber: 3.0 },
  { name: "Aloo Gobi", calories: 95, protein: 2.5, carbs: 12, fat: 4.0, fiber: 2.5 },
  { name: "Aloo Matar", calories: 100, protein: 3.0, carbs: 14, fat: 3.5, fiber: 2.5 },
  { name: "Bhindi Masala", calories: 90, protein: 2.5, carbs: 8, fat: 6.0, fiber: 3.0 },        // okra
  { name: "Baingan Bharta", calories: 75, protein: 2.0, carbs: 7, fat: 4.5, fiber: 2.5 },       // smoked eggplant
  { name: "Palak Paneer", calories: 160, protein: 9.0, carbs: 5.0, fat: 12.0, fiber: 2.5 },   // (PDF verified)
  { name: "Mixed Veg Curry", calories: 85, protein: 2.5, carbs: 10, fat: 4.0, fiber: 2.5 },
  { name: "Cauliflower", calories: 25, protein: 1.9, carbs: 5, fat: 0.3, fiber: 2.0 },
  { name: "Cabbage", calories: 25, protein: 1.3, carbs: 5.8, fat: 0.1, fiber: 2.5 },
  { name: "Carrot", calories: 41, protein: 0.9, carbs: 10, fat: 0.2, fiber: 2.8 },
  { name: "Capsicum", calories: 31, protein: 1.0, carbs: 6, fat: 0.3, fiber: 1.7 },             // bell pepper
  { name: "Tomato", calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2 },
  { name: "Onion", calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7 },
  { name: "Green Peas", calories: 81, protein: 5.4, carbs: 14, fat: 0.4, fiber: 5.1 },          // cooked
  { name: "Corn", calories: 96, protein: 3.4, carbs: 21, fat: 1.5, fiber: 2.4 },                // sweet corn
  { name: "Mushroom", calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, fiber: 1.0 },
  { name: "Avocado", calories: 160, protein: 2.0, carbs: 8.5, fat: 14.7, fiber: 6.7 },
  { name: "Salad", calories: 20, protein: 1.5, carbs: 3.5, fat: 0.2, fiber: 1.5 },              // mixed green

  // ─── Paneer & Dairy ───
  { name: "Paneer", calories: 265, protein: 18.3, carbs: 1.2, fat: 20.8, fiber: 0 },            // raw
  { name: "Paneer Butter Masala", calories: 225, protein: 8.5, carbs: 6.5, fat: 18.5, fiber: 1.0 }, // (PDF verified)
  { name: "Paneer Tikka", calories: 200, protein: 16, carbs: 5, fat: 13, fiber: 1.0 },
  { name: "Milk", calories: 42, protein: 3.4, carbs: 5, fat: 1, fiber: 0 },                     // whole, per 100ml
  { name: "Skimmed Milk", calories: 34, protein: 3.4, carbs: 5, fat: 0.1, fiber: 0 },           // per 100ml
  { name: "Yogurt", calories: 59, protein: 3.5, carbs: 3.6, fat: 3.3, fiber: 0 },               // plain, whole
  { name: "Greek Yogurt", calories: 59, protein: 10, carbs: 3.6, fat: 0.7, fiber: 0 },
  { name: "Curd", calories: 60, protein: 3.5, carbs: 4, fat: 3.0, fiber: 0 },                   // Indian dahi
  { name: "Buttermilk", calories: 20, protein: 1.5, carbs: 2.5, fat: 0.5, fiber: 0 },           // chaas
  { name: "Lassi", calories: 65, protein: 3.0, carbs: 8, fat: 2.0, fiber: 0 },                  // sweet
  { name: "Cheese", calories: 402, protein: 25, carbs: 1.3, fat: 33, fiber: 0 },                // cheddar
  { name: "Cottage Cheese", calories: 98, protein: 11, carbs: 3.4, fat: 4.3, fiber: 0 },
  { name: "Butter", calories: 717, protein: 0.9, carbs: 0.1, fat: 81, fiber: 0 },
  { name: "Ghee", calories: 883, protein: 0, carbs: 0, fat: 99.8, fiber: 0 },
  { name: "Cream", calories: 195, protein: 2.1, carbs: 3.9, fat: 19, fiber: 0 },
  { name: "Paneer Bhurji", calories: 220, protein: 15, carbs: 5, fat: 15, fiber: 1.0 },

  // ─── Fruits ───
  { name: "Banana", calories: 89, protein: 1.1, carbs: 23, fat: 0.3, fiber: 2.6 },
  { name: "Apple", calories: 52, protein: 0.3, carbs: 14, fat: 0.2, fiber: 2.4 },
  { name: "Mango", calories: 60, protein: 0.8, carbs: 15, fat: 0.4, fiber: 1.6 },
  { name: "Orange", calories: 47, protein: 0.9, carbs: 12, fat: 0.1, fiber: 2.4 },
  { name: "Papaya", calories: 43, protein: 0.5, carbs: 11, fat: 0.3, fiber: 1.7 },
  { name: "Watermelon", calories: 30, protein: 0.6, carbs: 8, fat: 0.2, fiber: 0.4 },
  { name: "Grapes", calories: 69, protein: 0.7, carbs: 18, fat: 0.2, fiber: 0.9 },
  { name: "Pineapple", calories: 50, protein: 0.5, carbs: 13, fat: 0.1, fiber: 1.4 },
  { name: "Pomegranate", calories: 83, protein: 1.7, carbs: 19, fat: 1.2, fiber: 4.0 },
  { name: "Guava", calories: 68, protein: 2.6, carbs: 14, fat: 1.0, fiber: 5.4 },
  { name: "Chikoo", calories: 83, protein: 0.4, carbs: 20, fat: 1.1, fiber: 5.3 },              // sapota
  { name: "Custard Apple", calories: 94, protein: 2.0, carbs: 23, fat: 0.3, fiber: 4.4 },       // sitaphal
  { name: "Strawberry", calories: 32, protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0 },
  { name: "Kiwi", calories: 61, protein: 1.1, carbs: 15, fat: 0.5, fiber: 3.0 },
  { name: "Pear", calories: 57, protein: 0.4, carbs: 15, fat: 0.1, fiber: 3.1 },
  { name: "Peach", calories: 39, protein: 0.9, carbs: 10, fat: 0.3, fiber: 1.5 },
  { name: "Coconut", calories: 354, protein: 3.3, carbs: 15, fat: 33, fiber: 9.0 },             // fresh, meat only
  { name: "Dates", calories: 282, protein: 2.5, carbs: 75, fat: 0.4, fiber: 8.0 },
  { name: "Jackfruit", calories: 95, protein: 1.7, carbs: 23, fat: 0.6, fiber: 1.5 },

  // ─── Nuts & Seeds ───
  { name: "Almonds", calories: 579, protein: 21.1, carbs: 21.6, fat: 49.9, fiber: 12.5 },      // (PDF verified)
  { name: "Walnuts", calories: 654, protein: 15, carbs: 14, fat: 65, fiber: 6.7 },
  { name: "Cashews", calories: 553, protein: 18, carbs: 30, fat: 44, fiber: 3.3 },
  { name: "Peanuts", calories: 567, protein: 25.8, carbs: 16.1, fat: 49.2, fiber: 8.5 },      // (PDF verified)
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6.0 },
  { name: "Pistachios", calories: 562, protein: 20, carbs: 28, fat: 45, fiber: 10.6 },
  { name: "Mixed Nuts", calories: 607, protein: 20, carbs: 18, fat: 54, fiber: 7.0 },
  { name: "Chia Seeds", calories: 486, protein: 17, carbs: 42, fat: 31, fiber: 34.4 },
  { name: "Flax Seeds", calories: 534, protein: 18, carbs: 29, fat: 42, fiber: 27.3 },
  { name: "Sunflower Seeds", calories: 584, protein: 21, carbs: 20, fat: 51, fiber: 8.6 },
  { name: "Coconut Dry", calories: 660, protein: 6.9, carbs: 23, fat: 64, fiber: 16.3 },        // copra/desiccated

  // ─── Snacks & Street Food ───
  { name: "Samosa", calories: 308, protein: 4.5, carbs: 32, fat: 18, fiber: 2.5 },             // (PDF verified)
  { name: "Pakora", calories: 230, protein: 4.5, carbs: 22, fat: 14, fiber: 2.0 },              // onion/bhajji
  { name: "Vada Pav", calories: 290, protein: 6.0, carbs: 42, fat: 11, fiber: 2.5 },           // (PDF verified)
  { name: "Pav Bhaji", calories: 190, protein: 5.0, carbs: 25, fat: 8.0, fiber: 3.0 },
  { name: "Bhel Puri", calories: 180, protein: 4.0, carbs: 28, fat: 6.0, fiber: 2.0 },
  { name: "Pani Puri", calories: 140, protein: 3.0, carbs: 22, fat: 4.5, fiber: 1.5 },          // golgappa
  { name: "Dhokla", calories: 160, protein: 6.2, carbs: 22, fat: 5.1, fiber: 2.0 },            // (PDF verified)
  { name: "Kachori", calories: 280, protein: 4.5, carbs: 28, fat: 16, fiber: 2.0 },
  { name: "Aloo Tikki", calories: 210, protein: 3.5, carbs: 26, fat: 10, fiber: 2.0 },
  { name: "Masala Dosa", calories: 165, protein: 3.5, carbs: 26, fat: 5.5, fiber: 2.0 },       // (PDF verified)
  { name: "Medu Vada", calories: 333, protein: 8.5, carbs: 24, fat: 22, fiber: 2.0 },          // (PDF verified)
  { name: "Chips", calories: 536, protein: 7.0, carbs: 53, fat: 35, fiber: 3.0 },               // potato crisps
  { name: "Popcorn", calories: 375, protein: 11, carbs: 74, fat: 4.3, fiber: 10.5 },             // air-popped, no butter
  { name: "Nachos", calories: 320, protein: 6.0, carbs: 38, fat: 16, fiber: 3.0 },
  { name: "French Fries", calories: 312, protein: 3.4, carbs: 41, fat: 15, fiber: 3.8 },
  { name: "Pizza", calories: 266, protein: 11, carbs: 33, fat: 10, fiber: 2.3 },
  { name: "Burger", calories: 295, protein: 17, carbs: 24, fat: 14, fiber: 1.3 },
  { name: "Sandwich", calories: 230, protein: 9.0, carbs: 28, fat: 9.0, fiber: 2.0 },
  { name: "Wrap", calories: 260, protein: 10, carbs: 30, fat: 10, fiber: 2.5 },

  // ─── Sweets & Desserts ───
  { name: "Gulab Jamun", calories: 330, protein: 3.0, carbs: 48, fat: 14, fiber: 0.5 },
  { name: "Rasgulla", calories: 186, protein: 4.0, carbs: 37, fat: 2.5, fiber: 0 },
  { name: "Jalebi", calories: 380, protein: 2.5, carbs: 60, fat: 15, fiber: 0.5 },
  { name: "Ladoo", calories: 380, protein: 5.0, carbs: 50, fat: 17, fiber: 1.5 },               // besan/motichoor
  { name: "Barfi", calories: 370, protein: 6.0, carbs: 48, fat: 17, fiber: 0.5 },
  { name: "Halwa", calories: 280, protein: 3.5, carbs: 40, fat: 12, fiber: 1.0 },               // suji/gajar
  { name: "Kheer", calories: 130, protein: 4.0, carbs: 20, fat: 3.5, fiber: 0.5 },              // rice pudding
  { name: "Rice Kheer", calories: 130, protein: 4.0, carbs: 20, fat: 3.5, fiber: 0.5 },
  { name: "Payasam", calories: 135, protein: 3.5, carbs: 22, fat: 3.0, fiber: 0.5 },
  { name: "Rasmalai", calories: 195, protein: 7.0, carbs: 26, fat: 7.5, fiber: 0.3 },
  { name: "Ice Cream", calories: 207, protein: 3.5, carbs: 24, fat: 11, fiber: 0 },
  { name: "Chocolate", calories: 546, protein: 5.0, carbs: 60, fat: 31, fiber: 2.5 },           // milk
  { name: "Dark Chocolate", calories: 598, protein: 7.8, carbs: 46, fat: 43, fiber: 10.9 },
  { name: "Cookie", calories: 488, protein: 5.5, carbs: 65, fat: 23, fiber: 1.5 },
  { name: "Cake", calories: 348, protein: 5.0, carbs: 52, fat: 14, fiber: 0.5 },
  { name: "Brownie", calories: 405, protein: 5.0, carbs: 50, fat: 21, fiber: 1.5 },
  { name: "Donut", calories: 421, protein: 5.0, carbs: 47, fat: 23, fiber: 1.0 },
  { name: "Mysore Pak", calories: 440, protein: 4.0, carbs: 42, fat: 27, fiber: 0.5 },

  // ─── Beverages ───
  { name: "Green Tea", calories: 1, protein: 0, carbs: 0, fat: 0, fiber: 0 },                   // per 100ml
  { name: "Black Coffee", calories: 2, protein: 0.3, carbs: 0, fat: 0, fiber: 0 },              // per 100ml
  { name: "Chai", calories: 40, protein: 1.5, carbs: 5, fat: 1.5, fiber: 0 },                   // per 100ml, with milk+sugar
  { name: "Masala Chai", calories: 45, protein: 1.5, carbs: 6, fat: 1.5, fiber: 0 },            // per 100ml
  { name: "Lassi", calories: 65, protein: 3.0, carbs: 8, fat: 2.0, fiber: 0 },                  // per 100ml
  { name: "Mango Lassi", calories: 90, protein: 2.5, carbs: 14, fat: 2.0, fiber: 0.3 },         // per 100ml
  { name: "Nimbu Pani", calories: 20, protein: 0.1, carbs: 5, fat: 0, fiber: 0 },               // lemonade, per 100ml
  { name: "Coconut Water", calories: 19, protein: 0.7, carbs: 3.7, fat: 0.2, fiber: 1.1 },      // per 100ml
  { name: "Juice", calories: 45, protein: 0.5, carbs: 10, fat: 0.1, fiber: 0.3 },               // orange, per 100ml
  { name: "Mango Juice", calories: 51, protein: 0.4, carbs: 13, fat: 0.1, fiber: 0.3 },         // per 100ml
  { name: "Sugarcane Juice", calories: 38, protein: 0.3, carbs: 9.5, fat: 0, fiber: 0.2 },      // per 100ml
  { name: "Protein Shake", calories: 100, protein: 20, carbs: 5, fat: 2.0, fiber: 1.0 },        // whey with water/milk
  { name: "Smoothie", calories: 60, protein: 2.0, carbs: 10, fat: 1.5, fiber: 1.5 },            // fruit, per 100ml
  { name: "Soda", calories: 41, protein: 0, carbs: 10.6, fat: 0, fiber: 0 },                    // cola, per 100ml
  { name: "Energy Drink", calories: 45, protein: 0, carbs: 11, fat: 0, fiber: 0 },              // per 100ml
  { name: "Beer", calories: 43, protein: 0.5, carbs: 3.6, fat: 0, fiber: 0 },                   // per 100ml
  { name: "Wine", calories: 83, protein: 0.1, carbs: 2.6, fat: 0, fiber: 0 },                   // per 100ml

  // ─── Protein Supplements ───
  { name: "Whey Protein", calories: 400, protein: 80, carbs: 10, fat: 5, fiber: 0 },             // dry powder, per 100g
  { name: "Whey Protein Isolate", calories: 370, protein: 87, carbs: 3, fat: 1.5, fiber: 0 },    // dry powder
  { name: "Casein Protein", calories: 380, protein: 78, carbs: 9, fat: 4.5, fiber: 0 },         // dry powder
  { name: "Soy Protein", calories: 340, protein: 73, carbs: 10, fat: 3, fiber: 2.0 },           // dry powder
  { name: "Protein Bar", calories: 355, protein: 35, carbs: 40, fat: 12, fiber: 5.0 },          // per 100g

  // ─── Condiments & Oils ───
  { name: "Olive Oil", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Coconut Oil", calories: 862, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Mustard Oil", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Sunflower Oil", calories: 884, protein: 0, carbs: 0, fat: 100, fiber: 0 },
  { name: "Honey", calories: 304, protein: 0.3, carbs: 82, fat: 0, fiber: 0.2 },
  { name: "Sugar", calories: 387, protein: 0, carbs: 100, fat: 0, fiber: 0 },
  { name: "Jaggery", calories: 383, protein: 0.4, carbs: 98, fat: 0.1, fiber: 0 },              // gur
  { name: "Soy Sauce", calories: 53, protein: 8.1, carbs: 4.9, fat: 0, fiber: 0.8 },
  { name: "Ketchup", calories: 112, protein: 1.7, carbs: 26, fat: 0.1, fiber: 0.3 },
  { name: "Mayonnaise", calories: 680, protein: 1.0, carbs: 0.6, fat: 75, fiber: 0 },
  { name: "Pickle", calories: 130, protein: 1.5, carbs: 12, fat: 8.0, fiber: 2.0 },             // Indian achar
  { name: "Chutney", calories: 90, protein: 1.0, carbs: 18, fat: 1.0, fiber: 2.0 },             // green/mint
  { name: "Raita", calories: 50, protein: 3.0, carbs: 4, fat: 2.0, fiber: 0.5 },

  // ─── Tofu & Soy ───
  { name: "Tofu", calories: 76, protein: 8, carbs: 1.9, fat: 4.8, fiber: 0.3 },
  { name: "Tempeh", calories: 192, protein: 20, carbs: 8, fat: 11, fiber: 0 },
  { name: "Edamame", calories: 121, protein: 11, carbs: 8.9, fat: 5.2, fiber: 5.2 },
  { name: "Soy Milk", calories: 33, protein: 2.8, carbs: 1.2, fat: 1.8, fiber: 0.4 },           // per 100ml

  // ─── Breakfast ───
  { name: "Cornflakes", calories: 357, protein: 7.0, carbs: 84, fat: 0.4, fiber: 3.0 },         // dry
  { name: "Muesli", calories: 375, protein: 11, carbs: 66, fat: 8.5, fiber: 7.5 },              // dry
  { name: "Granola", calories: 471, protein: 10, carbs: 64, fat: 20, fiber: 5.0 },              // dry
  { name: "Pancakes", calories: 227, protein: 6.4, carbs: 28, fat: 10, fiber: 1.0 },
  { name: "Waffles", calories: 291, protein: 7.9, carbs: 33, fat: 14, fiber: 1.0 },
  { name: "French Toast", calories: 229, protein: 8.0, carbs: 24, fat: 11, fiber: 1.0 },

  // ─── Additional Indian Curries & Gravies ───
  { name: "Kadhai Paneer", calories: 220, protein: 12, carbs: 8, fat: 16, fiber: 1.5 },
  { name: "Shahi Paneer", calories: 230, protein: 11, carbs: 9, fat: 17, fiber: 1.0 },
  { name: "Matar Paneer", calories: 200, protein: 10, carbs: 10, fat: 13, fiber: 2.0 },
  { name: "Paneer Do Pyaza", calories: 215, protein: 11, carbs: 9, fat: 14, fiber: 1.5 },
  { name: "Malai Kofta", calories: 240, protein: 7, carbs: 12, fat: 18, fiber: 1.5 },
  { name: "Navratan Korma", calories: 195, protein: 6, carbs: 14, fat: 13, fiber: 2.5 },
  { name: "Dal Makhani", calories: 145, protein: 7, carbs: 16, fat: 6, fiber: 4.0 },
  { name: "Dal Palak", calories: 110, protein: 7, carbs: 14, fat: 3, fiber: 4.0 },
  { name: "Aloo Palak", calories: 110, protein: 3, carbs: 13, fat: 5, fiber: 2.5 },
  { name: "Gobi Manchurian", calories: 180, protein: 4, carbs: 20, fat: 9, fiber: 2.0 },
  { name: "Chicken Do Pyaza", calories: 170, protein: 18, carbs: 7, fat: 8, fiber: 1.5 },
  { name: "Chicken Korma", calories: 190, protein: 16, carbs: 8, fat: 11, fiber: 1.0 },
  { name: "Egg Curry", calories: 145, protein: 10, carbs: 6, fat: 9, fiber: 1.0 },
  { name: "Kadhi", calories: 90, protein: 3, carbs: 10, fat: 4, fiber: 1.0 },
  { name: "Kadhi Pakora", calories: 120, protein: 4, carbs: 12, fat: 6, fiber: 1.5 },
  { name: "Mutton Keema", calories: 220, protein: 20, carbs: 6, fat: 13, fiber: 1.0 },
  { name: "Fish Fry", calories: 185, protein: 18, carbs: 8, fat: 9, fiber: 0.5 },
  { name: "Prawn Curry", calories: 130, protein: 18, carbs: 5, fat: 4, fiber: 0.8 },
  { name: "Chicken 65", calories: 230, protein: 20, carbs: 8, fat: 13, fiber: 0.8 },
  { name: "Chilli Chicken", calories: 200, protein: 18, carbs: 9, fat: 10, fiber: 1.0 },
  { name: "Mutton Rogan Josh", calories: 205, protein: 22, carbs: 5, fat: 11, fiber: 0.8 },
  { name: "Hyderabadi Biryani", calories: 175, protein: 8, carbs: 23, fat: 6, fiber: 1.0 },
  { name: "Veg Biryani", calories: 155, protein: 4, carbs: 24, fat: 5, fiber: 1.5 },
  { name: "Mutton Biryani", calories: 195, protein: 12, carbs: 21, fat: 8, fiber: 0.8 },
  { name: "Egg Biryani", calories: 170, protein: 8, carbs: 24, fat: 5, fiber: 0.8 },

  // ─── Additional Indian Breads & Staples ───
  { name: "Kulcha", calories: 300, protein: 8, carbs: 46, fat: 8, fiber: 2.0 },
  { name: "Bhatura", calories: 330, protein: 7, carbs: 42, fat: 15, fiber: 1.5 },
  { name: "Appam", calories: 120, protein: 2, carbs: 24, fat: 1, fiber: 0.5 },
  { name: "Puttu", calories: 170, protein: 3, carbs: 32, fat: 3, fiber: 2.0 },
  { name: "Ragi Roti", calories: 200, protein: 5, carbs: 36, fat: 4, fiber: 5.0 },
  { name: "Thalipeeth", calories: 220, protein: 7, carbs: 32, fat: 7, fiber: 4.0 },
  { name: "Thepla", calories: 260, protein: 7, carbs: 34, fat: 11, fiber: 3.5 },
  { name: "Lachha Paratha", calories: 320, protein: 6, carbs: 36, fat: 17, fiber: 2.0 },
  { name: "Missi Roti", calories: 230, protein: 8, carbs: 33, fat: 8, fiber: 4.5 },

  // ─── Additional Indian Snacks ───
  { name: "Sev Puri", calories: 170, protein: 3, carbs: 22, fat: 8, fiber: 1.5 },
  { name: "Ragda Pattice", calories: 200, protein: 5, carbs: 26, fat: 8, fiber: 2.5 },
  { name: "Dahi Puri", calories: 150, protein: 3, carbs: 20, fat: 6, fiber: 1.5 },
  { name: "Khandvi", calories: 130, protein: 5, carbs: 16, fat: 5, fiber: 1.0 },
  { name: "Thecha", calories: 80, protein: 2, carbs: 8, fat: 5, fiber: 2.0 },
  { name: "Murukku", calories: 450, protein: 7, carbs: 50, fat: 24, fiber: 2.0 },
  { name: "Mixture", calories: 470, protein: 8, carbs: 48, fat: 27, fiber: 3.0 },
  { name: "Chivda", calories: 420, protein: 8, carbs: 50, fat: 21, fiber: 3.0 },
  { name: "Shankarpali", calories: 440, protein: 5, carbs: 55, fat: 22, fiber: 1.0 },
  { name: "Mathri", calories: 460, protein: 6, carbs: 48, fat: 27, fiber: 1.5 },
  { name: "Namak Pare", calories: 440, protein: 6, carbs: 50, fat: 24, fiber: 1.5 },
  { name: "Papdi Chaat", calories: 190, protein: 4, carbs: 24, fat: 9, fiber: 2.0 },
  { name: "Dabeli", calories: 250, protein: 5, carbs: 34, fat: 10, fiber: 2.5 },
  { name: "Misal Pav", calories: 220, protein: 8, carbs: 28, fat: 8, fiber: 4.0 },
  { name: "Poha", calories: 180, protein: 3, carbs: 32, fat: 4.5, fiber: 1.0 },
  { name: "Upma", calories: 150, protein: 3.5, carbs: 22, fat: 5.5, fiber: 1.5 },

  // ─── Additional Indian Sweets ───
  { name: "Soan Papdi", calories: 400, protein: 4, carbs: 52, fat: 19, fiber: 0.5 },
  { name: "Peda", calories: 390, protein: 6, carbs: 50, fat: 18, fiber: 0 },
  { name: "Sandesh", calories: 210, protein: 6, carbs: 32, fat: 7, fiber: 0 },
  { name: "Kaju Katli", calories: 460, protein: 7, carbs: 52, fat: 25, fiber: 0.5 },
  { name: "Mysore Pak", calories: 440, protein: 4, carbs: 42, fat: 27, fiber: 0.5 },
  { name: "Gajar Halwa", calories: 260, protein: 4, carbs: 34, fat: 12, fiber: 1.5 },
  { name: "Moong Dal Halwa", calories: 300, protein: 6, carbs: 36, fat: 15, fiber: 1.0 },
  { name: "Shrikhand", calories: 230, protein: 5, carbs: 36, fat: 7, fiber: 0 },
  { name: "Basundi", calories: 210, protein: 5, carbs: 28, fat: 8, fiber: 0 },
  { name: "Rabri", calories: 220, protein: 5, carbs: 28, fat: 10, fiber: 0 },
  { name: "Imarti", calories: 380, protein: 3, carbs: 58, fat: 15, fiber: 0.5 },
  { name: "Malpua", calories: 320, protein: 4, carbs: 44, fat: 14, fiber: 0.5 },

  // ─── Additional Indian Regional Specialties ───
  { name: "Thali", calories: 700, protein: 22, carbs: 90, fat: 28, fiber: 8.0 },
  { name: "Veg Thali", calories: 650, protein: 18, carbs: 88, fat: 24, fiber: 9.0 },
  { name: "Non-Veg Thali", calories: 800, protein: 35, carbs: 80, fat: 35, fiber: 6.0 },
  { name: "Chole Bhature", calories: 400, protein: 12, carbs: 48, fat: 18, fiber: 5.0 },
  { name: "Rajma Chawal", calories: 320, protein: 12, carbs: 50, fat: 6, fiber: 7.0 },
  { name: "Kadhi Chawal", calories: 280, protein: 8, carbs: 40, fat: 9, fiber: 2.5 },
  { name: "Dal Chawal", calories: 300, protein: 10, carbs: 48, fat: 5, fiber: 5.0 },
  { name: "Khichdi", calories: 140, protein: 5, carbs: 24, fat: 2.5, fiber: 2.0 },
  { name: "Pongal", calories: 160, protein: 4.5, carbs: 25, fat: 4, fiber: 1.5 },
  { name: "Uttapam", calories: 180, protein: 5, carbs: 28, fat: 5, fiber: 2.0 },
  { name: "Pesarattu", calories: 140, protein: 6, carbs: 22, fat: 3, fiber: 2.5 },
  { name: "Appam Stew", calories: 160, protein: 4, carbs: 26, fat: 4, fiber: 1.5 },
  { name: "Puttu Kadala", calories: 200, protein: 6, carbs: 32, fat: 5, fiber: 3.0 },
  { name: "Litti Chokha", calories: 250, protein: 8, carbs: 36, fat: 9, fiber: 4.0 },
  { name: "Dal Bati Churma", calories: 350, protein: 10, carbs: 45, fat: 14, fiber: 4.0 },
  { name: "Bisi Bele Bath", calories: 175, protein: 5, carbs: 27, fat: 5, fiber: 2.5 },
  { name: "Puliyogare", calories: 165, protein: 4, carbs: 28, fat: 4.5, fiber: 1.5 },
  { name: "Lemon Rice", calories: 160, protein: 3.5, carbs: 27, fat: 4, fiber: 1.0 },
  { name: "Curd Rice", calories: 130, protein: 4, carbs: 22, fat: 2.5, fiber: 0.5 },
  { name: "Tomato Rice", calories: 155, protein: 3, carbs: 26, fat: 4, fiber: 1.0 },
  { name: "Coconut Rice", calories: 175, protein: 3.5, carbs: 26, fat: 6, fiber: 1.5 },

  // ─── Western Breakfast & Brunch ───
  { name: "Scrambled Eggs", calories: 148, protein: 10, carbs: 2, fat: 11, fiber: 0 },
  { name: "Omelette", calories: 154, protein: 11, carbs: 1, fat: 12, fiber: 0 },
  { name: "Eggs Benedict", calories: 350, protein: 18, carbs: 20, fat: 23, fiber: 1.0 },
  { name: "Avocado Toast", calories: 280, protein: 8, carbs: 26, fat: 17, fiber: 6.0 },
  { name: "Bagel with Cream Cheese", calories: 340, protein: 11, carbs: 50, fat: 11, fiber: 2.0 },
  { name: "Croissant", calories: 406, protein: 8, carbs: 46, fat: 21, fiber: 2.5 },
  { name: "Hash Browns", calories: 310, protein: 3, carbs: 32, fat: 19, fiber: 3.0 },
  { name: "Breakfast Burrito", calories: 350, protein: 16, carbs: 30, fat: 18, fiber: 4.0 },
  { name: "Smoothie Bowl", calories: 180, protein: 5, carbs: 32, fat: 4, fiber: 5.0 },
  { name: "Overnight Oats", calories: 150, protein: 6, carbs: 24, fat: 3, fiber: 4.0 },
  { name: "Granola with Yogurt", calories: 280, protein: 10, carbs: 40, fat: 10, fiber: 4.0 },

  // ─── Western Main Dishes ───
  { name: "Grilled Chicken Breast", calories: 165, protein: 31, carbs: 0, fat: 3.6, fiber: 0 },
  { name: "Steak", calories: 271, protein: 26, carbs: 0, fat: 18, fiber: 0 },
  { name: "Roast Chicken", calories: 190, protein: 28, carbs: 0, fat: 7.5, fiber: 0 },
  { name: "Beef Stew", calories: 170, protein: 16, carbs: 12, fat: 7, fiber: 2.0 },
  { name: "Shepherd's Pie", calories: 210, protein: 10, carbs: 22, fat: 9, fiber: 2.5 },
  { name: "Mac and Cheese", calories: 220, protein: 9, carbs: 25, fat: 9, fiber: 1.0 },
  { name: "Lasagna", calories: 280, protein: 14, carbs: 28, fat: 13, fiber: 2.0 },
  { name: "Spaghetti Bolognese", calories: 220, protein: 12, carbs: 28, fat: 7, fiber: 2.5 },
  { name: "Fish and Chips", calories: 350, protein: 15, carbs: 35, fat: 17, fiber: 3.0 },
  { name: "Grilled Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, fiber: 0 },
  { name: "Caesar Salad", calories: 180, protein: 10, carbs: 8, fat: 12, fiber: 2.0 },
  { name: "Club Sandwich", calories: 340, protein: 18, carbs: 28, fat: 17, fiber: 2.0 },
  { name: "BLT Sandwich", calories: 310, protein: 14, carbs: 26, fat: 17, fiber: 1.5 },
  { name: "Quesadilla", calories: 300, protein: 12, carbs: 26, fat: 16, fiber: 2.0 },
  { name: "Tacos", calories: 250, protein: 12, carbs: 22, fat: 12, fiber: 3.0 },
  { name: "Burrito Bowl", calories: 350, protein: 18, carbs: 42, fat: 11, fiber: 6.0 },
  { name: "Sushi Roll", calories: 200, protein: 8, carbs: 30, fat: 4, fiber: 1.0 },
  { name: "Pad Thai", calories: 260, protein: 10, carbs: 34, fat: 9, fiber: 2.0 },
  { name: "Fried Rice", calories: 180, protein: 5, carbs: 28, fat: 5, fiber: 1.5 },

  // ─── Western Soups & Salads ───
  { name: "Tomato Soup", calories: 55, protein: 2, carbs: 9, fat: 1.5, fiber: 2.0 },
  { name: "Chicken Soup", calories: 60, protein: 4, carbs: 6, fat: 2, fiber: 1.0 },
  { name: "Minestrone", calories: 65, protein: 3, carbs: 10, fat: 1.5, fiber: 3.0 },
  { name: "Mushroom Soup", calories: 70, protein: 2, carbs: 8, fat: 3, fiber: 1.5 },
  { name: "Greek Salad", calories: 120, protein: 4, carbs: 6, fat: 9, fiber: 2.0 },
  { name: "Cobb Salad", calories: 280, protein: 18, carbs: 8, fat: 20, fiber: 3.0 },
  { name: "Garden Salad", calories: 60, protein: 2, carbs: 6, fat: 3, fiber: 2.5 },

  // ─── Western Desserts & Baked Goods ───
  { name: "Cheesecake", calories: 321, protein: 6, carbs: 26, fat: 22, fiber: 0.3 },
  { name: "Tiramisu", calories: 283, protein: 5, carbs: 28, fat: 16, fiber: 0.5 },
  { name: "Apple Pie", calories: 237, protein: 2, carbs: 34, fat: 11, fiber: 1.5 },
  { name: "Muffin", calories: 340, protein: 5, carbs: 48, fat: 14, fiber: 1.5 },
  { name: "Scone", calories: 380, protein: 6, carbs: 50, fat: 17, fiber: 1.5 },
  { name: "Cinnamon Roll", calories: 360, protein: 5, carbs: 50, fat: 15, fiber: 1.0 },
  { name: "Crème Brûlée", calories: 260, protein: 4, carbs: 26, fat: 15, fiber: 0 },
  { name: "Panna Cotta", calories: 220, protein: 3, carbs: 22, fat: 14, fiber: 0 },
  { name: "Tart", calories: 350, protein: 4, carbs: 45, fat: 17, fiber: 1.0 },

  // ─── Fast Food & Casual ───
  { name: "Hot Dog", calories: 290, protein: 10, carbs: 24, fat: 17, fiber: 1.0 },
  { name: "Chicken Nuggets", calories: 296, protein: 16, carbs: 16, fat: 19, fiber: 0.5 },
  { name: "Chicken Wings", calories: 260, protein: 22, carbs: 3, fat: 18, fiber: 0 },
  { name: "Sub Sandwich", calories: 320, protein: 16, carbs: 36, fat: 12, fiber: 2.5 },
  { name: "Garlic Bread", calories: 350, protein: 8, carbs: 42, fat: 17, fiber: 2.0 },
  { name: "Mozzarella Sticks", calories: 350, protein: 12, carbs: 30, fat: 19, fiber: 1.0 },
  { name: "Onion Rings", calories: 330, protein: 5, carbs: 38, fat: 17, fiber: 2.0 },
  { name: "Loaded Fries", calories: 400, protein: 12, carbs: 40, fat: 22, fiber: 3.0 },

  // ─── Condiments & Spreads (Western + Indian) ───
  { name: "Pesto", calories: 310, protein: 5, carbs: 4, fat: 30, fiber: 1.5 },
  { name: "Hummus", calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 4.0 },
  { name: "Tahini", calories: 595, protein: 17, carbs: 21, fat: 54, fiber: 9.0 },
  { name: "Salsa", calories: 36, protein: 1, carbs: 7, fat: 0.2, fiber: 2.0 },
  { name: "Guacamole", calories: 160, protein: 2, carbs: 9, fat: 14, fiber: 7.0 },
  { name: "Cream Cheese", calories: 342, protein: 6, carbs: 4, fat: 34, fiber: 0 },
  { name: "Nutella", calories: 539, protein: 6, carbs: 58, fat: 31, fiber: 3.4 },
  { name: "Peanut Butter", calories: 588, protein: 25, carbs: 20, fat: 50, fiber: 6.0 },
  { name: "Almond Butter", calories: 598, protein: 21, carbs: 19, fat: 54, fiber: 7.0 },
  { name: "Tamarind Chutney", calories: 160, protein: 1, carbs: 40, fat: 0.3, fiber: 2.0 },
  { name: "Mint Chutney", calories: 40, protein: 2, carbs: 7, fat: 0.5, fiber: 3.0 },
  { name: "Coconut Chutney", calories: 130, protein: 2, carbs: 6, fat: 11, fiber: 3.0 },

  // ─── Health Foods & Superfoods ───
  { name: "Acai Bowl", calories: 200, protein: 4, carbs: 35, fat: 5, fiber: 6.0 },
  { name: "Chia Pudding", calories: 180, protein: 6, carbs: 20, fat: 8, fiber: 10.0 },
  { name: "Matcha Latte", calories: 120, protein: 4, carbs: 12, fat: 5, fiber: 0.5 },
  { name: "Protein Smoothie", calories: 250, protein: 30, carbs: 20, fat: 5, fiber: 3.0 },
  { name: "Kale Salad", calories: 50, protein: 3.5, carbs: 7, fat: 1, fiber: 3.5 },
  { name: "Quinoa Bowl", calories: 220, protein: 8, carbs: 34, fat: 5, fiber: 4.0 },
  { name: "Buddha Bowl", calories: 350, protein: 12, carbs: 45, fat: 13, fiber: 8.0 },
  { name: "Zucchini Noodles", calories: 20, protein: 1.5, carbs: 4, fat: 0.3, fiber: 2.0 },
  { name: "Cauliflower Rice", calories: 25, protein: 2, carbs: 5, fat: 0.3, fiber: 2.0 },
  { name: "Sweet Potato Fries", calories: 180, protein: 2.5, carbs: 28, fat: 7, fiber: 3.5 },

  // ─── Protein-Rich Indian Foods ───
  { name: "Sprouts Salad", calories: 100, protein: 7, carbs: 13, fat: 1.5, fiber: 4.0 },
  { name: "Paneer Tikka Masala", calories: 225, protein: 14, carbs: 8, fat: 15, fiber: 1.0 },
  { name: "Soya Chaap", calories: 180, protein: 22, carbs: 10, fat: 6, fiber: 3.0 },
  { name: "Chana Chaat", calories: 130, protein: 7, carbs: 18, fat: 3.5, fiber: 5.0 },
  { name: "Moong Sprouts", calories: 80, protein: 6, carbs: 11, fat: 0.5, fiber: 3.0 },
  { name: "Rajma Salad", calories: 140, protein: 8, carbs: 20, fat: 2, fiber: 6.0 },
  { name: "Egg Bhurji", calories: 170, protein: 12, carbs: 3, fat: 12, fiber: 0.5 },
  { name: "Chicken Seekh Kebab", calories: 160, protein: 22, carbs: 4, fat: 6, fiber: 0.5 },
  { name: "Paneer Seekh Kebab", calories: 190, protein: 14, carbs: 5, fat: 13, fiber: 1.0 },
  { name: "Shami Kebab", calories: 180, protein: 15, carbs: 10, fat: 9, fiber: 2.0 },

  // ─── Fasting / Vrat Foods ───
  { name: "Sabudana Khichdi", calories: 210, protein: 3, carbs: 38, fat: 5, fiber: 1.0 },
  { name: "Kuttu Ka Paratha", calories: 240, protein: 5, carbs: 32, fat: 10, fiber: 3.0 },
  { name: "Singhare Ka Atta Halwa", calories: 290, protein: 3, carbs: 42, fat: 12, fiber: 1.5 },
  { name: "Rajgira Paratha", calories: 230, protein: 5, carbs: 33, fat: 8, fiber: 3.0 },
  { name: "Vrat Ke Aloo", calories: 130, protein: 2, carbs: 18, fat: 5.5, fiber: 2.0 },
  { name: "Samak Rice", calories: 140, protein: 3, carbs: 28, fat: 1, fiber: 1.5 },

  // ─── Drinks & Beverages (Additional) ───
  { name: "Butterbeer", calories: 180, protein: 1, carbs: 40, fat: 3, fiber: 0 },
  { name: "Iced Coffee", calories: 80, protein: 2, carbs: 12, fat: 2, fiber: 0 },
  { name: "Latte", calories: 135, protein: 7, carbs: 13, fat: 6, fiber: 0 },
  { name: "Cappuccino", calories: 90, protein: 5, carbs: 9, fat: 4, fiber: 0 },
  { name: "Hot Chocolate", calories: 190, protein: 6, carbs: 28, fat: 6, fiber: 1.5 },
  { name: "Rose Sharbat", calories: 80, protein: 0, carbs: 20, fat: 0, fiber: 0 },
  { name: "Thandai", calories: 150, protein: 4, carbs: 22, fat: 5, fiber: 0.5 },
  { name: "Jaljeera", calories: 15, protein: 0.5, carbs: 3, fat: 0, fiber: 0.2 },
  { name: "Aam Panna", calories: 50, protein: 0.5, carbs: 12, fat: 0, fiber: 0.5 },
  { name: "Sattu Drink", calories: 90, protein: 5, carbs: 14, fat: 1.5, fiber: 2.0 },
];

// ── Unit-to-Gram Conversion Constants ──
// Used to convert volumetric units to grams for macro calculation.
// Key format: "foodName:unit" → grams, or "default:unit" → fallback grams
export const UNIT_TO_GRAMS: Record<string, number> = {
  // Default conversions (fallback for any food)
  "default:g": 1,
  "default:ml": 1,
  "default:tsp": 5,
  "default:tbsp": 15,
  "default:cup": 240,         // 1 standard cup ≈ 240ml
  "default:serving": 150,     // typical serving ≈ 150g
  "default:piece": 30,         // conservative default per piece ≈ 30g (food-specific overrides exist above)
  "default:oz": 28.35,        // 1 oz ≈ 28.35g
  "default:fl oz": 30,        // 1 fl oz ≈ 30ml
  "default:lb": 453.6,        // 1 lb ≈ 453.6g
  "default:lbs": 453.6,       // alias

  // Food-specific density overrides (1 unit in grams)
  "rice:cup": 195,            // 1 cup cooked rice ≈ 195g
  "basmati rice:cup": 195,
  "brown rice:cup": 195,
  "biryani:cup": 220,
  "pulao:cup": 210,
  "jeera rice:cup": 200,
  "oatmeal:cup": 234,         // 1 cup cooked oatmeal
  "oats:cup": 80,             // 1 cup raw oats
  "pasta:cup": 140,           // 1 cup cooked pasta
  "noodles:cup": 140,
  "maggi noodles:cup": 140,
  "quinoa:cup": 185,          // 1 cup cooked
  "couscous:cup": 157,

  // Dairy
  "milk:cup": 244,
  "skimmed milk:cup": 245,
  "yogurt:cup": 245,
  "greek yogurt:cup": 245,
  "curd:cup": 245,
  "buttermilk:cup": 245,
  "lassi:cup": 245,
  "cheese:cup": 132,
  "cottage cheese:cup": 226,
  "cream:cup": 240,
  "soy milk:cup": 245,

  // Paneer
  "paneer:cup": 140,
  "paneer butter masala:cup": 220,
  "paneer tikka:cup": 160,
  "paneer bhurji:cup": 180,

  // Indian breads (per piece AND per serving)
  "chapati:serving": 35,
  "chapati:piece": 35,            // 1 chapati ≈ 35g
  "roti:serving": 35,
  "roti:piece": 35,              // 1 roti ≈ 35g
  "paratha:serving": 60,
  "paratha:piece": 60,           // 1 paratha ≈ 60g
  "naan:serving": 90,
  "naan:piece": 90,              // 1 naan ≈ 90g
  "puri:serving": 25,
  "puri:piece": 25,              // 1 puri ≈ 25g
  "jowar roti:serving": 40,
  "jowar roti:piece": 40,        // 1 jowar roti ≈ 40g
  "bajra roti:serving": 40,
  "bajra roti:piece": 40,        // 1 bajra roti ≈ 40g
  "kulcha:piece": 80,            // 1 kulcha ≈ 80g
  "bhatura:piece": 100,          // 1 bhatura ≈ 100g
  "lachha paratha:piece": 70,    // 1 lachha paratha ≈ 70g
  "thepla:piece": 40,            // 1 thepla ≈ 40g
  "missi roti:piece": 45,        // 1 missi roti ≈ 45g
  "thalipeeth:piece": 50,        // 1 thalipeeth ≈ 50g
  "ragi roti:piece": 40,         // 1 ragi roti ≈ 40g

  // South Indian
  "dosa:serving": 85,
  "dosa:piece": 85,              // 1 plain dosa ≈ 85g
  "masala dosa:serving": 150,
  "masala dosa:piece": 150,      // 1 masala dosa ≈ 150g
  "idli:serving": 40,
  "idli:piece": 40,              // 1 idli ≈ 40g
  "medu vada:serving": 70,
  "upma:cup": 235,
  "sambhar:cup": 245,
  "rasam:cup": 245,
  "uttapam:piece": 120,          // 1 uttapam ≈ 120g
  "appam:piece": 50,             // 1 appam ≈ 50g
  "pesarattu:piece": 60,         // 1 pesarattu ≈ 60g

  // Breakfast items
  "poha:cup": 180,
  "vermicelli:cup": 180,
  "pongal:serving": 200,         // 1 serving ven pongal ≈ 200g
  "khichdi:serving": 200,        // 1 serving khichdi ≈ 200g

  // Lentils/Dal (cooked)
  "dal:cup": 210,
  "dal tadka:cup": 220,
  "toor dal:cup": 210,
  "moong dal:cup": 200,
  "masoor dal:cup": 200,
  "chana dal:cup": 210,
  "urad dal:cup": 210,
  "rajma:cup": 220,
  "chole:cup": 220,
  "chickpeas:cup": 240,
  "lentils:cup": 210,

  // Curries (cooked)
  "chicken curry:cup": 240,
  "butter chicken:cup": 240,
  "tandoori chicken:serving": 120,
  "fish curry:cup": 240,
  "mutton curry:cup": 240,
  "keema:cup": 230,
  "prawns masala:cup": 230,
  "mixed veg curry:cup": 230,
  "aloo gobi:cup": 220,
  "aloo matar:cup": 220,
  "bhindi masala:cup": 200,
  "baingan bharta:cup": 200,
  "palak paneer:cup": 220,

  // Vegetables
  "broccoli:cup": 91,
  "spinach:cup": 30,
  "green peas:cup": 160,
  "corn:cup": 164,
  "mushroom:cup": 86,
  "salad:cup": 55,

  // Fruits (per piece AND per serving approx)
  "banana:serving": 118,      // 1 medium banana
  "banana:piece": 118,         // 1 medium banana ≈ 118g
  "apple:serving": 182,       // 1 medium apple
  "apple:piece": 182,          // 1 medium apple ≈ 182g
  "mango:serving": 200,       // 1 cup pieces
  "mango:piece": 200,          // 1 whole mango ≈ 200g
  "orange:serving": 131,      // 1 medium
  "orange:piece": 131,         // 1 medium orange ≈ 131g
  "papaya:serving": 140,      // 1 cup cubed
  "papaya:piece": 300,         // 1 small papaya ≈ 300g (1 slice ≈ 150g)
  "watermelon:cup": 152,
  "watermelon:piece": 286,     // 1 wedge/slice ≈ 286g
  "grapes:cup": 151,
  "pineapple:cup": 165,
  "pineapple:piece": 165,      // 1 ring/slice ≈ 165g
  "pomegranate:cup": 174,
  "pomegranate:piece": 282,    // 1 whole pomegranate ≈ 282g
  "guava:cup": 165,
  "guava:piece": 55,           // 1 guava ≈ 55g
  "coconut:serving": 80,      // 1/2 cup shredded
  "dates:cup": 178,
  "strawberry:piece": 12,      // 1 strawberry ≈ 12g
  "kiwi:piece": 75,            // 1 kiwi ≈ 75g
  "pear:piece": 178,           // 1 medium pear ≈ 178g
  "peach:piece": 150,          // 1 medium peach ≈ 150g
  "chikoo:piece": 120,         // 1 chikoo/sapota ≈ 120g
  "custard apple:piece": 150,  // 1 custard apple ≈ 150g
  "jackfruit:piece": 30,       // 1 jackfruit bulb ≈ 30g

  // Eggs
  "egg:serving": 50,          // 1 large egg ≈ 50g
  "egg:piece": 50,              // 1 egg ≈ 50g
  "egg white:cup": 243,
  "egg white:piece": 33,        // 1 egg white ≈ 33g

  // Nuts & Seeds (per cup AND per piece)
  "almonds:cup": 143,
  "almonds:piece": 1.3,           // 1 almond ≈ 1.3g
  "almond:piece": 1.3,             // 1 almond (singular) ≈ 1.3g
  "walnuts:cup": 117,
  "walnuts:piece": 2.5,           // 1 walnut half ≈ 2.5g
  "walnut:piece": 2.5,             // 1 walnut (singular) ≈ 2.5g
  "cashews:cup": 137,
  "cashews:piece": 1.5,           // 1 cashew ≈ 1.5g
  "cashew:piece": 1.5,             // 1 cashew (singular) ≈ 1.5g
  "peanuts:cup": 146,
  "peanuts:piece": 0.7,           // 1 peanut ≈ 0.7g
  "peanut:piece": 0.7,             // 1 peanut (singular) ≈ 0.7g
  "peanut butter:tbsp": 16,
  "pistachios:cup": 123,
  "pistachios:piece": 0.5,        // 1 pistachio kernel ≈ 0.5g
  "pistachio:piece": 0.5,          // 1 pistachio (singular) ≈ 0.5g
  "mixed nuts:cup": 137,
  "mixed nuts:piece": 1.2,        // 1 average mixed nut ≈ 1.2g
  "chia seeds:tbsp": 12,
  "flax seeds:tbsp": 10.3,
  "sunflower seeds:cup": 134,
  "sunflower seeds:piece": 0.1,    // 1 sunflower seed kernel ≈ 0.1g
  "dates:piece": 7,               // 1 date ≈ 7g (Medjool ~24g, Deglet Noor ~7g)
  "coconut:piece": 20,            // 1 small piece of fresh coconut ≈ 20g
  "coconut dry:piece": 5,         // 1 small piece dried coconut ≈ 5g

  // Snacks & street food (per piece AND per serving)
  "samosa:serving": 80,
  "samosa:piece": 80,              // 1 samosa ≈ 80g
  "pakora:serving": 35,
  "pakora:piece": 15,              // 1 pakora ≈ 15g
  "vada pav:serving": 150,
  "vada pav:piece": 150,           // 1 vada pav ≈ 150g
  "pav bhaji:cup": 240,
  "bhel puri:serving": 100,
  "bhel puri:piece": 100,
  "pani puri:serving": 30,
  "pani puri:piece": 10,           // 1 puri ≈ 10g (without water)
  "dhokla:serving": 60,
  "dhokla:piece": 30,              // 1 dhokla piece ≈ 30g
  "kachori:serving": 60,
  "kachori:piece": 60,             // 1 kachori ≈ 60g
  "aloo tikki:serving": 80,
  "aloo tikki:piece": 80,          // 1 aloo tikki ≈ 80g
  "medu vada:piece": 70,           // 1 medu vada ≈ 70g

  // Sweets (per piece AND per serving)
  "gulab jamun:serving": 50,
  "gulab jamun:piece": 50,          // 1 gulab jamun ≈ 50g
  "rasgulla:serving": 55,
  "rasgulla:piece": 55,            // 1 rasgulla ≈ 55g
  "jalebi:serving": 50,
  "jalebi:piece": 20,              // 1 jalebi piece ≈ 20g
  "ladoo:serving": 40,
  "ladoo:piece": 40,               // 1 ladoo ≈ 40g
  "barfi:serving": 35,
  "barfi:piece": 25,               // 1 barfi piece ≈ 25g
  "halwa:cup": 240,
  "kheer:cup": 245,
  "rasmalai:serving": 50,
  "rasmalai:piece": 50,            // 1 rasmalai ≈ 50g
  "ice cream:cup": 132,
  "ice cream:serving": 132,
  "mysore pak:serving": 40,
  "mysore pak:piece": 25,          // 1 mysore pak piece ≈ 25g
  "soan papdi:piece": 25,          // 1 soan papdi cube ≈ 25g
  "peda:piece": 20,                // 1 peda ≈ 20g
  "sandesh:piece": 30,             // 1 sandesh ≈ 30g
  "kaju katli:piece": 15,          // 1 kaju katli piece ≈ 15g
  "gajar halwa:serving": 80,
  "gajar halwa:piece": 80,         // 1 serving ≈ 80g
  "shrikhand:cup": 245,
  "imarti:piece": 60,              // 1 imarti ≈ 60g
  "malpua:piece": 50,              // 1 malpua ≈ 50g

  // Beverages (per cup = 240ml typical)
  "chai:cup": 240,
  "masala chai:cup": 240,
  "nimbu pani:cup": 240,
  "coconut water:cup": 240,
  "juice:cup": 248,
  "mango juice:cup": 248,
  "sugarcane juice:cup": 240,
  "green tea:cup": 240,
  "black coffee:cup": 240,
  "smoothie:cup": 240,
  "protein shake:cup": 300,
  "soda:cup": 240,
  "energy drink:cup": 240,
  "beer:cup": 240,
  "wine:cup": 240,
  "mango lassi:cup": 245,

  // Protein supplements (dry powder)
  "whey protein:serving": 30,        // 1 scoop
  "whey protein:piece": 30,
  "whey protein isolate:serving": 30,
  "whey protein isolate:piece": 30,
  "casein protein:serving": 33,
  "casein protein:piece": 33,
  "soy protein:serving": 30,
  "soy protein:piece": 30,
  "protein bar:serving": 60,
  "protein bar:piece": 60,
  "protein shake:piece": 300,
  "protein smoothie:piece": 350,

  // Oils & condiments
  "olive oil:tbsp": 14,
  "coconut oil:tbsp": 14,
  "mustard oil:tbsp": 14,
  "sunflower oil:tbsp": 14,
  "butter:tbsp": 14,
  "ghee:tbsp": 13,
  "honey:tbsp": 21,
  "sugar:tbsp": 12.5,
  "jaggery:tbsp": 15,
  "soy sauce:tbsp": 15,
  "ketchup:tbsp": 17,
  "mayonnaise:tbsp": 14,
  "pickle:tbsp": 15,
  "chutney:tbsp": 15,
  "raita:cup": 245,

  // Breakfast
  "cornflakes:cup": 28,
  "muesli:cup": 85,
  "granola:cup": 100,

  // Western
  "pizza:serving": 150,        // 2 slices
  "pizza:piece": 107,            // 1 slice ≈ 107g
  "burger:serving": 200,
  "burger:piece": 200,           // 1 burger ≈ 200g
  "sandwich:serving": 150,
  "sandwich:piece": 150,         // 1 sandwich ≈ 150g
  "wrap:serving": 180,
  "wrap:piece": 180,             // 1 wrap ≈ 180g
  "french fries:serving": 117,
  "chips:serving": 28,
  "popcorn:cup": 8,
  "nachos:serving": 60,
  "cookie:serving": 30,
  "cookie:piece": 30,            // 1 cookie ≈ 30g
  "cake:serving": 80,
  "cake:piece": 80,              // 1 slice ≈ 80g
  "brownie:serving": 55,
  "brownie:piece": 55,           // 1 brownie ≈ 55g
  "donut:serving": 60,
  "donut:piece": 60,             // 1 donut ≈ 60g
  "pancakes:serving": 77,
  "pancakes:piece": 77,          // 1 pancake ≈ 77g
  "waffles:serving": 75,
  "waffles:piece": 75,           // 1 waffle ≈ 75g
  "french toast:serving": 65,
  "french toast:piece": 65,      // 1 slice ≈ 65g
  "chocolate:serving": 40,
  "chocolate:piece": 10,         // 1 piece/square ≈ 10g
  "dark chocolate:serving": 30,
  "dark chocolate:piece": 10,    // 1 piece/square ≈ 10g
  "muffin:piece": 110,           // 1 muffin ≈ 110g
  "croissant:piece": 67,         // 1 croissant ≈ 67g
  "scone:piece": 55,             // 1 scone ≈ 55g
  "tart:piece": 80,              // 1 tart ≈ 80g
};

export const WORKOUT_TYPES = [
  "Running", "Walking", "Cycling", "Swimming", "Weight Training",
  "HIIT", "Yoga", "Pilates", "Dance", "Boxing",
  "Jump Rope", "Rowing", "Elliptical", "Stair Climbing", "Stretching",
  "Basketball", "Football", "Tennis", "Badminton", "Cricket",
  "Push-ups", "Pull-ups", "Squats", "Planks", "Burpees"
];

export const PLATFORMS = [
  "YouTube", "Blog", "Twitter/X", "Instagram", "TikTok", "LinkedIn", "Podcast", "Newsletter", "Other"
];
