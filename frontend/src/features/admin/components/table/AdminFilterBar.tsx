import React, { ReactNode } from "react";

interface AdminFilterBarProps {
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (val: string) => void;
  onReset?: () => void;
  children?: ReactNode; // For additional filters like CustomSelect
}

export const AdminFilterBar: React.FC<AdminFilterBarProps> = ({
  searchPlaceholder = "Search...",
  searchValue,
  onSearchChange,
  onReset,
  children,
}) => {
  return (
    <div className="admin-filter-bar">
      {searchValue !== undefined && onSearchChange !== undefined && (
        <>
          <i className="bi bi-search admin-search-icon"></i>
          <input
            type="text"
            className="admin-search-input"
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </>
      )}
      
      {children}

      {onReset && (
        <button
          type="button"
          className="admin-filter-btn"
          onClick={onReset}
        >
          <i className="bi bi-arrow-counterclockwise"></i> Reset
        </button>
      )}
    </div>
  );
};
