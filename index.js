const statusMap = {
    "Learning":   { lvl: 1, class: "status-lvl-1" },
    "Practicing": { lvl: 2, class: "status-lvl-2" },
    "Skilled":    { lvl: 3, class: "status-lvl-3" },
    "Expert":     { lvl: 4, class: "status-lvl-4" }
};

const legacyMap = { "Needs Support": "Learning", "Improving": "Practicing", "Consistent": "Skilled", "Ready": "Expert" };

let workers = JSON.parse(localStorage.getItem('hane_workers')) || [
    { id: 1, name: "Odri", currentTask: "Espresso Extraction", status: "Practicing" },
    { id: 2, name: "Bervin", currentTask: "Order Dispatch", status: "Expert" },
    { id: 3, name: "Wen xuan", currentTask: "Cup Preparation", status: "Learning" },
    { id: 4, name: "Yu", currentTask: "Milk Steaming", status: "Skilled" }
];

function formatName(n) { 
    return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase(); 
}

function renderList() {
    const container = document.getElementById('worker-list-container');
    container.innerHTML = '';
    
    workers = workers.map(w => { 
        if(legacyMap[w.status]) w.status = legacyMap[w.status]; 
        return w; 
    });
    
    workers.forEach(w => {
        const s = statusMap[w.status] || statusMap["Learning"];
        const card = document.createElement('div');
        card.className = 'worker-card';
        card.onclick = () => window.location.href = `worker.html?id=${w.id}`;
        card.innerHTML = `
            <div class="avatar">
                <svg viewBox="0 0 24 24" stroke="currentColor" fill="none" stroke-width="1.5">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                </svg>
            </div>
            <div class="worker-card-content">
                <div class="worker-name">${formatName(w.name)}</div>
                <div class="worker-meta">
                    <span>Task: ${w.currentTask}</span>
                    <span>Level: ${s.lvl}</span>
                </div>
            </div>
            <div class="status-tag ${s.class}">${w.status}</div>`;
        container.appendChild(card);
    });
    
    localStorage.setItem('hane_workers', JSON.stringify(workers));
}

function openModal() { 
    document.getElementById('add-worker-modal').classList.add('show'); 
}

function closeModal() { 
    document.getElementById('add-worker-modal').classList.remove('show'); 
    document.getElementById('new-name').value = ''; 
}

function submitNewWorker() {
    const name = document.getElementById('new-name').value.trim();
    if (!name) return alert("Enter a name");
    workers.push({ id: Date.now(), name: name, currentTask: "Orientation", status: "Learning" });
    renderList(); 
    closeModal();
}

// Initialize
renderList();