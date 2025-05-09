import React from 'react';
import styles from './ModernNavbar.module.css';
import { FaUserCircle, FaSignOutAlt, FaHome } from 'react-icons/fa';

const ModernNavbar = ({ user, portalLabel, onHome, onLogout, hideLogout }) => {
  return (
    <nav className={styles.navbar}>
      <button className={styles.homeBtn} onClick={onHome} aria-label="Home">
        <FaHome size={20} className={styles.icon} />
        <span className={styles.hideMobile}>Home</span>
      </button>
      <div className={styles.centerContent}>
        {user?.profileImage ? (
          <img src={user.profileImage} alt="Profile" className={styles.avatar} />
        ) : (
          <FaUserCircle size={36} className={styles.avatarIcon} />
        )}
        <span className={styles.userName}>{user?.firstName || ''} {user?.lastName || ''}</span>
        <span className={styles.portalLabel}>{portalLabel}</span>
      </div>
      {!hideLogout && (
        <button className={styles.logoutBtn} onClick={onLogout} aria-label="Logout">
          <FaSignOutAlt size={20} className={styles.icon} />
          <span className={styles.hideMobile}>Logout</span>
        </button>
      )}
    </nav>
  );
};

export default ModernNavbar; 