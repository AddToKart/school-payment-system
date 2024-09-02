// src/routes/students.js
const express = require('express');
const db = require('../firebase-admin');

const router = express.Router();

// Fetch students by section
// Example modification in the students.js
router.get('/students/:grade/:strand/:section', async (req, res) => {
  try {
      const { grade, strand, section } = req.params;
      const studentsRef = db.collection('students');
      const snapshot = await studentsRef
          .where('grade', '==', grade)
          .where('strand', '==', strand)
          .where('section', '==', section)
          .get();

      if (snapshot.empty) {
          return res.json([]); // Return empty array instead of 404
      }

      const students = [];
      snapshot.forEach(doc => {
          students.push({ id: doc.id, ...doc.data() });
      });

      res.json(students);
  } catch (error) {
      console.error('Error while fetching students:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
  }
});


router.get('/test', (req, res) => {
  res.send('Test route is working!');
});

router.post('/api/students', async (req, res) => {
  try {
      const { studentNumber, name, grade, strand, section } = req.body;

      if (!studentNumber || !name || !grade || !strand || !section) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      const studentRef = db.collection('students').doc();
      await studentRef.set({ studentNumber, name, grade, strand, section, createdAt: new Date().toISOString() });

      res.status(201).json({ id: studentRef.id, studentNumber, name, grade, strand, section });
  } catch (error) {
      console.error('Error adding student:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});


// Fetch student balances
router.get('/students/:id/balances', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('Fetching balances for student:', id); // Debugging line

    const studentRef = db.collection('students').doc(id);
    const doc = await studentRef.get();

    if (!doc.exists) {
      console.log('Student not found'); // Debugging line
      return res.status(404).send('Student not found.');
    }

    const balances = doc.data().balances || [];
    const totalBalance = balances
      .filter(balance => balance.status === 'Unpaid')
      .reduce((sum, balance) => sum + balance.amount, 0);

    console.log('Balances fetched:', { balances, totalBalance }); // Debugging line
    res.json({ balances, totalBalance });
  } catch (error) {
    console.error('Error fetching balances:', error); // Debugging line
    res.status(500).send('Error fetching balances: ' + error.message);
  }
});

// Update student balances
router.post('/students/:id/balances', async (req, res) => {
  try {
    const { id } = req.params;
    const { updatedBalances } = req.body;
    console.log('Updating balances for student:', { id, updatedBalances }); // Debugging line

    const studentRef = db.collection('students').doc(id);

    await studentRef.update({
      balances: updatedBalances,
    });

    res.send('Balances updated successfully.');
  } catch (error) {
    console.error('Error updating balances:', error); // Debugging line
    res.status(500).send('Error updating balances: ' + error.message);
  }
});

// Add new balance
router.post('/students/:id/balance', async (req, res) => {
  try {
    const { id } = req.params;
    const { description, amount, status } = req.body;
    console.log('Adding new balance for student:', { id, description, amount, status }); // Debugging line

    const studentRef = db.collection('students').doc(id);
    const doc = await studentRef.get();

    if (!doc.exists) {
      console.log('Student not found'); // Debugging line
      return res.status(404).send('Student not found.');
    }

    const balances = doc.data().balances || [];
    balances.push({ description, amount, status });

    await studentRef.update({ balances });

    res.send('New balance added successfully.');
  } catch (error) {
    console.error('Error adding new balance:', error); // Debugging line
    res.status(500).send('Error adding new balance: ' + error.message);
  }
});

// Add new student
router.post('/students', async (req, res) => {
  try {
      const { studentNumber, name, grade, strand, section } = req.body;

      if (!studentNumber || !name || !grade || !strand || !section) {
          return res.status(400).json({ message: 'All fields are required' });
      }

      console.log('Adding new student:', { studentNumber, name, grade, strand, section });

      const studentRef = db.collection('students').doc(studentNumber);  // Ensure the correct student number is used

      const studentData = {
          studentNumber,
          name,
          grade,
          strand,
          section,
          balances: []
      };

      await studentRef.set(studentData);

      res.status(201).send('Student added successfully.');
  } catch (error) {
      console.error('Error adding new student:', error);
      res.status(500).send('Error adding new student: ' + error.message);
  }
});


router.get('/admins/:id/profile', async (req, res) => {
  try {
    const { id } = req.params;
    const adminRef = db.collection('admins').doc(id);
    const doc = await adminRef.get();

    if (!doc.exists) {
      return res.status(404).send('Admin not found.');
    }

    const profileData = doc.data();
    res.json(profileData);
  } catch (error) {
    res.status(500).send('Error fetching admin profile: ' + error.message);
  }
});

router.put('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedStudent = req.body;

    await db.collection('students').doc(id).update(updatedStudent);

    res.send('Student updated successfully.');
  } catch (error) {
    console.error('Error updating student:', error);
    res.status(500).send('Error updating student: ' + error.message);
  }
});

router.delete('/students/:id', async (req, res) => {
  try {
      const { id } = req.params;
      const studentRef = db.collection('students').doc(id);
      const studentDoc = await studentRef.get();

      if (!studentDoc.exists) {
          return res.status(404).send('Student not found.');
      }

      await studentRef.delete();
      res.status(200).send('Student deleted successfully.');
  } catch (error) {
      console.error('Error deleting student:', error);
      res.status(500).send('Error deleting student: ' + error.message);
  }
});



module.exports = router;
