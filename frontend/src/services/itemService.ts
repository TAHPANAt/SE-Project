// src/services/itemService.ts

import { getAuthToken } from './authService'; 

const API_BASE_URL = 'http://localhost:8000';

// =================================================================
// 1. INTERFACES (Types)
// =================================================================

export interface ItemImage {
  ID: number;
  image: string; // 🌟 FIX: ตรงกับ Go Entity (json:"image")
}
export interface Category {
    ID: number;
    name: string; 
}
export interface Condition {
    ID: number;
    condition_name: string; 
}
export interface ItemStatus {
    ID: number;
    status_name: string;
}
export interface User { 
    ID: number;
    username: string;
    Role?: {
        ID: number;
        role_name: string;
    }
}

// 🌟 FIX: Interface 'Item' (ใช้ Key ตัวพิมพ์เล็ก)
export interface Item {
  ID: number;
  title: string;
  description: string;
  desired_exchange: string;
  meetup_location: string;
  meetup_availability: string;
  user_id: number;
  condition_id: number;
  category_id: number;
  status_id: number;
  user: User;
  category: Category;
  condition: Condition;
  status: ItemStatus;
  images: ItemImage[];
}

// Payload สำหรับการสร้าง Item ใหม่
export interface ItemCreationPayload {
  title: string;
  description: string;
  condition_id: number;
  category_id: number;
  meetup_location: string;
  desired_exchange: string;
  meetup_availability: string;
  
  // 🌟 FIX: เปลี่ยน image_urls เป็น image (ให้ตรงกับ Go Payload) 🌟
  image: string[]; 
}


// =================================================================
// 2. FETCH ITEM DATA (ต้องการ Token)
// =================================================================
export const getAllItems = async (): Promise<Item[]> => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('User not authenticated. No token found.'); 
  }
  const response = await fetch(`${API_BASE_URL}/items/all`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`, 
    },
  });
  const responseData = await response.json();
  if (!response.ok) {
    throw new Error(responseData.message || 'Failed to fetch items.');
  }
  return responseData as Item[]; 
};

// =================================================================
// 3. CREATE ITEM (ต้องการ Token)
// =================================================================
export const createItem = async (data: ItemCreationPayload): Promise<any> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('User not authenticated. Please log in.');
    }
    const response = await fetch(`${API_BASE_URL}/item`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
    });
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.error || responseData.message || 'Failed to create item.');
    }
    return responseData;
};

// =================================================================
// 4. MASTER DATA LOOKUP
// =================================================================
export const getLookupData = async (endpoint: string): Promise<any[]> => {
    const response = await fetch(`${API_BASE_URL}/${endpoint}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
        throw new Error(`Failed to fetch ${endpoint} data.`);
    }
    return await response.json();
};

// =================================================================
// 5. FETCH SINGLE ITEM (GET /item/:id)
// =================================================================
export const getSingleItem = async (id: string): Promise<Item> => {
    const token = getAuthToken(); 
    const response = await fetch(`${API_BASE_URL}/item/${id}`, {
        method: 'GET',
        headers: {
             'Content-Type': 'application/json',
             ...(token && { 'Authorization': `Bearer ${token}` })
        },
    });
    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(`Failed to fetch item ${id}.`);
    }
    return responseData as Item; 
};

// =================================================================
// 🌟 6. UPLOAD FILE (POST /upload) 🌟
// =================================================================
export interface UploadResponse {
    url: string; // Backend ต้องตอบกลับด้วย URL ของไฟล์
}

export const uploadFile = async (file: File): Promise<UploadResponse> => {
    const token = getAuthToken();
    if (!token) {
        throw new Error('User not authenticated. Please log in.');
    }
    
    const formData = new FormData();
    formData.append('file', file); // 'file' คือ key ที่ Backend (Go) จะต้องอ่าน

    const response = await fetch(`${API_BASE_URL}/upload`, { 
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
        },
        body: formData,
    });

    const responseData = await response.json();
    if (!response.ok) {
        throw new Error(responseData.error || 'File upload failed');
    }
    return responseData as UploadResponse;
};