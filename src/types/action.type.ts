export type TActionResult<TData> =
  | {
      status: true;
      message: string;
      data: TData;
    }
  | {
      status: false;
      message: string;
      errors: Record<string, string>;
    }
  | {
      status: false;
      message: string;
      errors: null;
    };
