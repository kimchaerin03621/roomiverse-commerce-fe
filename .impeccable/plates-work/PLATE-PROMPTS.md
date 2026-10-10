# 패럴랙스 레이어 프롬프트 (5장)

**사용법 (레이어마다 ChatGPT 새 대화)**
1. 아래 두 이미지를 첨부하세요.
   - 전체 시안 `.impeccable/mocks/comp-1.png`: 전체 맥락용
   - 해당 레이어의 크롭 `.impeccable/plates-work/<이름>-crop.png`
2. 프롬프트를 붙여넣으세요.
3. 결과를 `assets/plates/<이름>.png`로 저장하세요. 투명 배경 레이어는 반드시 **PNG(투명)**여야 합니다. 흰색이나 체크무늬 배경이 깔려 나오면 "Make the background truly transparent (alpha), PNG"라고 다시 요청하세요.
4. 해상도는 가능한 한 크게 받아 주세요.

## 1. `assets/plates/bg-sky-sea.png`: 가장 뒤 레이어: 하늘·바다·먼 항구 (투명 아님)

첨부: `comp-1.png` + `bg-sky-sea-crop.png`

```
Use the provided crop as the approved visual reference and recreate it as a clean production asset at the target aspect ratio. This is a designed illustration plate. Output the same drawing, same style, same line weight and shading. Preserve silhouette, composition, perspective, palette (#100b10, #341313, #3b1c2c), lighting, material, and texture exactly. Remove every piece of UI text, label, caption, button, and interface chrome that is not part of the artwork itself. Remove letterboxing, borders, card corners, drop shadows, and any layout background that the page will draw in code. Do not add objects. Do not change the concept. Do not restyle. The artwork fills the whole frame edge to edge at the same scale as the reference; no margins, no border, no background band. Region: deepest parallax layer: pink-violet dusk sky with clouds, distant city skyline, sea with reflections, quay cranes and docked ship on the right horizon.

The first attached image is the full approved screen for context; the second is the crop of this layer.

PARALLAX LAYER RULES: this is the deepest layer only. Keep the dusk sky, clouds, distant city skyline, sea with reflections, the quay cranes and docked ships on the far shore. REMOVE the foreground crane structure on the left, the orange crane leg on the right, and the whole container yard; repaint what they covered so the sea, far quay and horizon continue naturally behind them (extend the sea and far shore down to the bottom of the frame). Also extend the scene about 8% beyond every edge so it can shift without revealing gaps. Opaque, full frame, landscape, highest resolution available.
```

## 2. `assets/plates/mid-yard.png`: 중간 레이어: 컨테이너 야적장 (위쪽 하늘 부분은 투명)

첨부: `comp-1.png` + `mid-yard-crop.png`

```
Use the provided crop as the approved visual reference and recreate it as a clean production asset at the target aspect ratio. This is a designed illustration plate. Output the same drawing, same style, same line weight and shading. Preserve silhouette, composition, perspective, palette (#100b10, #341313, #3b1c2c), lighting, material, and texture exactly. Remove every piece of UI text, label, caption, button, and interface chrome that is not part of the artwork itself. Remove interface borders, card corners, and layout backgrounds; retain only shadows that belong to the referenced object itself. Do not add objects, change the concept, or restyle. Preserve the reference's placement, scale, and clear margins exactly; do not enlarge the subject to fill the frame. Remove the page ground and interior gaps to genuine transparent alpha. Keep white paint and other solid foreground colors opaque, preserve fine edges, and retain partial alpha only for genuinely translucent material or soft shadows in the reference. No chroma background, baked-in checkerboard, or matte. Output a transparent PNG cutout. Region: middle parallax layer: wet reflective concrete container yard seen from above, stacked containers in muted red, blue and gray, yellow straddle carriers and lamp posts, pink light reflections; transparent above the yard horizon.

The first attached image is the full approved screen for context; the second is the crop of this layer.

PARALLAX LAYER RULES: keep only the container yard from the waterline down: stacks, wet reflective concrete, straddle carriers, lamp posts, the pink light reflection on the ground. REMOVE the single red container with the glowing open door (it is a separate layer) and repaint the wet concrete under it, but keep its pink light reflection on the ground. REMOVE the dark crane structure on the left and the orange crane leg on the right and repaint the yard behind them. Everything above the far edge of the yard (sea, sky) is fully transparent. Extend the yard slightly past the left, right and bottom edges. Landscape, highest resolution available.
```

## 3. `assets/plates/trigger-container.png`: 트리거 컨테이너 하나 (배경 투명)

첨부: `comp-1.png` + `trigger-container-crop.png`

