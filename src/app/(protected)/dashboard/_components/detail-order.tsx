"use client";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import React, { Fragment } from "react";
import { IconDotsVertical } from "@tabler/icons-react";
import { Card, CardContent, CardTitle } from "@/components/ui/card";
import { formatToRupiah } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { OrderWithLineItems } from "@/types/order.type";
import { ScrollArea } from "@/components/ui/scroll-area";

const DetailOrder: React.FC<{
  data: OrderWithLineItems;
}> = ({ data }) => {
  return (
    <Drawer>
      {/* Tombol Favorite yang membuka Drawer */}
      <DrawerTrigger asChild>
        <Button
          variant="ghost"
          className="data-[state=open]:bg-muted text-muted-foreground flex size-8"
          size="icon"
        >
          <IconDotsVertical />
          <span className="sr-only">Open menu</span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-1/2">
        <div className="mx-auto h-1/2 w-full max-w-2xl px-4 sm:px-0">
          <DrawerHeader>
            <DrawerTitle>Order Customer : {data.customerName}</DrawerTitle>
            <DrawerDescription>
              Detail Order Product by Customer.
            </DrawerDescription>
          </DrawerHeader>
          <Card className="from-primary/5 to-card dark:bg-card mx-auto h-full w-full bg-gradient-to-t shadow-xs">
            <ScrollArea className="h-full w-full rounded-md">
              <CardContent className="space-y-1.5 px-4 sm:px-6">
                {data.lineItems.map(({ price, product, quantity, id }) => (
                  <Fragment key={id}>
                    <div className="gap grid grid-cols-2 space-y-1">
                      <div className="self-center">
                        <CardTitle className="col-span-1 line-clamp-1 text-base font-medium">
                          {product.name}
                        </CardTitle>
                        <p className="text-muted-foreground line-clamp-1 capitalize sm:text-sm">
                          {product.category ?? "Unknown"}
                        </p>
                      </div>
                      {/* Tampilkan harga asli per unit dan total berdasarkan quantity */}

                      <div className="col-span-1 space-y-1">
                        <p className="text-muted-foreground line-clamp-1 sm:text-sm">
                          {formatToRupiah(price)} each x {quantity}
                        </p>
                        <p className="text-muted-foreground line-clamp-1 sm:text-sm">
                          Total = {formatToRupiah(price * quantity)}
                        </p>
                      </div>
                    </div>
                    <Separator />
                  </Fragment>
                ))}
              </CardContent>
            </ScrollArea>
          </Card>
        </div>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default DetailOrder;
