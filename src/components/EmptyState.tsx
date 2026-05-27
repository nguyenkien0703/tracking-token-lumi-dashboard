import { ReactNode } from "react";

type Props = {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export default function EmptyState({ icon, title, description, action, className = "" }: Props) {
  return (
    <div
      className={`flex flex-col items-center justify-center text-center px-6 py-12 bg-surface border border-border-default rounded-xl ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-surface-2 flex items-center justify-center text-text-secondary mb-3">
        {icon}
      </div>
      <p className="text-text-primary text-sm font-medium">{title}</p>
      {description && (
        <p className="text-text-secondary text-xs mt-1 max-w-sm">{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
