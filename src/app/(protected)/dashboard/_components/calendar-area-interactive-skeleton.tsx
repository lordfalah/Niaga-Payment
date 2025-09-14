import * as React from "react";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarIcon } from "lucide-react";

export function CalenderAreaInteractiveSkeleton() {
  return (
    <Card className="@container/card w-full">
      <CardHeader className="flex flex-col border-b @md/card:grid">
        <CardTitle>Web Analytics</CardTitle>
        <CardDescription>
          <Skeleton className="w-[200px]" />
        </CardDescription>
        <CardAction className="mt-2 @md/card:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon className="mr-2 h-4 w-4" />
                <Skeleton className="w-[150px]" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <div className="p-4">
                <Skeleton className="h-[250px] w-[280px]" />
              </div>
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <div className="aspect-auto h-[250px] w-full">
          <Skeleton className="h-full w-full" />
        </div>
      </CardContent>
      <CardFooter className="flex flex-col items-start gap-2 border-t">
        <div className="text-sm">
          <Skeleton className="w-[200px]" />
        </div>
        <div className="text-sm">
          <Skeleton className="w-[150px]" />
        </div>
      </CardFooter>
    </Card>
  );
}
