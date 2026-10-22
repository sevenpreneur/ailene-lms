"use client";

import type {
  NotificationItem,
  NotificationList,
  NotificationReadResult,
} from "@/apis/notifications";
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
import { useCallback, useEffect, useRef, useState } from "react";

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
  const readingIds = useRef(new Set<number>());
  const readQueue = useRef<Promise<void>>(Promise.resolve());
  const requestId = useRef(0);

  const load = useCallback(
    async (nextPage: number) => {
      const request = ++requestId.current;
      if (nextPage === 1) setItems([]);
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
        if (request !== requestId.current) return;
        setItems((prev) =>
          nextPage === 1 ? data.list : [...prev, ...data.list],
        );
        setPage(data.metapaging.current_page);
        setTotalPage(data.metapaging.total_page);
        onUnreadChange(data.unread_count);
      } catch (err) {
        if (request === requestId.current)
          setError(
            err instanceof Error ? err.message : "Gagal memuat notifikasi.",
          );
      } finally {
        if (request === requestId.current) setIsLoading(false);
      }
    },
    [projectId, onUnreadChange],
  );

  useEffect(() => {
    if (isOpen) void load(1);
  }, [isOpen, load]);

  const openItem = (item: NotificationItem) => {
    if (item.read_at === null && !readingIds.current.has(item.id)) {
      readingIds.current.add(item.id);
      readQueue.current = readQueue.current
        .catch(() => undefined)
        .then(async () => {
          try {
            const response = await fetch("/api/notifications/read", {
              method: "POST",
              headers: JSON_HEADERS,
              body: JSON.stringify({
                project_id: projectId,
                notification_ids: [item.id],
              }),
              keepalive: true,
            });
            if (!response.ok || response.redirected)
              throw new Error(
                "Status baca belum tersimpan. Coba buka notifikasi lagi.",
              );
            const result = (await response.json()) as NotificationReadResult;
            const readAt = dayjs().toISOString();
            setItems((previous) =>
              previous.map((row) =>
                row.id === item.id ? { ...row, read_at: readAt } : row,
              ),
            );
            onUnreadChange(result.unread_count);
          } catch {
            setError("Status baca belum tersimpan. Coba buka notifikasi lagi.");
          } finally {
            readingIds.current.delete(item.id);
          }
        });
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
      await readQueue.current;
      const response = await fetch("/api/notifications/read-all", {
        method: "POST",
        headers: JSON_HEADERS,
        body: JSON.stringify({ project_id: projectId }),
      });
      if (!response.ok) throw new Error("Gagal menandai notifikasi.");
      const result = (await response.json()) as NotificationReadResult;
      const readAt = dayjs().toISOString();
      setItems((prev) =>
        prev.map((row) => ({ ...row, read_at: row.read_at ?? readAt })),
      );
      onUnreadChange(result.unread_count);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Gagal menandai notifikasi.",
      );
    } finally {
      setIsMarkingAll(false);
    }
  };

  if (!isOpen) return null;

  return (
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
            <div
              role="alert"
              className="flex flex-col items-start gap-2 px-3 text-sm"
            >
              <p>{error}</p>
              <ButtonAILN
                variant="outline"
                size="small"
                disabled={isLoading}
                onClick={() => void load(1)}
              >
                Coba lagi
              </ButtonAILN>
            </div>
          )}
          {isLoading && items.length === 0 ? (
            <SkeletonRowsAILN
              count={5}
              rowClassName="h-16"
              className="gap-2 px-3"
            />
          ) : items.length === 0 && !error ? (
            <div className="px-3">
              <EmptyStateAILN>Belum ada notifikasi.</EmptyStateAILN>
            </div>
          ) : (
            items.map((item) => (
              <NotificationItemAILN
                key={item.id}
                item={item}
                onClick={openItem}
              />
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
    </SheetAILN>
  );
}
