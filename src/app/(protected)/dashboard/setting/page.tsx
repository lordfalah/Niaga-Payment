import React from "react";
import { ProfileDetailsForm } from "./_components/profile-detail-form";
import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";

const DashboardPageSetting = async () => {
  const session = await getServerSession();
  const user = session?.user;

  if (!user) redirect("/");

  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <ProfileDetailsForm user={user} />
    </div>
  );
};

export default DashboardPageSetting;
