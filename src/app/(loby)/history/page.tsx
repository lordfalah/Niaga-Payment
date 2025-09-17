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
import { redirect } from "next/navigation";
import { SearchParams } from "nuqs";
import React from "react";

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
    <section className="container min-h-screen px-4 pt-28 pb-14 sm:px-6">
      <Card>
        <CardHeader>
          <CardTitle>Login to your account</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button variant="link">Sign Up</Button>
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
