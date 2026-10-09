import React from 'react';
import { Boxes } from 'lucide-react';
import { WORLD_TOPICS } from '../utils/worldTopics.js';

export default function WorldTopicPicker({ worldTopic, onTopicChange }) {
  return (
    <div>
      <label style={{ fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
        <Boxes size={16} color="var(--primary)" /> 3D 牆面材質
      </label>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
        {Object.values(WORLD_TOPICS).map((topic) => {
          const selected = worldTopic === topic.id;
          return (
            <button
              key={topic.id}
              type="button"
              onClick={() => onTopicChange(topic.id)}
              className={`btn btn-sm ${selected ? 'btn-primary' : 'btn-outline'}`}
              style={{ width: '100%' }}
            >
              {topic.name}
            </button>
          );
        })}
      </div>
    </div>
  );
}
