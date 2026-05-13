import React from "react";
import type { ServicesToolbarProps } from "../../../types/service/service.types";
import type { SortOption } from "../../../types/service/service.types";
import { CustomSelect } from "../../../shared/components/ui/CustomSelect";

const ServiceToolBar: React.FC<ServicesToolbarProps> = ({
  search,
  onSearch,
  sort,
  onSort,
  category,
  onCategory,
  categories,
  resultCount,
}) => (
  <div className="qw-toolbar mb-5">
    <div className="qw-search-wrap mb-4">
      <span className="qw-search-icon">🔍</span>
      <input
        type="search"
        className="qw-search-input"
        placeholder="Search services…"
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        aria-label="Search services"
      />
      {search && (
        <button
          className="qw-search-clear"
          onClick={() => onSearch("")}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>

    <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
      <div className="qw-category-pills d-flex flex-wrap gap-2">
        <button
          className={`qw-pill${category === "all" ? " active" : ""}`}
          onClick={() => onCategory("all")}
        >
          All
        </button>
        {categories.map((cat: string) => (
          <button
            key={cat}
            className={`qw-pill${category === cat ? " active" : ""}`}
            onClick={() => onCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="d-flex align-items-center gap-3 ms-auto">
        <span className="qw-result-count">
          {resultCount} result{resultCount !== 1 ? "s" : ""}
        </span>
        <CustomSelect
          value={sort}
          onChange={(v) => onSort(v as SortOption)}
          options={[
            { value: "name-asc", label: "Name A–Z" },
            { value: "name-desc", label: "Name Z–A" },
            { value: "newest", label: "Newest first" },
          ]}
          size="md"
          label="Sort services"
        />
      </div>
    </div>
  </div>
);
export default ServiceToolBar;
