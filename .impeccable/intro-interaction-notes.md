# Intro (harbor parallax): user-confirmed interaction requirements

Fold these into the intro surface brief's Direction contract when it is written.

- The screen contains only the GNB, the parallax scene, and the trigger. Nothing else.
- Parallax responds to the mouse immediately on hover/move. No start or play action. (Touch devices and reduced motion need a fallback: gyro or a slow idle drift; reduced motion means static layers.)
- The trigger (the one open container) is the only way into the 3D Shop. No play marker or label in the scene.
- Clickable objects (the trigger here, and products in the 3D Shop):
  1. **Sheen: removed (user, 2026-10-04).** Replaced by a soft glow of light leaking from inside the container. The user is bringing a reference example, so it is not implemented yet.
  2. **Hover:** a very small lift only. No tilt and no scale (user, 2026-10-04: the lift was too big, and tilting is not wanted).
- Implementation consequence: the trigger container must be its own cutout layer (transparent PNG plate) so the sheen mask and tilt apply to it alone.
- Keyboard: the trigger is focusable, with an accessible name ("컨테이너 열기 / Enter the shop"). Focus shows the same hover state.
