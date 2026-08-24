"use client";

import ButtonAILN from "@/components/buttons/ButtonAILN";
import { DeleteSession } from "@/lib/actions";
import { LOGIN_URL } from "@/lib/config";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

export default function NoProjectStateAILN() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await DeleteSession();
      router.push(LOGIN_URL);
    } catch {
      toast.error("Gagal logout. Coba lagi.");
      setIsLoggingOut(false);
    }
  };

  return (
    <div className="state-root flex flex-col w-full min-h-screen pt-24 px-6 items-center sm:pt-32 lg:px-0 lg:pt-0 lg:justify-center">
      <div className="state-attributes flex flex-col gap-4 max-w-md text-center items-center">
        <div className="state-text flex flex-col gap-2 items-center">
          <h2 className="state-title flex font-bold text-center tracking-tight text-2xl dark:text-sevenpreneur-white">
            Belum Tergabung ke Project
          </h2>
          <p className="state-description text-center font-medium text-emphasis dark:text-foreground">
            Akun kamu belum terdaftar di project manapun. Hubungi admin atau
            Champion program kamu untuk ditambahkan.
          </p>
        </div>
        <ButtonAILN onClick={handleLogout} disabled={isLoggingOut}>
          <LogOut className="size-4" />
          {isLoggingOut ? "Logging out..." : "Logout"}
        </ButtonAILN>
      </div>
    </div>
  );
}
