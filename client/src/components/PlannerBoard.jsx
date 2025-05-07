import React from 'react';
import ResizableNavbar from './ResizableNavbar';

const days = [
  'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'
];
const cards = {
  Monday: [
    { color: '#FFD580', text: 'ELA: News reading, writing', icon: '💡', note: 'Due end of week!' },
    { color: '#FDCBFF', text: 'Math: Multiplication, word problems', icon: '🫐', note: 'ASAP' },
  ],
  Tuesday: [
    { color: '#B6F5C9', text: 'Social Studies: Current events, significance', icon: '〰️' },
    { color: '#AEEBFF', text: 'Science: Video, note-taking', icon: '📹' },
  ],
  Wednesday: [
    { color: '#D6F5A7', text: 'Social Studies: Timeline, map', icon: '🗺️', sticker: 'YESSS' },
    { color: '#fff', text: 'Maximus', icon: '🍏', sticker: 'HELP' },
  ],
  Thursday: [
    { color: '#B6F5C9', text: 'SCIENCE: EXPERIMENT, OBSERVATIONS', icon: '🤖' },
    { color: '#E0E0E0', text: 'Social Studies: Research, poster/presentation', icon: '📄' },
  ],
  Friday: [
    { color: '#AEEBFF', text: 'ENVIRONMENTAL ISSUES, SOLUTIONS', icon: '🚧', sticker: 'Evelina' },
  ],
};

export default function PlannerBoard() {
  return (
    <div style={{ minHeight: '100vh', background: 'repeating-linear-gradient(0deg, #f7f7fa 0 2px, transparent 2px 32px), repeating-linear-gradient(90deg, #f7f7fa 0 2px, transparent 2px 32px)', fontFamily: 'Cal Sans, Arial, sans-serif', position: 'relative' }}>
      <ResizableNavbar />
      {/* Week label */}
      <div style={{ margin: '32px auto 0 32px', display: 'inline-block', background: '#19C37D', color: '#fff', fontWeight: 700, fontSize: '1.1rem', borderRadius: 8, padding: '8px 22px', fontFamily: 'Cal Sans, Arial, sans-serif', letterSpacing: 1 }}>Week 1</div>
      {/* Board grid */}
      <div style={{ display: 'flex', gap: 18, justifyContent: 'center', alignItems: 'flex-start', margin: '32px auto', maxWidth: 1200 }}>
        {days.map(day => (
          <div key={day} style={{ flex: 1, minWidth: 180, background: 'rgba(255,255,255,0.85)', borderRadius: 18, boxShadow: '0 2px 12px rgba(34,34,34,0.07)', padding: '18px 10px 32px 10px', margin: '0 2px', border: '1.5px solid #e0e0e0' }}>
            <div style={{ fontFamily: 'Caveat, cursive', fontSize: '1.5rem', fontWeight: 700, marginBottom: 12, textAlign: 'center', color: '#222', letterSpacing: 1 }}>{day}</div>
            {cards[day]?.map((card, i) => (
              <div key={i} style={{ background: card.color, borderRadius: 14, boxShadow: '0 2px 8px rgba(34,34,34,0.08)', margin: '0 0 18px 0', padding: '18px 14px 14px 14px', position: 'relative', minHeight: 80, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', fontFamily: 'Cal Sans, Arial, sans-serif', fontWeight: 500, fontSize: '1.08rem', color: '#222' }}>
                <span style={{ fontSize: '1.5rem', marginBottom: 6 }}>{card.icon}</span>
                <div>{card.text}</div>
                {card.note && <div style={{ position: 'absolute', left: -18, top: 10, background: '#a259f7', color: '#fff', fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1rem', borderRadius: 6, padding: '2px 10px', transform: 'rotate(-12deg)' }}>{card.note}</div>}
                {card.sticker && <div style={{ position: 'absolute', right: -18, bottom: 10, background: '#ff4ecd', color: '#fff', fontFamily: 'Caveat, cursive', fontWeight: 700, fontSize: '1rem', borderRadius: 6, padding: '2px 10px', transform: 'rotate(8deg)' }}>{card.sticker}</div>}
              </div>
            ))}
          </div>
        ))}
      </div>
      {/* Playful toolbar */}
      <div style={{ position: 'fixed', left: '50%', bottom: 24, transform: 'translateX(-50%)', background: '#fff', borderRadius: 18, boxShadow: '0 2px 12px rgba(34,34,34,0.10)', padding: '10px 28px', display: 'flex', gap: 18, alignItems: 'center', zIndex: 20 }}>
        <span style={{ fontSize: 22 }}>✏️</span>
        <span style={{ width: 24, height: 24, background: '#19C37D', borderRadius: '50%', display: 'inline-block' }}></span>
        <span style={{ width: 24, height: 24, background: '#FFD580', borderRadius: '50%', display: 'inline-block' }}></span>
        <span style={{ width: 24, height: 24, background: '#AEEBFF', borderRadius: '50%', display: 'inline-block' }}></span>
        <span style={{ fontSize: 22 }}>📎</span>
        <span style={{ fontSize: 22 }}>🗑️</span>
      </div>
    </div>
  );
} 