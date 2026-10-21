import React from "react";
import { NoticesPage } from "../public/NoticesPage";
import { DashboardLayout } from "../../components/layout/DashboardLayout";

export const StudentNotices = () => {
  return (
    <DashboardLayout
      title="College Circulars & Notices"
      subtitle="Official notices, examination hall orders, and holiday schedules targeted for your cohort"
    >
      <NoticesPage />
    </DashboardLayout>
  );
};
