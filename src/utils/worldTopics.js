/** Opaque world materials: stone, plants, and a future spaceship hull. */

export const WORLD_TOPICS = {
  stone: {
    id: 'stone',
    name: '石牆',
    sky: 0xebf2f8,
    fog: 0.008,
    floor: 0xc4bcb3,
    wall: 0xdfd9d0,
    roughness: 0.75,
    metalness: 0.02,
    goal: 0xf59e0b,
    light: 0xfff3db,
    defaultForAges: ['adult'],
  },
  plants: {
    id: 'plants',
    name: '植物',
    sky: 0xe7f6ff,
    fog: 0.010,
    floor: 0xa5d48f,
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
    sky: 0xf0f7fd,
    fog: 0.006,
    floor: 0xdde5ed,
    wall: 0xf3f6fa,
    roughness: 0.45,
    metalness: 0.04,
    emissive: 0x06b6d4,
    goal: 0x06b6d4,
    light: 0xffffff,
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
