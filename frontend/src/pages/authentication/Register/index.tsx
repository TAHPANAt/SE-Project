// src/pages/authentication/Register/index.tsx (ฉบับแก้ไข)

import React, { useState, type FormEvent } from 'react';
import { signUp, type SignUpData } from '../../../services/authService'; 
import { useNavigate } from 'react-router-dom';

// 🌟 1. Import CSS Module สำหรับ Register และ Navbar 🌟
import styles from './RegisterPage.module.css'; // (ใช้ CSS ของตัวเอง)
import navStyles from '../../HomePage/HomePage.module.css'; // (ยืม CSS Navbar จาก HomePage)

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [firstName, setFirstName] = useState<string>('');
  const [lastName, setLastName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);
    
    if (password !== confirmPassword) {
      setError('รหัสผ่านไม่ตรงกัน');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      setLoading(false);
      return;
    }

    try {
      const payload: SignUpData = { 
          username, password, first_name: firstName, last_name: lastName, phone,
      };
      
      const authResponse = await signUp(payload);
      
      setSuccess(`ลงทะเบียนสำเร็จ! ID: ${authResponse.user_id} กำลังนำทาง...`);
      
      setTimeout(() => {
        navigate('/login'); 
      }, 2000);
      
    } catch (err: any) {
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
          <h2 className={styles.formTitle}>Register</h2>
          <p className={styles.formSubtitle}>Create your account to start exchanging.</p>

          <div className={styles.formGroup}>
            <label>Username:</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required disabled={loading} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label>First Name:</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required disabled={loading} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label>Last Name:</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required disabled={loading} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label>Phone:</label>
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required disabled={loading} className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label>Password:</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required disabled={loading} autoComplete="new-password" className={styles.formInput} />
          </div>
          <div className={styles.formGroup}>
            <label>Confirm Password:</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required disabled={loading} autoComplete="new-password" className={styles.formInput} />
          </div>
          
          {error && <p className={styles.errorMessage}>{error}</p>}
          {success && <p className={styles.successMessage}>{success}</p>}

          <button type="submit" disabled={loading} className={styles.submitButton}>
            {loading ? 'Creating Account...' : 'Register'}
          </button>
          
          <p className={styles.switchLink}>
            Already have an account? 
            <span onClick={() => navigate('/login')}> Login here</span>
          </p>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;