import { ReactNode } from "react";

type Props = {
  icon?: ReactNode;
  iconGradient?: "blue" | "purple" | "amber" | "green";
  title: string;
  subtitle?: ReactNode;
  actions?: ReactNode;
};

const gradients: Record<NonNullable<Props["iconGradient"]>, string> = {
  blue:   "linear-gradient(135deg, #3B82F6, #6366F1)",
  purple: "linear-gradient(135deg, #6366F1, #A78BFA)",
  amber:  "linear-gradient(135deg, #F59E0B, #FBBF24)",
  green:  "linear-gradient(135deg, #10B981, #34D399)",
};

export default function PageHeader({ icon, iconGradient = "blue", title, subtitle, actions }: Props) {
  return (
    <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
      <div className="flex items-center gap-3 min-w-0">
        {icon && (
          <div
            className="flex items-center justify-center text-white font-bold shrink-0"
            style={{
              width: 44,
              height: 44,
              borderRadius: 10,
              background: gradients[iconGradient],
              fontSize: 18,
            }}
          >
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <div className="text-text-primary font-bold truncate" style={{ fontSize: 20 }}>
            {title}
          </div>
          {subtitle && (
            <div className="text-text-muted mt-0.5" style={{ fontSize: 12 }}>
              {subtitle}
            </div>
          )}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
