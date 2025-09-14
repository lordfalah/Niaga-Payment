import { SearchParams } from "nuqs";
import React from "react";
import DataTableCategory from "./_components/table/data-table-category";
import FormCategory from "./_components/form-category";
import { searchParamsCacheCategory } from "@/lib/search-params/search-category";
import { getCategorysWithFilters } from "@/actions/category";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const DashboardPageCategory: React.FC<PageProps> = async ({ searchParams }) => {
  const search = searchParamsCacheCategory.parse(await searchParams);
  const { data: resutCategorys } = await getCategorysWithFilters(search);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="space-y-2.5 px-4 lg:px-6">
        <FormCategory />
        <DataTableCategory
          data={resutCategorys.data}
          total={resutCategorys.total}
        />
      </div>
    </div>
  );
};

export default DashboardPageCategory;
