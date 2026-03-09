

## Plan: Enhance Hero Section — Responsive, Premium UX & Interactive

### Current Issues
- On mobile, the shoe image is cut off awkwardly — not properly framed
- Image has no zoom/scale animation on load — feels static
- No interactive hover effects on desktop (e.g., subtle image movement on mouse)
- The hero text competes with the shoe image for readability on mobile
- No particle/shimmer effects that luxury brands typically use
- Scroll indicator hidden on mobile

### Changes — Single file: `src/pages/Home.tsx`

**1. Better responsive image positioning**
- Adjust `objectPosition` for mobile to `center 30%` so the shoe is better framed
- Add responsive `objectFit` tweaks so the shoe isn't cropped badly on narrow screens
- On mobile, shift text content lower with more bottom alignment so image breathes

**2. Cinematic load animation for hero image**
- Add a `scale(1.1)` → `scale(1)` zoom-out animation on the hero image using framer-motion (`initial={{ scale: 1.15, opacity: 0 }}` → `animate={{ scale: 1, opacity: 1 }}`) over ~2s with easeOut
- This creates a Ken Burns / cinematic reveal effect

**3. Mouse-tracking parallax on desktop (interactive)**
- Track mouse position with `onMouseMove` on the hero container
- Apply subtle `translateX/Y` transform to the hero image based on cursor position (max ~15px offset)
- Creates a floating/3D depth effect as users move their mouse
- Disable on mobile (touch devices) for performance

**4. Floating gold particle/shimmer accent**
- Add 2-3 small animated gold dots/circles using framer-motion that float gently around the hero
- Very subtle — `opacity: 0.15`, small size (4-8px), slow looping animation
- Adds a premium, living feel to the hero

**5. Enhanced text reveal**
- Add a shimmer/gradient sweep effect on the "Elegance" text after it loads — a gold gradient that sweeps across once
- Use CSS `background-clip: text` with animated `background-position`

**6. Improved mobile layout**
- Make hero `minHeight: 100svh` (safe viewport height) for better mobile browser compatibility
- Show a simplified scroll indicator on mobile (just a small chevron)
- Increase bottom gradient intensity on mobile for better text contrast

### No new files needed — all changes in `src/pages/Home.tsx` and minor CSS additions in `src/index.css` for the shimmer keyframe.

