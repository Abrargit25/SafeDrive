export const TAB_BAR_BASE_HEIGHT = 52;

export function getTabBarHeight(bottomInset: number) {
  return TAB_BAR_BASE_HEIGHT + Math.max(bottomInset, 8);
}
