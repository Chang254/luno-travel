import { Spinner } from "@/components/ui/spinner";

import { styles } from "./TripLoading.styles";

export default function TripLoading() {
  return (
    <div className={styles.container}>
      <Spinner className={styles.spinner} />
      <span className={styles.label}>Loading trip…</span>
    </div>
  );
}
