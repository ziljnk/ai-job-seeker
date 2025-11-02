This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## API: Companies and Jobs

Two new endpoints are available for searching companies and listing jobs by company. These APIs read from your Supabase tables `companies` and `jobs`.

- GET `/api/companies`
	- Query params:
		- `q` string: free-text search across name, description, industry, location
		- `industry` string: filter by industry (ilike)
		- `location` string: filter by location (ilike)
		- `page` number: 1-based page (default 1)
		- `limit` number: items per page (default 10; max 100)
	- Response:
		- `{ data: Company[], meta: { page, perPage, total, totalPages } }`

- GET `/api/companies/:id/jobs`
	- Path `id` can be the company UUID (preferred) or a company name (fallback, ilike match)
	- Query params:
		- `q` string: free-text search across job title, description, location, type
		- `page` number: 1-based page (default 1)
		- `limit` number: items per page (default 10; max 100)
	- Response:
		- `{ data: Job[], meta: { page, perPage, total, totalPages } }`

Notes
- Both endpoints are uncached (force-dynamic) and return `count`-based pagination when supported by your schema.
- The jobs endpoint returns `company_info` via the `jobs_company_id_fkey` relationship when present.
- If your `jobs` table doesn’t have `company_id` but stores a `company` string column, the endpoint will still work by matching on name.
