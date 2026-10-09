/** Opaque world materials. Spaceship replaces the misread "alien sheep" topic. */

export const WORLD_TOPICS = {
  stone: {
    id: 'stone',
    name: '石牆',
    sky: 0x9aa3ad,
    fog: 0.032,
    floor: 0x5c564e,
    wall: 0x8d8478,
    roughness: 0.92,
    metalness: 0.04,
    goal: 0xf59e0b,
    light: 0xffe0b0,
    defaultForAges: ['adult'],
  },
  plants: {
    id: 'plants',
    name: '植物',
    sky: 0xcfe8ff,
    fog: 0.028,
    floor: 0x7dba6a,
    wall: 0x2f6b3a,
    roughness: 1,
    metalness: 0,
    goal: 0x4ade80,
    light: 0xfff6d5,
    defaultForAges: ['toddler', 'kids'],
  },
  spaceship: {
    id: 'spaceship',
    name: '未來飛船',
    sky: 0x070b14,
    fog: 0.055,
    floor: 0x121820,
    wall: 0x243044,
    roughness: 0.28,
    metalness: 0.82,
    emissive: 0x22d3ee,
    goal: 0x22d3ee,
    light: 0x7dd3fc,
    defaultForAges: ['teens'],
  },
};

export function defaultTopicForAge(ageKey) {
  const key = String(ageKey || '').toLowerCase();
  for (const topic of Object.values(WORLD_TOPICS)) {
    if (topic.defaultForAges.includes(key)) return topic.id;
  }
  return 'stone';
}
