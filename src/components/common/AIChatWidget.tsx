"use client";

import { useState, useRef, useEffect } from "react";
import { MessageCircle, X, Send, Bot, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";

interface Message {
  role: "user" | "model";
  text: string;
}

interface ChatHistory {
  role: "user" | "model";
  parts: { text: string }[];
}

interface ChatConfig {
  isActive: boolean;
  welcomeMessage: string;
  suggestions: string[];
}

export default function AIChatWidget() {
  const [config, setConfig] = useState<ChatConfig | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch("/api/chat/config")
      .then((res) => res.json())
      .then((data: ChatConfig) => {
        setConfig(data);
        setMessages([{ role: "model", text: data.welcomeMessage }]);
      })
      .catch(() => {
        setConfig({ isActive: false, welcomeMessage: "", suggestions: [] });
      });
  }, []);

  useEffect(() => {
    if (isOpen) {
      bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      inputRef.current?.focus();
    }
  }, [isOpen, messages]);

  const getHistory = (): ChatHistory[] =>
    messages
      .filter((_, i) => i > 0)
      .map((m) => ({
        role: m.role,
        parts: [{ text: m.text }],
      }));

  const sendMessage = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = { role: "user", text: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          history: getHistory(),
        }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };

      if (!res.ok || !data.reply) {
        throw new Error(data.error ?? "Terjadi kesalahan");
      }

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.reply as string },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Maaf, terjadi kesalahan. Silakan coba lagi.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const sendQuickMessage = async (text: string) => {
    if (isLoading) return;
    const userMessage: Message = { role: "user", text };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const currentHistory = messages
        .filter((_, i) => i > 0)
        .map((m) => ({ role: m.role, parts: [{ text: m.text }] }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, history: currentHistory }),
      });

      const data = (await res.json()) as { reply?: string; error?: string };
      if (!res.ok || !data.reply) throw new Error(data.error ?? "Error");

      setMessages((prev) => [
        ...prev,
        { role: "model", text: data.reply as string },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "model", text: "Maaf, terjadi kesalahan. Silakan coba lagi." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!config?.isActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {/* Chat window */}
      {isOpen && (
        <div className="w-[340px] sm:w-[380px] bg-white rounded-lg shadow-md border border-primary-100 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-700 to-primary-600 px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-white font-semibold text-sm leading-tight">
                  Asisten SMKMUDA
                </p>
                <p className="text-white/70 text-xs">
                  Tanya apapun tentang sekolah kami
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1 rounded-sm hover:bg-white/10"
              aria-label="Tutup chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[380px] bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                {msg.role === "model" && (
                  <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-4 h-4 text-primary-600" />
                  </div>
                )}
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-primary-600 text-white rounded-tr-sm"
                      : "bg-white text-gray-800 border border-gray-200 rounded-tl-sm"
                  }`}
                >
                  {msg.role === "user" ? (
                    msg.text
                  ) : (
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => (
                          <p className="mb-1 last:mb-0">{children}</p>
                        ),
                        strong: ({ children }) => (
                          <strong className="font-semibold">{children}</strong>
                        ),
                        ul: ({ children }) => (
                          <ul className="list-disc pl-4 my-1 space-y-0.5">
                            {children}
                          </ul>
                        ),
                        ol: ({ children }) => (
                          <ol className="list-decimal pl-4 my-1 space-y-0.5">
                            {children}
                          </ol>
                        ),
                        li: ({ children }) => <li>{children}</li>,
                        code: ({ children }) => (
                          <code className="bg-gray-100 rounded px-1 text-xs font-mono">
                            {children}
                          </code>
                        ),
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  )}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-primary-600" />
                </div>
                <div className="bg-white border border-gray-200 rounded-lg rounded-tl-sm px-4 py-3">
                  <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick suggestions */}
          {messages.length === 1 && config.suggestions.length > 0 && (
            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-2">
              {config.suggestions.map((q) => (
                <button
                  key={q}
                  onClick={() => sendQuickMessage(q)}
                  className="text-xs bg-primary-50 hover:bg-primary-100 text-primary-700 border border-primary-200 rounded-sm px-3 py-1 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 bg-white border-t border-gray-100 flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pertanyaan kamu..."
              maxLength={500}
              disabled={isLoading}
              className="flex-1 bg-gray-50 text-sm"
            />
            <Button
              size="icon"
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="bg-primary-600 hover:bg-primary-700 disabled:bg-primary-300 shrink-0 text-white"
              aria-label="Kirim pesan"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className={`w-14 h-14 rounded-full shadow-md flex items-center justify-center transition-all duration-300 ${
          isOpen
            ? "bg-gray-700 hover:bg-gray-800 rotate-0"
            : "bg-primary-600 hover:bg-primary-700 hover:scale-110"
        }`}
        aria-label={isOpen ? "Tutup chat" : "Buka chat asisten"}
      >
        {isOpen ? (
          <X className="w-6 h-6 text-white" />
        ) : (
          <MessageCircle className="w-6 h-6 text-white" />
        )}
      </button>
    </div>
  );
}
