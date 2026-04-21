require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/suggest', async (req, res) => {
    const { workerData } = req.body;
    console.log(`\n--- New AI Request for ${workerData.name} ---`);
    console.log(`Rating given: ${workerData.rating} Stars`);

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    // Here is where we inject your custom logic into the AI's brain!
    const prompt = `
        You are a supportive F&B caregiver assistant for neurodivergent workers.
        Worker Name: ${workerData.name}
        Task: ${workerData.taskName}
        Time: ${workerData.time}
        Food Quality Rating: ${workerData.rating}/5 stars.

        RULES FOR YOUR DECISION:
        1. If the rating is 3 stars or lower, you MUST choose "Redo Training".
        2. If the rating is 4 or 5 stars, look at the time. If the time seems long (over 3 minutes), choose "Speed & Pacing". Otherwise, pick one of the other remaining options randomly to encourage variety.

        Choose ONLY ONE exact phrase from this list:
        Station Cleanliness
        Matching Ingredients
        Drink Presentation
        Speed & Pacing
        Following Puzzle Steps
        Redo Training

        Reply with ONLY the exact text. Do not add quotes, periods, or extra words.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        // Clean up the text just in case the AI adds quotes or periods
        let aiAnswer = response.text().replace(/['"\.]/g, '').trim(); 
        
        console.log(`AI Answered: [${aiAnswer}]`); // This prints to your terminal so you can see it working!
        
        res.json({ suggestion: aiAnswer });
    } catch (error) {
        console.error("AI failed to respond:", error);
        res.status(500).json({ error: "AI failed to respond" });
    }
});

app.listen(3000, () => console.log('AI Server running on port 3000'));