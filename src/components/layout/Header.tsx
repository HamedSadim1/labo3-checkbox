import type { FC, ReactNode } from "react";

interface HeaderProps {
  title: string;
  subtitle: string;
  children: ReactNode;
}

const Header: FC<HeaderProps> = ({ title, subtitle, children }) => {
  return (
    <header className="flex items-center justify-between mb-5 animate-fade-in-down">
      <div className="min-w-0">
        <h1
          className="text-2xl md:text-3xl font-bold tracking-tight truncate"
          style={{ color: "var(--color-text)" }}
        >
          {title}
        </h1>
        <p className="text-xs mt-0.5" style={{ color: "var(--color-text-secondary)" }}>
          {subtitle}
        </p>
      </div>

      <div className="flex flex-wrap justify-end items-center gap-1">{children}</div>
    </header>
  );
};

export default Header;
