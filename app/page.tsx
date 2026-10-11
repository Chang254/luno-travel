import Header from "@/components/Header";

import { styles } from "./page.styles";

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.content}>
        <Header />
      </div>
    </main>
  );
}
