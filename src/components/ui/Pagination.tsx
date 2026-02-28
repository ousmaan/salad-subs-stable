/**
 * Pagination Component
 * Reusable pagination controls
 */

import { cn } from '@/lib/utils/cn';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  showPageNumbers?: boolean;
  maxPageButtons?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  disabled = false,
  showPageNumbers = true,
  maxPageButtons = 5,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const halfButtons = Math.floor(maxPageButtons / 2);

    let startPage = Math.max(1, currentPage - halfButtons);
    let endPage = Math.min(totalPages, currentPage + halfButtons);

    // Adjust if we're near the start or end
    if (currentPage <= halfButtons) {
      endPage = Math.min(totalPages, maxPageButtons);
    }
    if (currentPage >= totalPages - halfButtons) {
      startPage = Math.max(1, totalPages - maxPageButtons + 1);
    }

    // Add first page and ellipsis if needed
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }

    // Add page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    // Add ellipsis and last page if needed
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = showPageNumbers ? getPageNumbers() : [];

  return (
    <nav className="flex items-center justify-center gap-1" aria-label="Pagination">
      {/* Previous Button */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={disabled || currentPage === 1}
        className={cn(
          'px-3 py-2 rounded-lg font-medium transition-colors',
          currentPage === 1 || disabled
            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
            : 'bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
        )}
        aria-label="Previous page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Page Numbers */}
      {showPageNumbers &&
        pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span key={`ellipsis-${index}`} className="px-3 py-2 text-secondary-500">
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              disabled={disabled || isActive}
              className={cn(
                'px-3 py-2 rounded-lg font-medium transition-colors min-w-[40px]',
                isActive
                  ? 'bg-primary-600 text-white cursor-default'
                  : disabled
                  ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
                  : 'bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
              )}
              aria-label={`Page ${pageNum}`}
              aria-current={isActive ? 'page' : undefined}
            >
              {pageNum}
            </button>
          );
        })}

      {/* Next Button */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={disabled || currentPage === totalPages}
        className={cn(
          'px-3 py-2 rounded-lg font-medium transition-colors',
          currentPage === totalPages || disabled
            ? 'bg-secondary-100 text-secondary-400 cursor-not-allowed'
            : 'bg-white border border-secondary-300 text-secondary-700 hover:bg-secondary-50'
        )}
        aria-label="Next page"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}

interface PaginationInfoProps {
  currentPage: number;
  pageSize: number;
  total: number;
  itemName?: string;
}

export function PaginationInfo({
  currentPage,
  pageSize,
  total,
  itemName = 'items',
}: PaginationInfoProps) {
  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, total);

  return (
    <p className="text-sm text-secondary-600">
      Showing {start} to {end} of {total} {itemName}
    </p>
  );
}
