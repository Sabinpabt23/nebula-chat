/**
 * AppShell
 *
 * Main application layout — sidebar + content area.
 * Used by ChatPage to provide consistent structure.
 * Does not own any data fetching logic — receives children as props.
 * Mobile: sidebar collapses behind a hamburger toggle with overlay.
 */
import { type ReactNode, useState, useEffect } from "react";

interface AppShellProps {
  sidebar: ReactNode;
  children: ReactNode;
}

export function AppShell({ sidebar, children }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Close sidebar on resize to desktop
  useEffect(() => {
    function onResize() {
      if (window.innerWidth >= 769) setSidebarOpen(false);
    }
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ backgroundColor: "var(--color-bg-base)" }}
    >
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`w-[300px] flex-shrink-0 border-r flex flex-col transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "sidebar-visible" : "sidebar-hidden"}
          md:relative md:translate-x-0 md:flex`}
        style={{
          backgroundColor: "var(--color-bg-surface)",
          borderColor: "var(--color-border)",
        }}
      >
        {/* Close button inside sidebar on mobile */}
        {/* UPDATED: Changed right-3 to right-4 to align with sidebar padding */}
        <button
          className="md:hidden absolute top-4 right-4 z-10 w-7 h-7 flex items-center justify-center rounded-lg transition-colors"
          style={{
            color: "var(--color-text-secondary)",
            backgroundColor: "var(--color-bg-elevated)",
          }}
          onClick={() => setSidebarOpen(false)}
          aria-label="Close sidebar"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M1 1l12 12M13 1L1 13"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
        </button>
        {sidebar}
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile header bar with hamburger */}
        <div
          className="md:hidden flex items-center gap-3 px-4 py-3 border-b flex-shrink-0"
          style={{
            backgroundColor: "var(--color-bg-surface)",
            borderColor: "var(--color-border)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(true)}
            className="w-8 h-8 flex items-center justify-center rounded-lg transition-colors"
            style={{
              backgroundColor: "var(--color-bg-elevated)",
              color: "var(--color-text-secondary)",
            }}
            aria-label="Open sidebar"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <rect
                x="1"
                y="3"
                width="14"
                height="1.5"
                rx="0.75"
                fill="currentColor"
              />
              <rect
                x="1"
                y="7.25"
                width="14"
                height="1.5"
                rx="0.75"
                fill="currentColor"
              />
              <rect
                x="1"
                y="11.5"
                width="14"
                height="1.5"
                rx="0.75"
                fill="currentColor"
              />
            </svg>
          </button>
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--color-text-primary)" }}
          >
            Nebula Chat
          </span>
        </div>

        <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {children}
        </div>
      </main>
    </div>
  );
}
