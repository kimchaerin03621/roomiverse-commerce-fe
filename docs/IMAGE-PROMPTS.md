# 웹사이트 사진 교체용 ChatGPT 이미지 프롬프트

범위: 샵(상품 이미지, 3D 샵), 인트로(승인 완료, 레이어 컷아웃), 로고는 **제외**. 나머지 사진 전부.
파일은 아래 "저장 이름"으로 저장해서 주면 같은 이름으로 교체하고, 크롭 위치만 손본다. (webp 변환은 내가 한다. png/jpg 그대로 줘도 됨.)

## 0. 공통 스타일 블록 (모든 프롬프트 맨 앞에 붙여넣기)

사진 톤이 한 세트로 보이려면 이 블록을 **항상 같이** 쓴다. 한 대화(채팅)에서 이어서 생성하면 톤이 더 비슷해진다.

```
Photorealistic candid photograph, shot on 35mm film (Kodak Portra 800 feel), natural skin texture, subtle film grain, shallow depth of field, honest unretouched look. A real party in Korea: friends in their 20s (Korean and international), casual streetwear, natural unposed expressions, anatomically correct hands and faces. Colour palette: hot pink (#F71D64), violet (#C14ED4) and warm peach (#FFB792) as practical light colours against deep black shadows. No text, no logos, no brand names on any gear, no watermark, no illustration or 3D-render look, no stock-photo posing.
```

팁
- 크기는 ChatGPT 기본 3가지만 쓰면 된다: **가로 3:2 (1536x1024)**, **세로 2:3 (1024x1536)**, **정사각 1:1 (1024x1024)**. 아래에 파일마다 지정했다.
- 얼굴이나 손이 이상하게 나오면 "다시 생성"보다 "hands and faces look natural, fix anatomy"를 추가해서 다시.
- DJ 장비는 실제 브랜드 로고가 나오면 안 된다. "generic DJ controller, no brand markings"를 넣어 둠.
- 같은 사람이 여러 장에 반복되지 않게, 장면마다 다른 사람으로.

---

## 1. Meet ROOMi (7장 + 아이콘 3장)

### 1-1. `meet/hero` · 가로 3:2 · 화면 전체 배경 (ROOMi 그라피티 로고가 위에 얹힘)
```
[스타일 블록] A night party crowd seen from behind the dance floor: silhouettes of dancers with raised arms, strong haze, blurred pink and violet stage-light bokeh, a hazy darker area in the centre-left kept relatively empty (a large logo will sit there). Wide angle, atmospheric, slightly motion-blurred hands.
```

### 1-2. `meet/transform-before` + `meet/transform-after` · 가로 3:2 · "평범한 공간이 파티 공간으로" 슬라이더
**반드시 같은 방, 같은 각도.** 먼저 before를 만들고, 그 이미지를 올린 채로 after를 요청한다.
- before
```
[스타일 블록] An ordinary apartment living room on a sunny afternoon, seen from a fixed eye-level camera: sofa, low coffee table, a bookshelf, a window with daylight. Two friends are casually hanging a party garland, nothing party-like yet. Plain, a little everyday-messy, neutral warm light.
```
- after (before 이미지를 첨부하고)
```
Keep the exact same room, camera angle, furniture and window. Now it is night, daylight gone, the room is transformed into a party: pink and violet LED lights, small disco ball reflections on the walls, a generic DJ controller on the coffee table, five friends dancing and laughing, haze in the air. Same photographic style as the first image, no text or logos.
```
(이 두 장을 받으면 슬라이더가 진짜 before/after 두 장으로 바뀌어서 지금보다 훨씬 좋아진다. 코드는 내가 고친다.)

### 1-3. `meet/about` · 세로 2:3 · About Us 옆 큰 사진
```
[스타일 블록] Friends toasting with raised glass bottles under a hot pink light, close group shot, laughing, motion in the raised arms, pink gel light on faces, dark background, shot from slightly below.
```

### 1-4. How 세 칸 (각 3:2 가로, 카드에서 크롭됨)
- `meet/how-gear` (장비)
```
[스타일 블록] Close-up of hands playing a generic DJ controller with two jog wheels on a wooden table at home, pink light glow on the pads, a laptop and headphones beside it, no brand markings.
```
- `meet/how-space` (공간 연출)
```
[스타일 블록] A corner of an ordinary living room being turned into a party space: LED light bars glowing pink and violet on the wall, a small disco ball, a sofa pushed aside, a speaker on a stand, nobody dancing yet, calm mood.
```
- `meet/how-setup` (세팅)
```
[스타일 블록] A friendly setup crew member in a plain dark t-shirt kneeling to connect cables to a speaker in a living room while two friends watch and smile, lighting stands half-assembled, practical lamp light.
```

