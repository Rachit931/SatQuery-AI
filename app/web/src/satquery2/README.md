# SatQuery Frontend

The `satquery2` directory contains the current SatQuery web frontend. It is a React and TypeScript application for exploring satellite imagery, monitoring watch zones, and presenting remote-sensing analysis workflows.

## Tech Stack

- **React 19** for the component-based user interface.
- **TypeScript 5.9** with strict type checking.
- **vinext** for the Next-compatible application runtime and build pipeline.
- **Vite 8** for development and bundling.
- **Tailwind CSS 4** with the Tailwind PostCSS plugin for styling.
- **shadcn/ui-style components** built with `@shadcn/react`, `@base-ui/react`, Radix-inspired UI patterns, `class-variance-authority`, and `tailwind-merge`.
- **Lucide React** for icons.
- **Leaflet and Leaflet Draw** for interactive maps and geographic drawing tools.
- **Three.js and GSAP** for the space-themed visual scene and animation.
- **Recharts** for charts and data visualizations.
- **Cloudflare Vite plugin and Wrangler** for the Cloudflare Workers-compatible build and local production preview.
- **npm** with the committed `package-lock.json` for reproducible dependency installation.

## Requirements

Install the following on the new system:

- Node.js `22.13.0` or newer
- npm, included with Node.js
- Git

Check the installed versions:

```powershell
node --version
npm --version
git --version
```

## Run on a New System

From the repository root, open PowerShell and run:

```powershell
cd "app/web/src/satquery2"
npm install
npm run dev
```

Open the local URL printed by the development server in your browser. The development server supports hot reload while editing the frontend.

The frontend currently has no required `.env` values for local startup. If API integrations are added later, keep local secrets in an ignored `.env.local` file and document required variable names here without committing secret values.

## Available Commands

Run these commands from `app/web/src/satquery2`:

```powershell
# Start the local development server
npm run dev

# Create the production/Cloudflare-compatible build
npm run build

# Serve the generated build locally through Wrangler
npm run start

# Run the Oxlint checks
npm run lint

# Format the project with Oxfmt
npm run format
```

Run `npm run build` before `npm run start`. The start command serves the generated files from `dist/server/wrangler.json`.

## Project Structure

```text
satquery2/
├── app/             # App Router pages, layouts, global styles, and scenes
├── components/      # Shared UI and map components
├── hooks/           # Reusable React hooks
├── lib/             # Shared utilities
├── providers/       # React context/providers
├── public/          # Static assets
├── services/        # Frontend service integrations
├── next.config.ts   # Next-compatible configuration
├── vite.config.ts   # Vite, vinext, Tailwind, and Cloudflare setup
├── package.json     # Scripts and dependencies
└── tsconfig.json    # TypeScript configuration and path aliases
```

The `@/*` TypeScript alias resolves to the project root. For example:

```tsx
import { Button } from '@/components/ui/button';
```

## Notes for Development

- The project uses the App Router-style `app/` directory.
- The checked-in `.openai/hosting.json` contains project hosting metadata and does not currently define D1 or R2 bindings.
- Generated directories such as `.next`, `dist`, `.vinext`, and `.wrangler` should not be edited manually.
- Keep frontend-only changes inside this directory unless the API contract or shared project documentation also needs to change.
