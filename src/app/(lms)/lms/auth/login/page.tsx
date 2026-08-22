import LoginAILN from "@/components/pages/LoginAILN";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

export default function AuthLogin() {
  return <LoginAILN />;
}
