// src/pages/HomePage/index.tsx

import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './HomePage.module.css'; 

const HomePage: React.FC = () => {
    const navigate = useNavigate();

    const handleRegisterClick = () => {
        navigate('/register');
    };

    const handleLoginClick = () => {
        navigate('/login');
    };

    return (
        <div className={styles.container}>
            {/* --- 1. Navbar --- */}
            <nav className={styles.navbar}>
                {/* 🌟 ใช้ .wrapper เพื่อจัดกลางเนื้อหา Navbar 🌟 */}
                <div className={styles.wrapper} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 0 }}>
                    <div className={styles.navbarBrand}>Campus Exchange</div>
                    <div className={styles.navbarNav}>
                        <a href="#" className={styles.navLink}>About</a>
                        <a href="#" className={styles.navLink}>How It Works</a>
                        <a href="#" className={styles.navLink}>Contact</a>
                        <button onClick={handleRegisterClick} className={`${styles.navButton} ${styles.registerButton}`}>Register</button>
                        <button onClick={handleLoginClick} className={`${styles.navButton} ${styles.loginButton}`}>Login</button>
                    </div>
                </div>
            </nav>

            {/* --- 2. Hero Section (เต็มจอ ไม่ต้องใช้ wrapper) --- */}
            <header className={styles.heroSection}>
                <div className={styles.heroOverlay}>
                    <h1 className={styles.heroTitle}>Welcome to Campus Exchange</h1>
                    <p className={styles.heroSubtitle}>Your go-to platform for buying, selling, and exchanging items within the university community.</p>
                    <div className={styles.heroActions}>
                        <button onClick={handleRegisterClick} className={`${styles.heroButton} ${styles.heroRegisterButton}`}>Register</button>
                        <button onClick={handleLoginClick} className={`${styles.heroButton} ${styles.heroLoginButton}`}>Login</button>
                    </div>
                </div>
            </header>

            {/* --- 3. Feature Section --- */}
            <section className={styles.featuresSection}>
                {/* 🌟 ใช้ .wrapper เพื่อจัดกลางเนื้อหา 🌟 */}
                <div className={styles.wrapper}> 
                    <h2 className={styles.featuresTitle}>Why Choose Campus Exchange?</h2>
                    <p className={styles.featuresSubtitle}>Discover the benefits of using our platform for your buying and selling needs.</p>
                    <div className={styles.featureCardsContainer}>
                        {/* (Card content) */}
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🔍</div>
                            <h3 className={styles.featureCardTitle}>Easy To Search</h3>
                            <p className={styles.featureCardText}>Quickly find what you need with our intuitive search and filtering options.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>🛡️</div>
                            <h3 className={styles.featureCardTitle}>Safe Transactions</h3>
                            <p className={styles.featureCardText}>Our platform ensures secure transactions and protects your personal information.</p>
                        </div>
                        <div className={styles.featureCard}>
                            <div className={styles.featureIcon}>💸</div>
                            <h3 className={styles.featureCardTitle}>Save Money</h3>
                            <p className={styles.featureCardText}>Get the best deals on items from fellow students, saving you money.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* --- 4. Call to Action (CTA) Section --- */}
            <section className={styles.ctaSection}>
                {/* 🌟 ใช้ .wrapper เพื่อจัดกลางเนื้อหา 🌟 */}
                <div className={styles.wrapper}>
                    <h2 className={styles.ctaTitle}>Ready to Join?</h2>
                    <p className={styles.ctaSubtitle}>Sign up now and start exploring the Campus Exchange community.</p>
                    <button onClick={handleRegisterClick} className={`${styles.heroButton} ${styles.ctaButton}`}>Get Started</button>
                </div>
            </section>
        </div>
    );
};

export default HomePage;