# buckl3 // portfolio

Mini portfolio of Igor Aleksejev (handle **buckl3**). Static site: plain HTML, CSS and JavaScript, no build step, no dependencies.

Hacker / ASCII aesthetic, fan-inspired by Watch Dogs 2. Not affiliated with Ubisoft — the mask and all ASCII art are original and generated in code.

## Features

- Boot sequence (once per session, skippable)
- ASCII canvas engines: binary rain, `BUCKL3` banner, rotating glitch mask, hexagon tunnel, warped stripes, block noise
- Cat portrait in ASCII or cyan/magenta halftone
- ET / EN language switch
- `SAFE MODE`: turns all animation off; enabled by default when the OS asks for reduced motion
- Animations pause when off-screen; lighter settings on small or low-core devices

## Run locally

```bash
python -m http.server 5517 --directory .
# open http://localhost:5517
```

## Structure

```
index.html
assets/css/style.css
assets/js/i18n.js    # texts (ET/EN), project list, language stats
assets/js/ascii.js   # canvas ASCII engines
assets/js/main.js    # UI: language, safe mode, boot, typewriter, scramble
assets/fonts/        # JetBrains Mono, Chakra Petch (SIL OFL 1.1)
assets/img/
```

To add a project, append an entry to `PROJECTS` in `assets/js/i18n.js`.
