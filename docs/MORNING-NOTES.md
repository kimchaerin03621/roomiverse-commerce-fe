# 아침 정리 (2026-10-04 새벽 작업)

`npm run dev`를 실행한 뒤 http://localhost:3000 에서 확인하세요.

## 새로 만든 페이지

| 주소 | 내용 |
|---|---|
| `/whats-going-on` | **ROOMi SCENE**: 파티 6종 목록. 큰 제목, 핑크 OBI 띠지(01 House ~ 06 After, 누르면 해당 장면으로 이동), 장면마다 사진 2장 + #해시태그 + 설명 + MAKE IT YOURS(Space/Sound/Mood/Key elements) + "Explore this scene". Rave만 어두운 풀블리드로 처리 |
| `/whats-going-on/house-party` 외 5개 | **장면 상세**: SCENE 00X + 큰 제목 + 한 줄 리드, 큰 사진, Requirements(아이콘 4개), Essentials(이미지·글 교차 4개), Add-ons(카드 4개), 핑크 **LET'S PARTY** 띠, 이전·다음 장면 |
| `/lets-party` | **Build your party** 예약 시뮬레이터: 피그마 4단계(Your Party → When & Where → Space Check → Your Details) → 완료 화면 + 예약번호. 장면 상세에서 들어오면 그 파티가 미리 선택되고, 단계별로 필수 항목을 검사해요 |
| `/shop` | 2D 샵: DJ 컨트롤러를 크게 + 굿즈 5종 그리드 |
| `/shop/cap` 외 | 상품 상세: 옵션, 수량, Add to cart |
| `/cart` | 장바구니(**새로고침하면 비워짐**) → 이름 입력 + 동의 → 가짜 결제 → 주문번호 |
| `/my` | 주문번호·예약번호 조회 + 이 브라우저의 기록 목록 + 상세(주문 진행 단계, 예약 내용) |
| 없는 주소 | "NO TRACK" 404 페이지 |

공통으로 바뀐 것:
- 공통 푸터 추가
- 탭 아이콘(핑크·보라 CD) 추가
- GNB의 Cart 숫자가 실제 장바구니 수량을 따라가요

## 건드리지 않은 것
- **Meet ROOMi**: 수정할 게 많다고 하셔서 손대지 않았어요. 아침에 같이 고쳐요.
- **인트로**: 그대로예요.
- **3D Shop**: 일정대로 맨 마지막에 해요.

## 제가 가정한 것 (확인해 주세요)
1. **가격은 전부 "예시"**예요(컨트롤러 389,000원, 굿즈 9,000~38,000원). 화면에 "Sample price"라고 표시돼 있어요. 실제 가격이 정해지면 `content/products.ts`에서 바꾸면 됩니다.
2. **상품 사진이 없어서** CD 트레이 카드 모양의 임시 이미지(제품명 + "Image coming soon")를 넣었어요.
3. **상품 설명과 옵션**(색상 등)은 제가 쓴 초안이에요. 컨트롤러는 "디자인 진행 중 · 사양 확정 전"으로 표시했어요.
4. **파티 상세 문구**(Requirements, Essentials, Add-ons)는 코덱스 버전의 문구를 가져왔어요. 해시태그와 설명, MAKE IT YOURS는 **피그마에서 옮겨 적은 것**이라 오타가 있을 수 있어요. 피그마 화질이 낮아 일부는 추측해서 읽었습니다.
5. **파티 사진**은 코덱스 때 받은 Pexels 무료 라이선스 사진이에요. 출처는 `docs/IMAGE_SOURCES-parties.md`에 있어요.
6. 피그마에 있던 **ROOMi SESSION(플레이리스트)과 ROOMi TAG(그라피티)** 섹션은 아직 안 넣었어요. 음원이 오면 SESSION부터 넣을게요.
7. **My의 1:1 문의**는 "준비 중" 문구만 있어요.

## 다음 할 일 (제안)
1. Meet ROOMi 수정
2. 컨펌용으로 새 페이지 무드 피드백 반영
3. ROOMi SESSION(음원 받으면) / ROOMi TAG
4. 3D Shop
5. 마무리 검수 + 디자인 시스템 문서(DESIGN.md)
