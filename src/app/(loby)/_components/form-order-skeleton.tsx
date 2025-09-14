import React from "react";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

const OrderFormSkeleton: React.FC = () => {
  return (
    <CardContent className="w-full space-y-5 px-4 sm:px-6">
      <Card className="space-y-4 p-4">
        {/* Skeleton untuk form field "Nama Customer" */}
        <div className="space-y-2">
          <Skeleton className={"w-[120px]"} />
          <Skeleton className="h-10 w-full" />
        </div>
      </Card>

      <Card className="space-y-4 p-4">
        {/* Skeleton untuk "Daftar Item" header dan tombol */}
        <div className="flex items-center justify-between">
          <Skeleton className={"w-[150px]"} />
          <Skeleton className="h-9 w-32" />
        </div>

        {/* Skeleton untuk setiap item form */}
        {[...Array(2)].map((_, index) => (
          <div key={index} className="space-y-3.5 rounded-md border p-3">
            <div className="flex flex-wrap items-center justify-between gap-x-2.5">
              <Skeleton className={"h-5 w-[100px]"} />
              <Skeleton className={"w-[100px]"} />
            </div>

            <div className="grid grid-cols-12 items-end gap-x-3.5">
              <div className="col-span-7 space-y-2">
                <Skeleton className={"w-full"} />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="col-span-3 space-y-2">
                <Skeleton className={"w-[30px]"} />
                <Skeleton className="h-10 w-full" />
              </div>
              <div className="col-span-2 flex justify-end">
                <Skeleton className="h-9 w-9" />
              </div>
            </div>
          </div>
        ))}
      </Card>

      {/* Skeleton untuk total bayar */}
      <div className="bg-accent-foreground/10 dark:bg-muted rounded-lg p-3.5">
        <div className="flex items-center justify-between font-medium">
          <Skeleton className={"w-[120px]"} />
          <Skeleton className={"w-20"} />
        </div>
      </div>

      <CardFooter className="px-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </CardContent>
  );
};

export default OrderFormSkeleton;
