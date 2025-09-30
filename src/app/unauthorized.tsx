import {
  IllustrationUnauthorized,
  UnauthorizedCmp,
} from "@/components/unauthorized";

export default function NotFound() {
  return (
    <div className="bg-background relative flex min-h-svh w-full flex-col justify-center p-6 md:p-10">
      <div className="relative mx-auto w-full max-w-5xl">
        <IllustrationUnauthorized className="text-foreground absolute inset-0 h-[50vh] w-full opacity-[0.04] dark:opacity-[0.08]" />
        <UnauthorizedCmp />
      </div>
    </div>
  );
}
