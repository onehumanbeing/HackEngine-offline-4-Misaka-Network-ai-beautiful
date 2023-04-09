import React from 'react';
import styles from './index.module.scss';

export const IconBtn: React.FC<{
  icon: string,
  onClick?: () => void,
  className?: string,
  count?: number,
}> = ({ icon, onClick, className, count }) => {
  return (
    <div className={`${styles.IconBtn} ${className || ''}`} onClick={onClick}>
      <img className={styles.icon} src={icon} alt="icon" />
      {count ? <div className={styles.count}>{count}</div> : null}
    </div>
  );
}