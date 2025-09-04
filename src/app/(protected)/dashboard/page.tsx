import React from "react";
import { ChartAreaInteractive } from "@/app/(protected)/dashboard/_components/chart-area-interactive";
import { DataTable } from "@/app/(protected)/dashboard/_components/data-table";
import { SectionCards } from "@/app/(protected)/dashboard/_components/section-cards";
import data from "@/app/(protected)/data.json";

const DashboardRoot: React.FC = () => {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <SectionCards />
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>
      <DataTable data={data} />
    </div>
  );
};

export default DashboardRoot;
