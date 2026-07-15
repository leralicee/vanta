'use client';

import { RefObject, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { useReducedMotion } from './useReducedMotion';
import {
  addLights,
  buildWatch,
  createStudioEnvironment,
  setWatchHands,
  type WatchConfig,
  type WatchModel,
} from '@/lib/watch-scene';

export type { WatchConfig } from '@/lib/watch-scene';

interface UseThreeWatchOptions {

  interactive?: boolean;
  config: WatchConfig;
}

export function useThreeWatch(
  containerRef: RefObject<HTMLDivElement>,
  { interactive = true, config }: UseThreeWatchOptions,
): { supported: boolean } {
  const reduced = useReducedMotion();
  const [supported, setSupported] = useState(true);
  const modelRef = useRef<WatchModel | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      setSupported(false);
      return;
    }

    const size = () => ({ w: container.clientWidth || 1, h: container.clientHeight || 1 });
    let { w, h } = size();
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;
    renderer.domElement.style.display = 'block';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 100);
    camera.position.set(0, 0, 7.9);

    const env = createStudioEnvironment(renderer);
    scene.environment = env.environment;
    addLights(scene);

    const model = buildWatch(config);
    scene.add(model.group);
    modelRef.current = model;
    setWatchHands(model);

    const targetRot = { x: 0, y: 0 };
    const curRot = { x: 0, y: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      const nx = Math.min(Math.max((e.clientX - rect.left) / rect.width, 0), 1);
      const ny = Math.min(Math.max((e.clientY - rect.top) / rect.height, 0), 1);
      targetRot.y = (nx - 0.5) * 0.9;
      targetRot.x = (ny - 0.5) * 0.6;
    };

    const renderFrame = () => {
      curRot.x += (targetRot.x - curRot.x) * 0.06;
      curRot.y += (targetRot.y - curRot.y) * 0.06;
      model.group.rotation.x = curRot.x;
      model.group.rotation.y = curRot.y;
      setWatchHands(model);
      renderer.render(scene, camera);
    };

    let raf = 0;
    let visible = true;
    const loop = () => {
      if (!visible) return;
      raf = requestAnimationFrame(loop);
      renderFrame();
    };

    const resize = () => {
      ({ w, h } = size());
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting && !document.hidden;
        if (visible && !reduced) loop();
      },
      { threshold: 0.05 },
    );
    io.observe(container);
    const onVisibility = () => {
      visible = !document.hidden;
      if (visible && !reduced) loop();
    };
    document.addEventListener('visibilitychange', onVisibility);

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      if (interactive) window.addEventListener('pointermove', onPointerMove, { passive: true });
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onPointerMove);

      model.dispose();
      env.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) container.removeChild(renderer.domElement);
      modelRef.current = null;
    };
  }, [containerRef, interactive, reduced]);

  useEffect(() => {
    const model = modelRef.current;
    if (!model) return;
    model.setCaseColor(config.caseColor, config.caseRoughness);
    model.setDialColor(config.dialColor);
    model.setStrap(config.strapKind ?? 'alligator');
  }, [config.caseColor, config.dialColor, config.caseRoughness, config.strapKind]);

  return { supported };
}
