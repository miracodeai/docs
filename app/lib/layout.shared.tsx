import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { History } from 'lucide-react';
import { appName, appVersion } from './shared';

export function baseOptions(): BaseLayoutProps & {
  nav: BaseLayoutProps['nav'] & { mode?: 'top' | 'auto' };
} {
  return {
    nav: {
      title: (
        <span className="inline-flex items-center gap-2 font-medium">
          <img
            src="/logo.png"
            alt={`${appName} logo`}
            className="hidden h-6 w-6 rounded dark:block"
          />
          <img
            src="/logo-light.png"
            alt={`${appName} logo`}
            className="h-6 w-6 rounded dark:hidden"
          />
          {appName}
        </span>
      ),
      // Rendered next to the title but outside the home anchor — nesting an
      // <a> inside <a> is invalid HTML and breaks the click target.
      children: (
        <span className="ml-4 inline-flex items-center gap-3">
          <span className="text-xs font-medium text-fd-muted-foreground tabular-nums">
            v{appVersion}
          </span>
          <a
            href="/changelog"
            className="inline-flex items-center gap-1.5 rounded-md border bg-fd-secondary/50 px-2.5 py-1 text-xs font-medium text-fd-muted-foreground hover:bg-fd-accent hover:text-fd-accent-foreground transition-colors"
            aria-label={`${appName} changelog`}
          >
            <History className="size-3.5" aria-hidden="true" />
            Changelog
          </a>
        </span>
      ),
      mode: 'top',
    },
    links: [],
  };
}
