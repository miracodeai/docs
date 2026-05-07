import { index, route, type RouteConfig } from '@react-router/dev/routes';

export default [
  // `/` is the docs root, and every nested path (e.g. `/quickstart`,
  // `/configuration/mira-yml`) also resolves through the same loader.
  // The docs.tsx loader throws a 404 Response when no MDX page matches
  // the slug, so unknown routes still render the not-found UI.
  index('routes/docs.tsx'),
  route('api/search', 'routes/search.ts'),

  // LLM integration:
  route('llms.txt', 'llms/index.ts'),
  route('llms-full.txt', 'llms/full.ts'),
  route('llms.mdx/*', 'llms/mdx.ts'),

  // Same module as the index, but registered under a distinct route id
  // because React Router rejects duplicate ids. The `*` splat catches
  // every nested doc path (e.g. `/quickstart`, `/configuration/mira-yml`).
  route('*', 'routes/docs.tsx', { id: 'docs-splat' }),
] satisfies RouteConfig;
