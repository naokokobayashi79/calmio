import { SoundType } from '@/types';

let audioContext: AudioContext | null = null;
let currentSession: { nodes: AudioNode[]; id: number } | null = null;
let sessionCounter = 0;

function getAudioContext(): AudioContext {
  if (!audioContext || audioContext.state === 'closed') {
    audioContext = new AudioContext();
  }
  return audioContext;
}

export async function resumeAudioContext(): Promise<void> {
  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    await ctx.resume();
  }
}

function killNodes(nodes: AudioNode[]) {
  for (const node of nodes) {
    try { node.disconnect(); } catch {}
    try {
      if ('stop' in node && typeof (node as AudioScheduledSourceNode).stop === 'function') {
        (node as AudioScheduledSourceNode).stop();
      }
    } catch {}
  }
}

function createToneSound(ctx: AudioContext, baseFreq: number, gain: GainNode): AudioNode[] {
  const nodes: AudioNode[] = [];
  const freqs = [baseFreq, baseFreq / 2, baseFreq * 1.5];
  const volumes = [0.12, 0.06, 0.03];

  for (let i = 0; i < freqs.length; i++) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freqs[i], ctx.currentTime);

    const lfo = ctx.createOscillator();
    lfo.type = 'sine';
    lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
    const lfoGain = ctx.createGain();
    lfoGain.gain.setValueAtTime(freqs[i] * 0.003, ctx.currentTime);
    lfo.connect(lfoGain);
    lfoGain.connect(osc.frequency);
    lfo.start();

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(volumes[i], ctx.currentTime + 3);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();

    nodes.push(osc, lfo, oscGain, lfoGain);
  }
  return nodes;
}

function createAmbientSound(ctx: AudioContext, gain: GainNode): AudioNode[] {
  const nodes: AudioNode[] = [];
  const bufferLength = ctx.sampleRate * 4;
  const buffer = ctx.createBuffer(2, bufferLength, ctx.sampleRate);

  for (let ch = 0; ch < 2; ch++) {
    const data = buffer.getChannelData(ch);
    for (let i = 0; i < bufferLength; i++) {
      const white = Math.random() * 2 - 1;
      data[i] = i === 0 ? white * 0.02 : data[i - 1] * 0.998 + white * 0.02;
    }
    let max = 0;
    for (let i = 0; i < bufferLength; i++) max = Math.max(max, Math.abs(data[i]));
    if (max > 0) for (let i = 0; i < bufferLength; i++) data[i] /= max;
  }

  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  noise.loop = true;

  const lpf = ctx.createBiquadFilter();
  lpf.type = 'lowpass';
  lpf.frequency.setValueAtTime(300, ctx.currentTime);
  lpf.Q.setValueAtTime(0.7, ctx.currentTime);

  const noiseGain = ctx.createGain();
  noiseGain.gain.setValueAtTime(0, ctx.currentTime);
  noiseGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 3);

  noise.connect(lpf);
  lpf.connect(noiseGain);
  noiseGain.connect(gain);
  noise.start();
  nodes.push(noise, noiseGain);

  const droneFreqs = [110, 165, 220];
  for (const freq of droneFreqs) {
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);

    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0, ctx.currentTime);
    oscGain.gain.linearRampToValueAtTime(0.015, ctx.currentTime + 4);

    osc.connect(oscGain);
    oscGain.connect(gain);
    osc.start();
    nodes.push(osc, oscGain);
  }
  return nodes;
}

export function startSound(type: SoundType): void {
  if (type === 'none') return;

  // Stop previous session immediately (no fade) to avoid delayed cleanup killing new nodes
  if (currentSession) {
    killNodes(currentSession.nodes);
    currentSession = null;
  }

  const ctx = getAudioContext();
  if (ctx.state === 'suspended') {
    ctx.resume();
  }

  const id = ++sessionCounter;
  const nodes: AudioNode[] = [];

  const masterGain = ctx.createGain();
  masterGain.gain.setValueAtTime(0, ctx.currentTime);
  masterGain.gain.linearRampToValueAtTime(1, ctx.currentTime + 2);
  masterGain.connect(ctx.destination);
  nodes.push(masterGain);

  if (type === 'ambient') {
    nodes.push(...createAmbientSound(ctx, masterGain));
  } else {
    const freq = type === '528Hz' ? 528 : 432;
    nodes.push(...createToneSound(ctx, freq, masterGain));
  }

  currentSession = { nodes, id };
}

export function stopSound(): void {
  if (!currentSession) return;

  const session = currentSession;
  currentSession = null;

  try {
    const master = session.nodes.find(n => n instanceof GainNode);
    if (master && audioContext) {
      (master as GainNode).gain.linearRampToValueAtTime(0, audioContext.currentTime + 0.8);
      // Capture these specific nodes — not a shared mutable reference
      const nodesToKill = session.nodes;
      setTimeout(() => killNodes(nodesToKill), 1000);
    } else {
      killNodes(session.nodes);
    }
  } catch {
    killNodes(session.nodes);
  }
}
