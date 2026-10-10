import type { Metadata } from "next";
import PartyBuilder from "@/components/party/PartyBuilder";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = {
  title: "Let's Party · ROOMi",
  description: "파티 종류, 날짜와 장소, 공간 조건, 연락처만 알려주세요. 세팅은 ROOMi가 준비해요. (전시용 예약 문의 시뮬레이터)",
};

export default function LetsParty() {
  return (
    <>
      <PartyBuilder />
      <SiteFooter />
    </>
  );
}
