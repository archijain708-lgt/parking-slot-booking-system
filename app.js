const state = {
    step: 1,
    locationId: null,
    locationType: '',
    locationName: '',
    slots: 24,
    mapUrl: '',
    vehiclePlate: '',
    vehicleType: 'Four Wheeler',
    entryTime: '',
    duration: 2,
    selectedSlot: null,
    selectedFloor: 0,
    pricePerHour: 30,
    bookingId: ''
};

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    // Render Locations dynamically
    const grid = document.getElementById('locations-grid');
    if(grid) {
        const locs = getLocations();
        grid.innerHTML = locs.map(l => `
            <div class="location-card" onclick="selectLocation(${l.id})">
                <div class="icon">${l.icon}</div>
                <h3>${l.name}</h3>
                <p>${l.desc}</p>
            </div>
        `).join('');
    }

    // Set default entry time to current time + 1 hour
    const now = new Date();
    now.setHours(now.getHours() + 1);
    now.setMinutes(0);
    
    // Format for datetime-local
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    
    document.getElementById('entry-time').value = `${year}-${month}-${day}T${hours}:${minutes}`;
});

// Navigation Functions
function switchView(step) {
    // Hide all views
    document.querySelectorAll('.view-section').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    
    // Show target view
    const viewIds = ['view-location', 'view-details', 'view-slots', 'view-payment', 'view-pass'];
    const target = document.getElementById(viewIds[step - 1]);
    target.classList.remove('hidden');
    target.classList.add('active');

    // Update Progress Bar
    const percent = ((step - 1) / 4) * 100;
    document.getElementById('progress-fill').style.width = `${percent}%`;

    // Update Steps styling
    document.querySelectorAll('.step').forEach((el, index) => {
        el.classList.remove('step-active');
        el.classList.remove('step-done');
        
        if (index < step - 1) el.classList.add('step-done');
        if (index === step - 1) el.classList.add('step-active');
    });

    state.step = step;
}

function prevStep(step) {
    if (step >= 1) switchView(step);
}

// View 1 Actions
function selectLocation(id) {
    const loc = getLocationById(id);
    if(!loc) return;

    state.locationId = loc.id;
    state.locationType = loc.type;
    state.locationName = loc.name;
    state.slots = loc.slots || 24;
    state.mapUrl = loc.mapUrl || '';
    state.floors = loc.floors || null;
    
    document.getElementById('loc-name-display').innerText = loc.name;
    
    const iframe = document.getElementById('map-iframe');
    const container = document.getElementById('map-container');
    if(state.mapUrl) {
        iframe.src = state.mapUrl;
        container.style.display = 'block';
    } else {
        container.style.display = 'none';
        iframe.src = '';
    }
    
    // Set mock price in INR based on location
    if(loc.type === 'Mall') state.pricePerHour = 50;
    else if(loc.type === 'College') state.pricePerHour = 10;
    else if(loc.type === 'Event') state.pricePerHour = 100;
    else state.pricePerHour = 30;

    switchView(2);
}

// View 2 Actions
function submitDetails() {
    const plate = document.getElementById('vehicle-plate').value;
    const type = document.getElementById('vehicle-type').value;
    const time = document.getElementById('entry-time').value;
    const dur = document.getElementById('duration').value;

    if(!plate || !time || !dur) {
        alert("Please fill in all details.");
        return;
    }

    state.vehiclePlate = plate;
    state.vehicleType = type;
    state.entryTime = time;
    state.duration = dur;

    initFloors();
    generateGrid();
    switchView(3);
}

function initFloors() {
    const floorSelect = document.getElementById('floor-select');
    floorSelect.innerHTML = '';
    
    if (state.floors && state.floors.length > 0) {
        state.floors.forEach((f, i) => {
            const option = document.createElement('option');
            option.value = i;
            option.text = f.name;
            floorSelect.appendChild(option);
        });
    } else {
        const totalSlots = state.slots;
        const slotsPerFloor = 24;
        const numFloors = Math.max(1, Math.ceil(totalSlots / slotsPerFloor));
        
        for (let i = 0; i < numFloors; i++) {
            const option = document.createElement('option');
            option.value = i;
            if (i === 0) option.text = 'Ground Floor';
            else if (i === 1) option.text = '1st Floor';
            else if (i === 2) option.text = '2nd Floor';
            else if (i === 3) option.text = '3rd Floor';
            else option.text = `${i}th Floor`;
            floorSelect.appendChild(option);
        }
    }
    
    state.selectedFloor = 0;
    floorSelect.value = 0;
}

function changeFloor() {
    state.selectedFloor = parseInt(document.getElementById('floor-select').value);
    generateGrid();
}

