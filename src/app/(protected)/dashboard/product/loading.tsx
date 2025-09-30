import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const LoadingProduct: React.FC = () => {
  return (
    <DataTableSkeleton
      className="px-4 py-4 md:py-6 lg:px-6"
      columnCount={7}
      about="Product"
      filterCount={2}
    />
  );
};

export default LoadingProduct;
