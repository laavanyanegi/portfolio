"use client";

import { usePathname } from "next/navigation";
import HomeUI from "./HomeUI";
import TopBar from "./TopBar";

export default function Chrome() {
  const pathname = usePathname();
  return pathname === "/" ? <HomeUI /> : <TopBar pathname={pathname} />;
}
