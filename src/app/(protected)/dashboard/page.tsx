import React, { Suspense } from "react";
import { SectionCards } from "@/app/(protected)/dashboard/_components/section-cards";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import DataTableOrder from "./_components/table/data-table-order";
import { getOrdersWithFilters, getRevenueChartData } from "@/actions/order";
import { SearchParams } from "nuqs";
import {
  searchParamsCacheAnalytic,
  searchParamsCacheOrder,
} from "@/lib/search-params/search-order";
import CalenderAreaInteractive from "./_components/calendar-area-interactive";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const DashboardRoot: React.FC<PageProps> = async ({ searchParams }) => {
  const search = await searchParams;
  const searchOrder = searchParamsCacheOrder.parse(search);
  const searchAnalytic = searchParamsCacheAnalytic.parse(search);
  const [{ data: resultOrders }, { data: resultAnalytics }] = await Promise.all(
    [getOrdersWithFilters(searchOrder), getRevenueChartData(searchAnalytic)],
  );

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <CalenderAreaInteractive analytics={resultAnalytics} />
      </div>
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <Suspense
            key={resultOrders.data.length}
            fallback={
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
            }
          >
            {/* <PrintTablePdflengthr.pdf"
              className="flex w-0 pb-2 pl-1"
            /> */}
          </Suspense>
        </div>

        <DataTableOrder
          orderBy={true}
          data={resultOrders.data}
          total={resultOrders.total}
        />
      </div>
    </div>
  );
};

export default DashboardRoot;