```
Use the provided crop as the approved visual reference and recreate it as a clean production asset at the target aspect ratio. This is a designed illustration plate. Output the same drawing, same style, same line weight and shading. Preserve silhouette, composition, perspective, palette (#100b10, #341313, #3b1c2c), lighting, material, and texture exactly. Remove every piece of UI text, label, caption, button, and interface chrome that is not part of the artwork itself. Remove interface borders, card corners, and layout backgrounds; retain only shadows that belong to the referenced object itself. Do not add objects, change the concept, or restyle. Preserve the reference's placement, scale, and clear margins exactly; do not enlarge the subject to fill the frame. Remove the page ground and interior gaps to genuine transparent alpha. Keep white paint and other solid foreground colors opaque, preserve fine edges, and retain partial alpha only for genuinely translucent material or soft shadows in the reference. No chroma background, baked-in checkerboard, or matte. Output a transparent PNG cutout. Region: the single red 20ft container with its right door ajar and hot pink light glowing inside; the clickable trigger, cut out on transparency.

The first attached image is the full approved screen for context; the second is the crop of this layer.

PARALLAX LAYER RULES: only the one red 20ft shipping container with its right door ajar and hot pink light glowing from inside, seen from the same high angle. No ground, no reflection, no other containers. Clean edges, transparent everywhere else. Square or landscape, highest resolution available.
```

## 4. `assets/plates/fg-left-crane.png`: 가장 앞 레이어: 왼쪽 크레인 구조물 (배경 투명)

첨부: `comp-1.png` + `fg-left-crane-crop.png`

```
Use the provided crop as the approved visual reference and recreate it as a clean production asset at the target aspect ratio. This is a designed illustration plate. Output the same drawing, same style, same line weight and shading. Preserve silhouette, composition, perspective, palette (#100b10, #341313, #3b1c2c), lighting, material, and texture exactly. Remove every piece of UI text, label, caption, button, and interface chrome that is not part of the artwork itself. Remove interface borders, card corners, and layout backgrounds; retain only shadows that belong to the referenced object itself. Do not add objects, change the concept, or restyle. Preserve the reference's placement, scale, and clear margins exactly; do not enlarge the subject to fill the frame. Remove the page ground and interior gaps to genuine transparent alpha. Keep white paint and other solid foreground colors opaque, preserve fine edges, and retain partial alpha only for genuinely translucent material or soft shadows in the reference. No chroma background, baked-in checkerboard, or matte. Output a transparent PNG cutout. Region: nearest parallax layer: out-of-focus dark steel gantry crane beams and girders along the left edge and top-left, rim-lit pink, on transparency.

The first attached image is the full approved screen for context; the second is the crop of this layer.

PARALLAX LAYER RULES: only the nearest, out-of-focus dark steel gantry crane beams and girders on the left and top-left, rim-lit pink, keeping their blur. Everything else (sky, sea, yard) is fully transparent. Portrait, highest resolution available.
```

## 5. `assets/plates/fg-right-crane.png`: 앞 레이어: 오른쪽 주황 크레인 다리 (배경 투명)

첨부: `comp-1.png` + `fg-right-crane-crop.png`

```
Use the provided crop as the approved visual reference and recreate it as a clean production asset at the target aspect ratio. This is a designed illustration plate. Output the same drawing, same style, same line weight and shading. Preserve silhouette, composition, perspective, palette (#100b10, #341313, #3b1c2c), lighting, material, and texture exactly. Remove every piece of UI text, label, caption, button, and interface chrome that is not part of the artwork itself. Remove interface borders, card corners, and layout backgrounds; retain only shadows that belong to the referenced object itself. Do not add objects, change the concept, or restyle. Preserve the reference's placement, scale, and clear margins exactly; do not enlarge the subject to fill the frame. Remove the page ground and interior gaps to genuine transparent alpha. Keep white paint and other solid foreground colors opaque, preserve fine edges, and retain partial alpha only for genuinely translucent material or soft shadows in the reference. No chroma background, baked-in checkerboard, or matte. Output a transparent PNG cutout. Region: near layer on the right edge: orange-yellow crane leg with lit platforms and railings, on transparency.

The first attached image is the full approved screen for context; the second is the crop of this layer.

PARALLAX LAYER RULES: only the orange-yellow crane leg with lit platforms and railings on the right edge. Everything else is fully transparent. Tall portrait, highest resolution available.
```



## 재생성 (2026-10-04): `assets/plates/fg-right-crane.png`

첨부: `.impeccable/plates-work/fg-right-crane-crop.png` 한 장만

```
Recreate the attached crop as a production cutout layer for a 2.5D parallax web page.

Keep the EXACT framing of the attached crop: same aspect ratio (a tall strip about 1:3), the crane leg at the same size, the same position and the same angle inside the frame, cut off at the same edges. Do not zoom out, do not re-center, do not add more of the crane.

Keep only the orange-yellow steel crane leg with its lit platforms, railings, ladders and warm lamps, exactly as in the crop. Remove everything behind it (sea, sky, containers, ground) to genuinely transparent alpha.

Match the crop's color grade: warm orange lamplight on the steel, magenta-pink ambient light from the dusk sky, deep shadows. Photoreal, same lens softness and grain as the crop. No text.

Output: transparent PNG, tall portrait, highest resolution available (at least 660 x 1950).
```
