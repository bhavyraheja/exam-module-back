const JobInterview = require("../models/JobInterview");
const fetch = require("node-fetch");
require("dotenv").config();

exports.createJobInterview = async (req, res) => {
  try {
    const { jobRole, techStack, experience, studentId } = req.body;

    // Validate required fields
    if (!jobRole || !techStack || !experience || !studentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide jobRole, techStack, experience, and studentId",
      });
    }

    // Try to generate questions using Hugging Face API
    const questions = await generateQuestionsWithGemini(
      jobRole,
      techStack,
      experience
    );

    if (!questions || questions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Failed to generate questions",
      });
    }

    // Create new job interview document
    const newJobInterview = new JobInterview({
      jobRole,
      techStack,
      experience,
      questions,
      studentId,
    });

    // Save to database
    await newJobInterview.save();

    res.status(201).json({
      success: true,
      data: newJobInterview,
      message: "Job interview questions created successfully",
    });
  } catch (error) {
    console.error("Error creating job interview:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Generate questions using Gemini
async function generateQuestionsWithGemini(jobRole, techStack, experience) {
  // Verify that the API key exists
  if (!process.env.GEMINI_API_KEY) {
    console.error("Gemini API key is missing");
    // Fall back directly to local generation if Gemini API key is missing
    return generateLocalQuestions(jobRole, techStack, experience);
  }

  const prompt = `Create 10 technical interview questions for a ${jobRole} role with ${experience} experience in ${techStack}. 
  Make the questions specific to the tech stack and experience level. 
  Include a mix of theoretical concepts and practical problem-solving questions.
  Format the response as a numbered list of questions from 1-10.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 seconds timeout

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId); // Clear the timeout if the request completes
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error(`Gemini API returned status ${response.status}:`, errorData);
      // Fallback directly to local generation
      return generateLocalQuestions(jobRole, techStack, experience);
    }
    
    const data = await response.json();
    const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedText) {
      console.error("Empty response from Gemini API");
      return generateLocalQuestions(jobRole, techStack, experience);
    }
    
    // Extract questions from the generated text
    const questionList = extractQuestionsFromText(generatedText);
    if (questionList.length > 0) {
      console.log(`✅ Successfully extracted ${questionList.length} questions from Gemini response`);
      return questionList.map((q) => ({ question: q }));
    }
    
    // If extraction fails, use local generation
    console.warn("Could not extract questions from Gemini response, using local generation");
    return generateLocalQuestions(jobRole, techStack, experience);
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error("Request to Gemini API timed out after 20 seconds");
    } else {
      console.error("Error with Gemini API:", error);
    }
    
    // Fall back directly to local generation
    console.log("Falling back to local question generation");
    return generateLocalQuestions(jobRole, techStack, experience);
  }
}

// Helper to extract questions from text
function extractQuestionsFromText(text) {
  // Multiple strategies to identify questions in the text

  // Try to find numbered questions (1. ..., 2. ..., etc.)
  const numberedQuestions = text.match(/\d+\.\s+(.*?)(?=\d+\.|$)/gs);
  if (numberedQuestions && numberedQuestions.length >= 5) {
    return numberedQuestions.map((q) => q.trim());
  }

  // Try to find questions ending with question marks
  const questionMarkQuestions = text.match(/[^.!?]+\?/g);
  if (questionMarkQuestions && questionMarkQuestions.length >= 5) {
    return questionMarkQuestions.map((q) => q.trim());
  }

  // Try to split by new lines and find lines that seem like questions
  const lines = text.split("\n").filter((line) => {
    line = line.trim();
    return (
      line.length > 20 &&
      (line.includes("?") ||
        /^\d+\./.test(line) ||
        line.includes("how") ||
        line.includes("what") ||
        line.includes("explain") ||
        line.includes("describe"))
    );
  });

  if (lines.length >= 5) {
    return lines.map((l) => l.trim());
  }

  return [];
}

// Local question generation as last resort
function generateLocalQuestions(jobRole, techStack, experience) {
  // Template-based approach to generate questions locally
  const questions = [];

  // Add generic questions based on role and tech stack
  questions.push(`What experience do you have working with ${techStack}?`);
  questions.push(`What are the key features and benefits of ${techStack}?`);
  questions.push(`How would you implement error handling in ${techStack}?`);
  questions.push(
    `Explain the architecture of a typical ${jobRole} project using ${techStack}.`
  );
  questions.push(`What are the best practices for ${techStack} development?`);

  // Add more specific questions based on experience level
  if (
    experience.toLowerCase().includes("junior") ||
    experience.toLowerCase().includes("entry")
  ) {
    questions.push(`What basic ${techStack} concepts are you familiar with?`);
    questions.push(
      `Have you completed any personal projects using ${techStack}?`
    );
    questions.push(
      `How would you go about learning a new feature in ${techStack}?`
    );
  } else if (
    experience.toLowerCase().includes("senior") ||
    experience.toLowerCase().includes("lead") ||
    experience.toLowerCase().includes("expert")
  ) {
    questions.push(
      `How would you architect a large-scale ${techStack} application?`
    );
    questions.push(`Describe a complex problem you solved using ${techStack}.`);
    questions.push(`How would you mentor junior developers in ${techStack}?`);
    questions.push(
      `What performance optimizations have you implemented in ${techStack}?`
    );
    questions.push(
      `How do you handle scalability challenges in ${techStack} applications?`
    );
  } else {
    // Mid-level questions
    questions.push(`What testing strategies do you use with ${techStack}?`);
    questions.push(
      `How do you stay updated with the latest developments in ${techStack}?`
    );
    questions.push(
      `Describe a challenging project you completed using ${techStack}.`
    );
  }

  return questions.map((q) => ({ question: q }));
}

// Get all job interviews
exports.getAllJobInterviews = async (req, res) => {
  try {
    const jobInterviews = await JobInterview.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobInterviews.length,
      data: jobInterviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get single job interview by ID
exports.getJobInterviewById = async (req, res) => {
  try {
    const jobInterview = await JobInterview.findById(req.params.id);

    if (!jobInterview) {
      return res.status(404).json({
        success: false,
        message: "Job interview not found",
      });
    }

    res.status(200).json({
      success: true,
      data: jobInterview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Delete job interview
exports.deleteJobInterview = async (req, res) => {
  try {
    const jobInterview = await JobInterview.findByIdAndDelete(req.params.id);

    if (!jobInterview) {
      return res.status(404).json({
        success: false,
        message: "Job interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Job interview deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Update a specific question in a job interview
exports.updateInterviewQuestion = async (req, res) => {
  try {
    const { id } = req.params; // JobInterview ID
    const { questionIndex, newQuestion } = req.body;

    if (typeof questionIndex !== "number" || !newQuestion) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid questionIndex and newQuestion text",
      });
    }

    const jobInterview = await JobInterview.findById(id);
    if (!jobInterview) {
      return res.status(404).json({
        success: false,
        message: "Job interview not found",
      });
    }

    if (
      !jobInterview.questions ||
      questionIndex < 0 ||
      questionIndex >= jobInterview.questions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index",
      });
    }

    jobInterview.questions[questionIndex].question = newQuestion;
    await jobInterview.save();

    res.status(200).json({
      success: true,
      message: "Question updated successfully",
      data: jobInterview,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Submit answer and generate feedback using Hugging Face
exports.submitAnswer = async (req, res) => {
  try {
    const { id } = req.params; // JobInterview ID
    const { questionIndex, answer } = req.body;

    if (typeof questionIndex !== "number" || !answer) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid questionIndex and answer text",
      });
    }

    const jobInterview = await JobInterview.findById(id);
    if (!jobInterview) {
      return res.status(404).json({
        success: false,
        message: "Job interview not found",
      });
    }

    if (
      !jobInterview.questions ||
      questionIndex < 0 ||
      questionIndex >= jobInterview.questions.length
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid question index",
      });
    }

    // Add the answer to the specific question
    jobInterview.questions[questionIndex].answer = answer;

    // Generate feedback using Hugging Face
    try {
      const feedback = await generateFeedbackWithHuggingFace(
        jobInterview.questions[questionIndex].question,
        answer,
        jobInterview.jobRole,
        jobInterview.techStack,
        jobInterview.experience
      );

      jobInterview.questions[questionIndex].feedback = feedback;
    } catch (feedbackError) {
      console.error("Error generating feedback:", feedbackError);
      // Continue saving the answer even if feedback generation fails
    }

    await jobInterview.save();

    res.status(200).json({
      success: true,
      message: "Answer saved and feedback generated successfully",
      data: jobInterview,
    });
  } catch (error) {
    console.error("Error submitting answer:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get student's job interviews
exports.getStudentJobInterviews = async (req, res) => {
  try {
    const { studentId } = req.params;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid student ID",
      });
    }

    const jobInterviews = await JobInterview.find({ studentId }).sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: jobInterviews.length,
      data: jobInterviews,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};



// Generate feedback for all questions at once
exports.generateAllFeedback = async (req, res) => {
  try {
    const { id } = req.params; // JobInterview ID

    // 1. Check if API keys exist
    if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
      console.error("❌ Both Gemini and OpenAI API keys are missing");
      return res.status(500).json({
        success: false,
        message: "Server configuration error: No AI service API keys available",
      });
    }

    // 2. Fetch the job interview
    const jobInterview = await JobInterview.findById(id);
    if (!jobInterview) {
      return res.status(404).json({
        success: false,
        message: "Job interview not found",
      });
    }

    // 3. Only process questions with answers
    const questionsWithAnswers = jobInterview.questions.filter(q => q.answer && q.answer.trim() !== "");
    
    // 4. Process questions sequentially with delay to avoid rate limits
    const results = [];
    const failedQuestions = [];
    
    for (let i = 0; i < questionsWithAnswers.length; i++) {
      const { question, answer } = questionsWithAnswers[i];
      const questionIndex = jobInterview.questions.indexOf(questionsWithAnswers[i]);
      
      try {
        // Add delay between requests to avoid rate limits
        if (i > 0) {
          console.log(`⏱️ Waiting for 3 seconds before processing next question...`);
          await new Promise(resolve => setTimeout(resolve, 3000)); // Increased delay to 3 seconds
        }
        
        console.log(`⏳ Processing question ${questionIndex + 1}/${jobInterview.questions.length}...`);
        
        // Try different AI services in sequence
        let feedback = null;
        let serviceUsed = null;
        let attempts = 0;
        const maxAttempts = 2; // Try each service up to 2 times with backoff
        
        // Try services with retries and backoff
        while (!feedback && attempts < maxAttempts) {
          attempts++;
          
          // Try Gemini first if available
          if (!feedback && process.env.GEMINI_API_KEY) {
            try {
              console.log(`🤖 Attempting with Gemini (attempt ${attempts})...`);
              feedback = await generateFeedbackWithGemini(
                question,
                answer,
                jobInterview.jobRole,
                jobInterview.techStack,
                jobInterview.experience
              );
              serviceUsed = "Gemini";
            } catch (error) {
              console.log(`⚠️ Gemini failed: ${error.message}`);
              // If this is not the last attempt, wait before retrying
              if (attempts < maxAttempts) {
                const backoffTime = attempts * 2000; // Exponential backoff
                console.log(`Waiting ${backoffTime}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
              }
            }
          }
          
          // Fall back to OpenAI if Gemini failed
          if (!feedback && process.env.OPENAI_API_KEY) {
            try {
              console.log(`🤖 Attempting with OpenAI (attempt ${attempts})...`);
              feedback = await generateFeedbackWithOpenAI(
                question,
                answer,
                jobInterview.jobRole,
                jobInterview.techStack,
                jobInterview.experience
              );
              serviceUsed = "OpenAI";
            } catch (error) {
              console.log(`⚠️ OpenAI failed: ${error.message}`);
              // If this is not the last attempt, wait before retrying
              if (attempts < maxAttempts) {
                const backoffTime = attempts * 2000; // Exponential backoff
                console.log(`Waiting ${backoffTime}ms before retrying...`);
                await new Promise(resolve => setTimeout(resolve, backoffTime));
              }
            }
          }
        }
        
        // If both failed, try to provide a generic feedback as fallback
        if (!feedback) {
          console.log("⚠️ All AI services failed. Using fallback generic feedback");
          feedback = generateFallbackFeedback(question, answer);
          serviceUsed = "Fallback";
        }

        jobInterview.questions[questionIndex].feedback = feedback;
        results.push({ questionIndex, success: true, serviceUsed });
        console.log(`✅ Generated feedback for question ${questionIndex + 1} using ${serviceUsed}`);
      } catch (error) {
        console.error(`❌ Error generating feedback for question ${questionIndex + 1}:`, error.message);
        failedQuestions.push({ questionIndex, error: error.message });
      }
    }

    // 5. Save updated job interview
    await jobInterview.save();

    // 6. Count how many feedbacks were successfully generated
    const feedbackCount = jobInterview.questions.filter(q => q.feedback).length;

    res.status(200).json({
      success: true,
      message: `✅ Feedback generated for ${feedbackCount}/${questionsWithAnswers.length} questions.`,
      failedQuestions: failedQuestions.length > 0 ? failedQuestions : undefined,
      data: jobInterview,
    });
  } catch (error) {
    console.error("❌ Error generating all feedback:", error.message);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Gemini API for feedback generation
async function generateFeedbackWithGemini(question, answer, role, techStack, experience) {
  // Verify that the API key exists
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const prompt = `Role: ${role}\nTech Stack: ${techStack}\nExperience: ${experience} years\n\nQuestion: ${question}\nAnswer: ${answer}\n\nGive 3-4 line paragraph feedback on the answer.`;

  // Try with gemini-pro model (most reliable)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // Extended to 20 seconds timeout

  try {
    // Fixed the URL typo: "geneerateContent" -> "generateContent"
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 1024
          }
        }),
        signal: controller.signal
      }
    );

    clearTimeout(timeoutId); // Clear the timeout if the request completes
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Gemini API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const generatedFeedback = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!generatedFeedback) {
      throw new Error("Empty response from Gemini API");
    }
    
    return generatedFeedback;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Request to Gemini API timed out after 20 seconds");
    }
    throw error;
  }
}

