import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function SectionLabel({ children, className = "" }: Props) {
  return (
    <div
      className={`flex items-center gap-1.5 mb-2 ${className}`}
      style={{
        fontSize: 10,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        color: "var(--primary)",
        fontWeight: 700,
      }}
    >
      {children}
      <span
        className="flex-1 h-px"
        style={{ background: "rgba(59,130,246,0.2)" }}
      />
    </div>
  );
}
