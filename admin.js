// Mock Data for Dashboard

const locations = ['DU North Campus', 'Select CITYWALK', 'Connaught Place', 'Lajpat Nagar', 'Nehru Place', 'India Gate'];
const makes = ['Two Wheeler', 'Four Wheeler'];

// Generate Random Bookings
let mockBookings = [];

function generateInitialData() {
    mockBookings = [];
    for(let i=0; i<8; i++) {
        const id = 'PE-' + Math.floor(Math.random() * 90000 + 10000);
        const loc = locations[Math.floor(Math.random() * locations.length)];
        const plate = ['DL-01', 'DL-03', 'DL-05', 'HR-26'][Math.floor(Math.random()*4)] + '-AB-' + Math.floor(Math.random()*9000 + 1000);
        const type = makes[Math.floor(Math.random() * makes.length)];
        const slot = ['A', 'B', 'C', 'D'][Math.floor(Math.random()*4)] + '-' + Math.floor(Math.random()*15 + 1);
        
        // Random time within past 4 hours
        const d = new Date();
        d.setMinutes(d.getMinutes() - Math.floor(Math.random() * 240));
        
        // Status determination
        const isActive = Math.random() > 0.2; // 80% active
        
        mockBookings.push({
            id,
            location: loc,
            vehicle: `${plate} (${type})`,
            slot,
            time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            status: isActive ? 'Active' : 'Expired',
            rawDate: d
        });
    }
    
    // Sort so most recent is top
    mockBookings.sort((a,b) => b.rawDate - a.rawDate);
    renderTable();
    updateStats();
}

function renderTable() {
    const tbody = document.getElementById('bookings-table-body');
    tbody.innerHTML = '';
    
    mockBookings.forEach((b, index) => {
        const tr = document.createElement('tr');
        
        const statusBadge = `<span class="badge ${b.status.toLowerCase()}">${b.status}</span>`;
        const actionBtn = b.status === 'Active' ? 
            `<button class="btn btn-secondary btn-small" style="color:#ef4444; border-color:rgba(239, 68, 68, 0.4);" onclick="endBooking(${index})">End Booking</button>` : 
            `<button class="btn btn-secondary btn-small" disabled>Completed</button>`;
            
        tr.innerHTML = `
            <td style="font-weight: 600;">${b.id}</td>
            <td>${b.location}</td>
            <td>${b.vehicle}</td>
            <td><span class="highlight">${b.slot}</span></td>
            <td>${b.time}</td>
            <td>${statusBadge}</td>
            <td>${actionBtn}</td>
        `;
        tbody.appendChild(tr);
    });
}

function updateStats() {
    // slight randomization on refresh
    const baseOcc = 900 + Math.floor(Math.random() * 100);
    const total = 1250;
    
    const revElement = document.getElementById('stat-rev');
    // Animate stats briefly
    document.getElementById('stat-occ').innerText = baseOcc;
    document.getElementById('stat-avail').innerText = total - baseOcc;
    
    let currentRev = parseFloat(revElement.innerText.replace(/[₹,]/g, ''));
    if(isNaN(currentRev)) currentRev = 145000;
    
    const newRev = currentRev + Math.floor(Math.random() * 500);
    revElement.innerText = '₹' + newRev.toLocaleString('en-IN');
}

function endBooking(index) {
    if(confirm(`Manually end booking ${mockBookings[index].id}?`)) {
        mockBookings[index].status = 'Expired';
        renderTable();
        // Update stats slightly
        let occStr = document.getElementById('stat-occ').innerText;
        let availStr = document.getElementById('stat-avail').innerText;
        document.getElementById('stat-occ').innerText = parseInt(occStr) - 1;
        document.getElementById('stat-avail').innerText = parseInt(availStr) + 1;
    }
}

function refreshData() {
    // Just add one new booking at the top
    const id = 'PE-' + Math.floor(Math.random() * 90000 + 10000);
    const loc = locations[Math.floor(Math.random() * locations.length)];
    const plate = 'NEW-' + Math.floor(Math.random()*9000 + 1000);
    const type = 'Four Wheeler';
    const slot = 'E-' + Math.floor(Math.random()*10 + 1);
    
    const curr = new Date();
    
    mockBookings.unshift({
        id,
        location: loc,
        vehicle: `${plate} (${type})`,
        slot,
        time: curr.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'Active',
        rawDate: curr
    });
    
    // Pop last if too long
    if(mockBookings.length > 10) mockBookings.pop();
    
    renderTable();
    updateStats();
}

