// src/App.tsx (ฉบับแก้ไข)

import React, { useEffect } from 'react'; 
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Pages
import LoginPage from './pages/authentication/Login/index.tsx';
import RegisterPage from './pages/authentication/Register/index.tsx';
import DashboardPage from './pages/Dashboard/index.tsx'; 
import ItemListPage from './pages/Item/index.tsx';
import CreateItemPage from './pages/Item/Create.tsx'; 
import HomePage from './pages/HomePage/index.tsx'; 
import ItemDetailPage from './pages/Item/DetailPage.tsx'; // 🌟 1. FIX: Import หน้ารายละเอียด 🌟

// Components
import ProtectedRoute from './components/ProtectedRoute.tsx';
import AdminRoute from './components/AdminRoute.tsx'; 
import { isAuthenticated } from './services/authService'; 

// (Admin Placeholder)
const AdminUserManagement: React.FC = () => (
    <div style={{ padding: '100px 20px' }}>
        <h2>Admin: User Management</h2>
        <p>This page is only visible to users with Role ID 1.</p>
    </div>
);

const App: React.FC = () => {
  
  useEffect(() => {
    console.log('--- 🚀 [App.tsx] Application Root Component Loaded ---');
  }, []);

  const auth = isAuthenticated();

  return (
    <BrowserRouter>
      <div className="App" style={{ fontFamily: 'Arial, sans-serif' }}>
        
        <Routes>
          
          {/* ... (Public Routes: /, /login, /register - คงเดิม) ... */}
          <Route path="/" element={auth ? <Navigate to="/dashboard" replace /> : <HomePage />} /> 
          <Route path="/login" element={auth ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/register" element={auth ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />


          {/* Protected Routes (ต้อง Login ก่อน) */}
          <Route element={<ProtectedRoute />}>
              
              {/* --- 3. Routes สำหรับ User และ Admin (ทุกคนที่ Login) --- */}
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/items" element={<ItemListPage />} />
              <Route path="/items/new" element={<CreateItemPage />} />
              
              {/* 🌟 2. FIX: เพิ่ม Route สำหรับ "/item/:id" ที่นี่ 🌟 */}
              <Route path="/item/:id" element={<ItemDetailPage />} />

              {/* --- 4. Routes สำหรับ Admin เท่านั้น (Role ID 1) --- */}
              <Route element={<AdminRoute />}>
                  <Route path="/admin/users" element={<AdminUserManagement />} />
              </Route>
              
          </Route>

          {/* 404 Not Found */}
          <Route path="*" element={
            <h2 style={{ textAlign: 'center', color: 'gray' }}>404 Page Not Found</h2>
          } />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;