# WealthPath Frontend

Next.js frontend for the WealthPath personal finance application.

## Structure

```
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility libraries
│   ├── store/        # State management
│   └── messages/     # i18n translations
├── public/           # Static assets
├── e2e/              # Playwright E2E tests
└── Dockerfile        # Container build
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm test

# Run E2E tests
npm run test:e2e

# Build for production
npm run build
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_BASE_URL` | Frontend base URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics ID |

## Docker

```bash
# Build image
docker build -t wealthpath-frontend .

# Run container
docker run -p 3000:3000 wealthpath-frontend
```

## CI/CD

On push to `main`:
1. Runs linter and tests
2. Builds Docker image
3. Pushes to GitHub Container Registry:
   - `ghcr.io/wealthpathorganization/frontend:latest`

