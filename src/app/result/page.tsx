'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ScoreInput from '@/components/ScoreInput';
import SectionCard from '@/components/SectionCard';
import PrimaryButton from '@/components/PrimaryButton';
import { saveSession, generateId } from '@/lib/storage';
import { shareResult } from '@/lib/share';
import type { SessionSetup, BodyScores, CalmioSession } from '@/types';

const SCORE_LABELS: { key: keyof BodyScores; label: string }[] = [
  { key: 'bodyLightness', label: '体の軽さ' },
  { key: 'painRelief', label: '痛みの少なさ' },
  { key: 'fatigueRelief', label: '疲労の少なさ' },
  { key: 'mood', label: '気分の良さ' },
];

const defaultScores: BodyScores = {
  bodyLightness: 5,
  painRelief: 5,
  fatigueRelief: 5,
  mood: 5,
};

function readSetup(): SessionSetup | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('calmio_setup');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function ResultPage() {
  const router = useRouter();
  const [setup] = useState<SessionSetup | null>(readSetup);
  const [afterScores, setAfterScores] = useState<BodyScores>({ ...defaultScores });
  const [submitted, setSubmitted] = useState(false);
  const [savedSession, setSavedSession] = useState<CalmioSession | null>(null);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    if (!setup) router.replace('/');
  }, [setup, router]);

  const updateScore = (key: keyof BodyScores, value: number) => {
    setAfterScores((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    if (!setup || !setup.condition) return;
    const diff: BodyScores = {
      bodyLightness: afterScores.bodyLightness - setup.before.bodyLightness,
      painRelief: afterScores.painRelief - setup.before.painRelief,
      fatigueRelief: afterScores.fatigueRelief - setup.before.fatigueRelief,
      mood: afterScores.mood - setup.before.mood,
    };
    const session: CalmioSession = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      condition: setup.condition,
      durationMinutes: setup.durationMinutes,
      before: setup.before,
      after: afterScores,
      diff,
      soundType: setup.soundType,
      vibrationEnabled: false,
    };
    saveSession(session);
    setSavedSession(session);
    setSubmitted(true);
    sessionStorage.removeItem('calmio_setup');
  };

  const handleShare = async () => {
    if (!savedSession) return;
    const ok = await shareResult(savedSession);
    setShareMessage(ok ? 'シェアしました' : 'テキストをコピーしました');
    setTimeout(() => setShareMessage(''), 2500);
  };

  if (!setup) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-2 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!submitted) {
    return (
      <div className="max-w-lg mx-auto px-5 py-10 space-y-8">
        <section className="text-center space-y-2">
          <h1 className="text-xl font-bold text-[#222222]">おつかれさまでした</h1>
          <p className="text-[13px] text-[#999999]">セッション後の体感を記録しましょう</p>
        </section>

        <SectionCard className="space-y-5">
          <ScoreInput label="体の軽さ" value={afterScores.bodyLightness} onChange={(v) => updateScore('bodyLightness', v)} />
          <ScoreInput label="痛みの少なさ" value={afterScores.painRelief} onChange={(v) => updateScore('painRelief', v)} />
          <ScoreInput label="疲労の少なさ" value={afterScores.fatigueRelief} onChange={(v) => updateScore('fatigueRelief', v)} />
          <ScoreInput label="気分の良さ" value={afterScores.mood} onChange={(v) => updateScore('mood', v)} />
        </SectionCard>

        <PrimaryButton onClick={handleSubmit}>記録する</PrimaryButton>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto px-5 py-10 space-y-8">
      <section className="text-center space-y-1">
        <h1 className="text-xl font-bold text-[#222222]">セッション結果</h1>
        <p className="text-[12px] text-[#999999]">{setup.durationMinutes}分の調整セッション</p>
      </section>

      {/* Score cards */}
      <section className="space-y-2.5">
        {SCORE_LABELS.map(({ key, label }) => {
          const before = setup.before[key];
          const after = afterScores[key];
          const diff = after - before;
          return (
            <SectionCard key={key} className="flex items-center justify-between py-4">
              <div>
                <p className="text-[13px] font-medium text-[#222222]">{label}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[12px] text-[#AAAAAA]">{before}</span>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10M10 5l3 3-3 3" stroke="#CCCCCC" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="text-[13px] font-semibold text-[#222222]">{after}</span>
                </div>
              </div>
              <span className={`text-lg font-bold ${diff > 0 ? 'text-[#FF385C]' : diff < 0 ? 'text-[#AAAAAA]' : 'text-[#DDDDDD]'}`}>
                {diff > 0 ? `+${diff}` : diff === 0 ? '±0' : String(diff)}
              </span>
            </SectionCard>
          );
        })}
      </section>

      {/* Message */}
      <div className="bg-[#FFF8F9] rounded-2xl p-5 space-y-1.5">
        <p className="text-[13px] text-[#222222] leading-relaxed">
          今回のセッションでは、体感スコアに変化がありました。
        </p>
        <p className="text-[11px] text-[#999999] leading-relaxed">
          変化の感じ方には個人差があります。続けて記録することで、自分に合う使い方が見つかります。
        </p>
      </div>

      {/* Actions */}
      <section className="space-y-2.5">
        <PrimaryButton onClick={() => router.push('/')}>
          もう一度試す
        </PrimaryButton>
        <button
          onClick={() => router.push('/history')}
          className="w-full py-3.5 rounded-2xl bg-white text-[#222222] text-[13px] font-medium border border-[#EEEEEE] cursor-pointer hover:border-[#CCCCCC] hover:shadow-sm hover:bg-[#FAFAFA] transition-all duration-150"
        >
          履歴を見る
        </button>
        <button
          onClick={handleShare}
          className="w-full py-3.5 rounded-2xl bg-white text-[#FF385C] text-[13px] font-medium border border-[#FF385C]/30 cursor-pointer hover:bg-[#FFF0F3] hover:shadow-sm transition-all duration-150"
        >
          結果をシェアする
        </button>
        {shareMessage && (
          <p className="text-center text-[11px] text-[#999999]">{shareMessage}</p>
        )}
      </section>
    </div>
  );
}
