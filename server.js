require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- 1. THE DATABASE (One Declaration Only) ---
// This centralizes your "Human Capital" data [cite: 424]
const workersDB = [
    { worker_id: 1, name: "ODRI", gender: "Female", age: 22, current_task: "Espresso Extraction" },
    { worker_id: 2, name: "BERVIN", gender: "Male", age: 25, current_task: "Order Dispatch" },
    { worker_id: 3, name: "WEN XUAN", gender: "Male", age: 20, current_task: "Cup Preparation" },
    { worker_id: 4, name: "YU", gender: "Female", age: 24, current_task: "Milk Steaming" }
];

// Tracking "Operational Sustainability" via waste logs [cite: 740]
const activityLogsDB = [
    { log_id: 1, worker_id: 1, task: "Babyccino", time_taken_seconds: 135, interventions: 0, milk_wasted_ml: 0 },
    { log_id: 2, worker_id: 3, task: "French Mint Choco", time_taken_seconds: 345, interventions: 2, milk_wasted_ml: 100 },
    { log_id: 3, worker_id: 2, task: "Black Americano", time_taken_seconds: 80, interventions: 0, milk_wasted_ml: 0 },
    { log_id: 4, worker_id: 4, task: "Double Espresso", time_taken_seconds: 150, interventions: 1, milk_wasted_ml: 20 }
];

// --- 2. PAGE ROUTES ---
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));
app.get('/worker', (req, res) => res.sendFile(path.join(__dirname, 'worker.html')));
app.get('/esg', (req, res) => res.sendFile(path.join(__dirname, 'esg.html')));

// --- 3. API ENDPOINTS ---

// Fetch specific worker for the Profile Page
app.get('/api/worker/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const worker = workersDB.find(w => w.worker_id === id);
    if (worker) res.json(worker);
    else res.status(404).json({ error: "Worker not found" });
});

// Task Assignment: Building "Careers and Skills" [cite: 904]
app.post('/api/assign-task', (req, res) => {
    const { worker_id, taskName } = req.body;
    const worker = workersDB.find(w => w.worker_id === parseInt(worker_id));
    if (worker) {
        worker.current_task = taskName;
        console.log(`Task [${taskName}] assigned to ${worker.name}`);
        res.json({ success: true, message: `Task assigned to ${worker.name}` });
    } else {
        res.status(404).json({ error: "Worker not found" });
    }
});

// AI Suggestion Logic
app.post('/api/suggest', async (req, res) => {
    const { workerData } = req.body;
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
        You are a supportive F&B caregiver assistant. 
        Worker: ${workerData.name}, Task: ${workerData.taskName}, Rating: ${workerData.rating}/5.
        If rating <= 3, suggest "Redo Training". If rating > 3 but time is long, suggest "Speed & Pacing".
        Choose ONE: Station Cleanliness, Matching Ingredients, Drink Presentation, Speed & Pacing, Following Puzzle Steps, Redo Training.
        Reply with ONLY the phrase.`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        res.json({ suggestion: response.text().replace(/['"\.]/g, '').trim() });
    } catch (error) {
        res.status(500).json({ error: "AI Offline" });
    }
});

// ESG Impact Calculation [cite: 742, 877]
app.get('/api/report', (req, res) => {
    const totalSeconds = activityLogsDB.reduce((sum, log) => sum + log.time_taken_seconds, 0);
    const totalMilkWaste = activityLogsDB.reduce((sum, log) => sum + log.milk_wasted_ml, 0);
    const totalTasks = activityLogsDB.length;
    const sustainabilityScore = (100 - (totalMilkWaste / totalTasks)).toFixed(1);

    res.json({
        social: `Generated ${(totalSeconds / 3600).toFixed(2)} hours of independent labor.`,
        environmental: `Sustainability rate is ${sustainabilityScore}% with ${totalMilkWaste}ml waste.`,
        governance: `Audit trail verified for ${totalTasks} sessions.`
    });
});

app.listen(3000, () => console.log('Hané Board Server: http://localhost:3000'));
