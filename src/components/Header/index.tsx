import Link from 'next/link';
import styles from './header.module.scss';
import commonStyle from '../../styles/common.module.scss';

export default function Header() {
  return (
    <div className={styles.container}>
      <Link href="/">
        <img
          src="/logo-desafio.svg"
          alt="logo"
          className={commonStyle.container}
        />
      </Link>
    </div>
  );
}
