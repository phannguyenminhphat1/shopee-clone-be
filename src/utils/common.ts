export interface Pagination {
  page: number;
  limit: number;
}

export interface ResponsePagination {
  current_page: number;
  total_items: number;
  total_pages: number;
  limit: number;
}
