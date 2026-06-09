# Auto Company Landing Page

Production-ready landing page for Auto Company's developer tools catalog.

## Features

- **31 Distribution-Ready Products**: Database, Security, DevOps, Testing, CLI Tools, Performance
- **Dark Theme**: Easy on the eyes, professional look
- **Responsive Design**: Mobile-first, works on all devices
- **Product Filtering**: Filter by category, search by name/description
- **Copy-to-Clipboard**: One-click npm install command copying
- **Fast LCP**: Optimized for Core Web Vitals
- **Zero Dependencies**: Built with Next.js 15 and Tailwind v4 only
- **Static Generation**: Pre-rendered for instant loading

## Tech Stack

- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- React 19

## Development

```bash
npm install
npm run dev
```

Visit http://localhost:3000

## Build

```bash
npm run build
npm start
```

## Deployment

### Vercel (Recommended)

```bash
vercel deploy
```

The project is pre-configured for Vercel deployment:

- Static site generation
- Zero configuration needed
- Automatic HTTPS
- Edge caching

### Other Platforms

Any platform that supports Next.js works:

- Netlify
- Cloudflare Pages
- AWS Amplify
- Railway
- Render

## Project Structure

```
landing/
├── app/
│   ├── globals.css       # Global styles with Tailwind v4
│   ├── layout.tsx        # Root layout with metadata
│   └── page.tsx          # Home page
├── components/
│   ├── header.tsx        # Site header with navigation
│   ├── hero.tsx          # Hero section with stats
│   ├── products-section.tsx  # Product grid with filtering
│   ├── product-card.tsx  # Individual product card
│   └── footer.tsx        # Site footer
├── lib/
│   ├── types.ts          # TypeScript types
│   └── products.ts       # Product data (31 products)
└── public/               # Static assets
```

## Adding/Editing Products

Edit `lib/products.ts`:

```typescript
{
  id: "your-product-id",
  name: "Your Product Name",
  description: "Brief description",
  category: "database" | "security" | "devops" | "testing" | "cli-tools" | "performance",
  npmInstall: "npm install your-package",
  version: "0.1.0",
  github: "https://github.com/...", // optional
  npm: "https://npmjs.com/package/..." // optional
}
```

## Performance

- Lighthouse Score: 95+
- First Contentful Paint: < 1s
- Largest Contentful Paint: < 2s
- Zero CLS (Cumulative Layout Shift)

## License

MIT
