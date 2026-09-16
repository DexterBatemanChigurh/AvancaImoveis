"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

import {
  getNotificationsSummary,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/features/notifications/actions";
import { formatDateTime } from "@/lib/format";

const POLL_INTERVAL_MS = 20_000;

type Summary = Awaited<ReturnType<typeof getNotificationsSummary>>;

const KIND_LABELS: Record<string, string> = {
  lead: "Lead",
  visita: "Visita",
  proposta: "Proposta",
  venda: "Venda",
};

export function NotificationBell() {
  const router = useRouter();
  const [summary, setSummary] = useState<Summary>({ unread: 0, recent: [] });
  const [open, setOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      const data = await getNotificationsSummary().catch(() => null);
      if (!cancelled && data) setSummary(data);
    }
    poll();
    const id = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  async function handleOpenNotification(n: Summary["recent"][number]) {
    setOpen(false);
    if (!n.readAt) {
      await markNotificationRead(n.id);
      setSummary((s) => ({
        unread: Math.max(0, s.unread - 1),
        recent: s.recent.map((r) => (r.id === n.id ? { ...r, readAt: new Date() } : r)),
      }));
    }
    if (n.link) router.push(n.link);
  }

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setSummary((s) => ({
      unread: 0,
      recent: s.recent.map((r) => ({ ...r, readAt: r.readAt ?? new Date() })),
    }));
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label="Notificações"
        onClick={() => setOpen((v) => !v)}
        className="relative grid h-9 w-9 place-items-center rounded-md text-muted hover:bg-surface-2 hover:text-ink"
      >
        <Bell className="h-5 w-5" />
        {summary.unread > 0 && (
          <span className="absolute right-1 top-1 grid h-4 w-4 place-items-center rounded-full bg-danger text-[10px] font-medium text-white">
            {summary.unread > 9 ? "9+" : summary.unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-11 z-50 flex w-80 flex-col gap-2 rounded-card border border-line bg-surface p-3 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs uppercase tracking-wide text-muted">
                Notificações
              </span>
              {summary.unread > 0 && (
                <button
                  type="button"
                  onClick={handleMarkAll}
                  className="text-xs text-accent-ink hover:underline"
                >
                  Marcar todas como lidas
                </button>
              )}
            </div>

            {summary.recent.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted">Nenhuma notificação ainda.</p>
            ) : (
              <ul className="flex max-h-80 flex-col gap-1 overflow-y-auto">
                {summary.recent.map((n) => (
                  <li key={n.id}>
                    <button
                      type="button"
                      onClick={() => handleOpenNotification(n)}
                      className={`flex w-full flex-col gap-0.5 rounded-md p-2 text-left text-sm hover:bg-surface-2 ${
                        n.readAt ? "opacity-60" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <span className="font-mono text-[10px] uppercase tracking-wide text-muted">
                          {KIND_LABELS[n.kind] ?? n.kind}
                        </span>
                        {!n.readAt && <span className="h-1.5 w-1.5 rounded-full bg-accent" />}
                      </span>
                      <span className="font-medium">{n.title}</span>
                      {n.body && <span className="text-xs text-muted">{n.body}</span>}
                      <span className="text-xs text-muted">{formatDateTime(n.createdAt)}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
}
