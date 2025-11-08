// src/pages/Item/index.tsx

import React, { useState, useEffect } from 'react';
import { getAllItems, type Item } from '../../services/itemService'; 
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../../services/authService'; 

const ItemListPage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const userRole = getUserRole();
  const isAdmin = userRole === 1; // 1 คือ ID ของ Admin

  useEffect(() => {
    console.groupCollapsed('🛒 [ItemListPage] LIFECYCLE: Component Mounted');
    console.log('Status: Starting data fetch process.');
    console.groupEnd();
    
    const fetchItems = async () => {
      try {
        console.log('🔗 [ItemListPage] ACTION: Calling getAllItems API (Authorization required)...');
        const data = await getAllItems();
        console.log('✅ [ItemListPage] SUCCESS: Data fetch successful!');
        setItems(data);
      } catch (err: any) {
        console.error('❌ [ItemListPage] ERROR: Data fetch failed!', err.message);
        setError(err.message);
        if (err.message.includes('authenticated') || err.message.includes('token')) { 
            console.warn('⚠️ [ItemListPage] AUTH FAILURE: Redirecting to /login in 2s.');
            setTimeout(() => navigate('/login'), 2000); 
        }
      } finally {
        console.log('[ItemListPage] LOADING STATUS: Finished.');
        setLoading(false);
      }
    };

    fetchItems();
  }, [navigate]); 

  // --- Functions สำหรับปุ่ม ---
  const handleNavigateDashboard = () => {
      console.log('⬅️ [ItemListPage] NAVIGATE: Back to Dashboard (/dashboard).');
      navigate('/dashboard'); 
  };

  const handleNavigateCreate = () => {
      console.log('➡️ [ItemListPage] NAVIGATE: To Create Item Page (/items/new).');
      navigate('/items/new');
  };
  // ---------------------------

  if (loading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>🛒 รายการสิ่งของแลกเปลี่ยน</h2>
        <p>กำลังโหลดข้อมูล...</p>
      </div>
    );
  }

  if (error) {
     console.error(`🔴 [ItemListPage] RENDERING STATE: Displaying Error: ${error}`);
  } else if (items.length === 0) {
     console.log('🔵 [ItemListPage] RENDERING STATE: Displaying No Items Found.');
  } else {
     console.log(`🟢 [ItemListPage] RENDERING STATE: Displaying list of ${items.length} records.`);
  }


  return (
    <div style={{ padding: '20px' }}>
        
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <button onClick={handleNavigateDashboard}>← กลับสู่ Dashboard</button>
          
          {!isAdmin && (
              <button 
                  onClick={handleNavigateCreate}
                  style={{ backgroundColor: 'green', color: 'white', border: 'none', padding: '10px 15px' }}
              >
                  + ลงทะเบียนสิ่งของใหม่
              </button>
          )}
      </div>
      
      <h2 style={{ marginTop: '20px' }}>
        {isAdmin ? '📦 [Admin] Item Management' : '🛒 รายการสิ่งของแลกเปลี่ยน'} ({items.length} รายการ)
      </h2>
      
      {error && <p style={{ color: 'red', border: '1px solid red', padding: '10px' }}>
        **Error:** {error}
      </p>}

      {items.length === 0 && !error ? (
        <p>ไม่พบสิ่งของในระบบ</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '15px' }}>
          <thead>
            <tr style={{ backgroundColor: '#f2f2f2' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>ID</th>
              {/* 🌟 FIX: แก้ไข "1G" เป็น "1px" 🌟 */}
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ชื่อสิ่งของ</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>คำอธิบาย</th>
              <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>แลกกับ</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.ID}>
                <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>{item.ID}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.title}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.description}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{item.desired_exchange}</td> 
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default ItemListPage;