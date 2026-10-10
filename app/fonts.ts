import { Anton, Playfair_Display, Righteous } from "next/font/google";

/**
 * Party-name display faces (the other three come from Noonnu web fonts, see globals.css). Each scene gets its own letter shapes so the six names read as six different nights
 * instead of one bold sans repeated. Only the Latin subset: the names are English.
 */
export const listening = Playfair_Display({ subsets: ["latin"], weight: "800", style: "italic", variable: "--font-listening", display: "swap" });
export const day = Righteous({ subsets: ["latin"], weight: "400", variable: "--font-day", display: "swap" });
export const rave = Anton({ subsets: ["latin"], weight: "400", variable: "--font-rave", display: "swap" });

export const partyFontVars = [listening, day, rave].map((f) => f.variable).join(" ");
