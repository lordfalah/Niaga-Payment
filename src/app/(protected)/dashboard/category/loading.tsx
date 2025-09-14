import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const LoadingCategory: React.FC = () => {
  return (
    <DataTableSkeleton
      className="px-4 py-4 md:py-6 lg:px-6"
      columnCount={6}
      about="Category"
    />
  );
};

export default LoadingCategory;
