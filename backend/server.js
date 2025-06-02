const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');  // Import the database connection function
const userRoutes = require('./routes/userRoutes');  // Import user routes
const programRoutes = require('./routes/programRoutes');  // Import program routes
const purchaseRoutes = require('./routes/purchaseRoutes');  // Import purchase routes
const availabilityRoutes = require('./routes/availabilityRoutes'); // Import availability routes
const lessonRoutes = require('./routes/lessonRoutes'); // Import lesson routes
const adminRoutes = require('./routes/adminRoutes'); // Import admin routes
const instructorRoutes = require('./routes/instructorRoutes');
const { admin } = require('./middleware/authMiddleware');
const path = require('path');


dotenv.config();  // Load environment variables from the `.env` file

connectDB();  // Connect to the MongoDB database

const app = express();
app.use(cors());
app.use(express.json());  // Parse incoming JSON requests

// Basic route to check if the server is running
app.get('/', (req, res) => {
  res.send('API is running...');
});

// Use the user routes under the `/api/users` endpoint
app.use('/api/users', userRoutes);
console.log('User routes loaded and ready on /api/users'); // Add this line for debugging

// Use the program routes under the `/api/programs` endpoint
app.use('/api/programs', programRoutes);  // Add this line to include program routes
console.log('Program routes loaded and ready on /api/programs');  // Add this line for debugging

app.use('/api/purchase', purchaseRoutes);  // Add this line to use purchase routes
console.log('Purchase routes loaded and ready on /api/purchase');  // Log for debugging

app.use('/api/availability', availabilityRoutes);
console.log('Availability routes loaded and ready on /api/availability');

app.use('/api/lessons', lessonRoutes);
console.log('Lesson routes loaded and ready on /api/lessons');

app.use('/api/admin', adminRoutes);
console.log('Admin routes loaded and ready on /api/admin');

app.use('/api/instructors', instructorRoutes);
console.log('Instructor routes loaded and ready on /api/instructors');

app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
