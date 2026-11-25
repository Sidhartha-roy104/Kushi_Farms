export const FREE_DELIVERY_THRESHOLD = 199;

export const WHATSAPP_NUMBER = '918464952708';

export const PRODUCTS = [
  {
    id: 'cows-milk',
    name: "Cow's Milk",
    brandLine: 'KUSHI DAIRY · DAILY ESSENTIALS',
    purity: '★ 4.9 · Pure',
    badge: 'Fresh Daily',
    badgeTone: 'green',
    category: 'Dairy',
    pills: ['Unadulterated', 'Morning Sourced', 'Rich Calcium'],
    image: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/E5F0FF/1256A8?text=Fresh+Cow%27s+Milk',
    description:
      'Clean, naturally sweet cow’s milk sourced daily from Chaparam for morning filter coffee, tea, and children’s nutrition.',
    kitchenTip:
      'Boil gently on a low flame to enjoy a rich natural malai layer and authentic farm aroma.',
    freshness:
      'Sourced fresh every morning · Best consumed within 24–48 hours when refrigerated.',
    variants: [
      { label: '250 ml', price: 12 },
      { label: '500 ml', price: 24 },
      { label: '1 L', price: 48 }
    ]
  },
  {
    id: 'frozen-paneer',
    name: 'Frozen Paneer',
    brandLine: 'KUSHI DAIRY · FRESH CHOICE',
    purity: '★ 4.8 · High Protein',
    badge: 'Fresh Choice',
    badgeTone: 'blue',
    category: 'Dairy',
    pills: ['High Protein', 'Soft Cubes', 'Hygienic Seal'],
    image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/F2F7FC/1256A8?text=Frozen+Paneer',
    description:
      'Soft, protein-rich paneer cubes hygienically packed to stay tender in curries, pulao, and tawa fry.',
    kitchenTip:
      'Soak cubes in warm salted water for 8 minutes before cooking for melt-in-mouth softness.',
    freshness: 'Hygienically chilled & sealed · Keep frozen until ready to cook.',
    variants: [
      { label: '200 g', price: 55 },
      { label: '500 g', price: 130 },
      { label: '1 kg', price: 250 }
    ]
  },
  {
    id: 'honey',
    name: 'Honey',
    brandLine: 'KUSHI PANTRY · NATURAL HARVEST',
    purity: '★ 4.9 · Raw',
    badge: '100% Pure',
    badgeTone: 'gold',
    category: 'Pantry',
    pills: ['Zero Added Sugar', 'Natural Enzymes', 'Floral Aroma'],
    image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/FEF8DF/9A6700?text=100%25+Pure+Honey',
    description:
      'Unadulterated golden natural honey with rich floral notes—no added sugar syrup or artificial flavours.',
    kitchenTip:
      'Stir a spoonful into warm lemon water every morning or drizzle over fresh curd and fruits.',
    freshness: '100% Pure · Store at room temperature away from direct sunlight.',
    variants: [
      { label: '100 g', price: 70 },
      { label: '250 g', price: 165 },
      { label: '500 g', price: 310 }
    ]
  },
  {
    id: 'mushroom',
    name: 'Mushroom',
    brandLine: 'KUSHI FARM · FRESH HARVEST',
    purity: '★ 4.8 · Farm Pick',
    badge: 'Farm Fresh',
    badgeTone: 'green',
    category: 'Farm Fresh',
    pills: ['Handpicked', 'Rich Vitamin D', 'Cleaned Pack'],
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/ECF7E4/3E7F1C?text=Farm+Fresh+Mushroom',
    description:
      'Plump, earthy button mushrooms handpicked fresh for Andhra-style mushroom masala, biryani, and pepper fry.',
    kitchenTip:
      'Wipe gently or rinse quickly right before slicing so they sear golden instead of steaming.',
    freshness: 'Farm Fresh · Refrigerate in a breathable pack and use within 3 days.',
    variants: [
      { label: '200 g', price: 50 },
      { label: '400 g', price: 95 }
    ]
  },
  {
    id: 'sweet-corn',
    name: 'Sweet Corn',
    brandLine: 'KUSHI FARM · GOLDEN KERNELS',
    purity: '★ 4.9 · Crisp',
    badge: 'Farm Fresh',
    badgeTone: 'gold',
    category: 'Farm Fresh',
    pills: ['Naturally Sweet', 'Ready to Steam', 'High Fibre'],
    image: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/FEF8DF/9A6700?text=Farm+Fresh+Sweet+Corn',
    description:
      'Juicy, naturally sweet golden kernels ready for evening masala corn chaat, soups, and crispy corn.',
    kitchenTip:
      'Steam for 5 minutes and toss with Kushi ghee, chaat masala, chilli powder, and a squeeze of lime.',
    freshness: 'Farm Fresh · Crisp golden kernels packed cleanly for quick prep.',
    variants: [
      { label: '200 g', price: 22 },
      { label: '500 g', price: 52 },
      { label: '1 kg', price: 98 }
    ]
  },
  {
    id: 'green-peas',
    name: 'Green Peas',
    brandLine: 'KUSHI FARM · FRESH HARVEST',
    purity: '★ 4.8 · Tender',
    badge: 'Farm Fresh',
    badgeTone: 'green',
    category: 'Farm Fresh',
    pills: ['Tender Pods', 'Plant Protein', 'Quick Cook'],
    image: 'https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/ECF7E4/3E7F1C?text=Farm+Fresh+Green+Peas',
    description:
      'Tender, bright green peas carefully selected for matar paneer, vegetable pulao, upma, and aloo matar.',
    kitchenTip:
      'Blanch for 2 minutes in boiling water to lock in the vibrant green colour and sweet crunch.',
    freshness: 'Farm Fresh · Cleaned and ready for everyday family cooking.',
    variants: [
      { label: '250 g', price: 50 },
      { label: '500 g', price: 95 },
      { label: '1 kg', price: 185 }
    ]
  },
  {
    id: 'fresh-curd',
    name: 'Fresh Curd',
    brandLine: 'KUSHI DAIRY · HOMESTYLE SET',
    purity: '★ 4.9 · Thick',
    badge: 'Daily Set',
    badgeTone: 'blue',
    category: 'Dairy',
    pills: ['Live Probiotics', 'Mild & Creamy', 'Set Daily'],
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/E5F0FF/1256A8?text=Fresh+Daily+Curd',
    description:
      'Thick, creamy, mildly sweet homestyle perugu (curd) set daily from fresh milk—essential for every Andhra lunch.',
    kitchenTip:
      'Perfect for cooling curd rice (daddojanam), onion raita, or whisked into spiced buttermilk.',
    freshness: 'Set fresh daily · Keep chilled at 4°C for mild, non-sour taste.',
    variants: [
      { label: '250 g', price: 25 },
      { label: '500 g', price: 48 },
      { label: '1 kg', price: 92 }
    ]
  },
  {
    id: 'pure-desi-ghee',
    name: 'Pure Desi Ghee',
    brandLine: 'KUSHI DAIRY · TRADITIONAL',
    purity: '★ 5.0 · Grainy',
    badge: 'Traditional',
    badgeTone: 'gold',
    category: 'Dairy',
    pills: ['Slow Clarified', 'Rich Aroma', '100% Pure'],
    image: 'https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=800&q=80',
    fallback: 'https://placehold.co/600x440/FEF8DF/9A6700?text=Pure+Desi+Ghee',
    description:
      'Rich, grainy, aromatic desi ghee slow-clarified for hot steamed rice, pappu, dosas, and festive sweets.',
    kitchenTip:
      'Spoon over hot mudda pappu and avakaya rice for an unmistakable coastal Andhra comfort meal.',
    freshness:
      '100% Pure · Naturally shelf-stable in a cool, dry kitchen cupboard.',
    variants: [
      { label: '200 ml', price: 160 },
      { label: '500 ml', price: 385 },
      { label: '1 L', price: 750 }
    ]
  }
];
