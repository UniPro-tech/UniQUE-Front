export interface ListResponse<T> {
  data: T[];
  total_count: number;
  page: number;
}
