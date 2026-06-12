'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const navItems = [
  { href: '/', label: 'ホーム', icon: HomeIcon },
  { href: '/session', label: 'セッション', icon: SessionIcon },
  { href: '/history', label: 'ログ', icon: LogIcon },
];

function HomeIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF385C' : '#AAAAAA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

function SessionIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#FF385C' : 'none'} stroke={active ? '#FF385C' : '#AAAAAA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  );
}

function LogIcon({ active }: { active: boolean }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={active ? '#FF385C' : '#AAAAAA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="2" />
      <line x1="8" y1="7" x2="16" y2="7" />
      <line x1="8" y1="11" x2="16" y2="11" />
      <line x1="8" y1="15" x2="12" y2="15" />
    </svg>
  );
}

export default function BottomNav() {
  const pathname = usePathname();

  const isSessionActive = pathname === '/session';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-[#F0F0F0] z-50 md:hidden safe-area-bottom">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const active = item.href === '/session'
            ? isSessionActive
            : pathname === item.href && !isSessionActive;
          return (
            <Link
              key={item.href}
              href={item.href === '/session' ? '/' : item.href}
              className="flex flex-col items-center gap-0.5 py-2 px-5 min-w-[64px]"
            >
              <item.icon active={active} />
              <span className={`text-[10px] tracking-wide ${active ? 'text-[#FF385C] font-semibold' : 'text-[#AAAAAA]'}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
