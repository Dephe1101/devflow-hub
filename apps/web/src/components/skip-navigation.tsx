import React from 'react';

/**
 * Skip Navigation link for keyboard users (F3.5 Accessibility).
 * Visually hidden until focused. Allows skipping the sidebar navigation
 * and jumping straight to the main content area.
 */
export function SkipNavigation(): React.ReactElement {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:font-medium focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all"
    >
      Bỏ qua điều hướng (Skip to content)
    </a>
  );
}
