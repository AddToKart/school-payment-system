import axios from 'axios';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const API_BASE_URL = 'http://localhost:5000/api';

export const getAdminProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, "admins", userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw error;
  }
};

export const getStudentsBySection = async (grade, strand, section) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/${grade}/${strand}/${section}`);
    return response.data;
  } catch (error) {
    if (error.response && error.response.status === 404) {
      // Return an empty array if no students are found
      return [];
    } else {
      console.error('Error fetching students:', error);
      throw error;
    }
  }
};


export const getStudentBalances = async (studentId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/students/${studentId}/balances`);
    return response.data;
  } catch (error) {
    console.error('Error fetching student balances:', error);
    throw error;
  }
};

export const updateStudentBalance = async (studentId, updatedBalances) => {
  try {
    await axios.post(`${API_BASE_URL}/students/${studentId}/balances`, { updatedBalances });
    return true;
  } catch (error) {
    console.error('Error updating student balances:', error);
    throw error;
  }
};

export const addNewBalance = async (studentId, newBalance) => {
  try {
    await axios.post(`${API_BASE_URL}/students/${studentId}/balance`, newBalance);
    return true;
  } catch (error) {
    console.error('Error adding new balance:', error);
    throw error;
  }
};

export const addStudent = async (newStudent) => {
  try {
    const response = await axios.post(`${API_BASE_URL}/students`, newStudent);
    return response.data;
  } catch (error) {
    console.error('Error adding student:', error);
    throw error;
  }
};

export const updateStudentDetails = async (studentId, updatedStudent) => {
  try {
    await axios.put(`${API_BASE_URL}/students/${studentId}`, updatedStudent);
  } catch (error) {
    console.error('Error updating student:', error);
    throw error;
  }
};

export const deleteStudent = async (studentId) => {
  try {
    await axios.delete(`${API_BASE_URL}/students/${studentId}`);
  } catch (error) {
    console.error('Error deleting student:', error);
    throw error;
  }
};
