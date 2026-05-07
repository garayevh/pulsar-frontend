# Pulsar — Frontend

> AI-Assisted Requirement Analysis & Test Case Generation Platform

## Tech Stack
Next.js 14 · TypeScript · Tailwind CSS · Zustand · TanStack Query · pnpm

## Getting Started

```bash
# Install dependencies
pnpm install

# Copy env file
cp .env.example .env.local
# → edit NEXT_PUBLIC_API_URL to point to your backend

# Run dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## Project Structure
See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for full breakdown.

## Scripts
| Command | Description |
|---------|-------------|
| `pnpm dev` | Start dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint |
| `pnpm type-check` | TypeScript check |
| `pnpm format` | Prettier |

## Related
- **Backend repo**: `pulsar-backend` (FastAPI + LangGraph)
