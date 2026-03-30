# 🍞 Ruse's Bakery — Setup Guide (v2 — Murlok.io Aesthetic)

---

## Quick Start

```bash
npx create-react-app ruses-bakery
cd ruses-bakery
npm install lucide-react
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
```

**tailwind.config.js**
```js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: { extend: {} },
  plugins: [],
};
```

Drop the files:
- `src/App.js`  ← rename `App.jsx` → `App.js`
- `src/index.css` ← replace existing

---

## Google Fonts (add to `public/index.html` `<head>`)

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Rajdhani:wght@500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
```

---

## Wowhead Tooltips (add to `public/index.html` before `</body>`)

```html
<script>
  var whTooltips = {
    colorLinks: true,
    iconSize: 'medium',
    renameLinks: false,
    hide: { questRewards: true }
  };
</script>
<script src="https://wow.zamimg.com/js/tooltips.js"></script>
```

Any element with `data-wowhead="item=XXXXX"` will automatically show rich tooltips.
The WoW article cards already include these attributes on item links.

---

## Live RSS Feed (Production)

Replace mock data arrays with a serverless function:

**netlify/functions/feed.js**
```js
const Parser = require('rss-parser');
const parser = new Parser();
const FEEDS = {
  wowhead:     'https://www.wowhead.com/news/rss/news',
  mmochampion: 'https://www.mmo-champion.com/external.php?do=rss&type=newcontent&sectionid=1&days=7',
  dota2:       'https://www.dota2.com/news/rss',
  bluetracker: 'https://www.wowhead.com/blue-tracker/rss',
};
exports.handler = async ({ queryStringParameters: { source } }) => {
  const feed = await parser.parseURL(FEEDS[source]);
  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    body: JSON.stringify(feed.items.slice(0, 15).map(i => ({
      title: i.title, link: i.link, pubDate: i.pubDate, summary: i.contentSnippet,
    }))),
  };
};
```

Call from React:
```js
useEffect(() => {
  Promise.all(['wowhead','mmochampion','bluetracker','dota2'].map(s =>
    fetch(`/.netlify/functions/feed?source=${s}`).then(r => r.json())
  )).then(([wh, mmo, blue, dota]) => {
    // merge, sort by pubDate, set state
  });
}, []);
```

---

## Blue Post Detection

Blue posts are identified by the `bluetracker` RSS feed from Wowhead.
Each item in that feed is an official Blizzard forum post — mark them `isBluePost: true`
and they'll automatically receive the blue tint card style + "BLUE POST" badge.

---

## Deploy

```bash
npm run build
# Deploy /build to Netlify, Vercel, or Cloudflare Pages
```

---

*Built with ❤️ for the Ruse's Bakery community.*
