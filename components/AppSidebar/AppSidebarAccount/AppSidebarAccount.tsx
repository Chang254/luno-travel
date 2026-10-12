import SignOutButton from "@/components/SignOutButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials, type UserProfile } from "@/lib/auth/userProfile";

import { styles } from "./AppSidebarAccount.styles";

type AppSidebarAccountProps = UserProfile;

export default function AppSidebarAccount({ name, avatarUrl }: AppSidebarAccountProps) {
  return (
    <>
      {name && (
        <div className={styles.profile}>
          <Avatar className={styles.avatar}>
            {/* Google avatar URLs can 403 when a referrer is sent. */}
            {avatarUrl && <AvatarImage src={avatarUrl} alt="" referrerPolicy="no-referrer" />}
            <AvatarFallback>{getInitials(name)}</AvatarFallback>
          </Avatar>
          <span className={styles.name}>{name}</span>
        </div>
      )}
      <SignOutButton />
    </>
  );
}
