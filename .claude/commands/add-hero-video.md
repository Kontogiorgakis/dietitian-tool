# Add Hero Video

Add a full-screen background video to the hero section of the current project, following all 2026 performance best practices.

## What to do

1. **Ask the user** for the video file path (e.g. `public/images/videos/hero-video.mp4`) if not provided as an argument.

2. **Print the FFmpeg commands** they need to run first to compress the video and create a WebM version. Use the actual file path they gave. Tell them to run these before continuing, then wait for confirmation.

3. **Find the hero section component** — search the codebase for the component that contains the full-screen hero (look for `min-h-screen`, `h-screen`, `h-dvh`, `hero`, or a full-bleed background image).

4. **Replace the background** — swap any static `<Image fill>` or background `<div>` with a `<video>` element using this exact pattern:
   - `autoPlay muted loop playsInline preload="none"`
   - `poster` pointing to the existing hero image
   - WebM `<source>` first, MP4 `<source>` second
   - `className="absolute inset-0 h-full w-full object-cover"`

5. **Fix mobile viewport height** — change `min-h-screen` to `h-dvh` on the hero section wrapper.

6. **Add `prefers-reduced-motion` support** — add a `useRef` on the video and a `useEffect` that pauses it if `window.matchMedia("(prefers-reduced-motion: reduce)").matches`.

7. **Preload the poster image** — in the home page component (not the layout), add `<link rel="preload" as="image" href="..." fetchPriority="high" />` as the first child so React hoists it to `<head>`.

8. **Take a screenshot** and visually verify the hero looks correct.

Use the `add-hero-video` skill for the exact code patterns and attribute details.
