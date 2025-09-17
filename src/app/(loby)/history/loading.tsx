import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const LoadingHistory: React.FC = () => {
  return (
    <section className="container grid min-h-screen items-center justify-items-center gap-16 px-4 pt-28 pb-14 sm:px-6">
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <Skeleton className="mb-2 h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <CardAction className="mt-4 sm:mt-0">
              <Skeleton className="h-10 w-24" />
            </CardAction>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-x-auto p-0">
          <DataTableSkeleton
            className="px-4 py-4 md:py-6 lg:px-6"
            columnCount={7}
            about="History"
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default LoadingHistory;
