const express = require('express');
const db = require('../firebase-admin');

const router = express.Router();

// Fetch students by section
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
      return res.json([]);
    }

    const students = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.json(students);
  } catch (error) {
    console.error('Error while fetching students:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
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
router.put('/:id/balances/:balanceId', async (req, res) => {
  try {
    const studentId = req.params.id;
    const balanceId = req.params.balanceId;
    const updatedBalance = req.body;

    // Update the balance in the database
    const student = await Student.findByIdAndUpdate(studentId, {
      $set: { 'balances.$[balance].amount': updatedBalance.amount },
    }, {
      arrayFilters: [{ 'balance._id': balanceId }],
    });

    if (!student) {
      return res.status(404).send({ message: 'Student not found' });
    }

    res.send({ message: 'Balance updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: 'Error updating balance' });
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
    
    // Generate a unique ID for each balance
    const balanceId = `balance_${Date.now()}`;

    // Push the new balance with an ID
    balances.push({ id: balanceId, description, amount, status });

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
      return res.status(400).json({ error: 'Invalid request', message: 'All fields are required' });
    }

    const studentRef = db.collection('students').doc(studentNumber);
    const studentData = {
      studentNumber,
      name,
      grade,
      strand,
      section,
      balances: [],
    };

    await studentRef.set(studentData);

    res.status(201).send('Student added successfully.');
  } catch (error) {
    console.error('Error adding new student:', error);
    res.status(500).json({ error: 'Error adding new student', message: error.message });
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

// Fetch all students globally
router.get('/students', async (req, res) => {
  try {
    const studentsRef = db.collection('students');
    const snapshot = await studentsRef.get();

    if (snapshot.empty) {
      return res.json([]); // Return an empty array if no students found
    }

    const students = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.json(students); // Return all students globally
  } catch (error) {
    console.error('Error while fetching all students:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// Fetch all students globally
router.get('/students', async (req, res) => {
  try {
    const studentsRef = db.collection('students');
    const snapshot = await studentsRef.get();

    if (snapshot.empty) {
      return res.json([]); // Return an empty array if no students found
    }

    const students = [];
    snapshot.forEach((doc) => {
      students.push({ id: doc.id, ...doc.data() });
    });

    res.json(students); // Return all students globally
  } catch (error) {
    console.error('Error while fetching all students:', error.message);
    res.status(500).json({ error: 'Internal Server Error', message: error.message });
  }
});

// DELETE a specific balance for a student
router.delete('/students/:id/balances/:balanceId', async (req, res) => {
  try {
    const { id, balanceId } = req.params;

    const studentRef = db.collection('students').doc(id);
    const doc = await studentRef.get();

    if (!doc.exists) {
      return res.status(404).send('Student not found.');
    }

    let balances = doc.data().balances || [];
    // Remove the balance with the given id
    balances = balances.filter(balance => balance.id !== balanceId);

    await studentRef.update({ balances });

    res.send('Balance deleted successfully.');
  } catch (error) {
    console.error('Error deleting balance:', error);
    res.status(500).send('Error deleting balance: ' + error.message);
  }
});


module.exports = router;
