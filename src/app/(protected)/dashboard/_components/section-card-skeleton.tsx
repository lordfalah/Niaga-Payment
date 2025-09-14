import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";
import { Skeleton } from "@/components/ui/skeleton";

export function SectionCardsSkeleton() {
  const cards = [
    { title: "Total Revenue", trending: true },
    { title: "Total Users", trending: false },
    { title: "Total Order", trending: true },
    { title: "Total Product", trending: true },
  ];

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, index) => (
        <Card key={index} className="@container/card">
          <CardHeader>
            <CardDescription>
              <Skeleton className="w-full" />
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
              <Skeleton className="h-[30px] w-[150px]" />
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                {card.trending ? <IconTrendingUp /> : <IconTrendingDown />}
                <Skeleton className="h-10" />
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="line-clamp-1 flex gap-2 font-medium">
              <Skeleton className="w-[150px]" />
            </div>
            <div className="text-muted-foreground">
              <Skeleton className="w-[120px]" />
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}
