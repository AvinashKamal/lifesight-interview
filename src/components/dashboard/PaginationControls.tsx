import { Button } from "../ui/Button";

type PaginationControlsProps = {
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  page,
  pageSize,
  totalRows,
  onPageChange,
}: PaginationControlsProps) {
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));

  return (
    <div className="pagination">
      <Button
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      >
        Previous
      </Button>
      <span className="pagination-info">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Next
      </Button>
    </div>
  );
}
