import { redirect } from "next/navigation";

export default function ResetPasswordWithoutLink() {
  redirect("/auth/forget-password");
}
