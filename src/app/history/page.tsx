'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import SectionCard from '@/components/SectionCard';
import PrimaryButton from '@/components/PrimaryButton';
import { getSessions, clearSessions } from '@/lib/storage';
import type { CalmioSession, BodyScores } from '@/types';

const SCORE_LABELS: { key: keyof BodyScores; label: string }[] = [
  { key: 'bodyLightness', label: '体の軽さ' },
  { key: 'painRelief', label: '痛みの少なさ' },
  { key: 'fatigueRelief', label: '疲労の少なさ' },
  { key: 'mood', label: '気分の良さ' },
];

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ja-JP', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function calcAverages(sessions: CalmioSession[]) {
  if (sessions.length === 0) return null;
  const sum = { bodyLightness: 0, painRelief: 0, fatigueRelief: 0, mood: 0 };
  for (const s of sessions) {
    sum.bodyLightness += s.diff.bodyLightness;
    sum.painRelief += s.diff.painRelief;
    sum.fatigueRelief += s.diff.fatigueRelief;
    sum.mood += s.diff.mood;
  }
  const n = sessions.length;
  return {
    bodyLightness: sum.bodyLightness / n,
    painRelief: sum.painRelief / n,
    fatigueRelief: sum.fatigueRelief / n,
    mood: sum.mood / n,
  };
}

export default function HistoryPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState<CalmioSession[]>(() => getSessions());
  const [showConfirm, setShowConfirm] = useState(false);

  const handleClear = () => {
    clearSessions();
    setSessions([]);
    setShowConfirm(false);
  };

  const averages = calcAverages(sessions);

  if (sessions.length === 0) {
    return (
      <div className="max-w-lg mx-auto px-5 py-10">
        <div className="flex items-center gap-3 mb-10">
          <Image src="/logo.png" alt="Calmio" width={100} height={46} />
        </div>
        <div className="text-center py-20 space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#FFF0F3] flex items-center justify-center mx-auto">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FF385C" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="12" y2="15" />
            </svg>
          </div>
          <div className="space-y-2">
            <p className="text-[14px] text-[#222222] font-medium">まだ記録がありません</p>
            <p className="text-[12px] text-[#AAAAAA] leading-relaxed">
              まずは3分のセッションから試してみましょう。
            </p>
          </div>
          <PrimaryButton onClick={() => router.push('/')} className="max-w-xs mx-auto">
            セッションを始める
          </PrimaryButton>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="Calmio" width={100} height={46} />
        </div>
        <span className="text-[12px] text-[#AAAAAA] bg-[#F5F5F5] px-3 py-1 rounded-full">
          {sessions.length}回
        </span>
      </div>

      {/* Averages */}
      {averages && (
        <SectionCard className="bg-[#FFF8F9] border-none">
          <h2 className="text-[13px] font-semibold text-[#222222] mb-3">平均変化</h2>
          <div className="grid grid-cols-2 gap-4">
            {SCORE_LABELS.map(({ key, label }) => {
              const val = averages[key];
              return (
                <div key={key} className="text-center">
                  <p className="text-[11px] text-[#999999]">{label}</p>
                  <p className={`text-xl font-bold mt-0.5 ${val > 0 ? 'text-[#FF385C]' : val < 0 ? 'text-[#AAAAAA]' : 'text-[#DDDDDD]'}`}>
                    {val > 0 ? '+' : ''}{val.toFixed(1)}
                  </p>
                </div>
              );
            })}
          </div>
        </SectionCard>
      )}

      {/* Session list */}
      <section className="space-y-2.5">
        {sessions.map((s) => (
          <SectionCard key={s.id} className="space-y-3 py-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-[#AAAAAA]">{formatDate(s.createdAt)}</span>
              <span className="text-[11px] font-medium text-[#222222] bg-[#F5F5F5] px-2.5 py-0.5 rounded-full">
                {s.durationMinutes}分
              </span>
            </div>
            <p className="text-[13px] font-medium text-[#222222]">{s.condition}</p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
              {SCORE_LABELS.map(({ key, label }) => {
                const diff = s.diff[key];
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-[11px] text-[#999999]">{label}</span>
                    <span className={`text-[12px] font-bold ${diff > 0 ? 'text-[#FF385C]' : diff < 0 ? 'text-[#AAAAAA]' : 'text-[#DDDDDD]'}`}>
                      {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : String(diff)}
                    </span>
                  </div>
                );
              })}
            </div>
          </SectionCard>
        ))}
      </section>

      {/* Delete */}
      <section className="pt-4">
        {!showConfirm ? (
          <button
            onClick={() => setShowConfirm(true)}
            className="w-full py-3 rounded-2xl text-[12px] text-[#BBBBBB] border border-[#EEEEEE] hover:border-[#DDDDDD] transition-all"
          >
            履歴をすべて削除する
          </button>
        ) : (
          <SectionCard className="bg-[#FFF8F9] border-none space-y-3">
            <p className="text-[13px] text-[#222222] text-center">本当に全ての履歴を削除しますか？</p>
            <div className="flex gap-2.5">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-2xl text-[13px] text-[#717171] border border-[#EEEEEE] hover:border-[#DDDDDD] transition-all"
              >
                キャンセル
              </button>
              <button
                onClick={handleClear}
                className="flex-1 py-3 rounded-2xl text-[13px] text-white bg-[#FF385C] hover:bg-[#E8304F] transition-all"
              >
                削除する
              </button>
            </div>
          </SectionCard>
        )}
      </section>
    </div>
  );
}
