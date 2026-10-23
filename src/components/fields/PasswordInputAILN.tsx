"use client";

import { Eye, EyeOff, LockKeyhole } from "lucide-react";
import { useState } from "react";
import InputAILN, { type InputAILNProps } from "./InputAILN";

export default function PasswordInputAILN({
  inputIcon = <LockKeyhole />,
  disabled,
  ...rest
}: Omit<InputAILNProps, "type" | "inputType" | "trailing">) {
  const [visible, setVisible] = useState(false);
  return (
    <InputAILN
      {...rest}
      disabled={disabled}
      inputIcon={inputIcon}
      inputType={visible ? "text" : "password"}
      trailing={
        <button
          type="button"
          disabled={disabled}
          aria-controls={rest.inputId}
          aria-pressed={visible}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          onClick={() => setVisible((current) => !current)}
          className="flex size-10 cursor-pointer items-center justify-center rounded-lg text-muted-foreground transition hover:bg-card-2 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-claude disabled:cursor-not-allowed disabled:opacity-60"
        >
          {visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}
