const CodeInterview = require("../models/CodingInterview");
const fetch = require("node-fetch");
const mongoose = require("mongoose");

async function generateCodeQuestion(category, difficulty) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("Gemini API key is missing");
  }

  const prompt = `
Generate a coding interview question in the category "${category}" with "${difficulty}" difficulty.

Return the following strictly in JSON format:
{
  "title": "Problem title here",
  "question": "Full problem description",
  "testCases": [
    { "input": "input1", "expectedOutput": "output1" },
    { "input": "input2", "expectedOutput": "output2" },
    { "input": "input3", "expectedOutput": "output3" }
  ],
  "boilerplate": {
    "java": "// Java boilerplate",
    "javascript": "// JavaScript boilerplate",
    "python": "# Python boilerplate",
    "c": "// C boilerplate",
    "cpp": "// C++ boilerplate"
  }
}
`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.4,
            maxOutputTokens: 2048,
          },
        }),
        signal: controller.signal,
      }
    );

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Gemini API error ${response.status}: ${JSON.stringify(errorData)}`
      );
    }

    const data = await response.json();
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) throw new Error("Empty response from Gemini API");

    const jsonMatch = rawText.match(/{[\s\S]+}/);
    if (!jsonMatch) throw new Error("No JSON found in Gemini response");

    return JSON.parse(jsonMatch[0]);
  } catch (err) {
    if (err.name === "AbortError") {
      throw new Error("Gemini API request timed out after 20 seconds");
    }
    throw err;
  }
}

const createCodeInterview = async (req, res) => {
  try {
    const { studentId, category, difficulty } = req.body;

    if (!studentId || !category || !difficulty) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const generated = await generateCodeQuestion(category, difficulty);

    const newInterview = new CodeInterview({
      studentId,
      title: generated.title,
      field: category,
      difficulty,
      question: generated.question,
      testCases: generated.testCases,
      boilerplate: generated.boilerplate,
      result: {}, // Will be filled after attempt
    });

    await newInterview.save();

    res.status(201).json({
      message: "Code interview generated and saved",
      data: newInterview,
    });
  } catch (err) {
    console.error("Error creating code interview:", err);
    res.status(500).json({ error: err.message });
  }
};


const getCodeInterviewById = async (req, res) => {
  try {
    const { id } = req.params;

    // Validate if id is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid interview ID" });
    }

    const interview = await CodeInterview.findById(id);

    if (!interview) {
      return res.status(404).json({ error: "Interview not found" });
    }

    res.status(200).json(interview);
  } catch (err) {
    console.error("Error fetching interview:", err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = {
  createCodeInterview,
  getCodeInterviewById,
};
