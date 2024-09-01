// routes/students.js
const express = require('express');
const router = express.Router();
const admin = require('../firebase-admin');

const db = admin.firestore();

// Get all students by section with their total remaining balance
router.get('/students/:section', async (req, res) => {
  const section = req.params.section;
  try {
    const studentsRef = db.collection('students').where('section', '==', section);
    const snapshot = await studentsRef.get();
    if (snapshot.empty) {
      return res.status(404).send('No students found');
    }

    const students = snapshot.docs.map(doc => {
      const studentData = doc.data();
      const totalBalance = studentData.fees
        .filter(fee => fee.status === 'unpaid')
        .reduce((total, fee) => total + fee.amount, 0);

      return {
        id: doc.id,
        ...studentData,
        totalBalance // Add total balance to each student
      };
    });

    res.status(200).json(students);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Add a new fee to a student
router.post('/students/:id/fees', async (req, res) => {
  const studentId = req.params.id;
  const { description, amount } = req.body;

  try {
    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).send('Student not found');
    }

    const studentData = studentDoc.data();
    const newFee = {
      description,
      amount,
      status: 'unpaid'
    };

    const updatedFees = [...studentData.fees, newFee];
    await studentRef.update({ fees: updatedFees });

    res.status(200).send('Fee added successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Update the status of a fee (mark as paid)
router.put('/students/:id/fees/:feeIndex', async (req, res) => {
  const studentId = req.params.id;
  const feeIndex = req.params.feeIndex;

  try {
    const studentRef = db.collection('students').doc(studentId);
    const studentDoc = await studentRef.get();

    if (!studentDoc.exists) {
      return res.status(404).send('Student not found');
    }

    const studentData = studentDoc.data();
    studentData.fees[feeIndex].status = 'paid';

    await studentRef.update({ fees: studentData.fees });

    res.status(200).send('Fee status updated successfully');
  } catch (error) {
    res.status(500).send(error.message);
  }
});

module.exports = router;
