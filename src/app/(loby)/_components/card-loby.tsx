import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import React from "react";

const CardLoby: React.FC<{
  title: string;
  description: string;
  subTitle: string;
  children: React.ReactNode;
}> = ({ children, title, description, subTitle }) => {
  return (
    <section className="container grid min-h-screen items-center justify-items-center gap-16 px-4 sm:px-6">
      <div className="mt-24 mb-14 w-full max-w-lg space-y-5 sm:mt-24 sm:mb-10">
        <h1
          className={`z-10 cursor-default bg-white bg-linear-to-b from-neutral-950 to-neutral-800 bg-clip-text px-0.5 py-3.5 text-center text-4xl font-bold whitespace-nowrap text-transparent sm:text-5xl dark:from-neutral-50 dark:to-neutral-400`}
        >
          {title}
        </h1>
        <Card className="from-primary/5 to-card dark:bg-card w-full bg-gradient-to-t shadow-xs">
          <CardHeader>
            <CardTitle className="truncate">{subTitle}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>

          {children}
        </Card>
      </div>
    </section>
  );
};

export default CardLoby;
