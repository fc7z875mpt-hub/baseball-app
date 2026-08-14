import { LOGO_DATA_URL } from "@/lib/logo-assets";

export function DiamondLogo({ size = 148 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_DATA_URL}
      width={size}
      height={size}
      alt="Diamond Youth"
      className="select-none"
      draggable={false}
    />
  );
}
