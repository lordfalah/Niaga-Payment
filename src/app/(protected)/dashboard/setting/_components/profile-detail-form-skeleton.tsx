import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function ProfileDetailsFormSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <Skeleton className={"w-[150px]"} />
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {/* Skeleton untuk form field "Name" */}
          <div className="space-y-2">
            <Skeleton className={"w-20"} />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Skeleton untuk form field "Profile Image" */}
          <div className="space-y-2">
            <Skeleton className={"w-[120px]"} />
            <Skeleton className="h-10 w-full" />
          </div>

          {/* Skeleton untuk avatar placeholder */}
          <div className="relative size-16">
            <Skeleton className="size-16 rounded-full" />
          </div>

          {/* Skeleton untuk tombol "Save changes" */}
          <Skeleton className="h-10 w-full" />
        </div>
      </CardContent>
    </Card>
  );
}
