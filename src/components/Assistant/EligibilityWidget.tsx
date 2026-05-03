"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { motion, AnimatePresence } from 'framer-motion';

const questions = [
  { id: 1, en: "Are you an Indian citizen?", hi: "क्या आप भारतीय नागरिक हैं?" },
  { id: 2, en: "Are you 18 years of age or older?", hi: "क्या आपकी आयु 18 वर्ष या उससे अधिक है?" },
  { id: 3, en: "Are you a resident of the polling area where you want to vote?", hi: "क्या आप उस मतदान क्षेत्र के निवासी हैं जहां आप वोट देना चाहते हैं?" }
];

export default function EligibilityWidget() {
  const { language } = useLanguage();
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<boolean[]>([]);
  const [isFinished, setIsFinished] = useState(false);

  const handleAnswer = (answer: boolean) => {
    const newAnswers = [...answers, answer];
    setAnswers(newAnswers);
    if (currentQ < questions.length - 1) {
      setCurrentQ(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const isEligible = isFinished && answers.every(answer => answer);

  return (
    <div className="glass-panel" style={{ padding: '20px', margin: '16px 0', borderRadius: '16px', minHeight: '200px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <AnimatePresence mode="wait">
        {!isFinished ? (
          <motion.div key={currentQ} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <h4 style={{ margin: '0 0 16px 0', fontSize: '1.1rem' }}>
              {language === 'en' ? questions[currentQ].en : questions[currentQ].hi}
            </h4>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button className="glass-button" style={{ flex: 1 }} onClick={() => handleAnswer(true)}>
                {language === 'en' ? 'Yes' : 'हां'}
              </button>
              <button className="glass-button" style={{ flex: 1 }} onClick={() => handleAnswer(false)}>
                {language === 'en' ? 'No' : 'नहीं'}
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div key="result" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {isEligible ? (
              <h4 style={{ color: 'var(--success)', margin: 0 }}>{language === 'en' ? 'You are eligible!' : 'आप पात्र हैं!'}</h4>
            ) : (
              <h4 style={{ color: 'var(--error)', margin: 0 }}>{language === 'en' ? 'Not eligible yet' : 'अभी पात्र नहीं हैं'}</h4>
            )}
            <button className="glass-button" style={{ marginTop: '16px', width: '100%' }} onClick={() => { setCurrentQ(0); setAnswers([]); setIsFinished(false); }}>
              {language === 'en' ? 'Restart' : 'फिर से शुरू करें'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
