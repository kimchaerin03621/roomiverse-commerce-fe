import type { Metadata, Viewport } from "next";
import { Afacad } from "next/font/google";
import GNB from "@/components/GNB";
import { partyFontVars } from "./fonts";
import { CartProvider } from "@/lib/store";
import "pretendard/dist/web/variable/pretendardvariable-dynamic-subset.css";
import "./globals.css";

const afacad = Afacad({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-afacad",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ROOMi · ROOMiVERSE",
  description: "어디서 누구와 함께하든, 평범한 공간이 파티 공간이 됩니다. 내 방안의 나만의 우주, ROOMi.",
};

export const viewport: Viewport = {
  themeColor: "#100b10",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className={`${afacad.variable} ${partyFontVars}`}>
      <body>
        <CartProvider>
          <GNB />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}
