const urlParams = new URLSearchParams(window.location.search);
const workerId = parseInt(urlParams.get('id'));
let workers = JSON.parse(localStorage.getItem('hane_workers')) || [];
let currentWorker = workers.find(w => w.id === workerId);

function formatName(n) { 
    return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); 
}

function initPage() {
    if (currentWorker) {
        document.getElementById('worker-name-title').innerText = formatName(currentWorker.name);
        document.getElementById('task-assign-inline').value = currentWorker.currentTask;
    }
}

function updateTaskMemory() {
    if(currentWorker) {
        currentWorker.currentTask = document.getElementById('task-assign-inline').value;
        localStorage.setItem('hane_workers', JSON.stringify(workers));
    }
}

let currentStars = 0;
function setRating(n) {
    currentStars = n;
    document.querySelectorAll('.stars span').forEach((s, i) => {
        s.classList.toggle('active', i < n);
    });
}

function saveAuditRecord() {
    if (currentStars === 0) return alert("Please provide a food quality rating.");

    // 1. Define the progression order
    const levels = ["Learning", "Practicing", "Skilled", "Expert"];
    
    // 2. Find where the worker is currently
    let currentIndex = levels.indexOf(currentWorker.status);

    // 3. Logic: If they get 5 stars and aren't an Expert yet, Level Up!
    if (currentStars === 5 && currentIndex < levels.length - 1) {
        currentWorker.status = levels[currentIndex + 1];
        alert(`CONGRATULATIONS! ${currentWorker.name} has been promoted to ${currentWorker.status}!`);
    }

    // 4. Save the whole updated list back to LocalStorage
    localStorage.setItem('hane_workers', JSON.stringify(workers));
    
    window.location.href = "index.html";
}
// Add this function to your existing worker.js
function deleteThisWorker() {
    const confirmDelete = confirm(`Are you sure you want to delete ${formatName(currentWorker.name)}? This action is permanent.`);
    
    if (confirmDelete) {
        // Create a new array excluding the current worker
        const updatedWorkers = workers.filter(w => w.id !== workerId);
        
        // Save the updated list back to local storage
        localStorage.setItem('hane_workers', JSON.stringify(updatedWorkers));
        
        // Go back to the homepage
        window.location.href = "index.html";
    }
}
// --- 1. Put these at the TOP of worker.js ---
const taskBenchmarks = {
    "Babyccino": 90,           // 1m 30s
    "Black Americano": 120,    // 2m
    "Double Espresso": 180,    // 3m
    "French Mint": 210,        // 3m 30s
    "Matcha": 150,             // 2m 30s
    "Mocha": 240,              // 4m
    "Spiced Chai": 180,        // 3m
    "White Latte": 210         // 3m 30s
};

const skillMultipliers = {
    "Learning": 1.5,
    "Practicing": 1.2,
    "Skilled": 1.0,
    "Expert": 0.8
};

// ... keep your existing workerId and workers variables here ...

// --- 2. Add this function to the BOTTOM of worker.js ---
function generateRealisticTime() {
    if (!currentWorker) return;

    const task = document.getElementById('task-assign-inline').value;
    const status = currentWorker.status;
    
    const baseTime = taskBenchmarks[task] || 120;
    const multiplier = skillMultipliers[status] || 1.0;
    
    // Add ±10 seconds of "Human Noise"
    const noise = Math.floor(Math.random() * 21) - 10;
    let totalSeconds = Math.round(baseTime * multiplier) + noise;
    
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const timeString = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    // Update the UI (Make sure to add the ID 'task-time-display' in your HTML!)
    document.getElementById('task-time-display').innerText = `Time: ${timeString}`;
}

// --- 3. Update your existing initPage() to call it on load ---
function initPage() {
    if (currentWorker) {
        document.getElementById('worker-name-title').innerText = formatName(currentWorker.name);
        document.getElementById('task-assign-inline').value = currentWorker.currentTask;
        generateRealisticTime(); // Add this line here
    }
}
// Initialize
initPage();