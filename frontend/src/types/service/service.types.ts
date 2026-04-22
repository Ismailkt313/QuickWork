export type SortOption = "name-asc" | "name-desc" | "newest";

export interface Service {
  _id: string;
  name: string;
  slug: string;
  icon?: string;
}

export interface PopularServicesProps {
  services: Service[];
  loading: boolean;
  error: string | null;
}

export interface ServicesToolbarProps {
  search: string;
  onSearch: (v: string) => void;
  sort: SortOption;
  onSort: (v: SortOption) => void;
  category: string;
  onCategory: (v: string) => void;
  categories: string[];
  resultCount: number;
}
