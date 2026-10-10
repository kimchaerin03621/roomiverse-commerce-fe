import type { Metadata } from "next";
import CartView from "@/components/shop/CartView";
import SiteFooter from "@/components/site/SiteFooter";

export const metadata: Metadata = { title: "Cart · ROOMi" };

export default function CartPage() {
  return (
    <>
      <CartView />
      <SiteFooter />
    </>
  );
}
