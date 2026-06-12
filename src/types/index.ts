export type ConditionType =
  | '体が重い'
  | 'だるい'
  | '筋肉痛'
  | '肩や首がつらい'
  | '緊張している'
  | '眠い'
  | '集中したい'
  | '気分を整えたい';

export type SoundType = '432Hz' | '528Hz' | 'ambient' | 'none';

export type DurationMinutes = 3 | 5 | 10;

export type BodyScores = {
  bodyLightness: number;
  painRelief: number;
  fatigueRelief: number;
  mood: number;
};

export type CalmioSession = {
  id: string;
  createdAt: string;
  condition: ConditionType;
  durationMinutes: DurationMinutes;
  before: BodyScores;
  after: BodyScores;
  diff: BodyScores;
  soundType: SoundType;
  vibrationEnabled: boolean;
};

export type SessionSetup = {
  condition: ConditionType | null;
  durationMinutes: DurationMinutes;
  before: BodyScores;
  soundType: SoundType;
  vibrationEnabled: boolean;
};
