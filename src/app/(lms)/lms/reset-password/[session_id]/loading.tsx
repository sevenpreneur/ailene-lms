import { Loader2 } from "lucide-react";
import AuthSplitLayoutAILN from "@/components/pages/AuthSplitLayoutAILN";

export default function LoadingResetPassword() {
  return (
    <AuthSplitLayoutAILN>
      <p
        role="status"
        className="flex items-center gap-2 text-sm text-muted-foreground"
      >
        <Loader2 className="size-4 animate-spin" />
        Memeriksa tautan reset...
      </p>
    </AuthSplitLayoutAILN>
  );
}