// View 3 Actions: Grid Generation
function generateGrid() {
    const grid = document.getElementById('slot-grid');
    grid.innerHTML = '';
    state.selectedSlot = null;
    document.getElementById('btn-confirm-slot').disabled = true;

    let slotsThisFloor = 0;
    let floorPrefix = '';

    if (state.floors && state.floors.length > 0) {
        const floorData = state.floors[state.selectedFloor];
        slotsThisFloor = floorData.slots;
        floorPrefix = floorData.prefix || (state.selectedFloor === 0 ? 'G' : state.selectedFloor);
    } else {
        const totalSlots = state.slots;
        const slotsPerFloor = 24;
        
        const startSlot = state.selectedFloor * slotsPerFloor;
        slotsThisFloor = Math.min(slotsPerFloor, totalSlots - startSlot);
        floorPrefix = state.selectedFloor === 0 ? 'G' : state.selectedFloor;
    }

    const cols = 6;
    const numRows = Math.ceil(slotsThisFloor / cols);
    const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    let slotCount = 0;
    
    for(let r=0; r<numRows; r++) {
        const row = rowLetters[r % 26];
        for(let c=1; c<=cols; c++) {
            slotCount++;
            if (slotCount > slotsThisFloor) break;
            
            const slotId = `${floorPrefix}-${row}${c}`;
            const isOccupied = Math.random() > 0.6; // 40% chance of being occupied
            
            const slotEl = document.createElement('div');
            slotEl.className = `parking-slot ${isOccupied ? 'occupied' : 'available'}`;
            slotEl.innerText = slotId;
            
            if(!isOccupied) {
                slotEl.onclick = () => selectSlot(slotEl, slotId);
            }
            
            grid.appendChild(slotEl);
        }
    }
}

function selectSlot(el, slotId) {
    // clear prior selection
    document.querySelectorAll('.parking-slot.selected').forEach(s => {
        s.classList.remove('selected');
    });

    el.classList.add('selected');
    state.selectedSlot = slotId;
    document.getElementById('btn-confirm-slot').disabled = false;
}

function confirmSlot() {
    // Populate Payment View
    document.getElementById('sum-location').innerText = state.locationName;
    document.getElementById('sum-vehicle').innerText = `${state.vehiclePlate} (${state.vehicleType})`;
    
    let floorText = '';
    if (state.floors && state.floors.length > 0) {
        floorText = state.floors[state.selectedFloor].name;
    } else {
        floorText = state.selectedFloor === 0 ? 'Ground Floor' : `${state.selectedFloor} Floor`;
    }
    document.getElementById('sum-floor').innerText = floorText;
    document.getElementById('sum-slot').innerText = state.selectedSlot;
    document.getElementById('sum-duration').innerText = `${state.duration} Hours`;
    
    const total = state.duration * state.pricePerHour;
    document.getElementById('sum-price').innerText = `₹${total}`;

    // Prepare UPI QR
    document.getElementById('upi-amount').innerText = total;
    const upiUrl = `upi://pay?pa=parkease@upi&pn=ParkEase&am=${total}&cu=INR`;
    document.getElementById('payment-qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiUrl)}`;

    switchView(4);
}

function setPaymentMethod(method) {
    document.querySelectorAll('.method').forEach(el => el.classList.remove('active'));
    const cardFields = document.getElementById('card-fields');
    const upiFields = document.getElementById('upi-fields');
    
    if(method === 'card') {
        document.querySelector('.method:nth-child(1)').classList.add('active');
        cardFields.style.display = 'block';
        upiFields.style.display = 'none';
    } else {
        document.querySelector('.method:nth-child(2)').classList.add('active');
        cardFields.style.display = 'none';
        upiFields.style.display = 'block';
    }
}

// View 4 Actions
function simulatePayment(btn) {
    btn.innerHTML = 'Processing...';
    btn.disabled = true;

    // Simulate Network Delay
    setTimeout(() => {
        generatePass();
        switchView(5);
        btn.innerHTML = 'Pay & Confirm';
        btn.disabled = false;
    }, 1500);
}

// View 5 Actions
function generatePass() {
    const id = 'PE-' + Math.floor(Math.random() * 90000 + 10000);
    state.bookingId = id;

    document.getElementById('pass-id').innerText = id;
    
    let floorText = '';
    if (state.floors && state.floors.length > 0) {
        floorText = state.floors[state.selectedFloor].name;
    } else {
        floorText = state.selectedFloor === 0 ? 'Ground' : `${state.selectedFloor}`;
    }
    document.getElementById('pass-floor').innerText = floorText;
    document.getElementById('pass-slot').innerText = state.selectedSlot;
    document.getElementById('pass-plate').innerText = state.vehiclePlate;
    
    // Format time display
    const d = new Date(state.entryTime);
    // Add duration
    d.setHours(d.getHours() + parseInt(state.duration));
    
    const options = { month: 'short', day: 'numeric', hour: '2-digit', minute:'2-digit' };
    document.getElementById('pass-time').innerText = d.toLocaleDateString('en-US', options);

    // Generate dynamic QR Code using goqr API based on booking info
    const qrData = encodeURIComponent(`ID:${id}|Slot:${state.selectedSlot}|Reg:${state.vehiclePlate}`);
    document.getElementById('qr-image').src = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}`;
}

function resetApp() {
    state.selectedSlot = null;
    state.bookingId = '';
    
    document.getElementById('btn-confirm-slot').disabled = true;
    switchView(1);
}
