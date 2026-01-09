/**
 * Advisor Page
 * 
 * Chat interface for asking skincare questions.
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, Send, User, Sparkles, HelpCircle } from 'lucide-react';
import { useAdvisor, useExampleQuestions } from '../hooks/useApi';
import ReactMarkdown from 'react-markdown';
import type { AdvisorResponse } from '../types';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  confidence?: number;
  followUps?: string[];
}

export default function Advisor() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { mutate: askQuestion, isPending } = useAdvisor();
  const { data: examples } = useExampleQuestions();

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle sending a message
  const handleSend = (question?: string) => {
    const text = question || input.trim();
    if (!text) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
    };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Ask the API
    askQuestion(
      { question: text },
      {
        onSuccess: (response: AdvisorResponse) => {
          const assistantMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: response.answer,
            confidence: response.confidence,
            followUps: response.follow_up_questions,
          };
          setMessages(prev => [...prev, assistantMessage]);
        },
        onError: () => {
          const errorMessage: Message = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: "Sorry, I couldn't process that question. Please try again.",
          };
          setMessages(prev => [...prev, errorMessage]);
        },
      }
    );
  };

  // Handle key press (Enter to send)
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="max-w-3xl mx-auto h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
          <MessageCircle className="w-6 h-6 text-primary-500" />
          Skincare Advisor
        </h1>
        <p className="text-gray-500 mt-1">
          Ask me anything about ingredients, routines, and skincare
        </p>
      </div>

      {/* Chat Area */}
      <div className="flex-1 card p-4 overflow-y-auto mb-4">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center p-8">
            <Sparkles className="w-12 h-12 text-primary-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-700 mb-2">
              How can I help you today?
            </h3>
            <p className="text-gray-500 mb-6">
              Ask me about ingredient compatibility, routine building, or skincare advice.
            </p>

            {/* Example Questions */}
            {examples && (
              <div className="w-full max-w-md">
                <p className="text-sm text-gray-500 mb-3 flex items-center gap-1">
                  <HelpCircle className="w-4 h-4" />
                  Try asking:
                </p>
                <div className="space-y-2">
                  {Object.values(examples).flat().slice(0, 4).map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(q)}
                      className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg text-sm text-gray-700 transition-colors"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map(message => (
              <div
                key={message.id}
                className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : ''}`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] p-4 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-primary-500 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <div className="prose prose-sm max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  
                  {/* Confidence indicator */}
                  {message.confidence !== undefined && message.confidence < 0.5 && (
                    <p className="text-xs mt-2 opacity-70 italic">
                      Note: I'm not fully confident about this answer.
                    </p>
                  )}

                  {/* Follow-up questions */}
                  {message.followUps && message.followUps.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs font-medium mb-2">Related questions:</p>
                      <div className="space-y-1">
                        {message.followUps.slice(0, 3).map((q, i) => (
                          <button
                            key={i}
                            onClick={() => handleSend(q)}
                            className="block text-left text-xs text-primary-600 hover:underline"
                          >
                            • {q}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
            
            {/* Loading indicator */}
            {isPending && (
              <div className="flex gap-3">
                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary-600 animate-pulse" />
                </div>
                <div className="bg-gray-100 p-4 rounded-2xl rounded-bl-md">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="card p-4">
        <div className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about skincare..."
            className="input flex-1"
            disabled={isPending}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || isPending}
            className="btn-primary px-4"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
