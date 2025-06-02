const express = require('express');
const router = express.Router();
const { protect, student, instructor } = require('../middleware/authMiddleware');
const Lesson = require('../models/Lesson');
const User = require('../models/User');
const Availability = require('../models/Availability');
const sendEmail = require('../utils/sendEmail'); 

// @desc    Student schedules a new lesson
// @route   POST /api/lessons
// @access  Private/Students
router.post('/schedule', protect, student, async (req, res) => {
  const { instructorId, dateTime } = req.body;

  try {
    // Find the student based on the logged-in user's ID
    const student = await User.findById(req.user._id);

    // Check if the student has remaining lessons
    if (student.lessonsRemaining <= 0) {
      console.warn(`Student ${req.user._id} has no remaining lessons`);
      return res.status(400).json({ message: 'No lessons remaining' });
    }

    // Find instructor availability
    const availability = await Availability.findOne({ instructor: instructorId });
    if (!availability) {
      console.warn(`Instructor ${instructorId} has no availability set`);
      return res.status(400).json({ message: 'Instructor has no availability' });
    }

    // Check if the requested time slot is available
    const slotAvailable = availability.availableSlots.some(
      (slot) => new Date(slot.dateTime).getTime() === new Date(dateTime).getTime()
    );

    if (!slotAvailable) {
      console.warn(`The time slot ${dateTime} is not available for instructor ${instructorId}`);
      return res.status(400).json({ message: 'Selected time is not available' });
    }

    // Create a lesson with a 'pending' status
    const lesson = new Lesson({
      student: req.user._id,
      instructor: instructorId,
      dateTime,
      status: 'pending',  // Initialize status as pending
    });

    // Save the new lesson to the database
    const createdLesson = await lesson.save();
    console.log(`Lesson created successfully with ID: ${createdLesson._id}`);

    // Find instructor and send email notification
    const instructor = await User.findById(instructorId);
    await sendEmail(instructor.email, 'New Lesson Request', 'You have a new lesson request.');
    console.log(`Email notification sent to instructor ${instructorId}`);

    // Remove the selected slot from the availability
    availability.availableSlots = availability.availableSlots.filter(
    (slot) => new Date(slot.dateTime).getTime() !== new Date(dateTime).getTime());

    res.status(201).json(createdLesson);
  } catch (error) {
    console.error('Failed to schedule lesson:', error);
    res.status(500).json({ message: 'Failed to schedule lesson' });
  }
});

// @desc    Instructor approves a lesson
// @route   PUT /api/lessons/:id/approve
// @access  Private/Instructors
router.put('/:id/approve', protect, instructor, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.instructor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    lesson.status = 'approved';
    await lesson.save();

    // Send email notification to student
    const student = await User.findById(lesson.student);
    await sendEmail(student.email, 'Lesson Approved', 'Your lesson has been approved.');

    res.json({ message: 'Lesson approved' });
  } catch (error) {
    console.error('Failed to approve lesson:', error);
    res.status(500).json({ message: 'Failed to approve lesson' });
  }
});

// @desc    Student and Instructor confirm lesson completion
// @route   PUT /api/lessons/:id/confirm
// @access  Private/Students and Instructors
router.put('/:id/confirm', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    if (lesson.student.toString() !== req.user._id.toString() && lesson.instructor.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    if (lesson.student.toString() === req.user._id.toString()) {
      lesson.studentConfirmed = true;
    }

    if (lesson.instructor.toString() === req.user._id.toString()) {
      lesson.instructorConfirmed = true;
    }

    // If both confirmed, update status to 'completed'
    if (lesson.studentConfirmed && lesson.instructorConfirmed) {
      lesson.status = 'completed';

      // Update lessonsRemaining and lessonsCompleted for student
      const student = await User.findById(lesson.student);
      student.lessonsRemaining -= 1;
      student.lessonsCompleted += 1;
      await student.save();

    // Update lessonsCompleted for instructor
    const instructor = await User.findById(lesson.instructor);
    instructor.lessonsCompleted = (instructor.lessonsCompleted || 0) + 1;
    await instructor.save();
  }

    await lesson.save();
    res.json({ message: 'Lesson confirmation updated' });
  } catch (error) {
    console.error('Failed to confirm lesson:', error);
    res.status(500).json({ message: 'Failed to confirm lesson' });
  }
});

