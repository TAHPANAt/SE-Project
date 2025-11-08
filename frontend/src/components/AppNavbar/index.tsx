// src/components/AppNavbar/index.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { logout } from '../../services/authService'; 
import styles from './AppNavbar.module.css'; 

const AppNavbar: React.FC = () => {
    const navigate = useNavigate();
    const [userName, setUserName] = useState<string>('User'); 
    
    // 🌟 1. เพิ่ม State สำหรับ Dropdown
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    useEffect(() => {
        const storedUsername = localStorage.getItem('username');
        if (storedUsername) {
            setUserName(storedUsername); 
        }
    }, []);

    const handleLogout = () => {
        console.log('[AppNavbar] Logging out...');
        logout(); 
        navigate('/', { replace: true }); 
    };

    // 🌟 2. ฟังก์ชันสำหรับเปิด/ปิด Dropdown
    const toggleDropdown = () => {
        setIsDropdownOpen(prev => !prev); // สลับค่า true/false
    };

    // ฟังก์ชันสำหรับปิด Dropdown เมื่อคลิกที่เมนู
    const handleMenuClick = (path: string) => {
        setIsDropdownOpen(false);
        navigate(path);
    };

    return (
        <nav className={styles.dashboardNavbar}>
            <div className={styles.wrapper}> 
                <div className={styles.dashboardBrand} onClick={() => navigate('/dashboard')}>
                    Campus Exchange
                </div>
                
                {/* 🌟 3. เปลี่ยนจากปุ่ม Logout เป็น Profile Menu 🌟 */}
                <div className={styles.profileContainer}>
                    <button onClick={toggleDropdown} className={styles.profileButton}>
                        <span>Hello, {userName}!</span>
                        <span className={styles.arrowIcon}>▼</span>
                    </button>

                    {/* 🌟 4. เมนู Dropdown ที่จะแสดง/ซ่อน 🌟 */}
                    {isDropdownOpen && (
                        <div className={styles.dropdownMenu}>
                            <div 
                                className={styles.dropdownItem} 
                                onClick={() => handleMenuClick('/profile')} // (เราจะสร้างหน้านี้ในขั้นตอนที่ 3)
                            >
                                👤 My Profile
                            </div>
                            <div 
                                className={styles.dropdownItem} 
                                onClick={() => handleMenuClick('/items')}
                            >
                                📦 My Items
                            </div>
                            <div className={styles.dropdownSeparator}></div>
                            <div 
                                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                                onClick={handleLogout} // เรียกใช้ handleLogout
                            >
                                🚪 Logout
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default AppNavbar;