// src/pages/authentication/Login/index.tsx (ฉบับแก้ไข)

import React, { useState, type FormEvent } from 'react';
import { signIn, type SignInData } from '../../../services/authService'; 
import { useNavigate } from 'react-router-dom';

// 🌟 1. Import CSS Module สำหรับ Login และ Navbar 🌟
import styles from './LoginPage.module.css'; 
import navStyles from '../../HomePage/HomePage.module.css'; // (ยืม CSS Navbar จาก HomePage)

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const payload: SignInData = { username, password };
      await signIn(payload);
      
      console.log('✅ Login Success! Token saved.');
      navigate('/dashboard', { replace: true }); 
      
    } catch (err: any) {
      console.error('❌ Login Failed!', err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.pageContainer}>
      {/* --- 🌟 2. เพิ่ม Public Navbar (จาก HomePage) --- */}
      <nav className={navStyles.navbar}>
        <div className={navStyles.navbarBrand} onClick={() => navigate('/')}>Campus Exchange</div>
        <div className={navStyles.navbarNav}>
            <a href="#" className={navStyles.navLink}>About</a>
            <a href="#" className={navStyles.navLink}>How It Works</a>
            <button onClick={() => navigate('/register')} className={`${navStyles.navButton} ${navStyles.registerButton}`}>Register</button>
            <button onClick={() => navigate('/login')} className={`${navStyles.navButton} ${navStyles.loginButton}`}>Login</button>
        </div>
      </nav>

      {/* --- 🌟 3. เพิ่ม Wrapper สำหรับจัดกลางฟอร์ม --- */}
      <div className={styles.formContainer}>
        <form onSubmit={handleSubmit} className={styles.authForm}>
          <h2 className={styles.formTitle}>Login</h2>
          <p className={styles.formSubtitle}>Welcome back! Please enter your credentials.</p>

          <div className={styles.formGroup}>
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              disabled={loading}
              autoComplete="username" 
              className={styles.formInput}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password" 
              className={styles.formInput}
            />
          </div>

          {error && <p className={styles.errorMessage}>{error}</p>}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <p className={styles.switchLink}>
            Don't have an account? 
            <span onClick={() => navigate('/register')}> Register here</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;