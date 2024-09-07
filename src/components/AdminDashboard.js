import React, { useState, useEffect } from 'react';
import { getStudentsBySection, getStudentBalances, updateStudentBalance, addNewBalance, addStudent, updateStudentDetails, deleteStudent } from '../services/adminServices';
import { Modal, Button, Form, Navbar, Nav } from 'react-bootstrap';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { getAdminProfile } from '../services/adminServices';
import './AdminDashboard.css';
import schoolLogo from './images/school-logo.png';

const AdminDashboard = ({ onLogout }) => {
  const [authUser, setAuthUser] = useState(null);
  const [profile, setProfile] = useState({ name: '', profilePicture: '' });

  const [grade, setGrade] = useState(localStorage.getItem('selectedGrade') || 'Grade 11');
  const [strand, setStrand] = useState(localStorage.getItem('selectedStrand') || 'STEM');
  const [section, setSection] = useState(localStorage.getItem('selectedSection') || 'Section 1');

  const [students, setStudents] = useState({ unpaid: [], paid: [] });
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [balances, setBalances] = useState([]);
  const [totalBalance, setTotalBalance] = useState(0);
  const [editIndex, setEditIndex] = useState(null);
  const [editAmount, setEditAmount] = useState('');
  const [editStatus, setEditStatus] = useState('');
  const [newBalanceDescription, setNewBalanceDescription] = useState('');
  const [newBalanceAmount, setNewBalanceAmount] = useState('');
  const [isAddingBalance, setIsAddingBalance] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const [studentId, setStudentId] = useState(null);
  const [studentNumber, setStudentNumber] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentGrade, setStudentGrade] = useState('Grade 11');
  const [studentStrand, setStudentStrand] = useState('STEM');
  const [studentSection, setStudentSection] = useState('Section 1');

  const [error, setError] = useState(null); // Add error state for duplicate students

  const strands = ['STEM', 'GAS', 'HUMSS', 'ICT', 'ABM'];
  const sections = ['Section 1', 'Section 2', 'Section 3'];
  const grades = ['Grade 11', 'Grade 12'];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setAuthUser(user);
        loadProfile(user.uid);
      } else {
        setAuthUser(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const loadProfile = async (userId) => {
    try {
      const profileData = await getAdminProfile(userId);
      setProfile(profileData);
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      onLogout();
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  useEffect(() => {
    localStorage.setItem('selectedGrade', grade);
    localStorage.setItem('selectedStrand', strand);
    localStorage.setItem('selectedSection', section);
    fetchStudents(grade, strand, section);
    setSelectedStudent(null); // Clear selected student when navigating
  }, [grade, strand, section]);

  const fetchStudents = async (grade, strand, section) => {
    try {
      const studentList = await getStudentsBySection(grade, strand, section);
      if (studentList.length === 0) {
        console.log(`No students found for ${grade} ${strand} ${section}`);
        setStudents({ unpaid: [], paid: [] });
      } else {
        const unpaidStudents = studentList.filter((student) => {
          const hasUnpaidBalance = student.balances.some((balance) => balance.status === 'Unpaid');
          return hasUnpaidBalance;
        });
        const paidStudents = studentList.filter((student) => !unpaidStudents.includes(student));
        setStudents({ unpaid: unpaidStudents, paid: paidStudents });
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      setStudents({ unpaid: [], paid: [] });
    }
  };

  const handleStudentClick = async (student) => {
    try {
      const { balances, totalBalance } = await getStudentBalances(student.id);
      setSelectedStudent(student);
      setBalances(balances);
      setTotalBalance(totalBalance);
    } catch (error) {
      console.error('Error fetching student details:', error);
    }
  };

  const handleGradeChange = (e) => {
    setGrade(e.target.value);
  };

  const handleStrandChange = (e) => {
    setStrand(e.target.value);
  };

  const handleSectionChange = (e) => {
    setSection(e.target.value);
  };

  const handleEditBalance = (index) => {
    setEditIndex(index);
    setEditAmount(balances[index].amount);
    setEditStatus(balances[index].status);
  };

  const handleSaveBalance = async (index) => {
    const updatedBalances = [...balances];
    updatedBalances[index] = {
      ...updatedBalances[index],
      amount: parseFloat(editAmount),
      status: editStatus
    };

    if (isNaN(updatedBalances[index].amount)) {
      console.error('Invalid balance amount');
      return;
    }

    try {
      await updateStudentBalance(selectedStudent.id, updatedBalances);
      setBalances(updatedBalances);
      setTotalBalance(updatedBalances.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0));
      setEditIndex(null);
      fetchStudents(grade, strand, section);
    } catch (error) {
      console.error('Error saving balance:', error);
    }
  };

  const handleAddNewBalance = async () => {
    const newBalance = {
      description: newBalanceDescription,
      amount: parseFloat(newBalanceAmount),
      status: 'Unpaid'
    };

    if (isNaN(newBalance.amount)) {
      console.error('Invalid balance amount');
      return;
    }

    try {
      await addNewBalance(selectedStudent.id, newBalance);
      const updatedBalances = [...balances, newBalance];
      setBalances(updatedBalances);
      setTotalBalance(updatedBalances.filter(b => b.status === 'Unpaid').reduce((sum, b) => sum + b.amount, 0));
      setNewBalanceDescription('');
      setNewBalanceAmount('');
      setIsAddingBalance(false);
      fetchStudents(grade, strand, section);
    } catch (error) {
      console.error('Error adding new balance:', error);
    }
  };

  const handleAddStudent = async () => {
    const newStudent = {
      studentNumber,
      name: studentName,
      grade: studentGrade,
      strand: studentStrand,
      section: studentSection,
    };

    try {
      if (isEditMode && studentId) {
        // If editing, just update the student details without checking for duplicates
        await updateStudentDetails(studentId, newStudent);
        setShowAddStudentModal(false);
        fetchStudents(grade, strand, section);
        setIsEditMode(false);
      } else {
        // If adding a new student, check for duplicates
        const result = await addStudent(newStudent);

        if (result.success === false) {
          setError(result.message); // Show error if the student already exists
        } else {
          setShowAddStudentModal(false);
          fetchStudents(grade, strand, section);
          setError(null); // Clear any previous error
        }
      }

      setStudentId(null);
      setStudentNumber('');
      setStudentName('');
    } catch (error) {
      console.error('Error adding or updating student:', error);
    }
  };

  const handleEditStudent = (student) => {
    setStudentId(student.id);
    setStudentNumber(student.studentNumber);
    setStudentName(student.name);
    setStudentGrade(student.grade);
    setStudentStrand(student.strand);
    setStudentSection(student.section);
    setIsEditMode(true);
    setShowAddStudentModal(true);
  };

  const openAddStudentModal = () => {
    setStudentGrade(grade); // Sync with selected grade on the main page
    setStudentStrand(strand); // Sync with selected strand on the main page
    setStudentSection(section); // Sync with selected section on the main page
    setStudentNumber('');
    setStudentName('');
    setIsEditMode(false);
    setShowAddStudentModal(true);
  };

  const handleDeleteStudent = async () => {
    try {
      await deleteStudent(studentId);
      setShowAddStudentModal(false);
      setSelectedStudent(null);
      setStudentId(null);
      setStudentNumber('');
      setStudentName('');
      setIsEditMode(false);
      fetchStudents(grade, strand, section);
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const handleRefresh = () => {
    fetchStudents(grade, strand, section);
  };

  return (
    <div className="admin-dashboard-container">
      <Navbar bg="light" expand="lg" className="mb-4">
        <Navbar.Brand href="#home">
         <img src={schoolLogo}  alt="ICP" className="school-logo" />
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
          <Nav>
            <Nav.Link href="#profile">
              <img
                src={profile.profilePicture || 'default-avatar.png'}
                alt="Profile"
                className="profile-picture"
              />
              {profile.name || 'Admin'}
            </Nav.Link>
            <Button variant="outline-danger" onClick={handleLogout} className="logout-button">Logout</Button>
          </Nav>
        </Navbar.Collapse>
      </Navbar>

      <div className="card">
        <div className="card-body">
          <h5 className="card-title">Select Grade, Strand, and Section</h5>
          <div className="section-selector">
            <label>Select Grade: </label>
            <select value={grade} onChange={handleGradeChange} className="form-control">
              {grades.map(gradeOption => (
                <option key={gradeOption} value={gradeOption}>
                  {gradeOption}
                </option>
              ))}
            </select>
          </div>

          <div className="strand-selector">
            <label>Select Strand: </label>
            <select value={strand} onChange={handleStrandChange} className="form-control">
              {strands.map((strandOption) => (
                <option key={strandOption} value={strandOption}>
                  {strandOption}
                </option>
              ))}
            </select>
          </div>

          <div className="section-selector">
            <label>Select Section: </label>
            <select value={section} onChange={handleSectionChange} className="form-control">
              {sections.map((sectionOption) => (
                <option key={sectionOption} value={sectionOption}>
                  {sectionOption}
                </option>
              ))}
            </select>
          </div>
          <Button variant="primary" className="mt-3" onClick={openAddStudentModal}>
            Add New Student
          </Button>
          <Button variant="secondary" className="mt-3 ml-2" onClick={handleRefresh}>
            Refresh
          </Button>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Unpaid Students in {section}, {strand}, {grade}</h5>
          <ul className="list-group">
            {students.unpaid.map(student => (
              <li
                key={student.id}
                className="list-group-item list-group-item-danger"
                onClick={() => handleStudentClick(student)}
              >
                {student.name}
                <button
                  className="btn-edit btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleEditStudent(student); }}
                  style={{ float: 'right', marginLeft: 'auto' }}
                >
                  Edit Student
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="card mt-4">
        <div className="card-body">
          <h5 className="card-title">Paid Students in {section}, {strand}, {grade}</h5>
          <ul className="list-group">
            {students.paid.map(student => (
              <li
                key={student.id}
                className="list-group-item"
                onClick={() => handleStudentClick(student)}
              >
                {student.name}
                <button
                  className="btn-edit btn-sm"
                  onClick={(e) => { e.stopPropagation(); handleEditStudent(student); }}
                  style={{ float: 'right', marginLeft: 'auto' }}
                >
                  Edit Student
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {selectedStudent && (
        <div className="card mt-4">
          <div className="card-body">
            <h5 className="card-title">Details for {selectedStudent.name}</h5>
            <ul className="list-group">
              {balances.map((balance, index) => (
                <li key={index} className="list-group-item">
                  {editIndex === index ? (
                    <div className="form-inline">
                      <input
                        type="number"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        className="form-control mr-2"
                      />
                      <select value={editStatus} onChange={(e) => setEditStatus(e.target.value)} className="form-control mr-2">
                        <option value="Unpaid">Unpaid</option>
                        <option value="Paid">Paid</option>
                      </select>
                      <button onClick={() => handleSaveBalance(index)} className="btn btn-primary">Save</button>
                    </div>
                  ) : (
                    <div className="d-flex justify-content-between">
                      <span>{balance.description}: {balance.amount} - {balance.status}</span>
                      <button onClick={() => handleEditBalance(index)} className="btn btn-outline-primary btn-sm">Edit</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
            <h4 className="mt-3">Total Unpaid Balance: {totalBalance}</h4>

            {isAddingBalance ? (
              <div className="form-inline mt-3">
                <input
                  type="text"
                  value={newBalanceDescription}
                  onChange={(e) => setNewBalanceDescription(e.target.value)}
                  placeholder="Description"
                  className="form-control mr-2"
                />
                <input
                  type="number"
                  value={newBalanceAmount}
                  onChange={(e) => setNewBalanceAmount(e.target.value)}
                  placeholder="Amount"
                  className="form-control mr-2"
                />
                <button onClick={handleAddNewBalance} className="btn btn-success">Add Balance</button>
              </div>
            ) : (
              <button className="btn btn-success mt-3" onClick={() => setIsAddingBalance(true)}>Add New Balance</button>
            )}
          </div>
        </div>
      )}

      {/* Add/Edit Student Modal */}
      <Modal show={showAddStudentModal} onHide={() => setShowAddStudentModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{isEditMode ? 'Edit Student' : 'Add New Student'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group>
              <Form.Label>Student Number</Form.Label>
              <Form.Control
                type="text"
                value={studentNumber}
                onChange={(e) => setStudentNumber(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Student Name</Form.Label>
              <Form.Control
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Grade</Form.Label>
              <Form.Control
                as="select"
                value={studentGrade}
                onChange={(e) => setStudentGrade(e.target.value)}
              >
                {grades.map(gradeOption => (
                  <option key={gradeOption} value={gradeOption}>
                    {gradeOption}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Strand</Form.Label>
              <Form.Control
                as="select"
                value={studentStrand}
                onChange={(e) => setStudentStrand(e.target.value)}
              >
                {strands.map(strandOption => (
                  <option key={strandOption} value={strandOption}>
                    {strandOption}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            <Form.Group>
              <Form.Label>Section</Form.Label>
              <Form.Control
                as="select"
                value={studentSection}
                onChange={(e) => setStudentSection(e.target.value)}
              >
                {sections.map(sectionOption => (
                  <option key={sectionOption} value={sectionOption}>
                    {sectionOption}
                  </option>
                ))}
              </Form.Control>
            </Form.Group>
            {error && <p className="text-danger">{error}</p>} {/* Display error message */}
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddStudentModal(false)}>
            Close
          </Button>
          <Button variant="primary" onClick={handleAddStudent}>
            {isEditMode ? 'Save Changes' : 'Add Student'}
          </Button>
          {isEditMode && (
            <Button variant="danger" onClick={handleDeleteStudent}>
              Delete Student
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminDashboard;