### 1-5. Value 아이콘 3개 · 정사각 1:1 · 어두운 배경 위
스타일 블록은 쓰지 않는다 (사진이 아니라 3D 아이콘). 배경은 투명으로 요청.
```
A single glossy 3D isometric icon of a PLAY BUTTON (rounded triangle on a rounded square tile), soft plastic material, hot pink (#F71D64) with violet (#C14ED4) edges, soft studio lighting, subtle shadow, centred, transparent background, no text.
```
- `meet/value-play`: 위 프롬프트 (play button)
- `meet/value-immersion`: 같은 문장에서 "PLAY BUTTON ..."을 **"stack of three layered discs (CDs) slightly offset, concentric rings"** 로 교체
- `meet/value-expansion`: **"stack of rounded square tiles in a growing staircase arrangement, getting larger"** 로 교체

---

## 2. What's Going On: 파티 6종 · 필수 (장당 3~4장 = 16장)

각 파티에서 **목록과 상세 페이지 맨 위에 크게** 나오는 사진들. 지금은 여러 파티가 서로 같은 사진을 돌려 쓰고 있어서(예: Rave 상세에 House 사진) 이 16장이 가장 효과가 크다.

### House Party
- `parties/house-main` · 가로 3:2
```
[스타일 블록] A living room turned into a dance floor at night: five friends dancing with the sofa pushed against the wall, string lights, pink and violet LED glow, a small DJ setup on a shelf, joyful movement, wide shot.
```
- `parties/house-detail` · 세로 2:3
```
[스타일 블록] Close portrait of a friend dancing in a small apartment living room, laughing, pink light from the side, blurred friends behind, a plant and a speaker in the background.
```
- `parties/house-candid` · 가로 3:2
```
[스타일 블록] Candid shot of two friends dancing close under blue-violet light in a dim living room, motion blur, flash-less, a window with city lights behind.
```

### Listening Party
- `parties/listening-wide` · 세로 2:3
```
[스타일 블록] Friends sitting on a sofa and floor cushions listening to a record together, warm low lamp light with a touch of pink, a turntable and two bookshelf speakers, calm focused faces, cosy.
```
- `parties/listening-detail` · 세로 2:3
```
[스타일 블록] Close-up of a vinyl record spinning on a turntable, a hand holding the tonearm, warm lamp light, soft pink glow reflected on the vinyl, shallow depth of field, album sleeves in the blurred background.
```
- `parties/details/listening-vinyl` · 가로 3:2
```
[스타일 블록] A stack of vinyl records and sleeves on a wooden floor next to a turntable and a glass of water, warm evening light.
```

### Day Party
- `parties/day-main` · 가로 3:2
```
[스타일 블록, 단 이 장은 낮 장면이라 "practical light colours" 문장은 빼고 "warm golden daylight, pink and peach accents in clothing and decor"로 교체] Friends laughing on a sunny rooftop in the afternoon, a portable speaker and a small DJ controller on a table, drinks, string lights not yet on, city skyline, relaxed.
```
- `parties/details/day-rooftop` · 세로 2:3
```
[위와 같은 낮 톤] Two friends dancing barefoot on a rooftop terrace in golden afternoon sun, a parasol and a speaker, soft lens flare, candid.
```

### Themed Party
- `parties/themed-main` · 가로 3:2
```
[스타일 블록] Friends in matching ghost costumes (white sheet-like costumes with painted faces) posing and laughing in a living room, red and purple party lights, balloons, playful.
```
- `parties/themed-detail` · 세로 2:3
```
[스타일 블록] Close shot of a hand-painted costume detail and face paint on a friend, colourful props on a table, violet and pink light.
```
- `parties/themed-style` · 세로 2:3
```
[스타일 블록] Friends with face paint and costumes under red light, a dim room, strong colour cast, theatrical but candid.
```

### Rave Party
- `parties/rave-main` · 세로 2:3 (어두운 풀블리드 배경으로도 쓰임)
```
[스타일 블록] A dark warehouse-style room, green and pink lasers cutting through haze, silhouettes of dancers with raised arms, a DJ booth with a generic controller in the distance, very dark with strong light beams.
```
- `parties/house-party/dance-floor` (Rave 상세용, 파일명 유지) · 세로 2:3
```
[스타일 블록] A packed dance floor seen from the side in a dark room, bodies mid-motion with long-exposure light trails of pink and violet, haze, one dancer in sharp focus.
```

