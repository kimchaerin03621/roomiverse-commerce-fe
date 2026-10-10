# ROOMi 웹사이트: 새 채팅 인수인계

새 세션에서 이 파일, `PRODUCT.md`, `docs/MORNING-NOTES.md`를 먼저 읽고 이어서 진행하세요.

## 프로젝트
- 시각디자인 졸업전시 웹사이트. 브랜드 **ROOMi (ROOMiVERSE)**: DJ 라이프스타일 브랜드. 주 관객은 교수·심사위원.
- 일정: **컨펌 2026-10-06(화)**, **최종 마감 2026-10-25**.
- 스택: Next.js 16 (App Router, TypeScript, CSS Modules). 실행은 `npm run dev`(포트 3000). `.claude/launch.json`의 `roomi-dev`.
- 이전 코덱스 버전 `C:/OMG/roomiverse-fe`: 디자인은 폐기했고 구조, 문구, 사진만 재사용.
- 피그마: 파일 `2B60SAKczcyuddcFc5E9vK`, 최신 노드 `186:906`(지저분한 진행본, 구조와 내용 참고용).

## 사용자 작업 방식 (중요)
- 한국어로, 쉬운 말로 설명. 영어 툴 화면은 한국어로 풀어서 안내.
- 속도 우선. 시안 이미지는 사용자가 **ChatGPT로 직접 생성**(Higgsfield 크레딧 0). 최근에는 "사진 안 만들고 바로 코딩"을 선호.
- 시각 방향은 사용자가 명확히 지정함(브리프가 이김). 추측보다 확인.

## 시각 시스템 (현재)
- 세계관: 젠틀몬스터·아더에러식 미니멀 매거진(인트로와 3D 샵만 체험형 3D). CD 싱글 패키지는 컨셉이 아님. CD 모양 키링이 굿즈 후보일 뿐.
- 색: pink `#F71D64`, purple `#C14ED4`, peach `#FFB792`, paper `#F0F0F0`, ink `#111111`, night `#100B10`.
- 글꼴: Afacad(UI, 영문) + Pretendard Variable(한글·본문·초대형 900 제목).
- GNB: 로고(두 개짜리 ROOMi ROOMi, 흰색, 글씨 높이 24px) 정중앙. 왼쪽 Meet ROOMi / What's Going On / Let's Party / Shop, 오른쪽 Cart(n) / My. 어두운 섹션(`data-tone="dark"`) 위에서는 흰 글씨, 종이 섹션에서는 반투명 종이 바.
- 핑크 OBI 띠지(`components/site/ObiBand`): 가로 얇은 배너, 섹션 목차, sticky.
- "ROOMi"는 소문자 i 유지. uppercase 변환을 쓸 때 주의.

## 페이지 상태
- `/` **인트로(완료, 사용자 승인)**: 컨테이너 항구 2.5D 패럴랙스(레이어 5장, 마우스 즉시 반응). 트리거는 빛나는 컨테이너 하나이고 **3D Shop으로 들어가는 유일한 입구**. 컨테이너 문 안에서 피치·핑크 빛줄기 9가닥이 각자 일렁임(숲속 햇살 레퍼런스). 문 안쪽 네온 위에는 겹치지 않게 처리. 호버 시 아주 살짝 들림(기울기 없음). 클릭하면 핑크빛 속으로 줌인 → `/shop/3d`.
- `/meet-roomi` **(첫 버전, 사용자가 "수정할 게 많다")**: 100svh 히어로(사진 + 그라데이션 로고 + 짧은 소개 + 스크롤 표시) → OBI → Brand Story → About Us → Value(아이콘 3개) → How(패널 2개).
- `/whats-going-on`, `/whats-going-on/[slug]`, `/lets-party`, `/shop`, `/shop/[id]`, `/cart`, `/my` **(새벽에 만든 초안, 피드백 대기)**. 자세한 내용은 `docs/MORNING-NOTES.md`.
- `/shop/3d` **(임시 화면, 맨 마지막에 작업)**: 인트로에서 들어간 **그 컨테이너 안**(문은 닫혀 있어 바깥이 안 보임)을 방·거실·스튜디오로 꾸민 실시간 3D. 일부러 소박한 로우폴리 렌더(kidsuper.world 느낌). 고정 시점 + 마우스 따라 살짝 움직임. 상품 클릭 시 반투명 상세창, 조명 무드 변경, 음악 재생(사용자 음원). 미러볼은 보류. 모델은 사용자가 나중에 제공(GLB). 다른 페이지 무드에 맞춰 제작.

