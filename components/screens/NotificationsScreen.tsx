'use client';

import { useEffect, useState } from 'react';
import { useT } from '@/context/LangContext';
import { PageHeader } from '@/components/shell/PageHeader';
import { Card } from '@/components/ui/Card';
import { Btn } from '@/components/ui/Btn';
import { Icons } from '@/components/ui/Icon';
import { useAppData } from '@/lib/useAppData';
import type { NotifType } from '@/lib/types';

const TYPE_STYLES: Record<NotifType, { icon: string; bg: string; dot: string }> = {
  info:    { icon: 'text-ink-2', bg: 'bg-bg-2',       dot: 'bg-muted-2' },
  success: { icon: 'text-green', bg: 'bg-green-soft',  dot: 'bg-green' },
  warning: { icon: 'text-amber', bg: 'bg-amber-tint',  dot: 'bg-amber' },
  error:   { icon: 'text-red',   bg: 'bg-red-soft',    dot: 'bg-red' },
};

export function NotificationsScreen() {
  const { lang } = useT();
  const fr = lang === 'fr';
  const { notifications } = useAppData();
  const [notifs, setNotifs] = useState(notifications);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  useEffect(() => {
    setNotifs(notifications);
  }, [notifications]);

  const shown = filter === 'unread' ? notifs.filter((n) => !n.read) : notifs;
  const unreadCount = notifs.filter((n) => !n.read).length;

  const markAllRead = () => setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));
  const markRead = (id: string) => setNotifs((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));

  return (
    <div>
      <PageHeader
        title={fr ? 'Notifications' : 'Notifications'}
        subtitle={fr ? `${unreadCount} non lues` : `${unreadCount} unread`}
        actions={
          <Btn variant="ghost" onClick={markAllRead}>
            {fr ? 'Tout marquer comme lu' : 'Mark all as read'}
          </Btn>
        }
      />

      <div className="px-8 py-6 pb-12 flex flex-col gap-5">
        {/* Filter */}
        <div className="flex gap-2">
          {(['all', 'unread'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-[13px] font-medium border transition-colors ${filter === f ? 'bg-rust text-white border-rust' : 'bg-bg border-line text-muted hover:border-rust'}`}>
              {f === 'all' ? (fr ? 'Toutes' : 'All') : (fr ? 'Non lues' : 'Unread')}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 bg-white text-rust text-[10px] font-bold rounded-full px-1.5 py-0.5">{unreadCount}</span>
              )}
            </button>
          ))}
        </div>

        <Card>
          {shown.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted text-[13px]">
              <Icons.bell />
              <div className="mt-2">{fr ? 'Aucune notification.' : 'No notifications.'}</div>
            </div>
          ) : (
            <div className="divide-y divide-line-2">
              {shown.map((notif) => {
                const style = TYPE_STYLES[notif.type];
                return (
                  <div key={notif.id} className={`flex items-start gap-4 px-5 py-4 transition-colors ${notif.read ? '' : 'bg-rust/[0.03]'}`}>
                    <div className={`w-9 h-9 rounded-lg ${style.bg} grid place-items-center flex-shrink-0 ${style.icon}`}>
                      {notif.type === 'success' ? <Icons.check /> : notif.type === 'warning' ? <Icons.alert /> : notif.type === 'error' ? <Icons.x /> : <Icons.info />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-semibold text-ink">{fr ? notif.title_fr : notif.title_en}</span>
                        {!notif.read && <span className={`w-2 h-2 rounded-full ${style.dot} flex-shrink-0`} />}
                      </div>
                      <div className="text-[12.5px] text-muted mt-0.5 leading-relaxed">{fr ? notif.body_fr : notif.body_en}</div>
                      <div className="text-[11.5px] text-muted-2 mt-1">{notif.timestamp}</div>
                    </div>
                    {!notif.read && (
                      <Btn variant="ghost" className="flex-shrink-0" onClick={() => markRead(notif.id)}>
                        {fr ? 'Lu' : 'Read'}
                      </Btn>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
