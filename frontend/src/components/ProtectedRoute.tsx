// src/components/ProtectedRoute.tsx (แก้ไข)

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { isAuthenticated } from '../services/authService';
import AppNavbar from './AppNavbar/index.tsx'; // 🌟 1. Import Navbar ที่แยกออกมา 🌟

const ProtectedRoute: React.FC = () => {
  const location = useLocation();
  const auth = isAuthenticated(); 
  
  console.log(`[ProtectedRoute] Auth Status: ${auth ? 'Authenticated' : 'Unauthenticated'}`);

  if (!auth) {
    console.log('[ProtectedRoute] Access Denied. Redirecting to /login...');
    return <Navigate to="/login" replace state={{ from: location }} />; 
  }

  // 🌟 2. Render Layout ที่มี Navbar 🌟
  return (
    <div>
      <AppNavbar /> 
      {/* 🌟 3. เพิ่ม Padding ด้านบน เพื่อไม่ให้เนื้อหาจมหายไปใต้ Navbar 🌟 */}
      <main style={{ paddingTop: '70px' }}>
        <Outlet /> {/* <-- หน้า Dashboard, ItemList, CreateItem จะถูก Render ตรงนี้ */}
      </main>
    </div>
  );
};

export default ProtectedRoute;