// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const router = require('../routers/authRouter');

const app = express();

const corsOptions = {
  origin: ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use('/', router);

// connect drizzle and run server
  app.listen(process.env.PORT, () => {
    console.log('Server Connected at port', process.env.PORT);
  });

module.exports = app;
