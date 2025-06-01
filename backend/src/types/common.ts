export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ProductQuery extends PaginationQuery {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  bestseller?: boolean;
}
