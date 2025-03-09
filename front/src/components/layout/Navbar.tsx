import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';
import styles from './Navbar.module.css';

const Navbar: React.FC = () => {
    const { user, logout } = useAuth();

    return (
        <nav className={styles.navbar}>
            <div className={styles.container}>
                <Link href="/" className={styles.logo}>
                    Личная библиотека
                </Link>

                <div className={styles.navLinks}>
                    {user ? (
                        <>
                            <button
                                onClick={logout}
                                className={styles.navLink}
                            >
                                Выход
                            </button>
                            <span className={styles.welcomeText}>
                                {user.username}
                            </span>
                        </>
                    ) : (
                        <>
                            <Link href="/login" className={styles.navLink}>
                                Войти
                            </Link>
                            <Link href="/register" className={styles.navLink}>
                                Регистрация
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 