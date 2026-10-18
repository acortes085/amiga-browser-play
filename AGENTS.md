<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->
- Amiga games run in public/player.html (EmulatorJS puae core via CDN) inside an iframe; keeps the emulator out of SSR. Game list lives in src/lib/games.ts.
- Catalogue artwork uses GameCover and slug-named CDN asset pointers under src/assets/covers; central resolution preserves full covers and a fallback when an image is unavailable.