## 데이터
- `content/parties.ts`: 파티 6종(피그마와 코덱스 문구).
- `content/products.ts`: 컨트롤러 + 굿즈 5종. 가격은 **예시**.
- `lib/store.tsx`: 장바구니는 메모리(새로고침 시 초기화). 완료된 주문·예약은 localStorage `roomi:records`, 번호 형식 `RMV-O/RYYMMDD-XXXX`.

## Impeccable 상태
- `.impeccable/config.json`: `buildPath: "comp"`. 인트로 build-phase는 hero 단계에서 막혀 있음. 사용자가 승인한 레이어 컷아웃을 평면 시안과 비교할 때 생기는 'clipped plate' 오탐 때문이고, 기록은 build-phase note에 남김.
- 남은 것: 최종 finish review, DESIGN.md 작성(사이트가 완성된 뒤).
- 인트로 브리프: `.impeccable/surfaces/app-page-tsx.md`, 인터랙션 메모: `.impeccable/intro-interaction-notes.md`.

## 3D 샵 (2026-10-07 오전 갱신)
- **View all 버튼은 노트북으로 대체됨.** 오른쪽 벽 선반 위, 마샬 옆의 열린 노트북(살짝 틀어짐). 클릭하면 `/shop`. hover 시 "Shop all" 이름표.
- 슬로건 수건: 로고(public/shop3d/slogan.png)를 길이 방향으로 소파 등받이에 걸침.
- 로딩: `components/shop3d/ContainerGate`. 컨테이너 클릭 즉시 인트로 위에 문이 뜨고 숫자가 올라가며(시간 기반 최소 2.6초, 시작 시각은 sessionStorage `roomi:gate-t0`로 이어받음) 100%가 되면 문이 바깥으로 열림.
- 세로(모바일) 화면은 `VIEWS_PORTRAIT`로 오른쪽 시점이 따로 있음. 캔버스 `touch-action: none`.
- `room.solo(id)`: 상품 하나만 남겨 단독샷을 뽑는 기능(투명 PNG → public/products). 렌더용 임시 페이지는 지웠음.
- 2D 샵 상품 이미지는 public/products/{id}.png (3D 모델 단독 렌더, 임시). 실물 사진/GLB가 오면 같은 이름으로 교체.
- 이름: GNB 메뉴는 "What's Going On", 페이지 안 제목은 "ROOMi SCENE"(파티 6개 묶음 이름). 이 페이지에 아직 못 넣은 콘텐츠 2개가 더 있고 각자 이름이 있어서, 메뉴 이름이 큰 우산이고 ROOMi SCENE은 그 안의 한 묶음.
- 모바일 점검 완료(375px): 가로 넘침, 파티 단계 표시줄, Requirements 줄바꿈 수정. 예약 흐름 끝까지 제출 확인.
- 하단 안내 문구와 조명 상태 표시도 뺌. 조명은 천장 스테이지 조명 클릭(꺼짐→은은→핑크보라→레이저→꺼짐), 미러볼 클릭은 회전 토글.

