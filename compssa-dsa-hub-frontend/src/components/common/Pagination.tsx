import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type PaginationProps = {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
};

function getPages(page: number, pageCount: number, siblingCount: number) {
  const totalNumbers = siblingCount * 2 + 3; // current + siblings + first/last
  const totalBlocks = totalNumbers + 2; // adding two ellipses

  if (pageCount <= totalBlocks) {
    return Array.from({ length: pageCount }, (_, i) => i + 1);
  }

  const startPage = Math.max(2, page - siblingCount);
  const endPage = Math.min(pageCount - 1, page + siblingCount);
  const pages: (number | '…')[] = [1];

  if (startPage > 2) pages.push('…');
  for (let p = startPage; p <= endPage; p++) pages.push(p);
  if (endPage < pageCount - 1) pages.push('…');
  pages.push(pageCount);

  return pages;
}

export function Pagination({ page, pageCount, onPageChange, className, siblingCount = 1 }: PaginationProps) {
  const pages = getPages(page, pageCount, siblingCount);

  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Button
        variant="outline"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        className="px-3"
      >
        Prev
      </Button>

      {pages.map((p, idx) => (
        <Button
          key={`${p}-${idx}`}
          variant={p === page ? 'default' : 'outline'}
          disabled={p === '…'}
          onClick={() => typeof p === 'number' && onPageChange(p)}
          className={cn('px-3', p === '…' && 'pointer-events-none')}
        >
          {p}
        </Button>
      ))}

      <Button
        variant="outline"
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        className="px-3"
      >
        Next
      </Button>
    </div>
  );
}

export default Pagination;
