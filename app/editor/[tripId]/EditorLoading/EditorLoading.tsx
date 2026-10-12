import { Spinner } from "@/components/ui/spinner";

import { styles } from "./EditorLoading.styles";

export default function EditorLoading() {
  return (
    <div className={styles.container}>
      <Spinner className={styles.spinner} />
      <span className={styles.label}>Loading trip…</span>
    </div>
  );
}