## 쇼츠 B2 (회사 → 레이브) 상태 · 2026-10-07 새벽
- 시나리오/프롬프트: docs/shorts/shortB2-plan.md. 이미지: docs/shorts/images/B2-*.png (S1 사무실, 박스 컷아웃, S4a, S5, 테이프).
- 영상: docs/shorts/clips/B2-mj-shot4b_up.mp4 (박스 열림, 업스케일), B2-mj-shot4_up.mp4 (레이브 파티장, 업스케일). 둘 다 Higgsfield Topaz 1080p (각 3크레딧).
- AE: docs/shorts/ae/shortB2.jsx (실행: AfterFX.exe -r), 렌더 완료본 shortB2_v4.mp4. 사용자가 AE에서 ShortB2_office-rave_render.mp4로 직접 렌더 예정.
- 소리: docs/shorts/audio/make_b2_audio.py (techno.mp3 + 합성 효과음, 곡 드롭을 7.1초에 맞춤). 곡 라이선스는 사용자가 확인.
- 빠진 샷: 물건이 날아가 제자리로 들어가는 샷(S4a→S5). 지금은 7.1초 플래시로 점프.
- Higgsfield 크레딧 11.5. 자동 갱신 해지는 아직 안 함(사용자가 직접 결제/해지).
- 사용자가 아침에 영상 하나 더 만들 예정 (변주 쇼츠, 같은 틀에서 장소/컨셉만 바꿈).

## 확인 요청 (2026-10-07 새벽, 사용자가 자기 전)
- 3D 샵 반다나를 다시 만들었음(소파 오른쪽 팔걸이에 걸친 보라 패턴 천). 사용자가 직접 보고 OK인지 확인 필요.
- 3D 샵 정면 로고를 보낸 이미지(sign.png)로 교체하고 70%로 줄임. 미러볼과 겹치는 정도를 사용자가 정할 것.
- 3D 샵 조명/미러볼 hover 효과(CHANGE 이름표 + 빛), 상품 hover 이름표(이름 · 가격) 추가됨.
- 파티 상세 Essentials/Add-ons 레이아웃 변경, Meet 세로 인디케이터 변경.
- 쇼츠 B2: AE 렌더는 사용자가 ShortB2_office-rave_render.mp4로 직접 돌림.