### After Party
- `parties/after-main` · 세로 2:3
```
[스타일 블록] Friends relaxing on a sofa late at night, a few empty cups on a low table, one lamp and a dim pink light, tired smiles, a small speaker playing softly, intimate.
```
- `parties/after-detail` · 세로 2:3
```
[스타일 블록] Close shot of cushions and blankets on a sofa, a hand holding a mug, warm low lamp light with a soft pink glow, quiet late-night mood.
```

---

## 3. 파티 상세의 Essentials 4장씩 (24장) · 정사각 1:1 · 있으면 좋음

지금은 대부분 다른 파티 사진을 재활용 중이다. 각 항목마다 **그 이름에 맞는 장면 하나**. 공통: `[스타일 블록] + 장면`. 장비는 모두 로고 없는 일반 제품.

| 파티 | 항목 | 장면 (영문 한 줄) |
|---|---|---|
| House | DJ Set | A friend mixing on a generic DJ controller on a shelf in a living room, two friends watching |
| House | Party Lights | A living room corner with pink and violet LED light bars and string lights glowing |
| House | Setup Crew | A crew member adjusting a speaker and light stand in a living room before guests arrive |
| House | Dance Space | An empty cleared living room floor with the sofa pushed to the wall, lights low, ready to dance |
| Listening | Vinyl & Playlist | Hands choosing a record from a crate, warm lamp light |
| Listening | Shared Listening | Friends with eyes closed listening in front of two speakers at a comfortable distance |
| Listening | Comfortable Seats | Floor cushions and a low sofa arranged in a half circle facing speakers |
| Listening | Soft Lighting | A warm table lamp with a pink bulb glow on a dark wall |
| Day | Daytime Sound | A portable speaker on a rooftop table in daylight |
| Day | Open-air Space | A wide empty rooftop terrace with parasols and chairs in the afternoon |
| Day | Relaxed Seating | Friends lounging on outdoor cushions talking, golden light |
| Day | Drinks & Table | A table with colourful drinks and snacks in sunlight |
| Themed | Dress Code | Friends in coordinated costumes in one colour |
| Themed | Theme Decor | A table covered with theme props, balloons and painted details |
| Themed | Themed Playlist | A phone with a playlist (no readable text) next to a small speaker among props |
| Themed | Photo Moment | A corner with a backdrop and props where friends take a group photo |
| Rave | DJ Booth | A DJ booth in the dark with a generic controller and a silhouetted DJ, laser haze |
| Rave | Dance Floor | A crowd dancing under pink and violet moving lights |
| Rave | Immersive Lights | Laser beams and haze in an empty dark room |
| Rave | Sound Setup | A large speaker stack with a subwoofer in a dark room, haze |
| After | Slow Playlist | A hand lowering a small speaker's volume, dim lamp |
| After | Lounge Seating | A sofa with cushions, low light, a blanket |
| After | Warm Light | A warm amber lamp glowing in a dark room with a hint of pink |
| After | Small Gathering | Three friends talking quietly on a sofa at night |

## 4. Add-ons 4장씩 (24장) · 정사각 1:1 · 작은 썸네일(64px)이라 나중에

썸네일이 작아서 **물체 하나를 크게** 찍은 클로즈업이면 충분하다. 항목 이름 그대로 가져가면 된다.
House: Karaoke(마이크), Disco Ball, Party Decor, Table Setup / Listening: Vinyl Session, Album Talk, Cozy Corner, Refreshment Table / Day: Sunset Session, Colorful Details, Group Moments, Evening Lights / Themed: Costume Props, Color Lighting, Sing-along, Themed Table / Rave: Disco Reflections, Color Accents, Setup Support, (Rave는 3개만 쓰임) / After: One Last Record, Late-night Table, Extra Cushions, After-hours Talk.
프롬프트 형식: `[스타일 블록] Close-up of {항목}, single subject, simple background, 1:1`.

---

## 추천 순서 (시간이 없을 때)
1. **1-1, 1-3, 2번(파티 6종 16장)**: 컨펌에서 가장 먼저 보이는 큰 사진들. 이것만 바꿔도 체감이 크다.
2. **1-2 (transform before/after)** + 1-5 아이콘 3개.
3. 1-4, 그 다음 3번(Essentials).
4. 4번(Add-ons)은 마지막.

## 받고 나서 내가 하는 일
- 파일명으로 교체, webp 변환·크기 맞춤, 크롭 위치 조정, 같은 사진 재활용하던 코드(`content/parties.ts`)를 새 파일명으로 연결.
- transform 슬라이더를 before/after 두 장 방식으로 변경.
