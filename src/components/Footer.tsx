'use client';

import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();
  if (pathname === '/session') return null;

  return (
    <footer className="pb-24 md:pb-8 pt-12 px-6">
      <div className="max-w-lg mx-auto space-y-3">
        <p className="text-[11px] text-[#AAAAAA] leading-relaxed text-center">
          本アプリはセルフケア、リラクゼーション、体感記録を目的としたものです。医療行為、診断、治療、予防を目的とするものではありません。痛みや不調が続く場合は医療機関にご相談ください。
        </p>
        <p className="text-[10px] text-[#CCCCCC] text-center">
          &copy; 2025 Calmio
        </p>
      </div>
    </footer>
  );
}
