/** Opaque world materials: stone, plants, and a future spaceship hull. */

export const WORLD_TOPICS = {
  stone: {
    id: 'stone',
    name: '石牆',
    sky: 0xd5dde6,
    fog: 0.016,
    floor: 0x8d8680,
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
    sky: 0xe7f6ff,
    fog: 0.012,
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
    sky: 0xe4eaf1,
    fog: 0.012,
    floor: 0xa8b0b8,
    wall: 0xd8dde3,
    roughness: 0.62,
    metalness: 0.08,
    emissive: 0x22d3ee,
    goal: 0x22d3ee,
    light: 0xf7f8fa,
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