// OpenAI API for feedback generation
async function generateFeedbackWithOpenAI(question, answer, role, techStack, experience) {
  // Verify that the API key exists
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OpenAI API key is missing");
  }

  const prompt = `Role: ${role}\nTech Stack: ${techStack}\nExperience: ${experience} years\n\nQuestion: ${question}\nAnswer: ${answer}\n\nGive constructive feedback on the answer.`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // Extended to 20 seconds timeout

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo", // Consider fallback to a lower tier model if quota is an issue
        messages: [
          {
            role: "system",
            content: "You are an expert job interview coach. Provide constructive feedback on candidate responses."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.4,
        max_tokens: 1024
      }),
      signal: controller.signal
    });

    clearTimeout(timeoutId); // Clear the timeout if the request completes
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenAI API returned status ${response.status}: ${JSON.stringify(errorData)}`);
    }
    
    const data = await response.json();
    const generatedFeedback = data?.choices?.[0]?.message?.content;
    
    if (!generatedFeedback) {
      throw new Error("Empty response from OpenAI API");
    }
    
    return generatedFeedback;
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error("Request to OpenAI API timed out after 20 seconds");
    }
    throw error;
  }
}

// Generate fallback feedback when AI services fail
function generateFallbackFeedback(question, answer) {
  // Create a generic but helpful feedback based on the answer length and complexity
  const answerLength = answer.length;
  const wordCount = answer.split(/\s+/).length;
  
  let feedback = "Thank you for your response. ";
  
  if (wordCount < 30) {
    feedback += "Your answer is quite brief. Consider expanding your response with more details, examples, or explanations to fully demonstrate your knowledge and experience. ";
  } else if (wordCount > 200) {
    feedback += "You provided a comprehensive answer. While thorough responses show knowledge, consider focusing on the most relevant points for conciseness. ";
  } else {
    feedback += "You provided a balanced response in terms of length. ";
  }
  
  // Check for technical terms, assuming a technical interview
  const technicalTerms = [
    "algorithm", "framework", "database", "API", "function", "method", 
    "class", "object", "variable", "const", "let", "component", "module",
    "library", "architecture", "pattern", "design", "code", "test", "deploy"
  ];
  
  const hasTerms = technicalTerms.some(term => 
    answer.toLowerCase().includes(term.toLowerCase())
  );
  
  if (hasTerms) {
    feedback += "Your use of technical terminology demonstrates familiarity with the subject. ";
  } else {
    feedback += "Consider incorporating more specific technical terms relevant to the role to showcase your expertise. ";
  }
  
  feedback += "Remember to structure your answers using the STAR method (Situation, Task, Action, Result) for behavioral questions, and provide specific examples from your experience when possible.";
  
  return feedback;
}

// Controller function to empty the answer and feedback
exports.emptyAllAnswersAndFeedback = async (req, res) => {
  try {
    const { id } = req.params; // JobInterview ID

    // Find and update the job interview in one operation
    const jobInterview = await JobInterview.findOneAndUpdate(
      { _id: id },
      { $set: { "questions.$[].answer": "", "questions.$[].feedback": "" } },
      { new: true, runValidators: true }
    );

    if (!jobInterview) {
      return res.status(404).json({
        success: false,
        message: "Job interview not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "All answers and feedback cleared successfully",
      data: jobInterview,
    });
  } catch (error) {
    console.error("Error emptying all answers and feedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};
