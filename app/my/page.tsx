import type { Metadata } from "next";
import MyView from "@/components/my/MyView";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = { title: "My · ROOMi", description: "주문번호·문의번호로 내역을 조회해요. (전시용, 이 브라우저에 저장된 기록)" };

export default function MyPage() {
  return (
    <>
      <MyView />
      <SiteFooter />
    </>
  );
}
