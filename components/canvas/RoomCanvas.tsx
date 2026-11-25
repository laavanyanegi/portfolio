"use client";

import { Suspense, useEffect, useMemo, useRef } from "react";
import { LOOK_PER_PX, useLook } from "@/store/look";
import BedCamera from "./room/BedCamera";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { ROOM } from "@/lib/roomPalette";
import PixelPass from "./PixelPass";
import CameraRig, { type Drag } from "./room/CameraRig";
import Character from "./room/Character";
import Walker from "./room/Walker";
import type { Spot } from "@/store/ui";
import { LabelTracker, RoomLabels, type LabelEls } from "./room/Labels";
import Lights from "./room/Lights";
import { cameraMotion, NightCtx } from "./room/parts";
import Shell from "./room/Shell";
import ViewA from "./room/ViewA";
import ViewB from "./room/ViewB";
import FairyLights from "./room/FairyLights";
import { useUI, VIEW_WALLS } from "@/store/ui";
import { introActive, useIntro } from "@/store/intro";
import { DoorOutside, EntryCamera, SpeechBubbleTracker, StandingLaavanya } from "./room/Entrance";

/** Fades the night value towards its goal (~1s), and the backdrop colour with it. */
function NightFader({ night, tRef, instant }: { night: boolean; tRef: { current: number }; instant: boolean }) {
  const day = useMemo(() => new THREE.Color(ROOM.voidDay), []);
  const dark = useMemo(() => new THREE.Color(ROOM.voidNight), []);
  const bg = useMemo(() => new THREE.Color(), []);
  useFrame(({ scene }, dt) => {
    const goal = night ? 1 : 0;
    const t = tRef.current;
    tRef.current = instant ? goal : t + Math.sign(goal - t) * Math.min(Math.abs(goal - t), dt);
    scene.background = bg.copy(day).lerp(dark, tRef.current);
  });
  return null;
}

export default function RoomCanvas({
  night,
  reducedMotion,
  home,
  section,
  navigate,
  onToggleNight,
  phone,
  lite,
}: {
  night: boolean;
  reducedMotion: boolean;
  home: boolean;
  /** the open section (from the route), or null on home */
  section: Spot | null;
  navigate: (href: string) => void;
  onToggleNight: () => void;
  /** phones: the visitor sits on the bed (first person) instead of the dollhouse view */
  phone: boolean;
  /** phones and low-end devices: a lighter scene (fewer, smaller shadows) */
  lite: boolean;
}) {
  const view = useUI((s) => s.view);
  // re-render only when the entrance starts or ends (each re-render of the room costs a visible frame)
  const entering = useIntro((s) => introActive(s.stage));
  const loaded = useIntro((s) => s.stage !== "pending");
  const t = useRef(night ? 1 : 0);
  const drag = useRef<Drag>({ az: 0, pol: 0 });
  const labelEls: LabelEls = useRef({});
  const start = useRef<{ x: number; y: number; az: number; pol: number } | null>(null);

  const dragging = useRef(false);

  // phones: the visitor stays inside the room, so no wall is cut away and the ceiling shows
  useEffect(() => {
    cameraMotion.inside = phone;
  }, [phone]);

  // drag to look around (home only): a little on desktop, all the way round from the bed on phones
  const onDown = (e: React.PointerEvent) => {
    if (!home || e.button !== 0) return;
    start.current = { x: e.clientX, y: e.clientY, ...drag.current };
    dragging.current = false;
  };
  const onMove = (e: React.PointerEvent) => {
    const s = start.current;
    if (!s) return;
    if (phone) {
      // a tap must still reach the room (the light switch): only take over the finger once it really drags
      if (!dragging.current) {
        if (Math.hypot(e.clientX - s.x, e.clientY - s.y) < 6) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
      }
      useLook.getState().lookBy((e.clientX - s.x) * LOOK_PER_PX.yaw, (e.clientY - s.y) * LOOK_PER_PX.pitch);
      s.x = e.clientX;
      s.y = e.clientY;
      return;
    }
    const clamp = (v: number, m: number) => Math.max(-m, Math.min(m, v));
    drag.current = {
      az: clamp(s.az - (e.clientX - s.x) * 0.004, 0.45),
      pol: clamp(s.pol - (e.clientY - s.y) * 0.003, 0.25),
    };
  };
  const onUp = () => {
    start.current = null;
  };

  return (
    <div
      className="absolute inset-0"
      style={{ cursor: home ? "grab" : undefined, touchAction: phone && home ? "none" : undefined }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      onPointerLeave={onUp}
    >
      <Canvas
        shadows="percentage"
        dpr={1}
        gl={{ antialias: false, powerPreference: lite ? "default" : "high-performance" }}
        aria-label="Pixel-art view of Laavanya's bedroom"
        role="img"
        fallback={null}
      >
        <NightCtx.Provider value={t}>
          <NightFader night={night} tRef={t} instant={reducedMotion} />
          {phone ? (
            <BedCamera active={!entering} section={section} reducedMotion={reducedMotion} />
          ) : (
            <CameraRig dragRef={drag} reducedMotion={reducedMotion} active={!entering} section={section} />
          )}
          <Walker section={section} entering={entering} reducedMotion={reducedMotion} phone={phone} />
          <EntryCamera active={entering} reducedMotion={reducedMotion} phone={phone} />
          {/* stays mounted (light switched off) after the entrance: removing a light makes three.js rebuild every material at once */}
          <DoorOutside on={entering} />
          <Lights softAmber={section === "creatives"} lite={lite} />
          <Shell />
          <ViewA />
          <ViewB night={night} onToggleNight={onToggleNight} interactive={home && (phone || VIEW_WALLS[view].includes("east"))} />
          <FairyLights />
          <Suspense fallback={null}>
            <Character spinning={home && !reducedMotion} faceDesk={section === "work"} />
            <StandingLaavanya visible={loaded} />
          </Suspense>
          {home && <LabelTracker elsRef={labelEls} />}
          {entering && <SpeechBubbleTracker />}
          <PixelPass mode={night ? "night" : "day"} animate={!reducedMotion} blend={t} />
        </NightCtx.Provider>
      </Canvas>
      {home && <RoomLabels elsRef={labelEls} navigate={navigate} all={phone} />}
    </div>
  );
}
