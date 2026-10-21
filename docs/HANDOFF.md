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

## 보류: PANIC ROOM식 높은 각도 구도 (다른 쇼츠용) · 2026-10-13
- 사용자가 나중에 다른 쇼츠로 쓰려고 생각해 둔 구도. **지금 진행 중인 공통 시나리오 쇼츠와 섞지 말 것.**
- 레퍼런스: PANIC ROOM 라이브(일상 공간 안에서 DJ가 플레이, 방 모서리 위쪽에서 내려다보는 광각/액션캠 느낌, 공간이 빼곡하고 생활감 있음, DJ 테이블이 화면 앞쪽).
- 가져온 영상 docs/shorts/clips/E-mj1.mp4 (편의점에서 사람들이 춤추는 높은 각도, 네온 초록·파랑).
- 이미 만든 이미지(보관): docs/shorts/images/E1-store-gpt1.png(빈 편의점), E2-box-a/b(박스가 떠 있음), E3-burst-a/b(박스 열림), E5-party-*(어두운 파티, DJ 테이블).
- 이 세트는 FLUX 3 + 참고 이미지 방식으로 만듦(공간 유지가 잘 됨). 다시 쓸 때는 이 방식 재사용.

## 쇼츠 F (카페 → Y2K 파티), 쇼츠 G (편의점 → 하우스 파티) · 2026-10-13
- F: 계획 docs/shorts/shortF-plan.md(자막 부분은 폐기됨), AE docs/shorts/ae/shortF.jsx, 소리 audio/make_f_audio.py. 사용자가 AE에서 직접 렌더함.
- G: AE docs/shorts/ae/shortG.jsx(조립까지만, 렌더는 사용자), 소리 audio/make_g_audio.py → g_mix.wav(houseB.mp3 임시곡, 드롭 17.0초, 7.0초에 맞춤). 이미지 images/G1~G4, 영상 clips/G-burst.mp4, G-party.mp4.
- 규칙: 한글 자막·속도선 넣지 않기. 박스는 쇼츠 내내 같은 디자인(ROOMi 글자 유지). 파티 장면은 사람 있는 실제 파티 분위기 + 첫 장면과 같은 방으로 읽히게(창·카운터·조명 위치 고정, 가운데 통로 비우기). 영상 만들 때 Seedance 이미지 참조 방식 사용.
- 높은 각도 PANIC ROOM 구도는 여전히 보류(E 시리즈 자료).

## 쇼츠 F2 · G2 (10초 최종 후보) · 2026-10-14
- 사용자가 컨펌 이후 마음에 든다고 한 건 G2. F2는 렌더 확인 대기.
- 타이밍(둘 다 동일): 0~1.5 평범한 공간 → 1.5 문 소리(딩동/딸랑)+박스 낙하 → 2.4 박스 열림(영상) → 5.0 조명 꺼짐·스트로브·드롭 → 파티 영상 5초가 끝나는 10.0에 테이프·로고도 같이 끝남(테이프 7.4 시작).
- AE: ae/shortG2.jsx → ShortG2.aep / ShortG2_v1.mp4, ae/shortF2.jsx → ShortF2.aep / ShortF2_v1.mp4. 소리: audio/make_g2_audio.py, make_f2_audio.py (곡은 임시 houseB.mp3, SONG_DROP=17.0 → 드롭 5.0초에 맞춤). 곡 확정되면 환경변수 SONG, SONG_DROP으로 다시 생성.
- 소재: G 파티 최종 이미지 images/G5-party-final.png, 영상 clips/G-party-mj.mp4(미드저니, 464x832), 박스 터짐 clips/G-burst.mp4. F 파티 clips/F-party-mj.mp4, 박스 터짐 clips/F-burst.mp4.
- 사용자가 AE에서 직접 수정한 프로젝트는 ae/ShortG_user-edit-backup.aep, ShortG2_user-edit-backup.aep로 백업됨. AE 제목에 `*`(저장 안 됨)가 있으면 스크립트 돌리지 말고 먼저 저장하게 할 것(스크립트가 열린 프로젝트를 초기화함).
- 작업 규칙: ①한글 자막·속도선 넣지 않음 ②파티 사진 첨부는 빈 공간 이미지만, 사람은 글로 지정해서 쇼츠마다 다르게(다른 쇼츠 이미지 참고로 넣으면 사람이 똑같이 나옴) ③박스는 쇼츠 내내 같은 디자인(ROOMi 글자 유지) ④파티 세팅 = 박스에서 나오는 물건과 동일 ⑤파티 분위기는 쇼츠마다 고유하게(G 핑크·앰버+검정 옷, F 아이스블루·라임·은색+오렌지 펜던트) ⑥사람 크기는 공간 비율에 맞게, 가운데를 무대로 만들지 않기.
- 비용 사고: 2026-10-13 Higgsfield 크레딧 약 920을 사용자 확인 없이 소진(영상 15개×60). 잔액 26.5, Higgsfield MCP는 연결 끊김. 이미지는 GPT, 영상은 미드저니로 사용자가 직접 생성. 유료 도구는 반드시 단가·총액 알리고 허락받기.
- 남은 것: 곡 확정(+라이선스 확인), 로고 "ROOMiROOMi" 중복 여부, F 라임 탑 글자 가림 여부, 두 쇼츠 렌더 확인.

