// Initialize Data if not exists
const delLocations = [
    { id: 1, type: 'College', name: 'Delhi University (North Campus)', slots: 30, mapUrl: 'https://maps.google.com/maps?q=Delhi+University&t=&z=15&ie=UTF8&iwloc=&output=embed', icon: '🎓', desc: 'Faculty and student zones near Vishwavidyalaya' },
    { id: 2, type: 'Mall', name: 'Select CITYWALK (Saket)', slots: 60, mapUrl: 'https://maps.google.com/maps?q=Select+Citywalk+Mall&t=&z=15&ie=UTF8&iwloc=&output=embed', icon: '🛍️', desc: 'Premium multilevel parking in South Delhi' },
    { id: 3, type: 'Commercial', name: 'Connaught Place (Inner Circle)', slots: 40, mapUrl: 'https://maps.google.com/maps?q=Connaught+Place+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed', icon: '🏛️', desc: 'Surface parking in the heart of Delhi' },
    { id: 4, type: 'Market', name: 'Lajpat Nagar Central Market', slots: 20, mapUrl: 'https://maps.google.com/maps?q=Lajpat+Nagar+Market&t=&z=15&ie=UTF8&iwloc=&output=embed', icon: '🧺', desc: 'Busy street-side and underground spaces' },
    { id: 5, type: 'Office', name: 'Nehru Place (IT Hub)', slots: 50, mapUrl: 'https://maps.google.com/maps?q=Nehru+Place+Delhi&t=&z=15&ie=UTF8&iwloc=&output=embed', icon: '💻', desc: 'Corporate and visitor parking zones' },
    { id: 6, type: 'Event', name: 'India Gate / Kartavya Path', slots: 100, mapUrl: 'https://maps.google.com/maps?q=India+Gate&t=&z=15&ie=UTF8&iwloc=&output=embed', icon: '🇮🇳', desc: 'Spacious tourist parking near monuments' }
];

const STORAGE_KEY = 'parkease_locations_delhi_v1';

function getLocations() {
    const locs = localStorage.getItem(STORAGE_KEY);
    if (!locs) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(delLocations));
        return delLocations;
    }
    return JSON.parse(locs);
}

function addLocation(locationObj) {
    const locs = getLocations();
    locationObj.id = Date.now();
    locs.push(locationObj);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(locs));
}

function getLocationById(id) {
    const locs = getLocations();
    return locs.find(l => l.id == id);
}

// Automatically initialize on load
getLocations();
