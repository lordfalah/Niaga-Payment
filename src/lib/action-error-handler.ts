import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";

class ActionErrorHandler {
  static handlePrisma(error: PrismaClientKnownRequestError) {
    switch (error.code) {
      case "P2025":
        return {
          status: false,
          message: error.message || "Record not found",
          errors: {
            code: 404,
            description: "The record with the provided ID was not found.",
          },
        };

      case "P2002":
        const fields = (error.meta?.target as string[]) || [];
        const errorDetails = fields.reduce(
          (acc, field) => {
            acc[field] = `The value for ${field} must be unique.`;
            return acc;
          },
          {} as Record<string, string>,
        );

        return {
          status: false,
          message: `Unique constraint failed on: ${fields.join(", ")}.`,
          errors: errorDetails,
        };

      default:
        return this.handleDefault(error);
    }
  }

  static handleAuth(error: unknown) {
    if (error instanceof Error) {
      return {
        status: false,
        message: error.message || "Authentication failed",
        errors: null,
      };
    }
    return {
      status: false,
      message: "Unknown authentication error",
      errors: null,
    };
  }

  static handleZod(error: ZodError) {
    const errors = error.issues.reduce(
      (acc, issue) => {
        const path = issue.path.at(-1)?.toString() ?? "unknown";
        acc[path] = issue.message;
        return acc;
      },
      {} as Record<string, string>,
    );

    return {
      status: false as const,
      message: "Validation error",
      errors,
    };
  }

  static handleDefault(error: unknown) {
    return {
      status: false,
      message:
        typeof error === "string"
          ? error
          : error instanceof Error
            ? error.message
            : "An unexpected error occurred. Please try again later.",
      errors: {
        code: 500,
        description: "Internal server error.",
      },
    };
  }
}

export default ActionErrorHandler;
