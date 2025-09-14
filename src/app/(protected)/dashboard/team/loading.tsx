import { DataTableSkeleton } from "@/components/data-table/data-table-skeleton";

const LoadingTeam: React.FC = () => {
  return (
    <DataTableSkeleton
      className="px-4 py-4 md:py-6 lg:px-6"
      columnCount={8}
      about="Team"
    />
  );
};

export default LoadingTeam;
