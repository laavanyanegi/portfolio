"use client";

import { usePathname } from "next/navigation";
import { introActive, useIntro } from "@/store/intro";
import EntryOverlay from "./EntryOverlay";
import HomeUI from "./HomeUI";
import TopBar from "./TopBar";

export default function Chrome() {
  const pathname = usePathname();
  const entering = introActive(useIntro((s) => s.stage));
  if (pathname.startsWith("/lab")) return null; // look test is full-screen, no site nav
  return (
    <>
      {pathname === "/" ? <HomeUI hidden={entering} /> : <TopBar pathname={pathname} />}
      <EntryOverlay />
    </>
  );
}
