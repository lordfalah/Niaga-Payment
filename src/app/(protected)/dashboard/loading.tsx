import React from "react";
import { SectionCardsSkeleton } from "./_components/section-card-skeleton";
import { CalenderAreaInteractiveSkeleton } from "./_components/calendar-area-interactive-skeleton";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const LoadingRootDashboard = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCardsSkeleton />
      <div className="px-4 lg:px-6">
        <CalenderAreaInteractiveSkeleton />
      </div>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="flex items-center justify-between"
            disabled={true}
          >
            <Loader2 className="animate-spin" />
            Please wait
          </Button>
        </div>

        <DataTableSkeleton about="Order" columnCount={8} />
      </div>
    </div>
  );
};

export default LoadingRootDashboard;
