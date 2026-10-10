import styles from "./PageHead.module.css";

/**
 * Magazine page opener for paper pages: the title set as a giant display line,
 * a one-line standfirst beside it. No eyebrow labels: the title carries itself.
 */
export default function PageHead({ title, standfirst, children }: { title: string; standfirst?: string; children?: React.ReactNode }) {
  return (
    <header className={styles.head}>
      <h1 className={styles.title}>{title}</h1>
      {standfirst && <p className={styles.standfirst}>{standfirst}</p>}
      {children}
    </header>
  );
}
