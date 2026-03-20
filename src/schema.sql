CREATE TABLE IF NOT EXISTS applications (
  id SERIAL PRIMARY KEY,
  company VARCHAR(100) NOT NULL,
  position VARCHAR(100) NOT NULL,
  status VARCHAR(50) DEFAULT 'applied' CHECK (status IN ('applied', 'rejected', 'interviewing', 'offer', 'assessment')),
  applied_date DATE DEFAULT CURRENT_DATE,
  location VARCHAR(100),
  notes TEXT
);