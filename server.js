// File: backend/server.js
require('dotenv').config();
const express = require("express");
const cors = require("cors");
const path = require('path');
const connectDB = require("./config/db");
const userRoutes = require("./routes/userRoutes");
const jobRoutes = require("./routes/jobRoutes");

connectDB(); 

const app = express();
app.use(cors()); 
app.use(express.json()); 

app.use("/api/users", userRoutes);
app.use("/api/jobs", jobRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server started on port ${PORT}`));

server.timeout = 300000;