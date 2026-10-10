/*
 * ROOMi shop items. The DJ controller comes from the user's product-design
 * project (model pending). The goods are the user's candidates. Every price is
 * an EXHIBITION SAMPLE so the simulator can total a cart. These are not real
 * prices, and the UI says so.
 */

export type Product = {
  id: string;
  no: string;
  name: string;
  kind: "Hardware" | "Goods";
  price: number;
  summary: string;
  details: string[];
  options: string[];
};

export const PRODUCTS: Product[] = [
  {
    id: "dj-controller",
    no: "001",
    name: "ROOMi DJ Controller",
    kind: "Hardware",
    price: 389000,
    summary: "처음 플레이하는 사람도 바로 손에 익는 2덱 DJ 컨트롤러. ROOMi 제품디자인 프로젝트의 결과물이에요.",
    details: ["2-deck controller", "디자인 진행 중 · 사양 확정 전", "실물 모델은 졸업전시에서 공개"],
    options: ["Black", "Pink"],
  },
  {
    id: "slogan-towel",
    no: "002",
    name: "Slogan Towel",
    kind: "Goods",
    price: 24000,
    summary: "플로어 위에서도, 플레이가 끝난 뒤에도. ROOMi 슬로건을 새긴 수건.",
    details: ["Cotton", "Sample goods"],
    options: ["Pink", "Black"],
  },
  {
    id: "cap",
    no: "003",
    name: "ROOMi Cap",
    kind: "Goods",
    price: 38000,
    summary: "그라피티 로고를 수놓은 볼캡.",
    details: ["Free size", "Sample goods"],
    options: ["Black", "Purple"],
  },
  {
    id: "mini-cd-keyring",
    no: "004",
    name: "Mini CD Keyring",
    kind: "Goods",
    price: 15000,
    summary: "손바닥보다 작은 CD 한 장. 가방에 걸고 다니는 나만의 트랙.",
    details: ["Acrylic", "Sample goods"],
    options: ["Pink disc", "Violet disc"],
  },
  {
    id: "bandana",
    no: "005",
    name: "Bandana",
    kind: "Goods",
    price: 19000,
    summary: "목에도, 손목에도, 턴테이블 위에도.",
    details: ["Cotton", "Sample goods"],
    options: ["Pink", "Black"],
  },
  {
    id: "letter-patch",
    no: "006",
    name: "English Letter Patch",
    kind: "Goods",
    price: 9000,
    summary: "원하는 곳에 붙이는 영문 와펜.",
    details: ["Embroidered", "Sample goods"],
    options: ["R", "O", "M", "i"],
  },
];

export const productById = (id: string) => PRODUCTS.find((p) => p.id === id);