// @desc    Get instructor lessons summary
// @route   GET /api/lessons/instructor-summary
// @access  Private/Instructors
router.get('/instructor-summary', protect, instructor, async (req, res) => {
  try {
    // Fetch upcoming lessons for the instructor
    const upcomingLessons = await Lesson.find({
      instructor: req.user._id,
      dateTime: { $gte: new Date() }, // Only future lessons
      status: { $in: ['pending', 'approved'] }, // Only relevant statuses
    }).sort({ dateTime: 1 }); // Sort by date

    // Fetch completed lessons for the instructor
    const completedLessons = await Lesson.find({
      instructor: req.user._id,
      status: 'completed',
    }).sort({ dateTime: -1 }); // Sort by most recent

    res.json({
      upcomingLessons,
      completedLessonsCount: completedLessons.length,
    });
  } catch (error) {
    console.error('Failed to fetch instructor lessons summary:', error);
    res.status(500).json({ message: 'Failed to fetch lessons summary' });
  }
});

// @desc    Get student lessons summary
// @route   GET /api/lessons/student-summary
// @access  Private/Students
router.get('/student-summary', protect, student, async (req, res) => {
  try {
    // Fetch upcoming lessons for the student
    const upcomingLessons = await Lesson.find({
      student: req.user._id,
      dateTime: { $gte: new Date() }, // Only future lessons
      status: { $in: ['pending', 'approved'] }, // Only relevant statuses
    }).sort({ dateTime: 1 }); // Sort by date

    // Fetch completed lessons for the student
    const completedLessons = await Lesson.find({
      student: req.user._id,
      status: 'completed',
    }).sort({ dateTime: -1 }); // Sort by most recent

    res.json({
      upcomingLessons,
      completedLessonsCount: completedLessons.length,
    });
  } catch (error) {
    console.error('Failed to fetch student lessons summary:', error);
    res.status(500).json({ message: 'Failed to fetch lessons summary' });
  }
});

// @desc    Get all lessons for the logged-in instructor or student
// @route   GET /api/lessons
// @access  Private
router.get('/', protect, async (req, res) => {
  try {
    let lessons;
    if (req.user.role === 'instructor') {
      lessons = await Lesson.find({ instructor: req.user._id });
    } else if (req.user.role === 'student') {
      lessons = await Lesson.find({ student: req.user._id });
    } else {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(lessons);
  } catch (error) {
    console.error('Failed to fetch lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});

// @desc    Cancel a lesson
// @route   DELETE /api/lessons/:id
// @access  Private/Students and Instructors
router.delete('/:id', protect, async (req, res) => {
  try {
    const lesson = await Lesson.findById(req.params.id);

    if (!lesson) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    // Only the student or the instructor can cancel the lesson
    if (
      lesson.student.toString() !== req.user._id.toString() &&
      lesson.instructor.toString() !== req.user._id.toString()
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    await lesson.deleteOne();

    // Add the slot back to the instructor's availability
    const availability = await Availability.findOne({ instructor: lesson.instructor });
    if (availability) {
      availability.availableSlots.push({ dateTime: lesson.dateTime });
      await availability.save();
    }

    res.json({ message: 'Lesson canceled successfully' });
  } catch (error) {
    console.error('Failed to cancel lesson:', error);
    res.status(500).json({ message: 'Failed to cancel lesson' });
  }
});

// @desc    Get lessons for a purchased program
// @route   GET /api/programs/:programId/lessons
// @access  Private
router.get('/programs/:programId/lessons', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user || !user.purchasedPrograms.includes(req.params.programId)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const program = await Program.findById(req.params.programId);
    if (!program) {
      return res.status(404).json({ message: 'Program not found' });
    }

    res.status(200).json({ lessons: program.lessonFiles });
  } catch (error) {
    console.error('Failed to fetch lessons:', error);
    res.status(500).json({ message: 'Failed to fetch lessons' });
  }
});


module.exports = router;
