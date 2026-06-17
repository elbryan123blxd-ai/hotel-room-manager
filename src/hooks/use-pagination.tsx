import { useState, useMemo } from 'react';

const DEFAULT_PAGE_SIZE = 9;

export function usePagination<T>(items: T[], pageSize: number = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(0);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));

  const safePage = Math.min(page, totalPages - 1);

  const pageItems = useMemo(() => {
    const start = safePage * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, safePage, pageSize]);

  return {
    page: safePage,
    totalPages,
    pageItems,
    setPage,
    hasNext: safePage < totalPages - 1,
    hasPrev: safePage > 0,
    next: () => setPage((p) => Math.min(p + 1, totalPages - 1)),
    prev: () => setPage((p) => Math.max(p - 1, 0)),
  };
}

export function PaginationControls({
  page, totalPages, hasNext, hasPrev, next, prev, total,
}: {
  page: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
  next: () => void;
  prev: () => void;
  total: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between pt-4">
      <p className="text-xs text-muted-foreground">
        Página {page + 1} de {totalPages} ({total} total)
      </p>
      <div className="flex gap-2">
        <button
          onClick={prev}
          disabled={!hasPrev}
          className="px-3 py-1.5 text-xs rounded-md border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Anterior
        </button>
        <button
          onClick={next}
          disabled={!hasNext}
          className="px-3 py-1.5 text-xs rounded-md border border-border bg-card hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          Siguiente
        </button>
      </div>
    </div>
  );
}
