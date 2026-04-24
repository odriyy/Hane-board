// --- DATA RETRIEVAL & CALCULATION ---
const workers = JSON.parse(localStorage.getItem('hane_workers')) || [];

// 1. Social Inclusion Logic
const totalOpsHours = workers.length * 40; 
let interactionHours = 0;
let levelCounts = { "Learning": 0, "Practicing": 0, "Skilled": 0, "Expert": 0 };

workers.forEach(w => {
    if (w.status === "Learning") { interactionHours += 15; levelCounts["Learning"]++; }
    else if (w.status === "Practicing") { interactionHours += 20; levelCounts["Practicing"]++; }
    else if (w.status === "Skilled") { interactionHours += 30; levelCounts["Skilled"]++; }
    else if (w.status === "Expert") { interactionHours += 38; levelCounts["Expert"]++; }
});

const inclusionRate = totalOpsHours > 0 ? ((interactionHours / totalOpsHours) * 100).toFixed(1) : 0;
const nonInteractionHours = totalOpsHours - interactionHours;

document.getElementById('interaction-val').innerText = `${interactionHours} h`;
document.getElementById('ops-val').innerText = `${totalOpsHours} h`;
document.getElementById('inclusion-rate-val').innerText = `${inclusionRate}%`;

// 2. Ergonomic Adaptation Utility (U_A)
const mu_base = 18;  
const mu_adapted = 2; 
const u_a = (((mu_base - mu_adapted) / mu_base) * 100).toFixed(1);

document.getElementById('base-frict-val').innerText = `${mu_base}% Error`;
document.getElementById('adapt-frict-val').innerText = `${mu_adapted}% Error`;
document.getElementById('ua-val').innerText = `${u_a}%`;

// 3. Worker Advancement Velocity (Vs)
let deltaL = 0;
workers.forEach(w => {
    if (w.status === "Practicing") deltaL += 1;
    else if (w.status === "Skilled") deltaL += 2;
    else if (w.status === "Expert") deltaL += 3;
});
const deltaT = 30; 
const vs = (deltaL / deltaT).toFixed(2);

document.getElementById('delta-l-val').innerText = deltaL;
document.getElementById('velocity-val').innerText = vs;

// --- CHART GENERATION ---
Chart.defaults.font.family = "'Nunito', sans-serif";
Chart.defaults.color = '#5C5245';

new Chart(document.getElementById('inclusionChart'), {
    type: 'doughnut',
    data: {
        labels: ['Interaction Hours', 'Mechanical/Prep Hours'],
        datasets: [{
            data: [interactionHours, nonInteractionHours],
            backgroundColor: ['#8A6130', '#E2D4BB'],
            borderWidth: 0,
            hoverOffset: 4
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { boxWidth: 12 } } },
        cutout: '70%'
    }
});

new Chart(document.getElementById('ergonomicChart'), {
    type: 'bar',
    data: {
        labels: ['Traditional Method', 'Adapted Puzzle UI'],
        datasets: [{
            label: 'Error Rate (%)',
            data: [mu_base, mu_adapted],
            backgroundColor: ['#E0957B', '#6B9C7A'],
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, max: 25, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    }
});

new Chart(document.getElementById('velocityChart'), {
    type: 'bar',
    data: {
        labels: ['Learning', 'Practicing', 'Skilled', 'Expert'],
        datasets: [{
            label: 'Active Trainees',
            data: [levelCounts["Learning"], levelCounts["Practicing"], levelCounts["Skilled"], levelCounts["Expert"]],
            backgroundColor: ['#ddd', '#fcd299', '#e59a7d', '#d9b04a'],
            borderRadius: 6
        }]
    },
    options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: 'rgba(0,0,0,0.05)' } },
            x: { grid: { display: false } }
        }
    }
});