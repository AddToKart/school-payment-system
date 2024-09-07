import axios from 'axios';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';

const apiBaseUrl = process.env.API_BASE_URL || 'http://localhost:5000/api';

/* Utility function to handle Axios errors */
const handleAxiosError = (error) => {
  if (error.response) {
    // Server responded with a status other than 2xx
    console.error('Server Error:', error.response.status, error.response.data);
    throw new Error(error.response.data.message || 'Server Error');
  } else if (error.request) {
    // Request was made but no response received
    console.error('No Response:', error.request);
    throw new Error('No response received from server.');
  } else {
    // Something else happened
    console.error('Error:', error.message);
    throw new Error(error.message);
  }
};

/* Fetch admin profile by userId */
export const getAdminProfile = async (userId) => {
  try {
    const userDoc = await getDoc(doc(db, 'admins', userId));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error('Error fetching admin profile:', error);
    throw new Error('Failed to fetch admin profile.');
  }
};

/* Fetch students by section */
export const getStudentsBySection = async (grade, strand, section) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/students/${grade}/${strand}/${section}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return [];
    }
    handleAxiosError(error);
  }
};

/* Fetch student balances */
export const getStudentBalances = async (studentId) => {
  try {
    const response = await axios.get(`${apiBaseUrl}/students/${studentId}/balances`);
    return response.data;
  } catch (error) {
    handleAxiosError(error);
  }
};

/* Update student balance */
export const updateStudentBalance = async (studentId, updatedBalances) => {
  try {
    await axios.post(`${apiBaseUrl}/students/${studentId}/balances`, { updatedBalances });
    return { success: true, message: 'Balances updated successfully.' };
  } catch (error) {
    handleAxiosError(error);
  }
};

/* Add a new balance for a student */
export const addNewBalance = async (studentId, newBalance) => {
  try {
    await axios.post(`${apiBaseUrl}/students/${studentId}/balance`, newBalance);
    return { success: true, message: 'New balance added successfully.' };
  } catch (error) {
    handleAxiosError(error);
  }
};

/* Add a new student */
export const addStudent = async (newStudent) => {
  try {
    // Check if a student with the same Student Number or Name already exists
    const studentsRef = collection(db, "students");
    const q = query(
      studentsRef,
      where("studentNumber", "==", newStudent.studentNumber),
      where("name", "==", newStudent.name)
    );

    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      // If a student with the same Student Number or Name exists, return an error message
      return { success: false, message: "The Student Already Exists" };
    }

    // If the student does not exist, proceed with adding the new student
    const response = await axios.post(`${apiBaseUrl}/students`, newStudent);
    return response.data;
  } catch (error) {
    handleAxiosError(error); // Handle other errors using the centralized function
  }
};

/* Update student details */
export const updateStudentDetails = async (studentId, updatedStudent) => {
  try {
    await axios.put(`${apiBaseUrl}/students/${studentId}`, updatedStudent);
    return { success: true, message: 'Student details updated successfully.' };
  } catch (error) {
    handleAxiosError(error);
  }
};

/* Delete a student */
export const deleteStudent = async (studentId) => {
  try {
    await axios.delete(`${apiBaseUrl}/students/${studentId}`);
    return { success: true, message: 'Student deleted successfully.' };
  } catch (error) {
    handleAxiosError(error);
  }
};
