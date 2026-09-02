"use client";

import {
  Bot,
  ClipboardList,
  HelpCircle,
  Info,
  Layers,
  MessageCircle,
  Network,
  Send,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

type TabId = "chat" | "quiz" | "flashcards" | "mindmap" | "action-plan";

const tabs: { id: TabId; label: string; icon: typeof MessageCircle }[] = [
  { id: "chat", label: "Chat", icon: MessageCircle },
  { id: "quiz", label: "Quiz", icon: HelpCircle },
  { id: "flashcards", label: "Flashcards", icon: Layers },
  { id: "mindmap", label: "Mind Map", icon: Network },
  { id: "action-plan", label: "Action Plan", icon: ClipboardList },
];

const suggestedPrompts = [
  "Ringkas sesi ini",
  "Apa poin-poin pentingnya?",
  "Buatkan quiz dari materi ini",
];

const comingSoon: Record<Exclude<TabId, "chat">, { title: string; body: string }> = {
  quiz: {
    title: "Quiz belum siap",
    body: "Quiz otomatis dari transcript sesi ini bakal muncul di sini.",
  },
  flashcards: {
    title: "Flashcards belum siap",
    body: "Kartu ringkasan per konsep akan dibuat otomatis dari materi sesi.",
  },
  mindmap: {
    title: "Mind map belum siap",
    body: "Visualisasi hubungan antar konsep dari sesi ini akan tampil di sini.",
  },
  "action-plan": {
    title: "Action plan belum siap",
    body: "Langkah-langkah praktis yang bisa langsung kamu terapkan dari sesi ini.",
  },
};

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

function fakeReply(prompt: string) {
  return `Oke, aku bantu soal "${prompt}" — di versi prototype ini jawabannya masih statis, integrasi AI beneran menyusul. 🙂`;
}

export default function AIWorkspacePanelAILN({
  firstName,
}: {
  firstName: string;
}) {
  const [activeTab, setActiveTab] = useState<TabId>("chat");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "greeting",
      role: "assistant",
      text: `👋 Hi ${firstName}! Saya siap membantumu memahami materi sesi ini.\n\nMau mulai dari mana hari ini?`,
    },
  ]);
  const [draft, setDraft] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, isThinking]);

  function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed) return;

    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), role: "user", text: trimmed },
    ]);
    setDraft("");
    setIsThinking(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: crypto.randomUUID(), role: "assistant", text: fakeReply(trimmed) },
      ]);
      setIsThinking(false);
    }, 500);
  }

  return (
    <div className="flex h-140 flex-col overflow-hidden rounded-2xl border border-dashboard-border bg-card-1">
      <div className="flex shrink-0 items-center justify-between border-b border-dashboard-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Bot size={17} className="text-claude dark:text-lime-bright" />
          <h2 className="text-sm font-semibold text-foreground">
            AI Workspace
          </h2>
          <span className="rounded-full bg-hijau-t px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-claude dark:bg-claude/15 dark:text-lime-bright">
            Beta
          </span>
        </div>
        <Info size={16} className="text-muted-foreground" />
      </div>

      <div className="flex shrink-0 items-center gap-1 overflow-x-auto border-b border-dashboard-border px-3 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright"
                : "text-muted-foreground hover:bg-dashboard-bg"
            }`}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab !== "chat" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
            {(() => {
              const Icon = tabs.find((t) => t.id === activeTab)!.icon;
              return <Icon size={20} />;
            })()}
          </div>
          <p className="text-sm font-semibold text-foreground">
            {comingSoon[activeTab].title}
          </p>
          <p className="max-w-xs text-xs text-muted-foreground">
            {comingSoon[activeTab].body}
          </p>
        </div>
      ) : (
        <>
          <div
            ref={scrollRef}
            className="flex flex-1 flex-col gap-4 overflow-y-auto px-5 py-4"
          >
            {messages.map((message) => (
              <div
                key={message.id}
                className={
                  message.role === "assistant"
                    ? "max-w-[92%] whitespace-pre-line rounded-2xl rounded-tl-sm bg-dashboard-bg px-4 py-3 text-sm text-foreground"
                    : "ml-auto max-w-[85%] whitespace-pre-line rounded-2xl rounded-tr-sm bg-claude px-4 py-3 text-sm text-white"
                }
              >
                {message.text}
              </div>
            ))}

            {isThinking && (
              <div className="flex w-fit items-center gap-1 rounded-2xl rounded-tl-sm bg-dashboard-bg px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" />
              </div>
            )}

            {messages.length === 1 && (
              <div>
                <p className="mb-2.5 text-xs font-semibold text-muted-foreground">
                  Coba tanya
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <button
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                      className="rounded-full border border-dashboard-border px-3 py-1.5 text-left text-xs text-foreground/70 transition-colors hover:border-claude hover:bg-hijau-t hover:text-claude dark:hover:border-lime-bright/60 dark:hover:bg-claude/15 dark:hover:text-lime-bright"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="shrink-0 border-t border-dashboard-border p-3">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(draft);
              }}
              className="flex items-center gap-2 rounded-xl border border-dashboard-border bg-background px-3 py-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Tanya apa saja soal sesi ini..."
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                disabled={!draft.trim()}
                aria-label="Kirim pesan"
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-claude text-white transition-colors hover:bg-claude/90 disabled:opacity-40"
              >
                <Send size={14} />
              </button>
            </form>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              AI bisa saja salah. Selalu verifikasi informasi penting.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
