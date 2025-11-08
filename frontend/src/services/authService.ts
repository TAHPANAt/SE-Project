// src/services/authService.ts

const API_BASE_URL = 'http://localhost:8000';

// 1. INTERFACES
export interface SignInData {
  username: string; 
  password: string;
}
export interface SignUpData extends SignInData {
  first_name: string;
  last_name: string;
  phone: string;
}

export interface AuthResponse {
  token: string;
  id?: number; // Backend (users.go) ส่ง 'id' กลับมา
  user_id?: number; 
  message: string;
  role_id?: number;
}
// ---------------------- 2. Authentication Functions ----------------------

export const signIn = async (data: SignInData): Promise<AuthResponse> => {
  console.groupCollapsed(`🔗 [AuthService] ACTION: POST /signin for ${data.username}`);
  
  try {
    const body = JSON.stringify(data);
    const response = await fetch(`${API_BASE_URL}/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });
    const responseData = await response.json();
    
    if (!response.ok) {
      console.error('2. Status:', response.status);
      console.error('3. Response Data:', responseData);
      console.groupEnd();
      throw new Error(responseData.error || 'Sign In failed');
    }

    // Login สำเร็จ
    localStorage.setItem('authToken', responseData.token);
    localStorage.setItem('username', data.username); 

    // บันทึก User ID และ Role ID
    const userId = responseData.id || responseData.user_id;
    if (userId) {
        localStorage.setItem('user_id', userId.toString());
        console.log(`[AuthService] User ID ${userId} saved.`);
    }
    if (responseData.role_id) {
        localStorage.setItem('role_id', responseData.role_id.toString());
        console.log(`[AuthService] Role ID ${responseData.role_id} saved.`);
    }

    console.groupEnd();
    return responseData as AuthResponse;

  } catch (error) {
    console.error('⚠️ 5. FETCH ERROR:', error);
    console.groupEnd();
    throw error;
  }
};

export const signUp = async (data: SignUpData): Promise<AuthResponse> => {
  console.groupCollapsed(`🔗 [AuthService] ACTION: POST /signup for ${data.username}`);
  
  try {
    const body = JSON.stringify(data);
    const response = await fetch(`${API_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: body,
    });
    const responseData = await response.json();

    if (!response.ok) {
      console.error('2. Status:', response.status);
      console.error('3. Response Data:', responseData);
      console.groupEnd();
      throw new Error(responseData.error || 'Sign Up failed');
    }

    // บันทึก Token, Username, UserID, และ Role ID
    if (responseData.token && responseData.token.length > 100) {
        localStorage.setItem('authToken', responseData.token);
        localStorage.setItem('username', data.username);
        
        const userId = responseData.id || responseData.user_id;
        if (userId) {
            localStorage.setItem('user_id', userId.toString());
        }
        if (responseData.role_id) {
            localStorage.setItem('role_id', responseData.role_id.toString());
        }
    } else {
        console.warn('⚠️ [AuthService] SignUp returned an invalid or missing token.');
    }
    
    console.groupEnd();
    return responseData as AuthResponse;
    
  } catch (error) {
    console.error('⚠️ 5. FETCH ERROR:', error);
    console.groupEnd();
    throw error;
  }
};

// ---------------------- 3. Utility Functions ----------------------

export const getAuthToken = (): string | null => {
  const token = localStorage.getItem('authToken');
  
  if (token && token.length < 100) { 
      console.warn(`⚠️ [AuthService: Utility] Corrupted token detected. Clearing session.`);
      localStorage.removeItem('authToken'); 
      localStorage.removeItem('username');
      localStorage.removeItem('role_id'); 
      localStorage.removeItem('user_id'); 
      return null;
  }
  return token;
};

export const getCurrentUserId = (): number | null => {
    const userId = localStorage.getItem('user_id');
    if (!userId) {
        return null;
    }
    return parseInt(userId, 10);
};

export const getUserRole = (): number | null => {
    const roleId = localStorage.getItem('role_id');
    if (!roleId) {
        return null;
    }
    return parseInt(roleId, 10); 
};

export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

export const logout = (): void => {
  console.log('🚪 [AuthService] Clearing all session data.');
  localStorage.removeItem('authToken');
  localStorage.removeItem('username'); 
  localStorage.removeItem('role_id');
  localStorage.removeItem('user_id'); 
};