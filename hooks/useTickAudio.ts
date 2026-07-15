'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface TickGraph {
  ctx: AudioContext;
  master: GainNode;
}

export function useTickAudio() {
  const [on, setOn] = useState(false);
  const graphRef = useRef<TickGraph | null>(null);
  const timeoutRef = useRef(0);
  const intervalRef = useRef(0);

  const tick = useCallback(() => {
    const graph = graphRef.current;
    if (!graph) return;
    const { ctx, master } = graph;

    const dur = 0.009;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.frequency.value = 3600;
    bandpass.Q.value = 9;
    const gain = ctx.createGain();
    gain.gain.value = 0.55;
    src.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(master);
    src.start();
  }, []);

  const stopTimers = useCallback(() => {
    window.clearTimeout(timeoutRef.current);
    window.clearInterval(intervalRef.current);
  }, []);

  const toggle = useCallback(() => {
    setOn((prev) => {
      const next = !prev;
      if (next) {
        let graph = graphRef.current;
        if (!graph) {
          const Ctor =
            window.AudioContext ??
            (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
          if (!Ctor) return false;
          const ctx = new Ctor();
          const master = ctx.createGain();
          master.gain.value = 0;
          master.connect(ctx.destination);
          graph = { ctx, master };
          graphRef.current = graph;
        }
        void graph.ctx.resume();
        graph.master.gain.cancelScheduledValues(graph.ctx.currentTime);
        graph.master.gain.setTargetAtTime(0.12, graph.ctx.currentTime, 0.3);
        stopTimers();
        timeoutRef.current = window.setTimeout(() => {
          tick();
          intervalRef.current = window.setInterval(tick, 1000);
        }, 1000 - (Date.now() % 1000));
      } else {
        stopTimers();
        const graph = graphRef.current;
        if (graph) {
          graph.master.gain.cancelScheduledValues(graph.ctx.currentTime);
          graph.master.gain.setTargetAtTime(0, graph.ctx.currentTime, 0.15);
          window.setTimeout(() => {
            if (graphRef.current === graph) void graph.ctx.suspend();
          }, 500);
        }
      }
      return next;
    });
  }, [stopTimers, tick]);

  useEffect(() => {
    const onVisibility = () => {
      const graph = graphRef.current;
      if (!graph) return;
      if (document.hidden) {
        void graph.ctx.suspend();
      } else if (on) {
        void graph.ctx.resume();
      }
    };
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, [on]);

  useEffect(() => {
    return () => {
      stopTimers();
      const graph = graphRef.current;
      graphRef.current = null;
      if (graph) void graph.ctx.close();
    };
  }, [stopTimers]);

  return { on, toggle };
}
