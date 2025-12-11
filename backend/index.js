const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const AuthRouter = require('./Routes/AuthRouter');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Middlewares
app.use(express.json());
app.use(cors({ origin: 'http://localhost:3000', credentials: true }));

// Routes
app.use('/auth', AuthRouter);

app.get('/ping', (req, res) => res.send('PONG'));

// Start server
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
