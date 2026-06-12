import { CalmioSession } from '@/types';

function buildShareText(session: CalmioSession): string {
  return `Calmioで${session.durationMinutes}分の調整セッションを試しました。音と呼吸で、いまの体感を整えるセルフケアアプリ。`;
}

export async function shareResult(session: CalmioSession): Promise<boolean> {
  const text = buildShareText(session);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({ title: 'Calmio', text });
      return true;
    } catch {
      return false;
    }
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}
