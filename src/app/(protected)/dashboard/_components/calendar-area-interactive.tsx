"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { endOfMonth, format, startOfMonth } from "date-fns";
import { parseAsArrayOf, useQueryStates } from "nuqs";
import z from "zod";
import { parseAsDate } from "@/components/data-table/data-table-date-filter";

const chartConfig = {
  totalOrders: {
    label: "Order",
    color: "var(--color-primary)",
  },
  totalRevenue: {
    label: "Revenue",
    color: "var(--color-primary)",
  },
} satisfies ChartConfig;

export default function CalenderAreaInteractive({
  analytics,
}: {
  analytics: { totalOrders: number; totalRevenue: number; date: string }[];
}) {
  // Ambil tanggal saat ini
  const today = new Date();

  // Hitung tanggal awal dan akhir bulan dari tanggal saat ini
  const startOfThisMonth = startOfMonth(today);
  const endOfThisMonth = endOfMonth(today);

  // Menggunakan parseAsArrayOf dengan z.coerce.number() untuk createdAtAnalytic
  const [range, setRange] = useQueryStates(
    {
      createdAtAnalytic: parseAsArrayOf(z.coerce.number()).withDefault([
        startOfThisMonth.getTime(),
        endOfThisMonth.getTime(),
      ]),
    },
    {
      shallow: false,
    },
  );

  const filteredData = React.useMemo(() => {
    if (!range.createdAtAnalytic || range.createdAtAnalytic.length < 2) {
      return analytics;
    }

    const [from, to] = range.createdAtAnalytic;

    return analytics.filter((item) => {
      const date = new Date(item.date);
      return date.getTime() >= from! && date.getTime() <= to!;
    });
  }, [range, analytics]);

  const totalOrders = filteredData.reduce(
    (acc, cur) => acc + cur.totalOrders,
    0,
  );
  const totalRevenue = filteredData.reduce(
    (acc, cur) => acc + cur.totalRevenue,
    0,
  );

  // Mengonversi timestamps dari URL kembali ke objek Date untuk ditampilkan
  const dateFrom = range.createdAtAnalytic
    ? parseAsDate(range.createdAtAnalytic[0])
    : undefined;
  const dateTo = range.createdAtAnalytic
    ? parseAsDate(range.createdAtAnalytic[1])
    : undefined;
  const isRangeValid = dateFrom && dateTo;

  return (
    <Card className="@container/card w-full">
      <CardHeader className="flex flex-col border-b @md/card:grid">
        <CardTitle>Web Analytics</CardTitle>
        <CardDescription>
          Showing total visitors for this month.
        </CardDescription>
        <CardAction className="mt-2 @md/card:mt-0">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline">
                <CalendarIcon />
                <span className="hidden sm:block">
                  {isRangeValid
                    ? `${format(dateFrom, "PPP")} - ${format(dateTo, "PPP")}`
                    : `Month of ${format(today, "MMMM")}`}
                </span>
                <span className="block sm:hidden">
                  {isRangeValid
                    ? `${dateFrom.toLocaleDateString()} - ${dateTo.toLocaleDateString()}`
                    : `Month of ${format(today, "MMMM")}`}
                </span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto overflow-hidden p-0" align="end">
              <Calendar
                className="w-full"
                mode="range"
                defaultMonth={isRangeValid ? dateFrom : undefined}
                selected={
                  isRangeValid ? { from: dateFrom, to: dateTo } : undefined
                }
                onSelect={(newRange) => {
                  if (newRange?.from && newRange?.to) {
                    setRange({
                      createdAtAnalytic: [
                        newRange.from.getTime(),
                        newRange.to.getTime(),
                      ],
                    });
                  } else {
                    setRange({
                      createdAtAnalytic: newRange?.from?.getTime()
                        ? [newRange.from.getTime()]
                        : null,
                    });
                  }
                }}
                disabled={[
                  {
                    before: startOfThisMonth,
                    after: endOfThisMonth,
                  },
                ]}
                month={today}
                fixedWeeks
                showOutsideDays
              />
            </PopoverContent>
          </Popover>
        </CardAction>
      </CardHeader>
      <CardContent className="px-4">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <BarChart
            accessibilityLayer
            data={filteredData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={20}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  day: "numeric",
                });
              }}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  className="w-[150px]"
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                />
              }
            />
            <Bar
              dataKey="totalOrders"
              fill={`var(--color-totalOrders)`}
              radius={4}
              stackId="a"
            />
            <Bar
              dataKey="totalRevenue"
              fill={`var(--color-totalRevenue)`}
              radius={4}
              stackId="a"
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="border-t">
        <div className="text-sm">
          You had{" "}
          <span className="font-semibold">{totalOrders.toLocaleString()}</span>{" "}
          orders in this period.
        </div>
        <div className="text-sm">
          Total Revenue:{" "}
          <span className="font-semibold">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </span>
        </div>
      </CardFooter>
    </Card>
  );
}
