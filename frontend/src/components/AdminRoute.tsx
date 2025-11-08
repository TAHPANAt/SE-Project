// src/components/AdminRoute.tsx

import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUserRole } from '../services/authService';

// 🌟 1. กำหนด ID ของ Admin (ตาม Go Backend)
const ADMIN_ROLE_ID = 1;

const AdminRoute: React.FC = () => {
  const location = useLocation();
  const roleId = getUserRole(); // ดึง Role ID จาก localStorage

  // 2. ตรวจสอบว่า Role ID ตรงกับ Admin หรือไม่
  if (roleId === ADMIN_ROLE_ID) {
    // 3. ถ้าใช่ อนุญาตให้เข้าถึง
    console.log(`[AdminRoute] Access GRANTED (Role: ${roleId}) to: ${location.pathname}`);
    return <Outlet />; 
  }

  // 4. ถ้าไม่ใช่ Admin (แต่ Login แล้ว) ให้ Redirect กลับ
  console.warn(`[AdminRoute] Access DENIED (Role: ${roleId}) to: ${location.pathname}. Redirecting to /dashboard.`);
  // ส่งกลับไปหน้า Dashboard หลัก (หรือหน้า "Unauthorized")
  return <Navigate to="/dashboard" replace state={{ from: location }} />;
};

export default AdminRoute;