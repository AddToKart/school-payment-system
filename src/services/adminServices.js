import axios from 'axios';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api';

export const getAdminProfile = async (userId: string) => {
  try {
    const userDoc = await getDoc(doc(db, "admins", userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const getStudentsBySection = async (grade: string, strand: string, section: string) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/students/${grade}/${strand}/${section}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      return [];
    } else {
      console.error('Error fetching students:', error);
      throw error;
    }
  }
};

export const getStudentBalances = async (studentId: string) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/students/${studentId}/balances`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student balances:', error);
    throw error;
  }
};

export const updateStudentBalance = async (studentId: string, updatedBalances: any) => {
  try {
    await axios.post(`${apiBaseUrl}/students/${studentId}/balances`, { updatedBalances });
    return true;
  } catch (error) {
    console.error('Error updating student balances:', error);
    throw error;
  }
};

export const addNewBalance = async (studentId: string, newBalance: any) => {
  try {
    await axios.post(`${apiBaseUrl}/students/${studentId}/balance`, newBalance);
    return true;
  } catch (error) {
    console.error('Error adding new balance:', error);
    throw error;
  }
};

export const addStudent = async (newStudent: any) => {
  try {
    const response = await axios.post(`${apiBaseUrl}/students`, newStudent);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

export const updateStudentDetails = async (studentId: string, updatedStudent: any) => {
  try {
    await axios.put(`${apiBaseUrl}/students/${studentId}`, updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (studentId: string) => {
  try {
    await axios.delete(`${apiBaseUrl}/students/${studentId}`);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};