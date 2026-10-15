# tunerapps.net

Static site for tunerapps. Plain HTML, CSS and a little JS — no framework, no build step.

## Layout

```
index.html            home
apps/<slug>/          one page per app
journal/              journal (noindex until real posts exist)
404.html              not-found page
assets/css|js|img|fonts
robots.txt, sitemap.xml, site.webmanifest
CNAME                 custom domain for GitHub Pages (ignored by other hosts)
```

## Run locally

Paths are root-relative (`/assets/...`), so serve from the repo root:

```
npx serve .        # or: python -m http.server 8000
```

## Hosting

Works as-is on GitHub Pages, Netlify, Cloudflare Pages, Vercel or any static host:
publish the repository root, serve `404.html` for missing pages.
The only domain-specific bits are `https://tunerapps.net` in each page's `<head>` (canonical, Open Graph),
`robots.txt` and `sitemap.xml`. Find-and-replace it if the domain changes.

## Adding an app

1. Copy an existing folder in `apps/` to `apps/<slug>/`, edit the text, and put images in `assets/img/apps/<slug>/`.
2. Update title, description, canonical, `og:` tags and the JSON-LD block.
3. Add a card to `index.html` and the URL to `sitemap.xml`.

## Privacy policies

`/privacy/` is served by the separate `omidcc/privacy` repository (GitHub project pages are mounted under the same domain), so don't add a `privacy/` folder here.
