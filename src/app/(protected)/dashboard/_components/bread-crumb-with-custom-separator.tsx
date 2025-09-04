"use client";

import Link from "next/link";
import { toTitleCase } from "@/lib/utils";
import { Fragment } from "react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UrlObject } from "node:url";

export function BreadcrumbWithCustomSeparator({
  breadCrumbName,
}: {
  breadCrumbName: string[];
}) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadCrumbName.map((name, idx) => {
          // Cek apakah ini item terakhir dari array
          const isLast = idx === breadCrumbName.length - 1;

          // Bangun URL path secara dinamis
          // Contoh: untuk index 0, akan membuat "/dashboard"
          // untuk index 1, akan membuat "/dashboard/product"
          const href = `/${breadCrumbName.slice(0, idx + 1).join("/")}`;

          return (
            <Fragment key={idx}>
              <BreadcrumbItem>
                {/* Render BreadcrumbPage jika ini item terakhir, jika tidak, render BreadcrumbLink */}
                {isLast ? (
                  <BreadcrumbPage>{toTitleCase(name)}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link href={href as unknown as UrlObject}>
                      {toTitleCase(name)}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {/* Render separator hanya jika ini bukan item terakhir */}
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
