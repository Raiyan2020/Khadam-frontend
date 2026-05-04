import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Bell, Loader2, X, BellOff, Trash2, AlertTriangle } from 'lucide-react';
import { useLanguage } from '../i18n';
import { GlassCard, Button } from '../components/GlassUI';
import { useNavigate } from '@tanstack/react-router';
import {
  useNotifications,
  useUnreadNotifications,
  useDeleteNotification,
  useDeleteAllNotifications,
  useMarkAllAsRead,
  NotificationData,
} from '../features/auth/hooks/useNotifications';

// ── Confirm dialog state ──────────────────────────────────────────────────────
type ConfirmState =
  | { open: false }
  | { open: true; mode: 'one'; id: string }
  | { open: true; mode: 'all' };

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { t, dir } = useLanguage();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;

  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [selectedNotif, setSelectedNotif] = useState<NotificationData | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState>({ open: false });

  const allQuery = useNotifications();
  const unreadQuery = useUnreadNotifications();
  const deleteOne = useDeleteNotification();
  const deleteAll = useDeleteAllNotifications();
  const markAllRead = useMarkAllAsRead();

  const activeQuery = showUnreadOnly ? unreadQuery : allQuery;
  const { fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = activeQuery;
  const allNotifications = activeQuery.data?.pages.flatMap(page => page.data) || [];

  // ── Handlers ────────────────────────────────────────────────────────────────
  const requestDeleteOne = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setConfirm({ open: true, mode: 'one', id });
  };

  const requestDeleteAll = () => {
    setConfirm({ open: true, mode: 'all' });
  };

  const handleConfirm = () => {
    if (!confirm.open) return;
    if (confirm.mode === 'one') {
      deleteOne.mutate(confirm.id, { onSettled: () => setConfirm({ open: false }) });
    } else {
      deleteAll.mutate(undefined, { onSettled: () => setConfirm({ open: false }) });
    }
  };

  const isPendingConfirm =
    (confirm.open && confirm.mode === 'one' && deleteOne.isPending) ||
    (confirm.open && confirm.mode === 'all' && deleteAll.isPending);

  // ── Loading state ────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-secondary">{t('loading')}</p>
      </div>
    );
  }

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-border px-4 pt-8 pb-4 flex items-center justify-between transition-colors">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: '..' })}
            className="w-10 h-10 rounded-full bg-glass border border-border flex items-center justify-center text-primary hover:bg-glassHigh transition-colors"
          >
            <BackIcon size={20} />
          </button>
          <h1 className="text-xl font-bold text-primary">{t('notifications_title')}</h1>
        </div>

        <div className="flex gap-2 items-center">
          {/* Mark all read */}
          <button
            onClick={() => markAllRead.mutate()}
            disabled={markAllRead.isPending}
            className="text-xs font-medium text-accent hover:text-accent-hover transition-colors flex items-center gap-1 disabled:opacity-50"
          >
            {markAllRead.isPending && <Loader2 size={12} className="animate-spin" />}
            {t('mark_read')}
          </button>

          {/* Unread filter toggle */}
          <button
            onClick={() => setShowUnreadOnly(prev => !prev)}
            title={showUnreadOnly ? 'Show all' : 'Show unread only'}
            className={`relative w-9 h-9 rounded-full border flex items-center justify-center transition-all duration-200 ${showUnreadOnly
              ? 'bg-accent text-white border-accent shadow-md shadow-accent/30'
              : 'bg-glass border-border text-secondary hover:text-primary hover:border-accent/40'
              }`}
          >
            <BellOff size={16} />
            {!showUnreadOnly && (unreadQuery.data?.pages[0]?.pagination.total ?? 0) > 0 && (
              <span className="absolute top-1 end-1 w-2 h-2 rounded-full bg-accent border-2 border-background" />
            )}
          </button>

          {/* Delete all */}
          {allNotifications.length > 0 && (
            <button
              onClick={requestDeleteAll}
              title="Delete all notifications"
              className="w-9 h-9 rounded-full bg-glass border border-border flex items-center justify-center text-red-400 hover:bg-red-50 hover:border-red-300 transition-all duration-200"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Filter label */}
      {showUnreadOnly && (
        <div className="px-4 pt-4">
          <div className="flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-xl px-3 py-2 w-fit">
            <BellOff size={14} className="text-accent" />
            <span className="text-xs font-semibold text-accent">{t('unread_only') || 'Unread only'}</span>
            <button onClick={() => setShowUnreadOnly(false)} className="ml-1 text-accent/60 hover:text-accent transition-colors">
              <X size={12} />
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="px-4 mt-4 space-y-3 animate-in fade-in duration-300">
        {allNotifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-secondary">
            <div className="w-20 h-20 rounded-full bg-glass border border-border flex items-center justify-center mb-6">
              <Bell size={40} className="opacity-20" />
            </div>
            <p className="text-sm font-medium">
              {showUnreadOnly ? (t('no_unread_notifications') || 'No unread notifications') : t('no_notifications')}
            </p>
            <p className="text-xs opacity-50 mt-1">{t('no_notifications_desc') || 'You will receive updates here'}</p>
          </div>
        ) : (
          <>
            {allNotifications.map(notif => (
              <GlassCard
                key={notif.id}
                onClick={() => setSelectedNotif(notif)}
                className={`flex gap-3 cursor-pointer transition-all hover:border-accent/30 active:scale-[0.98] ${!notif.read_at ? 'bg-accent/5 border-accent/20' : ''}`}
              >
                <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${!notif.read_at ? 'bg-accent animate-pulse' : 'bg-transparent'}`} />

                <div className="flex-1 min-w-0">
                  <h3 className={`text-sm truncate mb-0.5 ${!notif.read_at ? 'font-bold text-primary' : 'font-medium text-primary/80'}`}>
                    {notif.data.title}
                  </h3>
                  <span className="text-[10px] text-secondary tabular-nums">
                    {notif.created_at_diff ?? notif.created_at}
                  </span>
                </div>

                {/* Per-card delete */}
                <button
                  onClick={(e) => requestDeleteOne(e, notif.id)}
                  className="shrink-0 self-center w-8 h-8 rounded-full flex items-center justify-center text-red-400 hover:bg-red-50 hover:text-red-500 transition-all duration-200"
                >
                  <Trash2 size={15} />
                </button>
              </GlassCard>
            ))}

            {hasNextPage && (
              <div className="pt-4 flex justify-center">
                <Button
                  variant="secondary"
                  onClick={() => fetchNextPage()}
                  disabled={isFetchingNextPage}
                  className="!h-10 !px-8 text-xs"
                >
                  {isFetchingNextPage ? <Loader2 size={16} className="animate-spin" /> : t('load_more')}
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Notification Detail Bottom Sheet ─────────────────────────────────── */}
      {selectedNotif && (
        <div className="fixed inset-0 z-[100] flex items-end justify-center" onClick={() => setSelectedNotif(null)}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200" />
          <div
            className="relative w-full max-w-[991px] bg-background rounded-t-3xl border border-border border-b-0 shadow-2xl animate-in slide-in-from-bottom duration-300 p-6 pb-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1 rounded-full bg-border mx-auto mb-6" />
            <button
              onClick={() => setSelectedNotif(null)}
              className="absolute top-5 end-5 w-8 h-8 rounded-full bg-glass border border-border flex items-center justify-center text-secondary hover:text-primary transition-colors"
            >
              <X size={16} />
            </button>
            <div className="w-14 h-14 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center mb-4">
              <Bell size={26} className="text-accent" />
            </div>
            <h2 className="text-lg font-bold text-primary mb-2 leading-snug">{selectedNotif.data.title}</h2>
            <span className="text-xs text-secondary mb-4 block">{selectedNotif.created_at_diff ?? selectedNotif.created_at}</span>
            <div className="border-t border-border mb-4" />
            <p className="text-sm text-secondary leading-relaxed">{selectedNotif.data.description}</p>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Dialog ────────────────────────────────────────── */}
      {confirm.open && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center px-5" onClick={() => setConfirm({ open: false })}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-150" />
          <div
            className="relative w-full max-w-sm bg-background rounded-2xl border border-border shadow-2xl animate-in zoom-in-95 fade-in duration-200 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Icon */}
            <div className="w-14 h-14 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center mx-auto mb-4">
              <AlertTriangle size={28} className="text-red-400" />
            </div>

            {/* Text */}
            <h3 className="text-base font-bold text-white text-center mb-1">
              {confirm.mode === 'all'
                ? (t('delete_all_confirm_title') || 'Delete all notifications?')
                : (t('delete_confirm_title') || 'Delete notification?')}
            </h3>
            <p className="text-xs text-white text-center mb-6">
              {confirm.mode === 'all'
                ? (t('delete_all_confirm_desc') || 'This will permanently remove all your notifications.')
                : (t('delete_confirm_desc') || 'This notification will be permanently removed.')}
            </p>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={() => setConfirm({ open: false })}
                className="flex-1 h-11 rounded-xl border border-border text-sm font-medium text-white bg-glass hover:bg-glassHigh transition-colors"
              >
                {t('cancel') || 'Cancel'}
              </button>
              <button
                onClick={handleConfirm}
                disabled={isPendingConfirm}
                className="flex-1 h-11 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPendingConfirm && <Loader2 size={15} className="animate-spin" />}
                {t('delete') || 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};