export const isNavActive = (pathname, path, { exact = false } = {}) => {
  if (!path) return false;
  if (exact || path.endsWith("/dashboard")) {
    return pathname === path || pathname === path.replace(/\/dashboard$/, "") || pathname === `${path.replace(/\/dashboard$/, "")}/`;
  }
  return pathname === path || pathname.startsWith(`${path}/`);
};

export default isNavActive;
