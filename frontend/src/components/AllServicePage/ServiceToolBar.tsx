import React from "react";
import type { ServicesToolbarProps } from "../../types/service/service.types";
import type { SortOption } from "../../types/service/service.types";

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
          onClick={() => onSearch('')}
          aria-label="Clear search"
        >
          ✕
        </button>
      )}
    </div>

     <div className="d-flex flex-wrap align-items-center justify-content-between gap-3">
       <div className="qw-category-pills d-flex flex-wrap gap-2">
        <button
          className={`qw-pill${category === 'all' ? ' active' : ''}`}
          onClick={() => onCategory('all')}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            className={`qw-pill${category === cat ? ' active' : ''}`}
            onClick={() => onCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="d-flex align-items-center gap-3 ms-auto">
        <span className="qw-result-count">
          {resultCount} result{resultCount !== 1 ? 's' : ''}
        </span>
        <select
          className="qw-sort-select"
          value={sort}
          onChange={(e) => onSort(e.target.value as SortOption)}
          aria-label="Sort services"
        >
          <option value="name-asc">Name A–Z</option>
          <option value="name-desc">Name Z–A</option>
          <option value="newest">Newest first</option>
        </select>
      </div>
    </div>
  </div>
)
export default ServiceToolBar;