import { LeaveRecord, Staff, User, Role, AccessLog } from '../types';

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxrZk8NKbh4Gu0SwEO9n-T8Y6mYteTxFm85lAEy7JoYTI96wSp3iIIaZmSPqPoY_GamIA/exec';

// --- API Helper ---

const apiRequest = async (action: string, data: any = null) => {
  try {
    const options: RequestInit = {
      method: 'POST',
      mode: 'no-cors', // Important for Google Apps Script Web App
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...data }),
    };

    // For 'GET' like requests that return data, we actually need to use GET method to read response body
    // because 'no-cors' POST returns an opaque response (cant read body).
    
    if (action === 'getData') {
        const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getData`);
        return await response.json();
    } else {
        // For Write operations (Fire & Forget)
        // CRITICAL: We MUST append the action to the URL query string.
        // The Google Apps Script reads `e.parameter.action` to decide what to do.
        // Even though we send data in body, the routing logic often depends on the query param in this setup.
        await fetch(`${GOOGLE_SCRIPT_URL}?action=${action}`, options);
        return { success: true };
    }
  } catch (error) {
    console.error("API Error:", error);
    return { success: false, error };
  }
};

// --- Staff Management ---

export const getStaffList = async (): Promise<Staff[]> => {
  try {
    const data = await apiRequest('getData');
    if (data && data.staff) {
        // Migration/Fix logic for positions if needed
        return data.staff.map((s: Staff) => {
             let pos = s.position;
             // Fix logic applied on read to ensure specific people have correct titles if not set in DB
             if (s.name.includes('ชัชตะวัน') && s.position !== 'ผู้อำนวยการ') pos = 'ผู้อำนวยการ';
             if (s.name.includes('ภราดร') && s.position !== 'รองผู้อำนวยการ') pos = 'รองผู้อำนวยการ';
             return { ...s, position: pos };
        });
    }
    return [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addStaff = async (name: string, position: string): Promise<Staff> => {
  const newStaff = { id: `staff-${Date.now()}`, name, position };
  await apiRequest('saveStaff', newStaff);
  return newStaff;
};

export const removeStaff = async (id: string): Promise<void> => {
  await apiRequest('deleteStaff', { id });
};

// --- Leave Management ---

export const getLeaveRecords = async (): Promise<LeaveRecord[]> => {
  try {
    const data = await apiRequest('getData');
    return data && data.leaves ? data.leaves : [];
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const addLeaveRecord = async (record: Omit<LeaveRecord, 'id' | 'createdAt'>): Promise<LeaveRecord> => {
  const newRecord: LeaveRecord = {
    ...record,
    id: `leave-${Date.now()}`,
    createdAt: new Date().toISOString()
  };
  await apiRequest('saveLeave', newRecord);
  return newRecord;
};

export const updateLeaveRecord = async (updatedRecord: LeaveRecord): Promise<void> => {
  await apiRequest('updateLeave', updatedRecord);
};

export const deleteLeaveRecord = async (id: string): Promise<void> => {
  await apiRequest('deleteLeave', { id });
};

// --- Access Log Management ---

export const getAccessLogs = async (): Promise<AccessLog[]> => {
  try {
    const data = await apiRequest('getData');
    // Sort logs by timestamp descending
    const logs = data && data.logs ? data.logs : [];
    return logs.sort((a: AccessLog, b: AccessLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  } catch (e) {
    console.error(e);
    return [];
  }
};

export const logAccess = async (user: User): Promise<void> => {
  const newLog: AccessLog = {
    id: `log-${Date.now()}`,
    username: user.username,
    fullName: user.fullName,
    role: user.role,
    timestamp: new Date().toISOString()
  };
  await apiRequest('logAccess', newLog);
};

export const clearAccessLogs = async (): Promise<void> => {
    // Not implemented in GAS for safety, or can add a specific action
    // console.warn("Clear logs not implemented in cloud version");
};

// --- Authentication ---

export const authenticate = async (username: string, pass: string): Promise<User | null> => {
  let user: User | null = null;

  if (username === 'admin' && pass === 'admin4444') {
    user = { username: 'admin', role: Role.ADMIN, fullName: 'ผู้ดูแลระบบ' };
  } else {
    // Fetch staff list to verify user
    const staffList = await getStaffList();
    const foundStaff = staffList.find(s => {
      return s.name.includes(username);
    });

    if (foundStaff && pass === 'PJ123') {
       user = { username, role: Role.USER, fullName: foundStaff.name };
    }
  }

  if (user) {
    logAccess(user); // Fire and forget
  }

  return user;
};