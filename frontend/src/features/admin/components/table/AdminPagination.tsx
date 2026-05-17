import React from "react";

interface AdminPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const AdminPagination: React.FC<AdminPaginationProps> = ({
  page,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) return null;

  const pages: number[] = [];
  const maxVisible = 3;
  let start = Math.max(1, page - 1);
  const end = Math.min(totalPages, start + maxVisible - 1);
  start = Math.max(1, end - maxVisible + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="admin-table-footer">
      <div className="admin-pagination">
        <button disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          <i className="bi bi-chevron-left" style={{ fontSize: "0.75rem" }}></i>
        </button>
        {pages.map((p) => (
          <button
            key={p}
            className={p === page ? "active" : ""}
            onClick={() => onPageChange(p)}
          >
            {p}
          </button>
        ))}
        <button disabled={page >= totalPages} onClick={() => onPageChange(page + 1)}>
          <i className="bi bi-chevron-right" style={{ fontSize: "0.75rem" }}></i>
        </button>
      </div>
    </div>
  );
};
