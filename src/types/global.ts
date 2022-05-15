export interface ApiResponse<T = void> {
  message: string;
  data?: T;
}
