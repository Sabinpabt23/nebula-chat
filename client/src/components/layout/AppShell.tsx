/**
 * AppShell
 *
 * Main application layout — sidebar + content area.
 * Used by ChatPage to provide consistent structure.
 * Does not own any data fetching logic — receives children as props.
 */
import { type ReactNode } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      <aside
        className="w-80 flex-shrink-0 border-r flex flex-col"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          borderColor: "var(--color-border, #2a2a2e)",
        }}
      >
        {sidebar}
      </aside>
      <main className="flex-1 flex flex-col min-w-0">{children}</main>
    </div>
  );
}
