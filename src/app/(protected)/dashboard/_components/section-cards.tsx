import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTotalOrder, getTotalRevenue } from "@/actions/order";
import { formatToRupiah } from "@/lib/utils";
import { getTotalUser } from "@/actions/user";
import { getTotalProduct } from "@/actions/product";
import { DollarSign, ListOrdered, PackageSearch, UserPlus } from "lucide-react";

export async function SectionCards() {
  const [totalRevenue, totalUser, totalOrder, totalProduct] = await Promise.all(
    [getTotalRevenue(), getTotalUser(), getTotalOrder(), getTotalProduct()],
  );

  const cardData = [
    {
      description: "Total Revenue",
      title: `Rp. ${formatToRupiah(totalRevenue)}`,
      icon: DollarSign,
      footerText: "Total revenue collected",
      footerDescription: "All recorded data",
    },
    {
      description: "Total Users",
      title: totalUser,
      icon: UserPlus,
      footerText: "Total users registered",
      footerDescription: "Acquisition needs attention",
    },
    {
      description: "Total Order",
      title: totalOrder,
      icon: ListOrdered,
      footerText: "Total orders created",
      footerDescription: "All recorded data",
    },
    {
      description: "Total Product",
      title: totalProduct,
      icon: PackageSearch,
      footerText: "Total products available",
      footerDescription: "All recorded data",
    },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cardData.map((card, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>{card.description}</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              {card.title}
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <card.icon />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              {card.footerText}
            </div>
            <div className="text-muted-foreground">
              {card.footerDescription}
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
