import { CircleAlert } from "lucide-react";

export default function AuthErrorAILN({
  id,
  message,
}: {
  id: string;
  message: string;
}) {
  if (!message) return null;
  return (
    <div
      id={id}
      role="alert"
      className="flex items-start gap-2 rounded-lg border border-destructive/20 bg-danger-soft p-3 text-sm leading-5 text-destructive"
    >
      <CircleAlert className="mt-0.5 size-4 shrink-0" />
      {message}
    </div>
  );
}
