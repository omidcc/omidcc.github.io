# tunerapps.net

Static site for tunerapps. Plain HTML, CSS and a little JS — no framework, no build step.

## Layout

```
index.html            home
apps/app-name/        app page template (noindex until filled in)
journal/              journal (noindex until real posts exist)
privacy/              site privacy statement
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

1. Copy `apps/app-name/` to `apps/<slug>/` and fill in the text.
2. Remove the `noindex` meta tag, update title, description, canonical and `og:url`.
3. Link a card to it from `index.html` and add the URL to `sitemap.xml`.
