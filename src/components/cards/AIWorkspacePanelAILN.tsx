"use client";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import Tabs from "@/components/navigations/Tabs";

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

const comingSoon: Record<
  Exclude<TabId, "chat">,
  { title: string; body: string }
> = {
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
        {
          id: crypto.randomUUID(),
          role: "assistant",
          text: fakeReply(trimmed),
        },
      ]);
      setIsThinking(false);
    }, 500);
  }

  return (
    <div className="flex h-140 flex-col overflow-hidden rounded-lg border border-dashboard-border bg-card-1">
      <div className="flex shrink-0 items-center justify-between border-b border-dashboard-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Bot size={17} className="text-claude dark:text-lime-bright" />
          <h2 className="text-sm font-medium text-foreground">AI Workspace</h2>
          <span className="rounded-full bg-hijau-t px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-claude dark:bg-claude/15 dark:text-lime-bright">
            Beta
          </span>
        </div>
        <Info size={16} className="text-muted-foreground" />
      </div>

      <div className="shrink-0 border-b border-dashboard-border px-3 py-2">
        <Tabs<TabId>
          ariaLabel="Fitur AI Workspace"
          value={activeTab}
          onValueChange={setActiveTab}
          compact
          items={tabs.map((tab) => ({
            value: tab.id,
            label: tab.label,
            icon: <tab.icon size={14} />,
          }))}
        />
      </div>

      {activeTab !== "chat" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 px-8 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-hijau-t text-claude dark:bg-claude/15 dark:text-lime-bright">
            {(() => {
              const Icon = tabs.find((t) => t.id === activeTab)!.icon;
              return <Icon size={20} />;
            })()}
          </div>
          <p className="text-sm font-medium text-foreground">
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
                    ? "max-w-[92%] whitespace-pre-line rounded-lg rounded-tl-lg bg-dashboard-bg px-4 py-3 text-sm text-foreground"
                    : "ml-auto max-w-[85%] whitespace-pre-line rounded-lg rounded-tr-lg bg-claude px-4 py-3 text-sm text-white"
                }
              >
                {message.text}
              </div>
            ))}

            {isThinking && (
              <div className="flex w-fit items-center gap-1 rounded-lg rounded-tl-lg bg-dashboard-bg px-4 py-3">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.2s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.1s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-foreground/40" />
              </div>
            )}

            {messages.length === 1 && (
              <div>
                <p className="mb-2.5 text-xs font-medium text-muted-foreground">
                  Coba tanya
                </p>
                <div className="flex flex-wrap gap-2">
                  {suggestedPrompts.map((prompt) => (
                    <ButtonAILN
                      variant="chip"
                      size="chip"
                      key={prompt}
                      type="button"
                      onClick={() => sendMessage(prompt)}
                    >
                      {prompt}
                    </ButtonAILN>
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
              className="flex items-center gap-2 rounded-lg border border-dashboard-border bg-background px-3 py-2"
            >
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Tanya apa saja soal sesi ini..."
                className="min-w-0 flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <ButtonAILN
                variant="dark"
                size="iconRounded"
                type="submit"
                disabled={!draft.trim()}
                aria-label="Kirim pesan"
              >
                <Send size={14} />
              </ButtonAILN>
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
