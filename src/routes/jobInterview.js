const express = require('express');
const router = express.Router();
const jobInterviewController = require('../controllers/jobInterviewController');

// Create a new job interview with questions
router.post('/', jobInterviewController.createJobInterview);

// Get all job interviews
router.get('/', jobInterviewController.getAllJobInterviews);

// Get a specific job interview by ID
router.get('/:id', jobInterviewController.getJobInterviewById);

// Delete a job interview
router.delete('/:id', jobInterviewController.deleteJobInterview);

router.put('/:id/question', jobInterviewController.updateInterviewQuestion);

router.post('/:id/submit-answer', jobInterviewController.submitAnswer);

router.post('/:id/feedback', jobInterviewController.generateAllFeedback);

// Retrieve job interviews for a specific student
router.get('/student/:studentId', jobInterviewController.getStudentJobInterviews);

router.put('/:id/empty-responses', jobInterviewController.emptyAllAnswersAndFeedback);


module.exports = router;