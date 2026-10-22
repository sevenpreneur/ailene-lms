"use client";

import { createContext, useContext, type ReactNode } from "react";

const StudentIdentityContext = createContext<string | null>(null);

export function StudentIdentityProvider({
  userId,
  children,
}: {
  userId: string;
  children: ReactNode;
}) {
  return (
    <StudentIdentityContext.Provider value={userId}>
      {children}
    </StudentIdentityContext.Provider>
  );
}

export function useStudentIdentity() {
  return useContext(StudentIdentityContext);
}
