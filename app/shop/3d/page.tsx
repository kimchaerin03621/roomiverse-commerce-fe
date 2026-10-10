import ShopScene from "@/components/shop3d/ShopScene";

export const metadata = { title: "3D Shop · ROOMi" };

// The container interior, reached only from the harbor intro.
export default function Shop3D() {
  return (
    <main>
      <h1 className="visually-hidden">ROOMi 3D Shop</h1>
      <ShopScene />
    </main>
  );
}
