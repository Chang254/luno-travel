import SignOutButton from "@/components/SignOutButton";

import { styles } from "./AppSidebar.styles";

interface AppSidebarAccountProps {
  email?: string;
}

export default function AppSidebarAccount({ email }: AppSidebarAccountProps) {
  return (
    <>
      {email && <span className={styles.accountEmail}>{email}</span>}
      <SignOutButton />
    </>
  );
}