## 쇼츠 최종 세트 정정 · 2026-10-14
- 사용자가 마음에 들어 하는 건 **F2(카페 Y2K), G2(편의점 하우스)** 뿐. 이전 A, B, B2, C는 쓰지 않음(위 "쇼츠 A/B2/C" 섹션은 참고 기록일 뿐).
- 앞으로 만들 것: **H 코인빨래방 → Rave(UV 네온 페인트 파티)**, **I 루프탑 → Themed(트로피컬 선셋)**. H는 처음 리스닝 파티였으나 UV 네온 레이브로 변경.
- H 배경: images/H1-laundry.png(완성). 박스 속 물건 = 블랙라이트 튜브, 형광 스프레이캔·마커, 곡선 네온 튜브, 글로우스틱, 스피커, 형광 파우더. 소리 장치는 세탁기 완료 알림음(1.45초). 사람은 흰 옷 + 형광 페인트, 염색 머리(F·G와 다르게).
- I 배경 프롬프트 준비됨(루프탑, 물탱크·빨래 건조대·철제 난간·도시 전경). 박스 속 물건: 플라밍고 튜브, 종이 랜턴·전구 줄조명, 꽃목걸이, 비치볼·파스텔 풍선, 야자잎 장식, 스피커. 소리 장치는 철문 삐걱+바람.
- 배경 프롬프트 규칙: 넓은 공간을 9:16으로 일부만 찍은 구도(전체를 우겨넣지 않기).

## 쇼츠 H·I 갱신 · 2026-10-14
- H(코인빨래방 UV 네온 레이브): 이미지 H1~H5, 영상 clips/H-burst.mp4(박스가 중간에 돌아서 2.7초부터만 사용), H-party.mp4. AE ae/shortH.jsx → ShortH.aep, 소리 audio/make_h_audio.py(임시곡 techno.mp3, SONG_DROP=8.06). 렌더는 사용자.
- I는 **크리스마스 테마 파티(겨울 루프탑)**로 변경(트로피컬 선셋 폐기). 박스 속 물건: 미니 트리, 전구 줄조명, 선물 상자(빨강·초록·금 리본), 산타 모자·루돌프 머리띠, 스피커, 금·빨강 오너먼트와 솜눈 컨페티. 소리 장치: 옥상 철문 삐걱+겨울 바람.
- 사람 이미지 규칙 추가: 실제 다큐 사진처럼(피부 질감, 땀, 평범한 외모, 다양한 시선), 레퍼런스 사진 첨부 금지.