function submitNewLocation() {
    const name = document.getElementById('new-loc-name').value;
    const type = document.getElementById('new-loc-type').value;
    const slots = document.getElementById('new-loc-slots').value;
    const mapUrl = document.getElementById('new-loc-map').value;
    const desc = document.getElementById('new-loc-desc').value;

    let icon = '📍';
    if(type === 'College') icon = '🎓';
    if(type === 'Mall') icon = '🛍️';
    if(type === 'Apartment') icon = '🏢';
    if(type === 'Event') icon = '🎟️';

    // Parse floors
    const floorContainer = document.getElementById('floor-container');
    let floors = null;
    if (floorContainer && floorContainer.children.length > 0) {
        floors = [];
        const rows = floorContainer.children;
        for (let i=0; i<rows.length; i++) {
            const fnameInput = rows[i].querySelector('.floor-name');
            const fslotsInput = rows[i].querySelector('.floor-slots');
            if (fnameInput && fslotsInput && fnameInput.value && fslotsInput.value) {
                const fname = fnameInput.value;
                const fslots = parseInt(fslotsInput.value);
                
                let prefix = fname.slice(0,2).toUpperCase();
                if (fname.toLowerCase() === 'ground' || fname.toLowerCase() === 'ground floor' || fname.toLowerCase() === 'g') prefix = 'G';
                if (fname.toLowerCase() === 'basement' || fname.toLowerCase() === 'basement 1' || fname.toLowerCase() === 'b1' || fname.toLowerCase() === 'b') prefix = 'B';
                
                floors.push({ name: fname, slots: fslots, prefix: prefix });
            }
        }
    }

    addLocation({
        name,
        type,
        slots: parseInt(slots),
        mapUrl,
        desc,
        icon,
        floors: floors
    });

    alert('Location added successfully!');
    document.getElementById('add-location-form').reset();
    if (document.getElementById('floor-container')) {
        document.getElementById('floor-container').innerHTML = '';
        document.getElementById('new-loc-slots').readOnly = false;
    }
    
    // update stats
    const totalEl = document.getElementById('stat-total');
    totalEl.innerText = (parseInt(totalEl.innerText.replace(/,/g, '')) + parseInt(slots)).toLocaleString();
}

// Initial Load
document.addEventListener('DOMContentLoaded', generateInitialData);

// Floor-wise UI Functions
function addFloorInput() {
    const container = document.getElementById('floor-container');
    
    const div = document.createElement('div');
    div.style.display = 'flex';
    div.style.gap = '0.5rem';
    
    div.innerHTML = `
        <input type="text" class="floor-name" placeholder="Floor Name (e.g. Ground)" style="flex: 1; padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.2); color: white;" required>
        <input type="number" class="floor-slots" placeholder="Slots" style="width: 80px; padding: 0.8rem; border-radius: 8px; border: 1px solid var(--glass-border); background: rgba(0,0,0,0.2); color: white;" min="1" required>
        <button type="button" class="btn btn-secondary btn-small" style="padding: 0.8rem; color: #ef4444; border-color: rgba(239, 68, 68, 0.4);" onclick="this.parentElement.remove(); updateSlotsFromFloors();">✕</button>
    `;
    
    div.querySelector('.floor-slots').addEventListener('input', updateSlotsFromFloors);
    
    container.appendChild(div);
    updateSlotsFromFloors();
}

function updateSlotsFromFloors() {
    const container = document.getElementById('floor-container');
    const totalInput = document.getElementById('new-loc-slots');
    
    if (container.children.length === 0) {
        totalInput.readOnly = false;
        return;
    }
    
    let total = 0;
    const inputs = container.querySelectorAll('.floor-slots');
    inputs.forEach(inp => {
        if (inp.value) total += parseInt(inp.value);
    });
    
    totalInput.value = total;
    totalInput.readOnly = true;
}
