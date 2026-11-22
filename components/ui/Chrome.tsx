"use client";

import { usePathname } from "next/navigation";
import HomeUI from "./HomeUI";
import TopBar from "./TopBar";

export default function Chrome() {
  const pathname = usePathname();
  if (pathname.startsWith("/lab")) return null; // look test is full-screen, no site nav
  return pathname === "/" ? <HomeUI /> : <TopBar pathname={pathname} />;
}
