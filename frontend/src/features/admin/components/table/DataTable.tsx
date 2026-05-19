import type { ReactNode } from "react";
import { AdminPagination } from "./AdminPagination";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  align?: "left" | "center" | "right";
  width?: string;
}

export interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  loading?: boolean;
  emptyMessage?: string;
  emptyIcon?: string;
  page?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  keyExtractor: (item: T) => string;
}

export function DataTable<T>({
  columns,
  data,
  loading = false,
  emptyMessage = "No records found",
  emptyIcon = "bi bi-database",
  page,
  totalPages,
  onPageChange,
  keyExtractor,
}: DataTableProps<T>) {
  return (
    <div className="admin-table-card">
      {loading ? (
        <div className="admin-loading">
          <div className="spinner-border spinner-border-sm"></div>
          <span>Loading...</span>
        </div>
      ) : data && data.length === 0 ? (
        <div className="admin-empty">
          <i className={`${emptyIcon} d-block`}></i>
          <div>{emptyMessage}</div>
        </div>
      ) : (
        <>
          <div className="table-responsive">
            <table className="admin-table">
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      style={{
                        textAlign: col.align || "left",
                        width: col.width,
                      }}
                    >
                      {col.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((item) => (
                  <tr key={keyExtractor(item)}>
                    {columns.map((col) => (
                      <td
                        key={col.key}
                        style={{ textAlign: col.align || "left" }}
                      >
                        {col.render ? col.render(item) : ((item as Record<string, unknown>)[col.key] as ReactNode)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {page !== undefined && totalPages !== undefined && onPageChange && (
            <AdminPagination
              page={page}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </>
      )}
    </div>
  );
}
