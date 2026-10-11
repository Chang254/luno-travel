"use client";

import { useTransition } from "react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

import { signOut } from "./SignOutButton.actions";
import { styles } from "./SignOutButton.styles";

export default function SignOutButton() {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={styles.button}
      disabled={isPending}
      onClick={() => startTransition(signOut)}
    >
      <LogOut className="size-4" />
      Sign out
    </Button>
  );
}
