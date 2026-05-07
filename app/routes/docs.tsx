import type { Route } from './+types/docs';
import { DocsLayout } from 'fumadocs-ui/layouts/notebook';
import { productRepoUrl } from '@/lib/shared';

// Inline GitHub mark — Lucide doesn't ship brand icons, and pulling in a
// brand-icon package just for one footer link isn't worth it.
function GithubMark({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.27-5.24-5.66 0-1.25.45-2.27 1.18-3.07-.12-.29-.51-1.46.11-3.04 0 0 .96-.31 3.15 1.17.91-.25 1.89-.38 2.86-.39.97 0 1.95.13 2.86.39 2.18-1.48 3.14-1.17 3.14-1.17.62 1.58.23 2.75.11 3.04.74.8 1.18 1.82 1.18 3.07 0 4.4-2.69 5.36-5.25 5.65.41.36.78 1.07.78 2.16 0 1.56-.01 2.81-.01 3.19 0 .31.21.67.8.55C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 2.5l2.95 5.98 6.6.96-4.78 4.66 1.13 6.58L12 17.6l-5.9 3.1L7.23 14 2.45 9.34l6.6-.96L12 2.4z" />
    </svg>
  );
}

function ForkIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <circle cx="6" cy="5" r="2" />
      <circle cx="6" cy="19" r="2" />
      <circle cx="18" cy="7" r="2" />
      <path d="M6 7v8" />
      <path d="M18 9v2a3 3 0 0 1-3 3H9" />
    </svg>
  );
}

function SidebarGitHubFooter({ stats }: { stats: GithubStats | null }) {
  return (
    <a
      href={productRepoUrl}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2 text-xs text-fd-muted-foreground hover:text-fd-foreground transition-colors"
    >
      <GithubMark className="size-4" />
      <span className="me-auto">miracodeai/mira</span>
      {stats && (
        <>
          <span className="inline-flex items-center gap-1">
            <StarIcon className="size-3" />
            {formatCount(stats.stars)}
          </span>
          <span className="inline-flex items-center gap-1">
            <ForkIcon className="size-3" />
            {formatCount(stats.forks)}
          </span>
        </>
      )}
    </a>
  );
}

function formatCount(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  return String(n);
}

type GithubStats = { stars: number; forks: number };

// Single in-flight fetch shared across loader invocations during one build /
// server lifetime. Avoids spamming the GitHub REST API across the dozen-plus
// prerendered docs routes — one HTTP call seeds the count for every page.
let _statsPromise: Promise<GithubStats | null> | null = null;

async function getRepoStats(): Promise<GithubStats | null> {
  if (_statsPromise) return _statsPromise;
  _statsPromise = (async () => {
    try {
      const resp = await fetch('https://api.github.com/repos/miracodeai/mira', {
        headers: {
          Accept: 'application/vnd.github+json',
          'User-Agent': 'mira-docs',
        },
      });
      if (!resp.ok) return null;
      const data = (await resp.json()) as {
        stargazers_count?: number;
        forks_count?: number;
      };
      const stars = data.stargazers_count;
      const forks = data.forks_count;
      if (typeof stars !== 'number' || typeof forks !== 'number') return null;
      return { stars, forks };
    } catch {
      return null;
    }
  })();
  return _statsPromise;
}
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
  MarkdownCopyButton,
  ViewOptionsPopover,
} from 'fumadocs-ui/layouts/notebook/page';
import { getPageMarkdownUrl, source } from '@/lib/source';
import browserCollections from 'collections/browser';
import { baseOptions } from '@/lib/layout.shared';
import { gitConfig } from '@/lib/shared';
import { useFumadocsLoader } from 'fumadocs-core/source/client';
import { useMDXComponents } from '@/components/mdx';

export async function loader({ params }: Route.LoaderArgs) {
  // The `index` mount of this route doesn't have a `*` splat param,
  // while the catch-all `*` mount does — default to empty so both
  // entry points resolve to the same getPage(slugs) call.
  const splat = params['*'] ?? '';
  const slugs = splat.split('/').filter((v) => v.length > 0);
  const page = source.getPage(slugs);
  if (!page) throw new Response('Not found', { status: 404 });

  const [pageTree, githubStats] = await Promise.all([
    source.serializePageTree(source.getPageTree()),
    getRepoStats(),
  ]);

  return {
    path: page.path,
    markdownUrl: getPageMarkdownUrl(page).url,
    pageTree,
    githubStats,
  };
}

const clientLoader = browserCollections.docs.createClientLoader({
  component(
    { toc, frontmatter, default: Mdx },
    // you can define props for the component
    {
      markdownUrl,
      path,
    }: {
      markdownUrl: string;
      path: string;
    },
  ) {
    return (
      <DocsPage toc={toc}>
        <title>{`${frontmatter.title} | Mira`}</title>
        <meta name="description" content={frontmatter.description} />
        <DocsTitle>{frontmatter.title}</DocsTitle>
        <DocsDescription>{frontmatter.description}</DocsDescription>
        <div className="flex flex-row gap-2 items-center border-b -mt-4 pb-6">
          <MarkdownCopyButton markdownUrl={markdownUrl} />
          <ViewOptionsPopover
            markdownUrl={markdownUrl}
            githubUrl={`https://github.com/${gitConfig.user}/${gitConfig.repo}/blob/${gitConfig.branch}/content/docs/${path}`}
          />
        </div>
        <DocsBody>
          <Mdx components={useMDXComponents()} />
        </DocsBody>
      </DocsPage>
    );
  },
});

export default function Page({ loaderData }: Route.ComponentProps) {
  const { pageTree, path, markdownUrl } = useFumadocsLoader(loaderData);

  return (
    <DocsLayout
      {...baseOptions()}
      tree={pageTree}
      sidebar={{
        // Open every folder by default — Rewire's sidebar shows the full
        // tree expanded out of the gate so users can scan the whole IA at
        // a glance. 99 is comfortably past the deepest possible depth.
        defaultOpenLevel: 99,
        // Function form so we can replace the wrapper div entirely.
        // The notebook layout's default footer wrapper is `hidden` on
        // desktop (only shows on mobile when icon-links exist) — so any
        // `footer` ReactNode we pass would never render on desktop. By
        // accepting the props ourselves and providing our own div, we
        // get to drop the `hidden` class and show the footer everywhere.
        footer: () => (
          <div className="flex flex-row items-center border-t px-4 py-2.5 mt-auto">
            <SidebarGitHubFooter stats={loaderData.githubStats} />
          </div>
        ),
      }}
    >
      {clientLoader.useContent(loaderData.path, {
        markdownUrl,
        path,
      })}
    </DocsLayout>
  );
}
