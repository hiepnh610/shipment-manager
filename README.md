# Shipment Manager

A shipment and assignment management app built with React, TypeScript, and Material UI.

## Tech Stack

React · TypeScript · Vite · Material UI · Leaflet · Axios · json-server

## Prerequisites

- Node.js >= 24
- pnpm 10.32.1

## Getting Started

```bash
# Install dependencies
pnpm install

# Generate mock data
node generate-data.cjs

# Run API server and dev server together
pnpm run parallel
```

Or run them separately:

```bash
# Start mock API (port 3001)
pnpm run api

# Start dev server (port 5173)
pnpm run dev
```

## Build

```bash
pnpm run build
pnpm run preview
```
