function getBasePath() {
  // In GitHub Pages
  if (import.meta.env.PROD && window.location.hostname !== 'localhost') {
    const pathSegments = window.location.pathname.split('/');
    // Find the repo name in the path
    if (pathSegments.length > 1) {
      return `/${pathSegments[1]}`;
    }
  }
  // Local development or Replit
  return '';
}

// Router base configuration utility
export function getRouterBase() {
  const base = getBasePath();

  return {
    base,
    makePath: (path: string) => `${base}${path}`,
  };
}
