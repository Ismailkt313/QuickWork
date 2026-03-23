import React from 'react';
import type { Skill } from '../../landingPage/services/landingService';

const SKILL_ICONS: Record<string, string> = {
  plumbing: '🔧', painting: '🖌️', electrical: '⚡', cleaning: '🧹',
  gardening: '🌿', moving: '🚛', carpentry: '🪚', roofing: '🏠',
  hvac: '❄️', pest: '🐛', security: '🔒', appliance: '📦',
  beauty: '💅', wellness: '🧘', tutoring: '📚', cooking: '🍳',
  photography: '📷', design: '🎨', it: '💻', mechanic: '🔩',
};

const getIcon = (skill: Skill) =>
  skill.icon
    ? skill.icon
    : Object.entries(SKILL_ICONS).find(([k]) => (skill.slug ?? skill.name ?? '').toLowerCase().includes(k))?.[1] ?? '🛠️';

interface SkillCardProps {
  skill: Skill;
  onClick?: (skill: Skill) => void;
}

const SkillCard: React.FC<SkillCardProps> = ({ skill, onClick }) => (
  <div
    onClick={() => onClick?.(skill)}
    className="d-flex flex-column align-items-center text-center"
    style={{
      minWidth: 120, padding: '20px 12px', borderRadius: 14,
      background: '#fff', border: '1.5px solid #f1f5f9',
      cursor: 'pointer', transition: 'all 0.22s ease', userSelect: 'none', gap: 10,
    }}
    onMouseEnter={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'translateY(-5px)';
      el.style.boxShadow = '0 10px 28px rgba(59,130,246,0.14)';
      el.style.borderColor = '#bfdbfe';
    }}
    onMouseLeave={e => {
      const el = e.currentTarget as HTMLElement;
      el.style.transform = 'translateY(0)';
      el.style.boxShadow = 'none';
      el.style.borderColor = '#f1f5f9';
    }}
  >
    <div style={{
      width: 56, height: 56, borderRadius: 12,
      background: 'linear-gradient(135deg,#eff6ff,#dbeafe)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26,
    }}>
      {getIcon(skill)}
    </div>
    <span style={{ fontSize: 12.5, fontWeight: 600, color: '#1e293b', textTransform: 'capitalize', lineHeight: 1.3 }}>
      {skill.name}
    </span>
  </div>
);

export default SkillCard;
