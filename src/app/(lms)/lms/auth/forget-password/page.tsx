import type { Metadata } from "next";
import ForgetPasswordAILN from "@/components/pages/ForgetPasswordAILN";

export const metadata: Metadata = {
  title: "Lupa Password",
  robots: { index: false, follow: false },
};

export default function ForgetPasswordPage() {
  return <ForgetPasswordAILN />;
}
