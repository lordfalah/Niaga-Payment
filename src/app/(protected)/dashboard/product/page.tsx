import { getProductsWithFilters } from "@/actions/product";
import { searchParamsCacheProduct } from "@/lib/search-params/search-product";
import { SearchParams } from "nuqs";
import React, { Suspense } from "react";
import DataTableProduct from "./_components/table/data-table-product";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import PrintTablePdf from "@/components/data-table/print-table-pdf";
import TablePdfProduct from "./_components/table/data-table-product-pdf";
import Link from "next/link";
import { getCategorys } from "@/actions/category";

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const DashboardPageProduct: React.FC<PageProps> = async ({ searchParams }) => {
  const search = searchParamsCacheProduct.parse(await searchParams);
  const [{ data: resultProducts }, { data: resultCategorys }] =
    await Promise.all([getProductsWithFilters(search), getCategorys()]);

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <Suspense
            key={resultProducts.data.length}
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
            <PrintTablePdf
              document={<TablePdfProduct data={resultProducts.data} />}
              fileName="laporan-order.pdf"
              className="flex w-0 pb-2 pl-1"
            />
          </Suspense>

          <Button size={"sm"} variant={"outline"} asChild>
            <Link href={"/dashboard/product/build"}>Create</Link>
          </Button>
        </div>

        <DataTableProduct
          data={resultProducts.data}
          categorys={resultCategorys}
          total={resultProducts.total}
        />
      </div>
    </div>
  );
};

export default DashboardPageProduct;
