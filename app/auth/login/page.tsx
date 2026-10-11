import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import GoogleSignInButton from "@/components/GoogleSignInButton";

import { styles } from "./login.styles";

export default function Page() {
  return (
    <div className={styles.page}>
      <div className={styles.formColumn}>
        <div className={styles.formWrapper}>
          <Card>
            <CardHeader>
              <CardTitle className={styles.cardTitle}>
                Welcome to Luno Travel
              </CardTitle>
              <CardDescription>Sign in to continue</CardDescription>
            </CardHeader>
            <CardContent>
              <GoogleSignInButton />
            </CardContent>
          </Card>
        </div>
      </div>
      <div className={styles.imageColumn} />
    </div>
  );
}
