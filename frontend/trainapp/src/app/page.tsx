'use client';

import { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

const knowledgeGraphPrompts = [
  "What the hell is happening on this train?",
  "Tell me a curious fact about this train",
  "What are people talking about?",
  "Who is Bart and what does he think about cities?",
  "What's the deal with the AC on this train?"
];

const fastLLMPrompts = [
  "Summarize the most interesting conversations on this train",
  "What can you tell me about the passengers' personalities?", 
  "Create a short story based on the train conversations",
  "What themes emerge from the overheard discussions?",
  "Analyze the social dynamics on this train",
  "Tell me more about Bart's views on Italian cities"
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

// Custom Markdown Component with styled elements
const MarkdownMessage = ({ children, isUser }: { children: string; isUser: boolean }) => {
  const customComponents = {
    // Headings
    h1: ({ children }: any) => <h1 className="text-xl font-bold mb-3 text-slate-800">{children}</h1>,
    h2: ({ children }: any) => <h2 className="text-lg font-bold mb-2 text-slate-800">{children}</h2>,
    h3: ({ children }: any) => <h3 className="text-base font-semibold mb-2 text-slate-700">{children}</h3>,
    
    // Paragraphs
    p: ({ children }: any) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
    
    // Lists
    ul: ({ children }: any) => <ul className="list-disc list-inside mb-3 space-y-1">{children}</ul>,
    ol: ({ children }: any) => <ol className="list-decimal list-inside mb-3 space-y-1">{children}</ol>,
    li: ({ children }: any) => <li className="text-sm leading-relaxed">{children}</li>,
    
    // Code blocks
    code: ({ inline, className, children, ...props }: any) => {
      if (inline) {
        return (
          <code 
            className={`px-1.5 py-0.5 rounded text-xs font-mono ${
              isUser 
                ? 'bg-white/20 text-blue-100' 
                : 'bg-slate-100 text-slate-800'
            }`} 
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <div className="my-3">
          <pre className={`p-3 rounded-lg text-xs font-mono overflow-x-auto ${
            isUser 
              ? 'bg-white/10 text-blue-50' 
              : 'bg-slate-50 text-slate-800 border border-slate-200'
          }`}>
            <code className={className} {...props}>
              {children}
            </code>
          </pre>
        </div>
      );
    },
    
    // Blockquotes
    blockquote: ({ children }: any) => (
      <blockquote className={`border-l-4 pl-4 my-3 italic ${
        isUser 
          ? 'border-white/40 text-blue-100' 
          : 'border-blue-300 text-slate-600'
      }`}>
        {children}
      </blockquote>
    ),
    
    // Tables
    table: ({ children }: any) => (
      <div className="my-3 overflow-x-auto">
        <table className={`min-w-full text-xs border-collapse ${
          isUser 
            ? 'border border-white/20' 
            : 'border border-slate-200'
        }`}>
          {children}
        </table>
      </div>
    ),
    th: ({ children }: any) => (
      <th className={`border px-3 py-2 text-left font-semibold ${
        isUser 
          ? 'border-white/20 bg-white/10' 
          : 'border-slate-200 bg-slate-50'
      }`}>
        {children}
      </th>
    ),
    td: ({ children }: any) => (
      <td className={`border px-3 py-2 ${
        isUser 
          ? 'border-white/20' 
          : 'border-slate-200'
      }`}>
        {children}
      </td>
    ),
    
    // Links
    a: ({ children, href, ...props }: any) => (
      <a 
        href={href} 
        className={`underline hover:no-underline ${
          isUser 
            ? 'text-blue-200 hover:text-white' 
            : 'text-blue-600 hover:text-blue-800'
        }`}
        target="_blank"
        rel="noopener noreferrer"
        {...props}
      >
        {children}
      </a>
    ),
    
    // Strong/Bold
    strong: ({ children }: any) => <strong className="font-semibold">{children}</strong>,
    
    // Emphasis/Italic
    em: ({ children }: any) => <em className="italic">{children}</em>,
    
    // Horizontal rule
    hr: () => <hr className={`my-4 ${isUser ? 'border-white/20' : 'border-slate-200'}`} />,
  };

  return (
    <ReactMarkdown
      components={customComponents}
      remarkPlugins={[remarkGfm]}
      rehypePlugins={[rehypeHighlight]}
    >
      {children}
    </ReactMarkdown>
  );
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'knowledge-graph' | 'fastllm'>('fastllm');
  const [showExamples, setShowExamples] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      const endpoint = mode === 'knowledge-graph' ? '/api/chat' : '/api/fastllm';
      
      // Prepare request body based on mode
      const requestBody = mode === 'knowledge-graph' 
        ? { question: message }
        : { 
            question: message,
            previousMessages: messages.map(msg => ({
              type: msg.type,
              content: msg.content,
              timestamp: msg.timestamp.toISOString()
            }))
          };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
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
    setShowExamples(false);
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
              I did what any reasonable person would do: turned overheard conversations into an AI knowledge graph.
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
                  <div className="text-3xl font-bold text-indigo-600 mb-1">2</div>
                  <div className="text-sm text-slate-600 font-medium">Knowledge Bases</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <button 
              onClick={() => {
                inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                setTimeout(() => inputRef.current?.focus(), 500);
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl hover-lift interactive-element animate-fade-in-up cursor-pointer transition-transform hover:scale-105" 
              style={{ animationDelay: '0.6s' }}
            >
              <span>Ask me anything about this yapping journey!</span>
              <div className="w-2 h-2 bg-white rounded-full animate-pulse-slow"></div>
            </button>
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
                      <h3 className="text-xl font-bold">The Southern Italy Vibes Train (We love it!)</h3>
                      <p className="text-blue-100 text-sm">
                        Powered by overheard conversations
                        {mode === 'fastllm' && messages.length > 0 && (
                          <span className="ml-2 px-2 py-0.5 bg-white/20 rounded-full text-xs">
                            💭 Memory Active
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-6">
                    {/* Mode Toggle */}
                    <div className="flex items-center space-x-3">
                      <div className="text-right text-xs">
                        <div className="text-blue-100">Mode</div>
                        <div className="font-semibold">
                          {mode === 'knowledge-graph' ? 'Knowledge Graph' : 'FastLLM'}
                        </div>
                      </div>
                      <div className="relative">
                        <input
                          type="checkbox"
                          id="mode-toggle"
                          checked={mode === 'fastllm'}
                          onChange={(e) => setMode(e.target.checked ? 'fastllm' : 'knowledge-graph')}
                          className="sr-only"
                        />
                        <label
                          htmlFor="mode-toggle"
                          className="block w-14 h-8 bg-white/20 rounded-full cursor-pointer relative transition-colors hover:bg-white/30"
                        >
                          <div
                            className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                              mode === 'fastllm' ? 'translate-x-6' : 'translate-x-0'
                            }`}
                          />
                          <div className="absolute inset-0 flex items-center justify-between px-2 text-xs font-medium">
                            <span className={mode === 'knowledge-graph' ? 'text-white' : 'text-white/50'}>KG</span>
                            <span className={mode === 'fastllm' ? 'text-white' : 'text-white/50'}>AI</span>
                          </div>
                        </label>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-blue-100">Live from</div>
                      <div className="text-sm font-semibold">Car 8, Seat 31</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="h-[500px] overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50/50 to-white/50 custom-scrollbar">
                {/* Example Prompts */}
                {(messages.length === 0 || showExamples) && (
                  <div className={`text-center animate-fade-in-up relative transition-all duration-300 ${
                    showExamples && messages.length > 0 
                      ? 'glass-effect rounded-3xl mx-4 my-4 border-2 border-blue-200 shadow-xl z-10' 
                      : ''
                  }`}>
                    {/* Close button for when examples are toggled after conversation started */}
                    {showExamples && messages.length > 0 && (
                      <button
                        onClick={() => setShowExamples(false)}
                        className="absolute top-4 right-4 w-8 h-8 bg-white/80 hover:bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:text-slate-700 hover-lift interactive-element shadow-sm"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    
                    <div className="mb-8">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4 hover-lift interactive-element">
                        <svg className="w-8 h-8 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                        </svg>
                      </div>
                      <h4 className="text-lg font-semibold text-slate-800 mb-2">
                        {messages.length === 0 ? 'Ready to explore the train conversations?' : 'Try these conversation ideas:'}
                      </h4>
                      <p className="text-slate-600 mb-6">
                        {messages.length === 0 ? 'Try one of these conversation starters:' : 'Click any prompt to continue the conversation:'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
                      {(mode === 'knowledge-graph' ? knowledgeGraphPrompts : fastLLMPrompts).map((prompt, index) => (
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
                          ? 'bg-gradient-to-br from-blue-600 to-purple-600 text-white user-message'
                          : 'bg-white border border-slate-200 text-slate-800 shadow-sm bot-message'
                      }`}>
                        <div className="mobile-text markdown-content">
                          <MarkdownMessage isUser={message.type === 'user'}>{message.content}</MarkdownMessage>
                        </div>
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
                {/* Example Prompts Toggle */}
                {messages.length > 0 && (
                  <div className="mb-4 flex justify-center">
                    <button
                      onClick={() => {
                        setShowExamples(!showExamples);
                        if (!showExamples) {
                          // Scroll to top of chat area to show examples
                          setTimeout(() => {
                            const chatArea = document.querySelector('.custom-scrollbar');
                            chatArea?.scrollTo({ top: 0, behavior: 'smooth' });
                          }, 100);
                        }
                      }}
                      className="inline-flex items-center space-x-2 bg-white/80 hover:bg-white border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-600 px-4 py-2 rounded-full text-sm font-medium hover-lift interactive-element transition-all"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      <span>{showExamples ? 'Hide' : 'Show'} Example Prompts</span>
                    </button>
                  </div>
                )}
                
                <form onSubmit={handleSubmit} className="flex space-x-4">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={currentMessage}
                      onChange={(e) => setCurrentMessage(e.target.value)}
                      placeholder="Ask about this experience..."
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
              <span className="text-sm">and too much caffeine by someone who should have been studying</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