## 쇼츠 마무리 · 2026-10-14
- 최종 쇼츠 4개: F2(카페 Y2K), G2(편의점 하우스), H(코인빨래방 UV 레이브), I(루프탑 크리스마스, 하이라이트). H·I는 사용자가 AE에서 렌더 확인 대기.
- 일괄 처리 남음: ①곡 확정 후 5.0초 드롭에 맞춰 소리 재생성(make_f2/g2/h/i_audio.py, 환경변수 SONG·SONG_DROP) ②로고 "ROOMiROOMi" 중복(public/logo.png가 두 개짜리) 정리 여부 ③F 라임 탑 작은 글자.
- 보류한 아이디어(쇼츠 J): DJ 한 명이 같은 자리에서 둠칫 루프, 배경·옷·소품만 F→G→H→I 파티로 전환. 방식 B(DJ를 오려 AE에서 바운스). 이미지 단계에서 중단: 시선이 너무 강함, 테이블이 가슴 높이(허리 높이로), 별 컨페티가 규칙적으로 박힘. 재시도하면 DJ 설정(탈색 크롭, 오버이어 헤드폰, 이어커프, 체인, 문신, 선글라스 없음)과 장면별 옷을 쓸 것.

## 브랜드 이름 구조 · 2026-10-14 (사용자 정정)
- **ROOMiVERSE(루미버스)** = 브랜드 풀네임 / **ROOMi ROOMi(루미루미)** = 파티 서비스 이름 / **ROOMi(루미)** = 애칭.
- 최종 로고 파일: docs/brand/final-logo-261014.ai (PDF 형식, 후보 4개: ①ROOMi ②ROOMi ROOMi+작은 ROOMIVERSE ③ROOMi/VERSE ④ROOMiVERSE).
- 전시 쓰임(제안): 박스 ①ROOMi(쇼츠 박스와 동일), 박스테이프 ②ROOMiROOMi+④ROOMiVERSE 번갈아, VD 가벽·수건 ④, 캡·카드·명함 ①. 박스 위칸을 ②로 할지는 사용자 결정 대기.

