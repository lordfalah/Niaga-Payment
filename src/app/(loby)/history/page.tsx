import { getOrdersWithFilters } from "@/actions/order";
import DataTableOrder from "@/app/(protected)/dashboard/_components/table/data-table-order";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TRole } from "@/generated/prisma";
import { getServerSession } from "@/lib/get-session";
import { searchParamsCacheOrder } from "@/lib/search-params/search-order";
import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import React from "react";

export const metadata: Metadata = {
  metadataBase: new URL(`${process.env.NEXT_PUBLIC_APP_URL}`),
  title: "History Order",
  description:
    "Easily view and track all your past orders and transaction history in one secure place.",
};

type PageProps = {
  searchParams: Promise<SearchParams>;
};

const PageHistory: React.FC<PageProps> = async ({ searchParams }) => {
  const [session, search] = await Promise.all([
    getServerSession(),
    searchParams,
  ]);
  if (!session || session.user.role === TRole.USER) redirect("/");

  const searchOrder = searchParamsCacheOrder.parse(search);
  const { data: resultOrders } = await getOrdersWithFilters(
    searchOrder,
    session.user.id,
  );

  return (
    <section className="container px-4 pt-28 pb-14 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Riwayat Pesanan</CardTitle>
          <CardDescription>
            Telusuri pesanan berdasarkan pelanggan, status, atau tanggal
          </CardDescription>
          <CardAction>
            <Button variant="link" asChild>
              <Link href={"/"}>Loby</Link>
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <DataTableOrder
            orderBy={false}
            data={resultOrders.data}
            total={resultOrders.total}
          />
        </CardContent>
      </Card>
    </section>
  );
};

export default PageHistory;
