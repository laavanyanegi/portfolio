"use client";

import dynamic from "next/dynamic";
import { usePathname, useRouter } from "next/navigation";
import {
  Component,
  useEffect,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { useTheme } from "next-themes";
import { useUI, type Spot } from "@/store/ui";
import { introActive, useIntro, webgl } from "@/store/intro";

// three.js only loads in the browser, after the page itself is readable
const RoomCanvas = dynamic(() => import("./RoomCanvas"), {
  ssr: false,
  loading: () => null,
});

/** If the 3D room ever fails, drop just the room: the CSS room behind and every page keep working. */
class RoomBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    // the entrance can't play without the room: let the home controls show
    if (introActive(useIntro.getState().stage)) useIntro.getState().finish();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

const RM = "(prefers-reduced-motion: reduce)";

const SECTIONS: Spot[] = ["work", "creatives", "about", "contact"];
/** "/work/some-case-study" → "work"; home and other pages → null */
function sectionOf(pathname: string): Spot | null {
  const first = pathname.split("/")[1] as Spot;
  return SECTIONS.includes(first) ? first : null;
}
function subscribeRM(cb: () => void) {
  const mq = window.matchMedia(RM);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

/** The one persistent 3D room, behind every page. The CSS room in RoomSlot shows until it loads. */
export default function RoomLoader() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme, setTheme } = useTheme();
  const idCardOpen = useUI((s) => s.idCardOpen);
  const entering = introActive(useIntro((s) => s.stage));
  // first load only: opened at `/`, the entrance plays (every load, not just once)
  useEffect(() => {
    useIntro.getState().begin(pathname);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  // a page change ends any hover highlight (the button that set it is gone)
  // and is remembered, so the next page knows where the visitor came from
  useEffect(() => {
    useUI.getState().setHoverSpot(null);
    useUI.setState({ lastPath: pathname, leaving: false });
    // leaving `/` mid-entrance (browser Back/Forward): end it, so it never plays over a section page
    if (pathname !== "/" && introActive(useIntro.getState().stage)) useIntro.getState().finish();
  }, [pathname]);
  const reducedMotion = useSyncExternalStore(
    subscribeRM,
    () => window.matchMedia(RM).matches,
    () => false,
  );
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  // /lab has its own canvas; without 3D support the CSS room stays and pages work as normal
  if (!mounted || pathname.startsWith("/lab") || !webgl()) return null;

  return (
    <div aria-hidden={pathname !== "/"} className="fixed inset-0 z-0">
      <RoomBoundary>
        <RoomCanvas
          night={resolvedTheme === "night"}
          reducedMotion={reducedMotion}
          home={pathname === "/" && !idCardOpen && !entering}
          section={sectionOf(pathname)}
          navigate={(href) => router.push(href)}
          onToggleNight={() =>
            setTheme(resolvedTheme === "night" ? "day" : "night")
          }
        />
      </RoomBoundary>
    </div>
  );
}
