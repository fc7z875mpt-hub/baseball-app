export function DiamondLogo({ size = 148 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/logo.svg"
      width={size}
      height={size}
      alt="Diamond Youth"
      className="select-none"
      draggable={false}
    />
  );
}
