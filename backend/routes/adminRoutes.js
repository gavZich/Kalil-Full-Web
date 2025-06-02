const express = require('express');
const router = express.Router();
const { protect, admin } = require('../middleware/authMiddleware');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Program = require('../models/Program');
const PDFDocument = require('pdfkit');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// @desc    Get all lessons (Admin use)
// @route   GET /api/admin/lessons
// @access  Private/Admin
router.get('/lessons', protect, admin, async (req, res) => {
  try {
    // Query all lessons with populated student and instructor fields
    const lessons = await Lesson.find({})
      .populate('student', 'name email')
      .populate('instructor', 'name email');

    res.status(200).json(lessons);
  } catch (error) {
    console.error('Failed to fetch lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// @desc    Get lessons filtered by student, instructor, or status
// @route   GET /api/admin/lessons/filter
// @access  Private/Admin
router.get('/lessons/filter', protect, admin, async (req, res) => {
  const { studentId, instructorId, status } = req.query;

  try {
    // Construct filter conditions dynamically
    const filter = {};
    if (studentId) filter.student = studentId;
    if (instructorId) filter.instructor = instructorId;
    if (status) filter.status = status;

    // Query lessons based on filter
    const lessons = await Lesson.find(filter)
      .populate('student', 'name email')
      .populate('instructor', 'name email');

    res.status(200).json(lessons);
  } catch (error) {
    console.error('Failed to fetch filtered lessons:', error);
    res.status(500).json({ message: 'Failed to fetch filtered lessons' });
  }
});

// Route to get all users by role 
// @desc    Get all users by role (instructor/student)
// @route   GET /api/admin/users/:role
// @access  Private/Admin
// Route to get all users by role
router.get('/users/:role', protect, admin, async (req, res) => {
  const { role } = req.params;

  try {
    if (!['student', 'instructor'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role specified' });
    }

    // Use populate to bring the names of the purchased programs and all relevant fields
    const users = await User.find({ role })
      .populate('purchasedPrograms.program', 'name description price lessonFiles phoneCalls') // Populate all needed fields
      .select('name email phone lessonsCompleted lessonsRemaining purchasedPrograms');

    console.log("Fetched Users with Populated Programs:", JSON.stringify(users, null, 2));

    res.json(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

// Route to add a new instructor
// @desc    Add a new instructor
// @route   POST /api/admin/add-instructor
// @access  Private/Admin
router.post('/add-instructor', protect, admin, async (req, res) => {
  const { name, email, phone, password } = req.body;

  try {
    // Check if instructor already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Instructor already exists' });
    }

    // Create a new instructor
    const instructor = new User({
      name,
      email,
      phone,
      password,
      role: 'instructor',
    });

    await instructor.save();

    res.status(201).json({ message: 'Instructor added successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to add instructor' });
  }
});

// @desc    Reset lessons completed for an instructor after payment
// @route   PUT /api/admin/instructors/:id/reset-lessons
// @access  Private/Admins
router.put('/instructors/:id/reset-lessons', protect, admin, async (req, res) => {
  try {
    // Find the instructor by ID
    const instructor = await User.findById(req.params.id);

    if (!instructor || instructor.role !== 'instructor') {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Reset the number of completed lessons
    instructor.lessonsCompleted = 0;

    // Save the updated instructor details
    await instructor.save();

    res.status(200).json({ message: 'Instructor lessons count reset successfully' });
  } catch (error) {
    console.error('Failed to reset instructor lessons:', error);
    res.status(500).json({ message: 'Failed to reset instructor lessons' });
  }
});


// @desc    Generate PDF report for instructor's completed lessons
// @route   GET /api/reports/instructor-payments/:instructorId
// @access  Private/Admin
router.get('/instructor-payments/:instructorId', protect, admin, async (req, res) => {
  try {
    const instructorId = req.params.instructorId;

    // Find the instructor
    const instructor = await User.findById(instructorId);
    if (!instructor) {
      return res.status(404).json({ message: 'Instructor not found' });
    }

    // Fetch completed lessons for the instructor
    const completedLessons = await Lesson.find({
      instructor: instructorId,
      status: 'completed',
    }).sort({ dateTime: -1 }).populate('student', 'name'); // Populating student name for report

    // Create a PDF document
    const doc = new PDFDocument({ margin: 30 });

    // Set headers for PDF response
    res.setHeader('Content-Disposition', `attachment; filename=${instructor.name}_payment_report.pdf`);
    res.setHeader('Content-Type', 'application/pdf');

    // Pipe the PDF document to response
    doc.pipe(res);

    // Add title and instructor info
    doc.fontSize(18).text(`Payment Report for ${instructor.name}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Email: ${instructor.email}`);
    doc.moveDown(2);

    // Add table header for lessons
    doc.fontSize(16).text('Completed Lessons:', { underline: true });
    doc.moveDown();

    // Check if there are any completed lessons
    if (completedLessons.length === 0) {
      doc.fontSize(12).text('No completed lessons found.');
    } else {
      // Define table headers
      const tableTop = 200;
      const rowHeight = 20;
      const col1X = 50;
      const col2X = 250;
      const col3X = 450;

      // Draw table header
      doc.fontSize(12).text('Lesson Date', col1X, tableTop);
      doc.text('Student Name', col2X, tableTop);
      doc.text('Lesson ID', col3X, tableTop);
      doc.moveDown(0.5);
      doc.moveTo(col1X, tableTop + 15).lineTo(550, tableTop + 15).stroke();

      // Draw each row in the table
      let y = tableTop + 25;
      completedLessons.forEach((lesson, index) => {
        doc.fontSize(10)
          .text(new Date(lesson.dateTime).toLocaleString(), col1X, y)
          .text(lesson.student.name, col2X, y)
          .text(lesson._id, col3X, y);
        y += rowHeight;
      });
    }

    // Finalize PDF document
    doc.end();
  } catch (error) {
    console.error('Failed to generate payment report:', error);
    res.status(500).json({ message: 'Failed to generate payment report' });
  }
});


// Set up multer for file uploads with dynamic destination based on program ID
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Check and create the main 'uploads' folder if it doesn't exist
    const uploadsDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Now create the program-specific folder
    const programDir = path.join(uploadsDir, req.params.programId);

    // Create the directory for the program if it doesn't exist
    if (!fs.existsSync(programDir)) {
      fs.mkdirSync(programDir, { recursive: true });
    }

    cb(null, programDir);
  },
  filename(req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const upload = multer({ storage });

// @desc    Upload lesson file to a program
// @route   POST /api/admin/programs/:programId/upload
// @access  Private/Admin
router.post(
  '/programs/:programId/upload',
  protect,
  admin,
  upload.single('lessonFile'),
  async (req, res) => {
    try {
      const program = await Program.findById(req.params.programId);

      if (!program) {
        return res.status(404).json({ message: 'Program not found' });
      }

      // Check if a file was uploaded 
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Create the file URL based on the request protocol, host, and file path
      const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.params.programId}/${req.file.filename}`;

      // create a new file object with the uploaded file details
      const file = {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
      };

      // add the file to the lessonFiles array in the program
      program.lessonFiles.push(file);
      await program.save();

      // Return the uploaded file details
      res.status(201).json({ message: 'File uploaded successfully', file });
    } catch (error) {
      console.error('Failed to upload file:', error);
      res.status(500).json({ message: 'Failed to upload file' });
    }
  }
);


// @desc    Delete a lesson file from a program
// @route   DELETE /api/admin/programs/:programId/files/:fileId
// @access  Private/Admin
router.delete('/programs/:programId/files/:fileId', protect, admin, async (req, res) => {
  try {
    const program = await Program.findById(req.params.programId);

    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    const fileIndex = program.lessonFiles.findIndex(file => file._id.toString() === req.params.fileId);

    if (fileIndex === -1) {
      return res.status(404).json({ message: 'File not found in the program' });
    }

    // Remove the file from the lessonFiles array
    program.lessonFiles.splice(fileIndex, 1);
    await program.save();

    res.status(200).json({ message: 'File deleted successfully' });
  } catch (error) {
    console.error('Failed to delete file:', error);
    res.status(500).json({ message: 'Failed to delete file' });
  }
});


// @desc    Assign a program to a student
// @route   POST /api/admin/users/:userId/assign-program
// @access  Private/Admin
router.post('/users/:userId/assign-program', protect, admin, async (req, res) => {
  const { userId } = req.params;
  const { programId } = req.body;

  try {
    const user = await User.findById(userId);
    const program = await Program.findById(programId);

    if (!user || !program) {
      return res.status(404).json({ message: 'User or Program not found' });
    }

    // Check if the program is already assigned
    const programExists = user.purchasedPrograms.some(p => p.program.toString() === programId);
    if (programExists) {
      return res.status(400).json({ message: 'Program already assigned to user' });
    }

    // Add the program to user's purchased programs
    const newPurchasedProgram = {
      program: programId,
      lessonFiles: program.lessonFiles, // Add lesson files from the program
      phoneCalls: program.phoneCalls,   // Add phone calls from the program
    };

    user.purchasedPrograms.push(newPurchasedProgram);
    user.lessonsRemaining += program.phoneCalls; // Update the lessons remaining
    await user.save();

    res.status(200).json({ message: 'Program assigned successfully' });
  } catch (error) {
    console.error("Error assigning program:", error);
    res.status(500).json({ message: 'Failed to assign program' });
  }
});

module.exports = router;