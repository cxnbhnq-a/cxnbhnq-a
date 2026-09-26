# Reuse this profile dashboard

This repository is both a GitHub profile README and a reusable profile-dashboard generator. It creates a terminal-style SVG with a rendered ASCII portrait, Neofetch-style profile summary, diagonal code rain, a vertical scanning beam, and responsive light/dark variants.

## Requirements

- Node.js 20 or newer
- A transparent PNG portrait image
- A GitHub repository named exactly like the account username to publish a profile README

## Set up your profile

1. Fork this repository into a repository named `YOUR-USERNAME/YOUR-USERNAME`.
2. Edit `profile.config.json`. Replace the sample identity, location, summary, focus, projects, technologies, links, and footer with your own information.
3. Install dependencies and generate the dashboard and profile README:

   ```sh
   npm ci
   npm run generate -- --source /path/to/your-transparent-portrait.png
   npm run check
   ```

   The portrait stays at the path you supplied and is not copied into the repository. Generated SVGs contain the rendered character portrait.

4. Review `README.md` and the four generated variants under `assets/hero/`, then commit and push.

When changing configuration or artwork, rerun `npm run generate` with your portrait source.

## Customize the artwork

- Choose `signal`, `ocean`, or `solar` in `profile.config.json` for the theme palette.
- The generator emits desktop and mobile versions for dark and light themes.
- Keep the source portrait outside Git when it is private; the default `.gitignore` excludes common portrait source filenames.
- `npm run check` validates the profile data, generated SVGs, and that no automatic activity block has been added to the README.

## License

The generator uses the repository's MIT license. Use only portrait images you have permission to publish.
