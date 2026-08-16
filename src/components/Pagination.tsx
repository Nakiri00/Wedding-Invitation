interface PaginationProps {
  page: number
  totalItems: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  label?: string
}

export function Pagination({ page, totalItems, itemsPerPage, onPageChange, label = 'item' }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalItems / itemsPerPage))
  if (totalItems === 0 || totalPages <= 1) return null

  const safePage = Math.min(page, totalPages)
  const start = (safePage - 1) * itemsPerPage + 1
  const end = Math.min(safePage * itemsPerPage, totalItems)

  return (
    <nav className="pagination" aria-label={`Pagination ${label}`}>
      <span className="pagination-summary">{start}–{end} dari {totalItems}</span>
      <div className="pagination-controls">
        <button
          type="button"
          className="pagination-button pagination-arrow"
          onClick={() => onPageChange(safePage - 1)}
          disabled={safePage <= 1}
          aria-label="Halaman sebelumnya"
        >
          ‹
        </button>
        {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
          <button
            type="button"
            key={pageNumber}
            className={`pagination-button ${pageNumber === safePage ? 'is-active' : ''}`}
            onClick={() => onPageChange(pageNumber)}
            aria-current={pageNumber === safePage ? 'page' : undefined}
          >
            {pageNumber}
          </button>
        ))}
        <button
          type="button"
          className="pagination-button pagination-arrow"
          onClick={() => onPageChange(safePage + 1)}
          disabled={safePage >= totalPages}
          aria-label="Halaman berikutnya"
        >
          ›
        </button>
      </div>
    </nav>
  )
}
