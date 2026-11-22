import type { Metadata } from "next";
import { Inter, Pixelify_Sans } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import RoomSlot from "@/components/canvas/RoomSlot";
import Chrome from "@/components/ui/Chrome";
import IdCardOverlay from "@/components/ui/IdCardOverlay";
import ThemeInit from "@/components/ui/ThemeInit";

const pixel = Pixelify_Sans({ variable: "--font-pixel", subsets: ["latin"] });
const body = Inter({ variable: "--font-body", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laavanya Negi — Product Manager",
  description: "Portfolio of Laavanya Negi, Product Manager based in Delhi / Bengaluru.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${pixel.variable} ${body.variable}`} suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="data-theme"
          themes={["day", "night"]}
          defaultTheme="day"
          enableSystem={false}
          storageKey="theme"
        >
          <ThemeInit />
          <RoomSlot />
          <Chrome />
          <main id="main">{children}</main>
          <IdCardOverlay />
        </ThemeProvider>
      </body>
    </html>
  );
}
