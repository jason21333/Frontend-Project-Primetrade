const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Passport (OAuth)
const passport = require('passport')
const configurePassport = require('./config/passport')
configurePassport()
app.use(passport.initialize())

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const oauthRoutes = require('./routes/oauth');

app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
// OAuth endpoints (server-side flows)
app.use('/auth', oauthRoutes);

const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error('Failed to connect to MongoDB:', err.message);
    process.exit(1);
  });
