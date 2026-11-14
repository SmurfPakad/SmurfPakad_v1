import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { agentApi } from '@/lib/api';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m SmurfBot, your blockchain forensics assistant. I can help you understand money laundering patterns, explain how our GNN detection works, or answer questions about using SmurfPakad. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput('');
    setIsLoading(true);

    try {
      // Ask the backend AML agent (IBM watsonx.ai / Groq server-side — no API keys in the browser).
      // Falls back to the built-in knowledge base when the backend is unreachable.
      let assistantResponse = '';
      const reply = await agentApi.chat(userInput).catch(() => null);
      const text = typeof reply?.message === 'string' ? reply.message.trim() : '';
      assistantResponse = text && !text.startsWith('SmurfPakad Agent: I can investigate') ? text : getSmartResponse(userInput);

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantResponse,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      // Fallback for demo
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: getSmartResponse(userInput),
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSmartResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('smurfing') || lowerQuery.includes('layering')) {
      return 'Smurfing, also known as layering, is a money laundering technique where large amounts of illicit funds are broken into hundreds of small transactions through multiple wallets (Fan-Out), then re-aggregated into clean wallets (Fan-In). SmurfPakad uses Graph Neural Networks to detect these patterns by analyzing transaction topology and identifying suspicious wallet clusters.';
    }
    
    if (lowerQuery.includes('gnn') || lowerQuery.includes('neural network')) {
      return 'Our Graph Neural Network (GNN) analyzes blockchain transaction graphs to identify suspicious patterns. It examines node centrality, edge weights, and temporal patterns to detect Fan-Out/Fan-In structures, Gather-Scatter patterns, and Peeling Chains. On the Elliptic2 benchmark our Temperature-Gated GATv2 reaches F1 0.564 / PR-AUC 0.604, beating the published GATv2 baseline.';
    }
    
    if (lowerQuery.includes('price') || lowerQuery.includes('cost') || lowerQuery.includes('pricing')) {
      return 'SmurfPakad offers three pricing tiers:\n\n📊 Analyst ($299/mo): Up to 100K transactions, basic visualization\n🚀 Professional ($799/mo): Up to 1M transactions, API access, real-time detection\n🏢 Enterprise ($2,499/mo): Unlimited analysis, custom GNN training, on-premise deployment\n\nAll plans include suspicion scoring and AML compliance reports!';
    }
    
    if (lowerQuery.includes('api') || lowerQuery.includes('integrate')) {
      return 'SmurfPakad provides a comprehensive REST API with 10 endpoints including transaction upload, pattern detection, wallet analysis, and real-time monitoring via WebSocket. Check out our API documentation for detailed integration guides, code examples, and authentication setup.';
    }
    
    if (lowerQuery.includes('data') || lowerQuery.includes('format') || lowerQuery.includes('upload')) {
      return 'SmurfPakad accepts transaction data in CSV format with columns: source_wallet_id, dest_wallet_id, amount, timestamp, and token_type. You can also provide a list of known illicit wallet addresses to improve detection accuracy. We support all major blockchains including Ethereum, Bitcoin, BSC, and Solana.';
    }
    
    if (lowerQuery.includes('accuracy') || lowerQuery.includes('detection rate')) {
      return 'Our Temperature-Gated GATv2 reaches F1 0.564 and PR-AUC 0.604 on held-out Elliptic2 data (2.27% positives), beating the published GATv2 baseline. The suspicion scoring algorithm uses centrality measures and connection analysis to known illicit nodes, providing confidence levels for each detected pattern.';
    }

    if (lowerQuery.includes('help') || lowerQuery.includes('how') || lowerQuery.includes('what')) {
      return 'I can help you with:\n\n🔍 Understanding Smurfing and money laundering detection\n🧠 Explaining our GNN technology\n💰 Pricing and plan details\n🔌 API integration guidance\n📊 Data format and upload process\n🎯 Detection accuracy and features\n\nWhat would you like to know more about?';
    }
    
    return 'Thank you for your question! I\'m here to help with blockchain forensics and SmurfPakad features. Could you please provide more details about what you\'d like to know? You can ask about Smurfing detection, our GNN technology, pricing, API integration, or any other SmurfPakad features.';
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {/* Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-crypto-purple hover:bg-crypto-dark-purple shadow-lg z-50 transition-all duration-300 hover:scale-110"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-crypto-blue border border-white/10 rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-crypto-purple to-crypto-dark-purple p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 bg-white/20 rounded-full flex items-center justify-center">
                <Bot className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">SmurfBot</h3>
                <p className="text-xs text-white/80">Blockchain Forensics Assistant</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 'assistant' && (
                    <div className="h-8 w-8 bg-crypto-purple/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-crypto-purple" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2 ${
                      message.role === 'user'
                        ? 'bg-crypto-purple text-white'
                        : 'bg-white/5 text-gray-200 border border-white/10'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className="text-xs opacity-60 mt-1">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {message.role === 'user' && (
                    <div className="h-8 w-8 bg-white/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              {isLoading && (
                <div className="flex gap-3">
                  <div className="h-8 w-8 bg-crypto-purple/20 rounded-full flex items-center justify-center">
                    <Bot className="h-4 w-4 text-crypto-purple animate-pulse" />
                  </div>
                  <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                disabled={isLoading}
              />
              <Button
                onClick={handleSendMessage}
                disabled={isLoading || !input.trim()}
                className="bg-crypto-purple hover:bg-crypto-dark-purple"
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;
