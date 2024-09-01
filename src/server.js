const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const studentsRoutes = require('./routes/students');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// Mount routes
app.use('/api', studentsRoutes);


app.get('/', (req, res) => {
  res.send('School Payment System Backend');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
