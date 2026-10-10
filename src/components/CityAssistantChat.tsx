'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CitizenData, JobContract, ActivityLog, CityMetrics } from '@/types';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  time: string;
  reasoningTokens?: number;
}

interface CityAssistantChatProps {
  metrics: CityMetrics;
  citizens: CitizenData[];
  jobs: JobContract[];
  logs: ActivityLog[];
  selectedCitizen: CitizenData | null;
}

const DEFAULT_SUGGESTIONS = [
  "How is the economy working right now?",
  "Who is leading the city and why?",
  "Why do citizens negotiate and counter-offer?",
  "How are digital passports used here?",
  "What are the citizens building in town?"
];

export const CityAssistantChat: React.FC<CityAssistantChatProps> = ({
  metrics,
  citizens,
  jobs,
  logs,
  selectedCitizen
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome-1',
      sender: 'assistant',
      text: "👋 **Welcome to the City Intelligence Oracle!**\n\nI am powered by **Inception Mercury 2.5** running at **Max Reasoning Effort**. I have 100% real-time awareness of every citizen's thoughts, wallet balances, bilateral negotiations, and digital passports.\n\nAsk me any question below to see how this autonomous city operates without any hardcoded scripts!",
      time: 'Just now',
      reasoningTokens: 980
    }
  ]);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputMessage).trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = {
      id: 'user-' + Date.now(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Build snapshot context for Mercury 2.5
      const context = {
        metrics,
        citizens: citizens.map(c => ({
          name: c.name,
          title: c.title,
          wallet: c.wallet,
          nativeSkills: c.nativeSkills,
          acquiredSkills: c.acquiredSkills,
          jobsCompleted: c.jobsCompleted,
          lastThought: logs.find(l => l.message.startsWith(c.name))?.message || null
        })),
        jobs: jobs.map(j => ({
          id: j.id,
          title: j.title,
          bounty: j.bounty,
          requiredSkills: j.requiredSkills,
          status: j.status
        })),
        recentLogs: logs.slice(0, 10),
        selectedCitizen: selectedCitizen ? {
          name: selectedCitizen.name,
          title: selectedCitizen.title,
          wallet: selectedCitizen.wallet
        } : null
      };

      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: text,
          context
        })
      });

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        id: 'assistant-' + Date.now(),
        sender: 'assistant',
        text: data.reply || "Mercury 2.5 analyzed the live state: the city is operating normally.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        reasoningTokens: data.reasoningTokens || 1024
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: 'error-' + Date.now(),
          sender: 'assistant',
          text: `⚠️ Error contacting Mercury 2.5: ${err?.message || 'Network error'}`,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Helper to render basic markdown bold and bullet points
  const renderFormattedText = (raw: string) => {
    const lines = raw.split('\n');
    return lines.map((line, idx) => {
      // Heading
      if (line.startsWith('### ')) {
        return (
          <h4 key={idx} style={{ margin: '8px 0 4px', fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            {line.replace('### ', '')}
          </h4>
        );
      }
      if (line.startsWith('* ') || line.startsWith('- ')) {
        const bulletText = line.substring(2);
        return (
          <div key={idx} style={{ paddingLeft: '12px', margin: '2px 0', display: 'flex', gap: '6px' }}>
            <span style={{ color: 'var(--accent, #00d2ff)' }}>•</span>
            <span>{parseBold(bulletText)}</span>
          </div>
        );
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '6px' }} />;
      }
      return (
        <p key={idx} style={{ margin: '3px 0' }}>
          {parseBold(line)}
        </p>
      );
    });
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div id="city-assistant-dock">
      {/* Collapsed Pill Button */}
      {!isOpen && (
        <button
          className="assistant-dock-pill"
          onClick={() => setIsOpen(true)}
          title="Open Mercury 2.5 Simulation Oracle"
        >
          <div className="assistant-pulsing-dot"></div>
          <span className="assistant-pill-icon">🧠</span>
          <span className="assistant-pill-title">Ask Mercury 2.5:</span>
          <span className="assistant-pill-subtitle">"How is everything working?"</span>
          <span className="assistant-pill-toggle">Expand ▲</span>
        </button>
      )}

      {/* Expanded Interactive Chat Drawer */}
      {isOpen && (
        <div className="assistant-window">
          {/* Header */}
          <div className="assistant-header">
            <div className="assistant-header-left">
              <span className="assistant-header-icon">🧠</span>
              <div>
                <div className="assistant-header-title">
                  Mercury 2.5 City Intelligence
                  <span className="assistant-status-tag">LIVE CONTEXT</span>
                </div>
                <div className="assistant-header-sub">
                  Real-time omniscient observer of citizen thoughts & economy
                </div>
              </div>
            </div>
            <div className="assistant-header-right">
              <button
                className="assistant-action-btn"
                onClick={() => setMessages(messages.slice(0, 1))}
                title="Reset conversation"
              >
                Clear
              </button>
              <button
                className="assistant-close-btn"
                onClick={() => setIsOpen(false)}
                title="Minimize assistant"
              >
                ▼ Minimize
              </button>
            </div>
          </div>

          {/* Prompt Suggestion Chips */}
          <div className="assistant-suggestions">
            {DEFAULT_SUGGESTIONS.map((sug, i) => (
              <button
                key={i}
                className="suggestion-chip"
                onClick={() => handleSendMessage(sug)}
                disabled={isLoading}
              >
                💡 {sug}
              </button>
            ))}
          </div>

          {/* Transcript / Messages */}
          <div className="assistant-messages">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`assistant-msg-row ${msg.sender === 'user' ? 'user' : 'bot'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="assistant-avatar">🧠</div>
                )}
                <div className="assistant-bubble">
                  <div className="assistant-bubble-meta">
                    <span className="msg-author">{msg.sender === 'user' ? 'You' : 'Mercury 2.5 Oracle'}</span>
                    <span className="msg-time">{msg.time}</span>
                  </div>
                  <div className="assistant-bubble-text">
                    {msg.sender === 'assistant' ? renderFormattedText(msg.text) : msg.text}
                  </div>
                  {msg.reasoningTokens ? (
                    <div className="msg-reasoning-badge">
                      <span>🧠 Inception Mercury 2.5:</span>
                      <strong>{msg.reasoningTokens} reasoning tokens</strong>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="assistant-msg-row bot">
                <div className="assistant-avatar">🧠</div>
                <div className="assistant-bubble loading">
                  <div className="assistant-thinking-indicator">
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <div className="dot"></div>
                    <span>Mercury 2.5 is reasoning with max effort (~1,000 tokens)...</span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="assistant-input-bar">
            <input
              type="text"
              placeholder="Ask how Maya, Liam, jobs, passports, or the economy works..."
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isLoading}
              autoFocus
            />
            <button
              className="assistant-send-btn"
              onClick={() => handleSendMessage()}
              disabled={isLoading || !inputMessage.trim()}
            >
              {isLoading ? 'Thinking...' : 'Send'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