## 3D 샵 재질/모델 디테일 (2026-10-14)
- components/shop3d/room.ts 에 woodMat(나무결), stoneMat(테라조/석재), brass() 헬퍼 추가.
- DJ 부스: 나무결 몸통 + 세로 홈(flute) 앞면 + 석재 상판 + 놋쇠 선. 선반: 월넛 나무결. 스피커: 천 질감 + 진동판 테두리.
- 소파: 파이핑, 누빔선, 나무 다리+놋쇠 캡, 쿠션. 테이블: 테라조 상판 + 놋쇠 테두리 + 놋쇠 받침.
- 캡: 6패널 야구모자(봉제선·스티치·통풍구·단추·스트랩·앞 로고·챙 테두리). 모든 파츠가 tag("cap")이고 cg 직속이라 room.solo("cap") 단독샷이 그대로 동작.
- 2D 샵의 상품 이미지(public/products/*.png)는 예전 렌더. 캡을 새 모델로 다시 뽑으려면 solo 단독샷 페이지를 임시로 만들어 렌더.

## 전시 부스 · 교수님 피드백 반영 · 2026-10-14
- 교수님 피드백(10/14): 오프라인 굿즈는 급하지 않음. 웹과 인스타에 집중. 인스타는 "짜임새 있게 짜오기". 파티마다 엽서(카드)를 만들어 가벽에 배치. 박스 오브제는 필요 없음.
- 쇼츠 피드백: 4편이 다 비슷함(전부 파티 한창). 표정 다양하게, 파티 시작 때 다 같이 쾅쾅 뛰는 느낌, 파티마다 다르다는 게 보이고 장소 특성도 보이게. → 앞부분(평범한 공간)은 좋고, 파티 장면의 차별화가 과제. 크레딧 없이 가능한 건 컷 편집(장면 길이·타이밍). 새 영상은 사용자가 미드저니로 직접.
- 부스: docs/exhibition/booth-v4.3dm (가벽 3, 테이블 2, 큰 모니터+키보드+마우스, 엽서 선반 6장, 인스타 프린트+폰, ID 가벽 아래 인스타 피드 월 3x3(가운데 태블릿 쇼츠 루프), 미러볼, 풍선, 바닥 테이프). 사용자가 Rhino에서 수정한 v2는 booth-v2_user-edit-backup.3dm. 생성/수정 스크립트 edit_booth_v3.py, edit_booth_v4.py (원본을 읽어 제자리 수정).
- 엽서: docs/exhibition/postcards/ (make_postcards.py). A6 가로 148x105 + 재단 여유 3mm, 300dpi, 6종 앞·뒷면 PNG + postcards-print.pdf. 서체는 사이트 규칙대로 파티마다 다름(리아·플레이페어·라이처스·가비아 던체·안톤·카페24). QR은 자리만(웹 주소 확정 후 교체).
- 확인 필요: 인쇄용 서체 라이선스(리아체, 가비아 던체, 카페24는 눈누 라이선스에서 인쇄 허용 여부), QR 주소, 송장 명함 자리, 엽서 선반 칸 높이(현재 100 → 105로).

## DJ 컨트롤러 모델 (2026-10-21)
- 사용자의 제품디자인 모델(DJ_CASE_FULLY_OPEN_WEB.zip: OBJ+MTL+display.jpg, 폭 0.60m·높이 0.26m·깊이 0.48m, Y-up, 앞 +Z, 바닥 중앙 원점)을 public/models/dj-controller.glb(2.56MB)로 변환해 3D 샵 DJ 부스에 올림.
- 변환: 정점 용접 + 법선/UV 유지, 재질 10개(display만 텍스처). 변환 스크립트는 세션 스크래치패드에 있었음(원본 zip은 사용자 폴더 C: _공주대-2. ID 캡스톤 디자인\DJ_CASE_OUTPUT\WEB_ASSETS).
- room.ts: DJ_SCALE=1.8(부스 깊이 0.88m 안에 들어가는 최대치), 위치 y=0.97. 로드 전에는 임시 도형, 로드 후 교체. 클릭 영역(hitBox)은 모델 크기에 맞춤. hover하면 전체가 분홍빛으로 은은하게 빛남.
- 부스 상판은 크림색 제품과 대비되도록 어두운 석재로 바꿈.
- 제품 설명(content/products.ts)은 아직 "2-deck controller": 실제 모델은 중앙 컨트롤러 + 좌우 덱(화면에 DECK 01~04)이라 사양 문구 확인 필요.
- 2D 샵의 컨트롤러 이미지(public/products/dj-controller.png)는 예전 임시 렌더. 새 모델로 다시 뽑을 수 있음.

## 3D 샵 상품 뷰어 (2026-10-21)
- 상품을 누르면 방이 흐려지고(배경 blur) 왼쪽에 그 상품의 3D 모델이 자동으로 돌며(약 15초에 한 바퀴) 오른쪽에 정보 패널. 드래그로 회전, 확대(줌)는 없앰(10/21 요청). 2.6초 건드리지 않으면 다시 자동 회전. "모션 줄이기" 설정이면 자동 회전 없음.
- 구현: components/shop3d/ProductViewer.tsx(자체 작은 three 장면 + OrbitControls). 모델은 room.cloneProduct(id)가 방의 모델을 복제해서 줌(수건·반다나는 펴진 모양, flatGeo). 컨트롤러는 GLB 그대로.
- 모바일(900px 이하)은 위에 모델, 아래에 패널. 
- 컨트롤러 색(room.ts djMats switch): 케이스 보라 #5b2f86, 트림 핑크, 본체 잉크블랙, 조그 휠 블랙+은색 림, 패드 핑크(은은한 발광), 노브 피치, 슬라이더 보라. 부스 상판은 다시 밝은 석재(대비용). 상품 옵션 Black/Pink가 있으니 Pink 에디션(케이스 핑크)은 아직 색만 안 바뀜.
- 2D 샵 상품 이미지(public/products/*.png)는 10/21에 새 3D 모델(칠한 컨트롤러, 새 캡 등)로 다시 렌더(투명 배경 900x1125). 모델을 또 바꾸면 임시 렌더 페이지로 다시 뽑아야 함(room.cloneProduct 사용).
