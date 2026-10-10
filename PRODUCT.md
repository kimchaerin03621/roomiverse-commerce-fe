# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Next.js (user choice). Deploy target not yet decided.

## Users

- **Primary: professors and graduation-exhibition judges.** They evaluate the site as a graduation project, judging how complete it is and how clearly the ROOMi brand concept comes through. The site is presented alongside the 2nd-round review deck (발표 자료).
- **Fictional in-world audience (the brand's target):** people who want to enjoy music and parties hands-on, DJing themselves, but feel burdened by equipment, space composition, and setup ("음악과 파티를 직접 즐기고 싶지만 장비, 공간 구성, 세팅에 부담을 느끼는 사람들"). The site speaks to this audience in its brand voice, but the judges are the ones evaluating it.

## Product Purpose

A brand website for **ROOMi (ROOMiVERSE)**, a DJ lifestyle brand created as a graduation-exhibition project. In one site it combines:

1. brand introduction (story, concept, values),
2. a 3D experience in which an ordinary room turns into a party space,
3. party and exhibition information.

Success means the judges experience the concept firsthand ("an ordinary space becomes a party space") and read the site as a finished, coherent brand world.

## Positioning

ROOMi provides equipment, spatial staging, and setup service so that anyone, anywhere, with anyone, can make the party they want. Its claim is the **transformation of an ordinary room into a party space**: "내 방안의 나만의 우주" (my own universe inside my room). It is not a gear shop. It sells the whole experience of turning your own room into your own musical universe.

## Operating Context

- Shown during the graduation-exhibition review. Judges evaluate it alongside the presentation deck.
- Undecided: whether exhibition visitors will also reach it on site (QR, phones). Undecided: whether there is a real party or event date to announce, or whether the "party" is a brand concept only.

## Capabilities and Constraints

- Must include brand intro, 3D content, and party/exhibition info (user-confirmed scope: "all of the above").
- **Entry flow (user-confirmed):** the site opens on a **2.5D parallax intro**. A trigger in the intro moves the visitor into the **3D Shop**. This trigger is the only way into the 3D Shop.
- **Information architecture** (user's IA map, root "항구 인트로"):
  - **3D 샵**: the 3D shop reached from the intro.
  - **Meet ROOMi**: brand intro (About Us, Value: Play / Immersion / Expansion, How). Links out to What's Going On and Shop.
  - **What's Going On**: six party types (01 House Party, 02 Listening Party, 03 Day Party, 04 Themed Party, 05 Rave Party, 06 After Party). Each has an "Explore This Party" detail page leading to reservation.
  - **Let's Party** ("Build Your Party"): reservation wizard with the steps Your Party → When & Where → Space Check → Your Detail → Reservation completed.
  - **Shop (2D)**: a conventional product list alongside the 3D shop.
  - **Cart**: its own page in the GNB, next to My → payment (simulated).
  - **My**: order and reservation history (orders: date, item/option, amount, status paid / preparing / shipping / delivered, with cancel and return/exchange; reservations: number, date/session, party size and options, confirmation status, with cancellation-fee notice and reschedule); 1:1 inquiry history and customer-center link.
- **Previous build:** `C:/OMG/roomiverse-fe` (Vite + React, made with Codex). The user is discarding its visual design. Only its structure may be reused: routes, data shapes (`src/content/*.js`), demo-state logic (`src/contexts/DemoContext.jsx`), reservation steps, and the docs `IA.md` / `HANDOFF.md`. Its product names and prices (such as "Pioneer DJ-Delivery Master System") and its Spline 3D scene are placeholders, not brand truth.
- Latest Figma design: file `2B60SAKczcyuddcFc5E9vK`, node `186:906`. It contains Meet ROOMi (3 variants), What's Going On, six party detail pages, the Build Your Party steps, and three isometric 3D value icons (play button, layered disc, stacked tiles). The file is mid-revision. It is evidence of structure and content, not a binding visual authority.
- **Commerce and reservation are a simulator (user-confirmed):** cart, payment, and reservation only *look* completed. No real payment, shipping, or booking happens. In-progress state is cleared on refresh. Wanted if feasible: completed orders and reservations get an order or reservation number that the visitor can look up later to see what they ordered or booked (stored locally in the browser, no server).
- **3D Shop form (user-confirmed 2026-10-04):** a real-time 3D scene (not layered photos) set **inside the same shipping container** the visitor entered from the intro. The container interior is furnished as a room. The render is deliberately simple and slightly naive (low-poly, hand-painted feel), like kidsuper.world. The camera is fixed with a slight mouse-follow, and controls stay limited. Interactions: click products (translucent detail panel), change the light mood, play music (user-supplied tracks). Mirror ball is on hold. **Scheduled last (user, 2026-10-04):** the user will supply their own models later. Build the 3D Shop after the other pages, in the mood those pages establish.
- **3D Shop contents (user-confirmed):** the user's own **DJ controller**, designed in their parallel product-design graduation project, plus brand **goods/merch** (in progress). The controller has not been modeled yet, so no 3D file exists. Use a placeholder until it arrives. The shop environment and goods are built in code (agreed). Goods candidates (user is still deciding which to include): **slogan towel, cap, bandana, mini CD keyring, English-lettering patch (와펜)**.
- **3D Shop product detail (user-confirmed):** opens in place as a side panel or popup over the 3D space, never as a page navigation, so the visitor stays inside the shop. The overlay is semi-transparent so the shop shows faintly behind it (binding visual constraint from the user).
- **Shop (2D) (user-confirmed):** an editorial product list that shares product data, detail content, and cart with the 3D Shop. It is reachable two ways: a "View all" switch inside the 3D Shop, and its own GNB menu item.
- **3D Shop has exactly one entrance (user-confirmed):** the trigger in the 2.5D parallax intro. There is no GNB link or other shortcut into it.
- **GNB (user-confirmed):** the ROOMi logo sits at the exact center of the GNB.
- **Cart is its own page (user-confirmed):** moved out of My. It sits in the GNB next to My.
- This website is the user's **visual-design** graduation project. The DJ controller belongs to their separate product-design project and is shown in the shop.
- **Harbor intro (user-confirmed meaning):** the 2.5D parallax intro is set in a **container port**. A shipping container goes anywhere and can hold almost anything, which mirrors the brand promise: the party you want, anywhere, with anyone. The container is the conceptual vessel of ROOMi, the room you can take anywhere and fill with any party.
- Terminology: brand name **ROOMi**; full name **ROOMiVERSE** (Room + Universe). Keep the lowercase "i".

## Brand Commitments

Source: the 2nd-round review deck, saved in `docs/brand/`.

- **Story & concept:** "어디서 누구와 함께하든 원하는 파티를 만들 수 있도록 평범한 공간이 파티 공간으로 변화하는 경험을 제공합니다. ROOMi는 누구든지 어디에서든지 자유롭게 나만의 음악적 우주의 방을 펼칠 수 있게 해줍니다."
- **Mission:** 접근성 (accessibility), 직관성 (intuitiveness), 자율성 (autonomy).
- **Core values:** 확장 (expansion), 몰입 (immersion), 놀이 (play).
- **Naming:** ROOMi (ROOMiVERSE) = Room + Universe, "내 방안의 나만의 우주".
- **Logo:** a hand-drawn graffiti marker wordmark "ROOMi", with a "ROOMIVERSE" sub-line in thin, widely tracked caps. It expresses the energy of playing music freely, and the act of writing the logo by hand stands for expressing yourself the way you play music. Final vector file not yet in the repo. Reference image: `docs/brand/06-logo.png`.
- **Brand colors (binding, defined in CMYK):**
  - Pink: C0 M97 Y41 K0. Stands for the liveliness and energy of playing music.
  - Purple: C39 M77 Y0 K0. Stands for your own universe and immersion.
  - Peach: C0 M34 Y41 K0. A soft tone.
  - Light gray: C4 M3 Y3 K0.
  - Deep black: C73 M67 Y66 K83.
  - Intent: pink and purple plus soft peach and deep black, for a sensory, trendy mood. Screen (hex) equivalents are not yet confirmed.

## Evidence on Hand

- Brand deck slides: `docs/brand/01-04-story-target-mission-value.png`, `05-naming.png`, `06-logo.png`, `07-brand-color.png`.
- Figma: `2B60SAKczcyuddcFc5E9vK`, latest design at node `186:906`. Rough, and mixed with older versions.
- From the Codex build (`C:/OMG/roomiverse-fe/public`): container-port parallax layers (`01_background*`, `02_Mid*`, `03_Target*`, `04_Foreground*`), logo PNGs (`logo1.png`, `logo2.png`), and party photographs under the Pexels License with attributions in `IMAGE_SOURCES.md`. Their quality and fit are to be judged again during new-work.
- Visual references named by the user (to be studied in new-work, not copied):
  - Intro and 3D Shop (experiential, 3D): https://basement.studio/ (parallax), https://kidsuper.world/store (parallax and 3D shop).
  - All other pages (static, magazine/editorial feel): https://www.adererror.com/kr, https://www.gentlemonster.com/kr/ko.
- **Two visual registers (user-confirmed):** the intro and 3D Shop are experience-led 3D. The remaining pages are static and editorial, like a magazine. Both must still read as one ROOMi world.
- Absent, must not be fabricated: customers, testimonials, prices, real product SKUs, real event dates and venue, team or credit info, press.

## Product Principles

1. **Show the transformation, don't describe it.** The core proof is an ordinary room becoming a party space. The site should let judges experience it.
2. **Accessible, intuitive, autonomous.** Follow the brand mission: no barrier to entering the experience, no learning curve, and the visitor stays in control.
3. **Expansion, immersion, play.** The interactive and 3D parts should express these values, not decorate the page.
4. **One coherent brand world.** Brand intro, 3D, and event info read as one ROOMi universe, not three separate pages.
