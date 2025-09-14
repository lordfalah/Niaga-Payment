import React from "react";
import { ProfileDetailsFormSkeleton } from "./_components/profile-detail-form-skeleton";

const LoadingDashboardPageSetting = () => {
  return (
    <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:py-6 lg:px-6">
      <ProfileDetailsFormSkeleton />
    </div>
  );
};

export default LoadingDashboardPageSetting;
