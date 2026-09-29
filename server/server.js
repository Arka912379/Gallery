require('dotenv').config();
const fs = require('fs');
const path = require('path');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const ensureAdmin = require('./seedAdmin');

const { MONGO_URI, JWT_SECRET, PORT = 5000, CLIENT_ORIGIN = 'http://localhost:5173' } = process.env;
if (!MONGO_URI || !JWT_SECRET) {
  console.error('MONGO_URI and JWT_SECRET must be set (copy server/.env.example to server/.env)');
  process.exit(1);
}

const app = express();
app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: CLIENT_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(cookieParser());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/photos', require('./routes/photos'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api', (_req, res) => res.status(404).json({ message: 'Not found' }));

// In production the built React app is served by Express too (run `npm run build` first).
const dist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.get('*', (_req, res) => res.sendFile(path.join(dist, 'index.html')));
}

// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 8 MB or smaller' : err.message;
    return res.status(400).json({ message });
  }
  if (err.code === 11000) return res.status(409).json({ message: 'That value is already in use' });
  if (err.name === 'CastError') return res.status(404).json({ message: 'Not found' });
  if (err.name === 'ValidationError') return res.status(400).json({ message: err.message });
  if (err.status) return res.status(err.status).json({ message: err.message });
  console.error(err);
  res.status(500).json({ message: 'Something went wrong on the server' });
});

mongoose
  .connect(MONGO_URI)
  .then(ensureAdmin)
  .then(() => app.listen(PORT, () => console.log(`API running on http://localhost:${PORT}`)))
  .catch((err) => {
    console.error('Failed to start:', err.message);
    process.exit(1);
  });
