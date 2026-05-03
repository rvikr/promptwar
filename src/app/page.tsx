"use client";

import { useChat } from '@ai-sdk/react';
import styles from "./page.module.css";
import { useLanguage } from "@/context/LanguageContext";
import { motion, AnimatePresence } from "framer-motion";
import { Send } from 'lucide-react';
import TimelineWidget from '@/components/Assistant/TimelineWidget';
import EligibilityWidget from '@/components/Assistant/EligibilityWidget';
import { useEffect, useRef, useState, FormEvent } from 'react';
import type { ElectionMessage } from '@/types/chat';

const STARTER_PROMPTS_EN = [
  "How do I register to vote?",
  "What is the election timeline?",
  "Am I eligible to vote?",
  "What are some common election myths?"
];

const STARTER_PROMPTS_HI = [
  "मैं मतदान के लिए पंजीकरण कैसे करूं?",
  "चुनाव की समयसीमा क्या है?",
  "क्या मैं वोट देने के लिए पात्र हूं?",
  "कुछ सामान्य चुनावी मिथक क्या हैं?"
];

export default function ChatAssistant() {
  const { language } = useLanguage();
  const starters = language === 'en' ? STARTER_PROMPTS_EN : STARTER_PROMPTS_HI;

  const { messages, sendMessage, status, error } = useChat<ElectionMessage>();

  const [input, setInput] = useState('');
  const isLoading = status === 'streaming' || status === 'submitted';

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleStarterClick = (prompt: string) => {
    if (isLoading) return;
    sendMessage({ text: prompt });
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.messages}>
        {messages.length === 0 ? (
          <div className={styles.emptyState}>
            <motion.h1
              className={styles.emptyStateTitle}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              VoteSmart Assistant
            </motion.h1>
            <motion.p style={{ color: 'var(--text-secondary)' }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
              {language === 'en' ? 'Your personal guide to the democratic process.' : 'लोकतांत्रिक प्रक्रिया के लिए आपका व्यक्तिगत मार्गदर्शक।'}
            </motion.p>
            <motion.div className={styles.starterPrompts} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              {starters.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  className={styles.promptChip}
                  onClick={() => handleStarterClick(prompt)}
                  disabled={isLoading}
                >
                  {prompt}
                </button>
              ))}
            </motion.div>
          </div>
        ) : (
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                className={`${styles.messageRow} ${styles[message.role] ?? ''}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className={`${styles.bubble} ${styles[message.role] ?? ''}`}>
                  {message.parts.map((part, idx) => {
                    switch (part.type) {
                      case 'text':
                        return <span key={idx}>{part.text}</span>;
                      case 'tool-showTimeline':
                        return <TimelineWidget key={idx} />;
                      case 'tool-checkEligibility':
                        return <EligibilityWidget key={idx} />;
                      default:
                        return null;
                    }
                  })}
                </div>
              </motion.div>
            ))}
            <div ref={messagesEndRef} />
          </AnimatePresence>
        )}
      </div>

      {error && (
        <div style={{
          margin: '0 auto',
          padding: '12px 20px',
          maxWidth: '680px',
          width: '100%',
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '12px',
          color: '#fca5a5',
          fontSize: '14px',
          textAlign: 'center',
          marginBottom: '8px'
        }}>
          Warning: {error.message?.includes('429') || error.message?.includes('quota')
            ? 'API rate limit reached. Please wait a moment and try again.'
            : `Something went wrong: ${error.message || 'Unknown error'}`}
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.inputForm}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={language === 'en' ? "Ask about the election process..." : "चुनाव प्रक्रिया के बारे में पूछें..."}
        />
        <button type="submit" disabled={isLoading || !input.trim()} className={styles.sendButton}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
}
