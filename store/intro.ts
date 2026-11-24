import { create } from "zustand";

/**
 * The entrance, played every time the site is opened or reloaded at `/` (Laavanya's rule):
 * knock (door view) → opening (door swings in) → greeting (she says hi) → walking (she walks to her
 * chair while the camera follows her in and rises to the corner view) → done (home).
 * "off" = no entrance this visit: opened at a section link, or no WebGL. Going home from inside the
 * site never replays it (begin() only runs on the first load).
 */
export type IntroStage = "pending" | "off" | "knock" | "opening" | "greeting" | "walking" | "done";

type IntroState = {
  stage: IntroStage;
  /** when the current stage began (performance.now() ms) */
  since: number;
  /** the 3D room has drawn its first frame, so the door can be knocked */
  ready: boolean;
  setReady: () => void;
  /** decide on first load whether to play the entrance */
  begin: (pathname: string) => void;
  knock: () => void;
  greet: () => void;
  walk: () => void;
  finish: () => void;
};

let glSupport: boolean | null = null;
/** Can this browser draw 3D? (checked once) */
export function webgl() {
  if (glSupport !== null) return glSupport;
  try {
    const c = document.createElement("canvas");
    const gl = (c.getContext("webgl2") || c.getContext("webgl")) as WebGLRenderingContext | null;
    glSupport = !!gl;
    // hand the test context straight back: browsers only allow a handful at once
    gl?.getExtension("WEBGL_lose_context")?.loseContext();
  } catch {
    glSupport = false;
  }
  return glSupport;
}

export const useIntro = create<IntroState>((set, get) => ({
  stage: "pending",
  since: 0,
  ready: false,
  setReady: () => {
    if (!get().ready) set({ ready: true });
  },
  begin: (pathname) => {
    if (get().stage !== "pending") return;
    const play = pathname === "/" && webgl();
    set({ stage: play ? "knock" : "off", since: performance.now() });
  },
  knock: () => {
    if (get().stage === "knock" && get().ready) set({ stage: "opening", since: performance.now() });
  },
  greet: () => {
    if (get().stage === "opening") set({ stage: "greeting", since: performance.now() });
  },
  walk: () => {
    if (get().stage === "greeting") set({ stage: "walking", since: performance.now() });
  },
  finish: () => set({ stage: "done", since: performance.now() }),
}));

/** Is the entrance on screen (room UI, labels and the home camera wait until it ends)? */
export const introActive = (s: IntroStage) => s === "pending" || s === "knock" || s === "opening" || s === "greeting" || s === "walking";
