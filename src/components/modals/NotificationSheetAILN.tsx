"use client";

import type { NotificationItem, NotificationList } from "@/apis/notifications";
import ButtonAILN from "@/components/buttons/ButtonAILN";
import NotificationItemAILN from "@/components/items/NotificationItemAILN";
import SheetAILN from "@/components/modals/SheetAILN";
import {
  EmptyStateAILN,
  SkeletonRowsAILN,
} from "@/components/states/DataStatesAILN";
import { notificationHref } from "@/lib/notifications";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const JSON_HEADERS = { "Content-Type": "application/json" };

export default function NotificationSheetAILN({
  projectId,
  isOpen,
  onClose,
  unreadCount,
  onUnreadChange,
}: {
  projectId: string;
  isOpen: boolean;
  onClose: () => void;
  unreadCount: number;
  onUnreadChange: (count: number) => void;
}) {
  const router = useRouter();
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isMarkingAll, setIsMarkingAll] = useState(false);

  const load = useCallback(
    async (nextPage: number) => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/notifications", {
          method: "POST",
          headers: JSON_HEADERS,
          body: JSON.stringify({ project_id: projectId, page: nextPage }),
        });
        if (!response.ok) throw new Error("Gagal memuat notifikasi.");
        const data = (await response.json()) as NotificationList;
        setItems((prev) => (nextPage === 1 ? data.list : [...prev, ...data.list]));
        setPage(data.metapaging.current_page);
        setTotalPage(data.metapaging.total_page);
        onUnreadChange(data.unread_count);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Gagal memuat notifikasi.");
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, onUnreadChange]
  );

  useEffect(() => {
    if (isOpen) void load(1);
  }, [isOpen, load]);

  useEffect(() => {
    if (!isOpen) return;
    const onEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onEscape);
    return () => document.removeEventListener("keydown", onEscape);
  }, [isOpen, onClose]);

  const openItem = (item: NotificationItem) => {
    if (item.read_at === null) {
      const readAt = dayjs().toISOString();
      setItems((prev) =>
        prev.map((row) => (row.id === item.id ? { ...row, read_at: readAt } : row))
      );
      onUnreadChange(Math.max(0, unreadCount - 1));
      // keepalive lets the request finish even when the click navigates away.
      void fetch("/api/notifications/read", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ project_id: projectId, notification_ids: [item.id] }),
        keepalive: true,
      }).catch(() => undefined);
    }
    const href = notificationHref(projectId, item);
    if (href) {
      onClose();
      router.push(href);
    }
  };

  const markAllRead = async () => {
    setIsMarkingAll(true);
    try {
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!response.ok) throw new Error("Gagal menandai notifikasi.");
      const readAt = dayjs().toISOString();
      setItems((prev) => prev.map((row) => ({ ...row, read_at: row.read_at ?? readAt })));
      onUnreadChange(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menandai notifikasi.");
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <SheetAILN
      sheetName="Notifikasi"
      sheetDescription={
        unreadCount > 0 ? `${unreadCount} belum dibaca` : "Semua sudah dibaca"
      }
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex min-h-0 flex-1 flex-col gap-2 px-3 pb-4">
        <div className="flex justify-end px-3">
          <ButtonAILN
            variant="textAccent"
            size="small"
            onClick={markAllRead}
            disabled={unreadCount === 0 || isMarkingAll}
          >
            Tandai semua dibaca
          </ButtonAILN>
        </div>

        <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto">
          {error && (
            <p className="px-3 text-sm text-destructive-foreground">{error}</p>
          )}
          {isLoading && items.length === 0 ? (
            <SkeletonRowsAILN count={5} rowClassName="h-16" className="gap-2 px-3" />
          ) : items.length === 0 && !error ? (
            <div className="px-3">
              <EmptyStateAILN>Belum ada notifikasi.</EmptyStateAILN>
            </div>
          ) : (
            items.map((item) => (
              <NotificationItemAILN key={item.id} item={item} onClick={openItem} />
            ))
          )}
          {page < totalPage && (
            <div className="flex justify-center pt-2">
              <ButtonAILN
                variant="neutral"
                size="medium"
                onClick={() => void load(page + 1)}
                disabled={isLoading}
              >
                {isLoading ? "Memuat…" : "Muat lebih banyak"}
              </ButtonAILN>
            </div>
          )}
        </div>
      </div>
    </SheetAILN>,
    document.body
  );
}
