"use client";

import Link from "next/link";

/**
 * BREADCRUMB NAVIGATION
 * Design System: Dark mode, CSS variables
 * Shows hierarchical navigation path
 */

// Lucide-style chevron icon
const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>
);

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav>
      <ol className="flex items-center gap-2 text-sm">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={index} className="flex items-center gap-2">
              {item.href && !isLast ? (
                <Link
                  href={item.href}
                  className="transition-colors duration-[80ms]"
                  style={{ color: 'var(--text-tertiary)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = 'var(--primary)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'var(--text-tertiary)';
                  }}
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  className={isLast ? "font-medium" : ""}
                  style={{ color: isLast ? 'var(--text-primary)' : 'var(--text-tertiary)' }}
                >
                  {item.label}
                </span>
              )}

              {!isLast && (
                <span style={{ color: 'var(--text-tertiary)' }}>
                  <ChevronRightIcon />
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
