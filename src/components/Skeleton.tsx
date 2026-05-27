type Props = {
  width?: string | number;
  height?: string | number;
  className?: string;
  rounded?: "sm" | "md" | "lg" | "xl" | "full";
};

const radiusMap: Record<NonNullable<Props["rounded"]>, string> = {
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  full: "rounded-full",
};

export default function Skeleton({
  width = "100%",
  height = 16,
  className = "",
  rounded = "md",
}: Props) {
  return (
    <div
      className={`skeleton ${radiusMap[rounded]} ${className}`}
      style={{ width, height }}
      aria-hidden="true"
    />
  );
}
