import Link from "next/link";

import LunoLogo from "@/components/LunoLogo";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

import { styles } from "./Header.styles";

export default async function Header() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();

  if (data?.claims) {
    return null;
  }

  return (
    <nav className={styles.nav}>
      <LunoLogo />
      <Button asChild variant="outline">
        <Link href="/auth/login">Sign in</Link>
      </Button>
    </nav>
  );
}
