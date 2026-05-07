import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName } from './shared';

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
            className="h-6 w-6 rounded"
          />
          {appName}
        </span>
      ),
      // Render the nav as a full-width top bar (Rewire-style), with the
      // sidebar sliding underneath it on the left.
      mode: 'top',
    },
    // No `githubUrl` and no `links`: the top-right collapses to just the
    // theme switcher, matching the Rewire-style minimal top bar. The
    // sidebar footer carries the GitHub repo link instead.
    links: [],
  };
}
