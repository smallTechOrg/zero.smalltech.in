/* Iconify helper — renders <iconify-icon> web-component */
export default function Icon({
  icon,
  width = 20,
  className = "",
}: {
  icon: string;
  width?: number;
  className?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Elem = "iconify-icon" as any;
  return <Elem icon={icon} width={width} class={className} />;
}
