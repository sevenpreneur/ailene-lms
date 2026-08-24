import DashboardStudentAILN from "@/components/pages/DashboardStudentAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Student",
};

export default function StudentPage() {
  return <DashboardStudentAILN />;
}
