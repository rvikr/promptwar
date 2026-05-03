"use client";

import { useLanguage } from '@/context/LanguageContext';
import { motion } from 'framer-motion';

type TimelineStep = {
  title: string;
  description: string;
  icon: string;
};

export default function TimelineWidget() {
  const { t } = useLanguage();
  const stepsValue = t('walkthrough');
  const steps = Array.isArray(stepsValue) ? stepsValue.filter(isTimelineStep) : [];
  const processLabel = t('nav.process');

  if (steps.length === 0) return null;

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '16px 0', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <h3 style={{ margin: 0, borderBottom: '1px solid var(--glass-border)', paddingBottom: '8px' }}>
        {typeof processLabel === 'string' ? processLabel : 'Process'} Timeline
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {steps.map((step, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.1 }}
            style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}
          >
            <div style={{ fontSize: '24px', background: 'var(--glass-bg)', padding: '12px', borderRadius: '50%' }}>
              {step.icon}
            </div>
            <div>
              <h4 style={{ margin: '0 0 4px 0' }}>{step.title}</h4>
              <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{step.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

function isTimelineStep(value: unknown): value is TimelineStep {
  if (typeof value !== 'object' || value === null) return false;

  const step = value as Record<string, unknown>;
  return (
    typeof step.title === 'string' &&
    typeof step.description === 'string' &&
    typeof step.icon === 'string'
  );
}
