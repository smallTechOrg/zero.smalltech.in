# Deployment

## Branches

| Branch | Target | How |
|--------|--------|-----|
| `main` | GitHub Pages (production) | GitHub Actions |
| `staging` | Vercel (staging) | GitHub Actions |

---

## GitHub Environments & Variables

Create two environments in **Repo → Settings → Environments**:

### `production`
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Production API base URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |

### `staging`
| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Staging API base URL |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | Google Analytics measurement ID |
| `VERCEL_ORG_ID` | From `vercel link` (see below) |
| `VERCEL_PROJECT_ID` | From `vercel link` (see below) |
| `VERCEL_TOKEN` | Vercel personal access token |
| `STAGING_DOMAIN` | e.g. `zero-staging.smalltech.in` |

---

## Getting Vercel IDs

Run inside the `code/` folder:

```bash
cd code
npx vercel link
```

- Select your team/account and existing project when prompted.
- Open the generated file:

```bash
cat .vercel/project.json
```

```json
{
  "orgId": "...",
  "projectId": "..."
}
```

- `orgId` → `VERCEL_ORG_ID`
- `projectId` → `VERCEL_PROJECT_ID`

## Getting a Vercel Token

Vercel Dashboard → Settings → Tokens → Create Token → copy once.

---

## Staging Domain DNS

Add a `CNAME` record with your DNS provider:

| Field | Value |
|-------|-------|
| Name | `staging` |
| Target | `cname.vercel-dns.com` |

Then add `staging.yourdomain.com` in Vercel → Project → Settings → Domains.

---

## What the CI/CD Does

**On push to `main`:**
1. Writes `code/.env.production` from `production` environment variables
2. Runs `npx next build` (static export)
3. Deploys `out/` to GitHub Pages

**On push to `staging`:**
1. Runs `vercel deploy --prod` with `NEXT_PUBLIC_*` vars passed as `--build-env`
2. Aliases the deployed URL to `STAGING_DOMAIN`
