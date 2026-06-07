type Size = {
  width: number;
  height: number;
};

type PositionedSize = Size & {
  left: number;
  top: number;
};

/**
 * Scales an image to cover the screen and anchors it to the bottom so
 * the lower portion (car/road) stays visible on every device size.
 */
export function getAdaptiveCoverLayout(
  screen: Size,
  image: Size,
  anchor: 'bottom' | 'center' = 'bottom',
): PositionedSize {
  const scale = Math.max(screen.width / image.width, screen.height / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const left = (screen.width - width) / 2;
  const top =
    anchor === 'bottom' ? screen.height - height : (screen.height - height) / 2;

  return { width, height, left, top };
}
