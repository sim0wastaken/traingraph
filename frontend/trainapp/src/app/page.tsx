'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const examplePrompts = [
  "What the hell is happening on this train?",
  "Tell me a curious fact about this train",
  "What are people talking about?",
  "Who is Bart and what does he think about cities?",
  "What's the deal with the AC on this train?"
];

const TrainIcon = () => (
  <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 2c-4 0-8 .5-8 4v9.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h2.23l2-2H14l2 2H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM12 10H6V7h6v3zm6 0h-4V7h4v3z"/>
  </svg>
);

const SendIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
  </svg>
);

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (messageText?: string) => {
    const message = messageText || currentMessage.trim();
    if (!message || isLoading) return;

    const userMessage: Message = {
      id: Date.now() + '-user',
      type: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsLoading(true);
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: message }),
      });

      const data = await response.json();

      // Simulate typing delay for better UX
      setTimeout(() => {
        const botMessage: Message = {
          id: Date.now() + '-bot',
          type: 'bot',
          content: data.response || 'Sorry, I had trouble understanding that.',
          timestamp: new Date(),
        };

        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error('Error sending message:', error);
      setTimeout(() => {
        const errorMessage: Message = {
          id: Date.now() + '-error',
          type: 'bot',
          content: 'Sorry, something went wrong. Please try again.',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, errorMessage]);
        setIsTyping(false);
      }, 1000);
    } finally {
      setIsLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  const handleExampleClick = (prompt: string) => {
    sendMessage(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="container mx-auto px-4 pt-12 pb-8 mobile-optimize">
          {/* Header */}
          <div className="text-center mb-12 animate-fade-in-up">
            <div className="inline-flex items-center justify-center space-x-3 mb-6">
              <div className="p-3 bg-blue-600 rounded-2xl shadow-lg hover-lift interactive-element">
                <TrainIcon />
              </div>
              <div>
                <h1 className="text-5xl md:text-7xl font-black gradient-text tracking-tight">
                  Simone's Train
                </h1>
                <div className="flex items-center justify-center space-x-2 mt-2 train-track relative">
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent flex-1"></div>
                  <span className="text-sm font-medium text-blue-600 px-3 bg-white/80 rounded-full">Torino → Roma</span>
                  <div className="h-px bg-gradient-to-r from-transparent via-blue-300 to-transparent flex-1"></div>
                </div>
              </div>
            </div>

            <p className="text-xl md:text-2xl text-slate-700 max-w-4xl mx-auto mb-8 leading-relaxed font-light animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Welcome aboard the chaotic <span className="font-semibold text-blue-700">Torino-Salerno express</span>! 
              When the journey got <em className="text-purple-600 not-italic font-medium">really</em> loud, 
              Simone did what any reasonable person would do: turned overheard conversations into an AI knowledge graph.
            </p>

            {/* Stats Card */}
            <div className="glass-effect rounded-3xl p-8 max-w-3xl mx-auto mb-8 shadow-xl hover-lift animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center interactive-element">
                  <div className="text-3xl font-bold text-blue-600 mb-1">300km/h</div>
                  <div className="text-sm text-slate-600 font-medium">Peak Speed</div>
                </div>
                <div className="text-center interactive-element">
                  <div className="text-3xl font-bold text-purple-600 mb-1">∞</div>
                  <div className="text-sm text-slate-600 font-medium">Loudness Level</div>
                </div>
                <div className="text-center interactive-element">
                  <div className="text-3xl font-bold text-indigo-600 mb-1">1</div>
                  <div className="text-sm text-slate-600 font-medium">Knowledge Graph</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover-lift interactive-element animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
              <span>Ask me anything about this chaotic journey!</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
            </div>
          </div>

          {/* Chat Interface */}
          <div className="max-w-5xl mx-auto animate-fade-in-up" style={{ animationDelay: '0.8s' }}>
            <div className="glass-effect rounded-3xl shadow-2xl overflow-hidden">
              {/* Chat Header */}
              <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                      <div className="w-6 h-6 bg-white rounded-full animate-pulse-slow"></div>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Train Knowledge Assistant</h3>
                      <p className="text-blue-100 text-sm">Powered by overheard conversations</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-blue-100">Live from</div>
                    <div className="text-sm font-semibold">Car 7, Seat 23A</div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50 custom-scrollbar">
                {messages.length === 0 && (
                  <div className="text-center py-12 animate-fade-in-up">
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 hover-lift interactive-element">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">Ready to explore the train conversations?</h4>
                      <p className="text-slate-600 mb-6">Try one of these conversation starters:</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {examplePrompts.map((prompt, index) => (
                        <button
                          key={index}
                          onClick={() => handleExampleClick(prompt)}
                          className="group bg-white hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 border border-slate-200 hover:border-blue-300 rounded-2xl p-4 text-left hover-lift interactive-element animate-fade-in-up"
                          style={{ animationDelay: `${index * 0.1}s` }}
                        >
                          <div className="flex items-start space-x-3">
                            <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 group-hover:bg-purple-500 transition-colors"></div>
                            <span className="text-slate-700 font-medium text-sm leading-relaxed mobile-text">"{prompt}"</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {messages.map((message, index) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end animate-slide-in-right' : 'justify-start animate-slide-in-left'} chat-message-enter`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`flex max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl ${
                      message.type === 'user' ? 'flex-row-reverse' : 'flex-row'
                    } space-x-3`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 hover-lift ${
                        message.type === 'user' 
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600 ml-3' 
                          : 'bg-gradient-to-br from-slate-100 to-slate-200 mr-3'
                      }`}>
                        {message.type === 'user' ? (
                          <span className="text-white text-xs font-bold">S</span>
                        ) : (
                          <span className="text-slate-600 text-xs font-bold">🤖</span>
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-4 py-3 message-bubble ${
                        message.type === 'user'
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed mobile-text">{message.content}</p>
                        <p className={`text-xs mt-2 ${
                          message.type === 'user' ? 'text-blue-200' : 'text-slate-500'
                        }`}>
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}

                {isTyping && (
                  <div className="flex justify-start animate-slide-in-left">
                    <div className="flex flex-row space-x-3 max-w-xs">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                        <span className="text-slate-600 text-xs font-bold">🤖</span>
                      </div>
                      <div className="bg-white border border-slate-200 rounded-2xl px-4 py-3 shadow-sm">
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full typing-indicator"></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full typing-indicator" style={{ animationDelay: '0.1s' }}></div>
                          <div className="w-2 h-2 bg-slate-400 rounded-full typing-indicator" style={{ animationDelay: '0.2s' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="border-t border-slate-200 p-6 bg-white/50 backdrop-blur-sm">
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask about the train conversations..."
                      className="w-full border border-slate-300 rounded-2xl px-6 py-4 focus-ring bg-white/70 backdrop-blur-sm placeholder-slate-500 text-slate-800 mobile-text"
                      disabled={isLoading}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={!currentMessage.trim() || isLoading}
                    className={`bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-2xl hover:from-blue-700 hover:to-purple-700 focus-ring disabled:opacity-50 disabled:cursor-not-allowed hover-lift interactive-element group ${
                      isLoading ? 'btn-loading' : ''
                    }`}
                  >
                    <SendIcon />
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-12 animate-fade-in-up" style={{ animationDelay: '1s' }}>
            <div className="inline-flex items-center space-x-2 text-slate-600">
              <span className="text-sm">Made with</span>
              <span className="text-red-500 animate-pulse-slow">❤️</span>
              <span className="text-sm">by someone who just wanted a quiet ride to Rome</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