## 일어난 뒤 순서 (사용자가 정함, 컨펌 2026-10-07 13:00 전)
1. **쇼츠 하나 더** 먼저 만든다 (같은 틀: docs/shorts/shortB2-plan.md, 장소/컨셉만 바꾸는 변주. 사용자가 시나리오/이미지를 가져옴).
2. 그 다음 아래 컨펌 전 할 일을 진행한다:
   - (완료 10/7) View all→노트북, 슬로건 확정, 모바일 점검, 3D 샵 로딩, 예약 제출 테스트, 이름 확인(GNB=What's Going On, 페이지 제목=ROOMi SCENE 유지)
   - 남음: 실제 폰으로 확인(`npm run dev -- -H 0.0.0.0`), 모바일 크기에서 로딩 문 확인
   - 쇼츠 B2 AE 렌더(사용자가 직접), 곡 라이선스 확인, 인스타용 결과물 범위 확인
   - 쇼츠 A 교수님 검토 후 수정
   - 미뤄 둔 것: 힉스필드 자동 갱신 해지(크레딧 11.5), 3D 샵 배경음악, 파티 사진 크롭 교체, 디스크 아이콘 플레이리스트
   - 하면 좋은 것: 발표 순서 정리, DESIGN.md, 접근성 점검

## 쇼츠 C (거실 → 하우스 파티) · 2026-10-07
- 계획/프롬프트: docs/shorts/shortB3-plan.md. 이미지 docs/shorts/images/C1~C4, 영상 docs/shorts/clips/C-mjA_up.mp4(박스 열림), C-mjB_up.mp4(파티 루프), 둘 다 Topaz 1080p.
- AE: docs/shorts/ae/shortC.jsx → ShortC_v1.mp4 (렌더 완료). 소리: audio/make_c_audio.py (SONG, SONG_DROP 환경변수). 현재 houseB.mp3(약 117.5 BPM, 드롭 17.0초) 사용. houseA.mp3는 약 143.6 BPM(드롭 28.3초).
- 곡 라이선스는 사용자가 확인.

## 컨펌 후 할 일 (2026-10-10 정리, 최종 마감 10/25)
용어 규칙: 한국 사람이 잘 모르는 영단어(Inquiry 등)는 쓰지 않는다. 버튼·번호·상태·안내는 한국어(예약 문의, 문의번호, 문의 접수), 큰 제목만 쉬운 영어(Request sent.).

컨펌 피드백(10/7):
1. (완료 10/10) **예약 → "예약 문의"로 문구 정리.** 지금 흐름은 예약이 아니라 문의 접수. "예약 문의"라는 말이 잘 보이게 (Let's Party 제목·버튼·완료 화면·My·장면 상세 띠). 예약번호 용어도 같이 결정.
2. (보정 적용 10/10, 사용자 확인 대기) **인트로가 너무 붉다.** 원인: 노을만이 아니라 전체에 초록이 거의 없고(평균 G 20~67) 하늘·바다 반사·항구가 같은 붉은 조명을 받음(R/G 1.9~2.6). 색 균형 보정(빨강↓ 초록·파랑↑, 바다는 더 강하게, 조명 반사는 보호)을 레이어별로 적용. 원본은 docs/intro-originals/*.png, 스크립트 docs/intro-originals/balance.py (`python balance.py apply`). 트리거 컨테이너와 오른쪽 크레인은 그대로. 되돌리려면 원본 png를 public/intro로 복사하고 webp 재생성.
3. (적용 10/10, 사용자 확인 대기) **ROOMi SCENE 파티 이름 타이포가 재미없다.** 교수님 말씀은 "재미없다". 이름은 그대로 두고 파티마다 서체를 다르게 적용(app/fonts.ts): Listening=Playfair 이탤릭, Day=Righteous, Rave=Anton 대문자(구글폰트, app/fonts.ts) + 눈누 폰트(원본 woff2를 public/fonts에 직접 넣음, app/globals.css, 수정·재가공 금지): House=리아체(RiaSans-ExtraBold, 롯데GRS; 상표·브랜드명 사용 금지라 파티 이름 용도로만), Themed=가비아 던체, After=Cafe24 ClassicType. 눈누 후보 비교는 모두 라이선스 웹사이트·임베딩 가능 확인. 목록(wgo.module.css)과 상세 제목(scene.module.css)에 적용.
4. (완료 10/10) **Let's Party 파티 선택에서 "Other"를 고르면 직접 입력 칸.** (게스트 수, 분위기 등 Other 항목도 같은 방식인지 확인)
5. (완료 10/10) **장면 상세 맨 아래 LET'S PARTY 띠를 그라데이션으로.**
6. (완료 10/10) **2D 샵 제품 이름 타이포가 너무 세다.** 굵기·크기를 죽이기.
7. **쇼츠 장소를 와닿는 곳으로** (카페 등 또래가 자주 가는 곳). 쇼츠는 다른 채팅에서 진행.
8. **전시 배치 스케치.** 나중에.

그 외 남은 것:
- 사진 교체(ChatGPT 생성): docs/IMAGE-PROMPTS.md, 1단계부터. 받으면 파일명대로 교체 + before/after 슬라이더 코드 수정.
- 쇼츠 B2: AE 렌더(사용자 직접), 곡 라이선스 확인, 인스타용 범위 확인. 쇼츠 A는 교수님 검토 후 수정.
- 실제 폰으로 확인(`npm run dev -- -H 0.0.0.0`), 모바일 크기에서 로딩 문 확인.
- What's Going On에 아직 못 넣은 콘텐츠 2개.
- 미뤄 둔 것: 힉스필드 자동 갱신 해지(크레딧 11.5), 3D 샵 배경음악, 디스크 아이콘 플레이리스트, ROOMi SESSION/TAG.
- 하면 좋은 것: DESIGN.md, 접근성 점검, 발표 연습(docs/PRESENTATION.md).

## 사진 교체 (2026-10-11)
- 사용자가 ChatGPT로 만든 사진 49장 적용: public/meet(hero, about, how-gear/space/setup, transform-before/after, value 아이콘 3개), public/parties(대표 사진), public/parties/details(Essentials 24장, 파일명은 소문자-하이픈). PNG 원본은 docs/photo-originals/new/.
- Transform 슬라이더는 이제 before/after 두 장(효과 필터 제거).
- Add-ons 썸네일은 아직 예전 사진(house-party/*) 재활용 중. 새 사진이 오면 교체.
- 문제 사진(사용자가 보고 고칠 예정): day-main(JBL·Pioneer DJ 로고), day-rooftop·daytime-sound(스피커 로고 가능), dress-code·photo-moment(얼굴이 서로 닮음).
