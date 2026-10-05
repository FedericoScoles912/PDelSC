import React from 'react';

/**
 * Componente atómico Card para layouts responsivos optimizados para 1920x1080 y móviles
 */
export default function Card({ children, className = '', title, subtitle, footer }) {
  return (
    <div
      className={`bg-white dark:bg-autumn-darkbg-card border border-autumn-beige-200 dark:border-autumn-darkbg-border rounded-2xl shadow-autumn dark:shadow-autumn-dark overflow-hidden transition-all duration-200 ${className}`}
    >
      {(title || subtitle) && (
        <div className="px-6 py-5 sm:px-8 border-b border-autumn-beige-100 dark:border-autumn-darkbg-border/60">
          {title && (
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-autumn-warmbrown dark:text-autumn-darktext-primary">
              {title}
            </h3>
          )}
          {subtitle && (
            <p className="mt-1 text-sm text-autumn-warmbrown-light dark:text-autumn-darktext-muted">
              {subtitle}
            </p>
          )}
        </div>
      )}

      <div className="p-6 sm:p-8">{children}</div>

      {footer && (
        <div className="px-6 py-4 sm:px-8 bg-autumn-beige-50/70 dark:bg-autumn-darkbg/40 border-t border-autumn-beige-100 dark:border-autumn-darkbg-border/60">
          {footer}
        </div>
      )}
    </div>
  );
}
