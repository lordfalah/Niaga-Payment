export type ActionResponse<
  TData = unknown,
  TFieldErrors = Record<string, string>,
> =
  | { status: true; message: string; data: TData }
  | { status: false; message: string; errors?: TFieldErrors };
