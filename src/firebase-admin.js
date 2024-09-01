const path = require('path');
const admin = require('firebase-admin');

const serviceAccount = require(path.resolve(__dirname, '../firebaseServiceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://school-payment-system-ff3da-default-rtdb.asia-southeast1.firebasedatabase.app/',
});

const db = admin.firestore();

module.exports = db;
