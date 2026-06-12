'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { resumeAudioContext, startSound, stopSound } from '@/lib/sound';
import { canVibrate, vibrateBreathTransition, stopVibration } from '@/lib/vibration';
import BreathingCircle from '@/components/BreathingCircle';
import type { SessionSetup, SoundType } from '@/types';

type BreathPhase = 'inhale' | 'hold' | 'exhale';

const BREATH_DURATIONS: Record<BreathPhase, number> = {
  inhale: 4,
  hold: 2,
  exhale: 6,
};

const PHASE_LABELS: Record<BreathPhase, string> = {
  inhale: '吸う',
  hold: '止める',
  exhale: '吐く',
};

const MESSAGES = [
  'いま、あなたのペースで大丈夫。',
  '今の体感に意識を向けましょう',
  '変化は人それぞれです',
  'ゆったりとしたリズムを感じて',
  '体の力を抜いていきましょう',
  'がんばりすぎない、わたしのセルフケア時間。',
];

const SOUND_LABELS: Record<SoundType, string> = {
  'none': 'OFF',
  '432Hz': '432Hz',
  '528Hz': '528Hz',
  'ambient': '環境音',
};

function readSetup(): SessionSetup | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem('calmio_setup');
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export default function SessionPage() {
  const router = useRouter();
  const [setup] = useState<SessionSetup | null>(readSetup);
  const [waiting, setWaiting] = useState(true);
  const [remainingSeconds, setRemainingSeconds] = useState(() => setup ? setup.durationMinutes * 60 : 0);
  const [breathPhase, setBreathPhase] = useState<BreathPhase>('inhale');
  const [phaseElapsed, setPhaseElapsed] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(() => setup ? setup.soundType !== 'none' : false);
  const [vibrationEnabled, setVibrationEnabled] = useState(false);
  const [paused, setPaused] = useState(false);
  const [messageIndex, setMessageIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentSoundType] = useState<SoundType>(() => setup?.soundType ?? 'none');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const soundEnabledRef = useRef(soundEnabled);
  const currentSoundTypeRef = useRef<SoundType>(currentSoundType);
  const soundStartedByTap = useRef(false);

  useEffect(() => { soundEnabledRef.current = soundEnabled; }, [soundEnabled]);
  useEffect(() => { currentSoundTypeRef.current = currentSoundType; }, [currentSoundType]);

  useEffect(() => {
    if (!setup) router.replace('/');
  }, [setup, router]);

  const handleBeginSession = async () => {
    await resumeAudioContext();
    if (soundEnabledRef.current && currentSoundTypeRef.current !== 'none') {
      startSound(currentSoundTypeRef.current);
      soundStartedByTap.current = true;
    }
    setWaiting(false);
    setIsRunning(true);
  };

  useEffect(() => {
    if (waiting) return;
    if (soundStartedByTap.current) { soundStartedByTap.current = false; return; }
    if (soundEnabled && currentSoundType !== 'none') {
      startSound(currentSoundType);
    } else {
      stopSound();
    }
  }, [soundEnabled, currentSoundType, waiting]);

  const advancePhase = useCallback(() => {
    setBreathPhase((prev) => {
      const next: BreathPhase = prev === 'inhale' ? 'hold' : prev === 'hold' ? 'exhale' : 'inhale';
      if (vibrationEnabled) vibrateBreathTransition();
      return next;
    });
    setPhaseElapsed(0);
  }, [vibrationEnabled]);

  useEffect(() => {
    if (!isRunning || paused) return;
    timerRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          stopSound();
          stopVibration();
          router.push('/result');
          return 0;
        }
        return prev - 1;
      });
      setPhaseElapsed((prev) => {
        const limit = BREATH_DURATIONS[breathPhase];
        if (prev + 1 >= limit) { advancePhase(); return 0; }
        return prev + 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning, paused, breathPhase, advancePhase, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % MESSAGES.length);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePause = () => {
    if (paused) {
      setPaused(false);
    } else {
      setPaused(true);
      stopSound();
    }
  };

  const handleResume = async () => {
    await resumeAudioContext();
    if (soundEnabledRef.current && currentSoundTypeRef.current !== 'none') {
      startSound(currentSoundTypeRef.current);
    }
    setPaused(false);
  };

  const handleStop = () => {
    setIsRunning(false);
    stopSound();
    stopVibration();
    router.push('/');
  };

  const toggleSound = async () => {
    await resumeAudioContext();
    setSoundEnabled((prev) => !prev);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const breathProgress = BREATH_DURATIONS[breathPhase] > 0
    ? phaseElapsed / BREATH_DURATIONS[breathPhase]
    : 0;

  if (!setup) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white">
        <div className="w-8 h-8 border-2 border-[#FF385C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (waiting) {
    return (
      <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-10 z-50 px-6">
        <div className="text-center space-y-2">
          <h1 className="text-lg font-semibold text-[#222222]">呼吸をととのえる</h1>
          <p className="text-[13px] text-[#999999]">
            {setup.durationMinutes}分間セッション
          </p>
        </div>

        <div className="relative w-48 h-48 flex items-center justify-center">
          <div className="absolute w-full h-full rounded-full bg-[#FF385C]/5" style={{ animation: 'breathe-pulse 4s ease-in-out infinite' }} />
          <div className="absolute w-3/4 h-3/4 rounded-full bg-[#FF385C]/8 border-2 border-[#FF385C]/15" style={{ animation: 'breathe-pulse 4s ease-in-out infinite 1s' }} />
          <div className="absolute w-1/2 h-1/2 rounded-full bg-[#FF385C]/12 border-2 border-[#FF385C]/20" style={{ animation: 'breathe-pulse 4s ease-in-out infinite 2s' }} />
        </div>

        <button
          onClick={handleBeginSession}
          className="px-14 py-4 rounded-full bg-[#FF385C] text-white text-[15px] font-semibold shadow-lg cursor-pointer hover:bg-[#E8304F] hover:shadow-xl active:scale-[0.97] transition-all duration-150"
        >
          タップしてはじめる
        </button>

        <button
          onClick={() => router.push('/')}
          className="text-[13px] text-[#AAAAAA] cursor-pointer hover:text-[#717171] hover:underline transition-all duration-150"
        >
          キャンセル
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white flex flex-col z-50">
      {/* Header */}
      <div className="text-center pt-12 pb-2 px-6">
        <h1 className="text-[15px] font-semibold text-[#222222]">呼吸をととのえる</h1>
        <p className="text-[12px] text-[#999999] mt-0.5">{setup.durationMinutes}分間セッション</p>
      </div>

      {/* Breathing Circle - center */}
      <div className="flex-1 flex flex-col items-center justify-center gap-6 px-6">
        <BreathingCircle
          phase={breathPhase}
          progress={breathProgress}
          remainingTime={formatTime(remainingSeconds)}
          phaseLabel={paused ? '一時停止中' : PHASE_LABELS[breathPhase]}
          subLabel={paused ? 'タップして再開' : ''}
        />

        {/* Message card */}
        <div className="bg-[#FFF8F9] rounded-2xl px-5 py-3 flex items-center gap-2.5 max-w-xs">
          <span className="text-[#FF385C] text-sm">&#9829;</span>
          <p className="text-[12px] text-[#666666] leading-relaxed">
            {MESSAGES[messageIndex]}
          </p>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="pb-8 px-6 space-y-5">
        {/* Control buttons */}
        <div className="flex items-center justify-center gap-8">
          {/* Sound */}
          <button
            onClick={toggleSound}
            className="flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-150 ${
              soundEnabled ? 'bg-[#FFF0F3] hover:bg-[#FFE4E9]' : 'bg-[#F5F5F5] hover:bg-[#EBEBEB]'
            }`}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={soundEnabled ? '#FF385C' : '#AAAAAA'} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                {soundEnabled ? (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                  </>
                ) : (
                  <>
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                  </>
                )}
              </svg>
            </div>
            <span className="text-[10px] text-[#999999]">
              {soundEnabled ? SOUND_LABELS[currentSoundType] : 'サウンド'}
            </span>
          </button>

          {/* Pause / Play */}
          <button
            onClick={paused ? handleResume : handlePause}
            className="flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-16 h-16 rounded-full bg-[#FF385C] flex items-center justify-center shadow-lg hover:bg-[#E8304F] hover:shadow-xl active:scale-95 transition-all duration-150">
              {paused ? (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <polygon points="6,4 20,12 6,20" />
                </svg>
              ) : (
                <svg width="24" height="24" viewBox="0 0 24 24" fill="white">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
            </div>
            <span className="text-[10px] text-[#999999]">
              {paused ? '再開' : '一時停止'}
            </span>
          </button>

          {/* Stop */}
          <button
            onClick={handleStop}
            className="flex flex-col items-center gap-1.5 cursor-pointer"
          >
            <div className="w-12 h-12 rounded-full bg-[#F5F5F5] flex items-center justify-center hover:bg-[#EBEBEB] transition-all duration-150">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="#999999">
                <rect x="4" y="4" width="16" height="16" rx="2" />
              </svg>
            </div>
            <span className="text-[10px] text-[#999999]">終了</span>
          </button>
        </div>

        {/* Vibration toggle (mobile only) */}
        {canVibrate() && (
          <div className="flex justify-center">
            <button
              onClick={() => setVibrationEnabled((prev) => !prev)}
              className={`text-[11px] px-4 py-1.5 rounded-full transition-all duration-150 cursor-pointer ${
                vibrationEnabled
                  ? 'bg-[#FFF0F3] text-[#FF385C] hover:bg-[#FFE4E9]'
                  : 'bg-[#F5F5F5] text-[#AAAAAA] hover:bg-[#EBEBEB]'
              }`}
            >
              振動 {vibrationEnabled ? 'ON' : 'OFF'}
            </button>
          </div>
        )}
      </div>

      {/* Session bottom nav */}
      <div className="border-t border-[#F0F0F0] bg-white/95 backdrop-blur-md md:hidden">
        <div className="flex justify-around items-center h-16 max-w-md mx-auto">
          <button onClick={handleStop} className="flex flex-col items-center gap-0.5 py-2 px-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-[10px] text-[#AAAAAA]">ホーム</span>
          </button>
          <div className="flex flex-col items-center gap-0.5 py-2 px-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="#FF385C" stroke="#FF385C" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
            </svg>
            <span className="text-[10px] text-[#FF385C] font-semibold">セッション</span>
          </div>
          <button onClick={() => { handleStop(); router.push('/history'); }} className="flex flex-col items-center gap-0.5 py-2 px-5">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#AAAAAA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="3" width="16" height="18" rx="2" /><line x1="8" y1="7" x2="16" y2="7" /><line x1="8" y1="11" x2="16" y2="11" /><line x1="8" y1="15" x2="12" y2="15" />
            </svg>
            <span className="text-[10px] text-[#AAAAAA]">ログ</span>
          </button>
        </div>
      </div>
    </div>
  );
}
