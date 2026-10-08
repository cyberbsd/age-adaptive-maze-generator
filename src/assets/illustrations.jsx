import React from 'react';

/**
 * High-quality SVG Illustration collection for maze Start & End indicators.
 */
export const ILLUSTRATION_SETS = {
  'rabbit-carrot': {
    id: 'rabbit-carrot',
    name: '小兔與胡蘿蔔',
    ageGroup: 'toddler',
    prompt: '幫可愛的小兔子劃出路線，找到好吃的胡蘿蔔！',
    startName: '小兔子',
    endName: '胡蘿蔔',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="36" r="20" fill="#FFF5F7" stroke="#FF85A2" strokeWidth="3"/>
        {/* Ears */}
        <ellipse cx="22" cy="14" rx="6" ry="14" fill="#FFF5F7" stroke="#FF85A2" strokeWidth="3" transform="rotate(-10 22 14)"/>
        <ellipse cx="22" cy="14" rx="3" ry="9" fill="#FFB7C5"/>
        <ellipse cx="42" cy="14" rx="6" ry="14" fill="#FFF5F7" stroke="#FF85A2" strokeWidth="3" transform="rotate(10 42 14)"/>
        <ellipse cx="42" cy="14" rx="3" ry="9" fill="#FFB7C5"/>
        {/* Eyes */}
        <circle cx="25" cy="34" r="3.5" fill="#333"/>
        <circle cx="39" cy="34" r="3.5" fill="#333"/>
        <circle cx="26" cy="32.5" r="1" fill="#FFF"/>
        <circle cx="40" cy="32.5" r="1" fill="#FFF"/>
        {/* Cheeks */}
        <circle cx="20" cy="39" r="4" fill="#FFB7C5" opacity="0.7"/>
        <circle cx="44" cy="39" r="4" fill="#FFB7C5" opacity="0.7"/>
        {/* Nose & Mouth */}
        <polygon points="32,38 29,35 35,35" fill="#FF85A2"/>
        <path d="M29 41C30.5 42.5 33.5 42.5 35 41" stroke="#333" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Leaves */}
        <path d="M32 20C28 10 20 8 16 12C20 18 26 20 30 22" fill="#52B788"/>
        <path d="M32 20C36 10 44 8 48 12C44 18 38 20 34 22" fill="#74C69D"/>
        <path d="M32 20C32 8 32 4 32 4C32 4 35 12 33 22" stroke="#2D6A4F" strokeWidth="3"/>
        {/* Body */}
        <path d="M22 22C20 32 28 54 32 60C36 54 44 32 42 22C36 20 28 20 22 22Z" fill="#FF7B00" stroke="#E05600" strokeWidth="3"/>
        {/* Texture lines */}
        <path d="M25 30H32" stroke="#FFA200" strokeWidth="2" strokeLinecap="round"/>
        <path d="M30 40H38" stroke="#FFA200" strokeWidth="2" strokeLinecap="round"/>
        <path d="M27 50H33" stroke="#FFA200" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    )
  },

  'puppy-bone': {
    id: 'puppy-bone',
    name: '小狗與美味骨頭',
    ageGroup: 'toddler',
    prompt: '小狗肚子餓了，幫牠尋找美味的骨頭吧！',
    startName: '小狗',
    endName: '骨頭',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ears */}
        <ellipse cx="14" cy="30" rx="8" ry="16" fill="#C68B59" transform="rotate(15 14 30)"/>
        <ellipse cx="50" cy="30" rx="8" ry="16" fill="#C68B59" transform="rotate(-15 50 30)"/>
        {/* Head */}
        <circle cx="32" cy="34" r="20" fill="#F3DBBB"/>
        {/* Eyes */}
        <circle cx="24" cy="30" r="3" fill="#3D2C1E"/>
        <circle cx="40" cy="30" r="3" fill="#3D2C1E"/>
        {/* Snout */}
        <ellipse cx="32" cy="40" rx="9" ry="7" fill="#FFFFFF"/>
        <ellipse cx="32" cy="37" rx="4" ry="3" fill="#3D2C1E"/>
        <path d="M32 40V43M29 43C30.5 45 33.5 45 35 43" stroke="#3D2C1E" strokeWidth="2" strokeLinecap="round"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M18 24C14 24 10 28 10 32C10 36 14 40 18 40C20 40 22 39 23 37L41 37C42 39 44 40 46 40C50 40 54 36 54 32C54 28 50 24 46 24C44 24 42 25 41 27L23 27C22 25 20 24 18 24Z" fill="#F4EAD5" stroke="#D3C3A4" strokeWidth="3"/>
        <circle cx="16" cy="27" r="5" fill="#F4EAD5" stroke="#D3C3A4" strokeWidth="3"/>
        <circle cx="16" cy="37" r="5" fill="#F4EAD5" stroke="#D3C3A4" strokeWidth="3"/>
        <circle cx="48" cy="27" r="5" fill="#F4EAD5" stroke="#D3C3A4" strokeWidth="3"/>
        <circle cx="48" cy="37" r="5" fill="#F4EAD5" stroke="#D3C3A4" strokeWidth="3"/>
      </svg>
    )
  },

  'kitten-milk': {
    id: 'kitten-milk',
    name: '貓咪與牛奶瓶',
    ageGroup: 'toddler',
    prompt: '請引導可愛的貓咪穿過迷宮找到鮮牛奶！',
    startName: '貓咪',
    endName: '牛奶',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Ears */}
        <polygon points="12,32 20,10 32,24" fill="#FFCDB2" stroke="#E5989B" strokeWidth="2"/>
        <polygon points="52,32 44,10 32,24" fill="#FFCDB2" stroke="#E5989B" strokeWidth="2"/>
        <polygon points="16,28 21,15 28,24" fill="#FFB4A2"/>
        <polygon points="48,28 43,15 36,24" fill="#FFB4A2"/>
        {/* Head */}
        <circle cx="32" cy="36" r="18" fill="#FFCDB2"/>
        {/* Whiskers */}
        <line x1="12" y1="36" x2="22" y2="37" stroke="#6D6875" strokeWidth="2"/>
        <line x1="10" y1="42" x2="22" y2="40" stroke="#6D6875" strokeWidth="2"/>
        <line x1="52" y1="36" x2="42" y2="37" stroke="#6D6875" strokeWidth="2"/>
        <line x1="54" y1="42" x2="42" y2="40" stroke="#6D6875" strokeWidth="2"/>
        {/* Eyes */}
        <ellipse cx="24" cy="34" rx="3" ry="4" fill="#6D6875"/>
        <ellipse cx="40" cy="34" rx="3" ry="4" fill="#6D6875"/>
        <circle cx="23" cy="33" r="1" fill="#FFF"/>
        <circle cx="39" cy="33" r="1" fill="#FFF"/>
        {/* Nose */}
        <polygon points="32,40 30,38 34,38" fill="#E5989B"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="22" y="24" width="20" height="34" rx="4" fill="#E8F1F5" stroke="#4895EF" strokeWidth="3"/>
        <rect x="24" y="10" width="16" height="14" fill="#BEE9E8" stroke="#4895EF" strokeWidth="3"/>
        <path d="M22 34H42V54H22V34Z" fill="#4895EF" opacity="0.3"/>
        <text x="32" y="46" fontSize="10" fontWeight="bold" fill="#4895EF" textAnchor="middle">MILK</text>
      </svg>
    )
  },

  'pirate-treasure': {
    id: 'pirate-treasure',
    name: '海盜船與藏寶箱',
    ageGroup: 'kids',
    prompt: '勇敢的海盜船，出航避開險礁尋找藏寶箱！',
    startName: '海盜船',
    endName: '寶藏箱',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Mast & Sails */}
        <line x1="32" y1="8" x2="32" y2="42" stroke="#5C3D2E" strokeWidth="4"/>
        <path d="M32 12C44 14 44 28 32 30Z" fill="#F4F4F6" stroke="#22252A" strokeWidth="2"/>
        <polygon points="32,8 24,12 32,16" fill="#D90429"/>
        {/* Skull logo */}
        <circle cx="37" cy="21" r="3" fill="#22252A"/>
        {/* Hull */}
        <path d="M10 38C10 38 18 54 32 54C46 54 54 38 54 38H10Z" fill="#8B5E34" stroke="#5C3D2E" strokeWidth="3"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="12" y="28" width="40" height="26" rx="3" fill="#B56576" stroke="#6B2D5C" strokeWidth="3"/>
        <path d="M10 28C10 20 22 16 32 16C42 16 54 20 54 28H10Z" fill="#D88C9A" stroke="#6B2D5C" strokeWidth="3"/>
        <rect x="28" y="28" width="8" height="12" fill="#F4A261" stroke="#6B2D5C" strokeWidth="2"/>
        <circle cx="32" cy="32" r="2" fill="#6B2D5C"/>
      </svg>
    )
  },

  'knight-dragon': {
    id: 'knight-dragon',
    name: '騎士與城堡',
    ageGroup: 'kids',
    prompt: '勇敢的騎士出發！通過迷宮前往安全城堡！',
    startName: '騎士',
    endName: '城堡',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Helmet */}
        <path d="M20 28C20 18 25 14 32 14C39 14 44 18 44 28V46H20V28Z" fill="#ADB5BD" stroke="#343A40" strokeWidth="3"/>
        {/* Visor */}
        <rect x="24" y="26" width="16" height="6" rx="2" fill="#212529"/>
        <line x1="28" y1="29" x2="36" y2="29" stroke="#E9ECEF" strokeWidth="1.5"/>
        {/* Plume */}
        <path d="M32 14C32 6 24 4 20 8" stroke="#D90429" strokeWidth="4" strokeLinecap="round"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="14" y="28" width="36" height="26" fill="#6C757D" stroke="#212529" strokeWidth="3"/>
        {/* Towers */}
        <rect x="10" y="20" width="12" height="34" fill="#495057" stroke="#212529" strokeWidth="3"/>
        <rect x="42" y="20" width="12" height="34" fill="#495057" stroke="#212529" strokeWidth="3"/>
        {/* Roofs */}
        <polygon points="16,8 8,20 24,20" fill="#D90429"/>
        <polygon points="48,8 40,20 56,20" fill="#D90429"/>
        {/* Gate */}
        <path d="M26 54V40C26 36 38 36 38 40V54H26Z" fill="#212529"/>
      </svg>
    )
  },

  'cyber-chip': {
    id: 'cyber-chip',
    name: '賽博節點與核心晶片',
    ageGroup: 'teens',
    prompt: '解鎖加密傳輸路徑，將資料傳送至核心晶片！',
    startName: '起始節點',
    endName: '核心晶片',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" fill="#0F172A" stroke="#38BDF8" strokeWidth="3"/>
        <circle cx="32" cy="32" r="14" fill="#1E293B" stroke="#818CF8" strokeWidth="2"/>
        <circle cx="32" cy="32" r="6" fill="#38BDF8"/>
        <path d="M32 6V10M32 54V58M6 32H10M54 32H58" stroke="#38BDF8" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="16" y="16" width="32" height="32" rx="4" fill="#0F172A" stroke="#C084FC" strokeWidth="3"/>
        <rect x="24" y="24" width="16" height="16" fill="#A855F7"/>
        {/* Pins */}
        <path d="M20 8V16M32 8V16M44 8V16M20 48V56M32 48V56M44 48V56M8 20H16M8 32H16M8 44H16M48 20H56M48 32H56M48 44H56" stroke="#C084FC" strokeWidth="2"/>
      </svg>
    )
  },

  'compass-quest': {
    id: 'compass-quest',
    name: '探險羅盤與目標',
    ageGroup: 'teens',
    prompt: '精準算出一條無障礙通路，抵達探險終點！',
    startName: '羅盤',
    endName: '終點',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" fill="#1E293B" stroke="#F59E0B" strokeWidth="3"/>
        <polygon points="32,14 36,32 32,28 28,32" fill="#EF4444"/>
        <polygon points="32,50 36,32 32,36 28,32" fill="#94A3B8"/>
        <circle cx="32" cy="32" r="3" fill="#F59E0B"/>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="22" fill="#1E293B" stroke="#10B981" strokeWidth="3"/>
        <circle cx="32" cy="32" r="14" fill="#047857"/>
        <circle cx="32" cy="32" r="6" fill="#34D399"/>
        <circle cx="32" cy="32" r="2" fill="#FFFFFF"/>
      </svg>
    )
  },

  'classic-geo': {
    id: 'classic-geo',
    name: '極簡標籤 A -> B',
    ageGroup: 'adult',
    prompt: '全神貫注分析路徑死路，突破最高難度考驗。',
    startName: '起點 (A)',
    endName: '終點 (B)',
    renderStart: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="44" height="44" rx="8" fill="#18181B" stroke="#F4F4F5" strokeWidth="3"/>
        <text x="32" y="41" fontSize="26" fontWeight="900" fill="#F4F4F5" textAnchor="middle" fontFamily="sans-serif">A</text>
      </svg>
    ),
    renderEnd: (size = 32) => (
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="10" y="10" width="44" height="44" rx="8" fill="#D97706" stroke="#FEF3C7" strokeWidth="3"/>
        <text x="32" y="41" fontSize="26" fontWeight="900" fill="#FFFFFF" textAnchor="middle" fontFamily="sans-serif">B</text>
      </svg>
    )
  }
};
