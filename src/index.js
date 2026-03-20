const express = require('express');
const pool = require('./db');
require('dotenv').config();

const app = express();
app.use(express.json());

// Create Table
const initDB = async (retries = 5) => {
  while (retries > 0) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS applications (
          id SERIAL PRIMARY KEY,
          company VARCHAR(100) NOT NULL,
          position VARCHAR(100) NOT NULL,
          status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'rejected', 'interviewing', 'offer', 'assessment')),
          applied_date DATE DEFAULT CURRENT_DATE,
          location VARCHAR(100),
          notes TEXT
        )
      `);
      console.log('DB connected!');
      return;
    } catch (err) {
      retries--;
      console.log(`DB connection failed. Retrying... (${retries} left)`);
      await new Promise(res => setTimeout(res, 3000));
    }
  }
  throw new Error('Could not connect to DB');
};

// GET - list of applications
app.get('/applications', async (req, res) => {
  const result = await pool.query('SELECT * FROM applications ORDER BY applied_date DESC');
  res.json(result.rows);
});

// POST - Create new application
app.post('/applications', async (req, res) => {
  const { company, position, status, location, notes } = req.body;
  const result = await pool.query(
    'INSERT INTO applications (company, position, status, location, notes) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [company, position, status, location, notes]
  );
  res.status(201).json(result.rows[0]);
});

// PUT - Update application
app.put('/applications/:id', async (req, res) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const result = await pool.query(
    'UPDATE applications SET status = $1, notes = $2 WHERE id = $3 RETURNING *',
    [status, notes, id]
  );
  res.json(result.rows[0]);
});

// DELETE 
app.delete('/applications/:id', async (req, res) => {
  const { id } = req.params;
  await pool.query('DELETE FROM applications WHERE id = $1', [id]);
  res.json({ message: 'Deleted successfully' });
});

app.get('/', (req, res) => {
  res.json({ message: 'Job Tracker API is running!' });
});

const PORT = process.env.PORT || 3000;
initDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
});