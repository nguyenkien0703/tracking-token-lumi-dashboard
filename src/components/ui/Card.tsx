import { ReactNode } from "react";

type Props = {
  title?: ReactNode;
  titleExtra?: ReactNode;
  children: ReactNode;
  className?: string;
  padded?: boolean;
};

export default function Card({ title, titleExtra, children, className = "", padded = true }: Props) {
  return (
    <div
      className={`bg-surface border border-border-default rounded-[10px] ${padded ? "px-5 py-4" : ""} ${className}`}
    >
      {title && (
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[13px] font-semibold text-text-primary">{title}</span>
          {titleExtra}
        </div>
      )}
      {children}
    </div>
  );
}
