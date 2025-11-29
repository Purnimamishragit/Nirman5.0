// ==================== CONFIGURATION ====================
const API_URL = 'http://127.0.0.1:5000';
const UPDATE_INTERVAL = 3000;
let map;
let markers = [];
let updateTimer;
let userLocation = null;

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    initializeMap();
    requestNotificationPermission();
    loadHospitals();
    setupEventListeners();
    startAutoUpdate();
});

// ==================== MAP INITIALIZATION ====================
function initializeMap() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                userLocation = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude
                };
                
                map = L.map('map').setView([userLocation.lat, userLocation.lng], 12);
                
                L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                    attribution: '© OpenStreetMap contributors',
                    maxZoom: 19
                }).addTo(map);
                
                L.marker([userLocation.lat, userLocation.lng], {
                    icon: L.divIcon({
                        className: 'user-location-marker',
                        html: '<div style="background: #4285F4; width: 20px; height: 20px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
                        iconSize: [20, 20]
                    })
                }).addTo(map).bindPopup('📍 Your Location');
                
                updateLocationDisplay(userLocation.lat, userLocation.lng);
            },
            (error) => {
                console.log('Geolocation error:', error);
                initializeDefaultMap();
            }
        );
    } else {
        initializeDefaultMap();
    }
}

function initializeDefaultMap() {
    map = L.map('map').setView([28.6139, 77.2090], 6);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors',
        maxZoom: 19
    }).addTo(map);
    
    updateLocationDisplay(28.6139, 77.2090, true);
}

function updateLocationDisplay(lat, lng, isDefault = false) {
    const locationText = document.getElementById('locationText');
    if (isDefault) {
        locationText.textContent = 'Default location: India';
    } else {
        locationText.textContent = `Your location: ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
}

// ==================== LOAD HOSPITALS ====================
async function loadHospitals(searchQuery = '') {
    showLoading(true);
    
    try {
        const url = searchQuery 
            ? `${API_URL}/api/hospitals?search=${encodeURIComponent(searchQuery)}`
            : `${API_URL}/api/hospitals`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.success) {
            displayHospitals(data.data);
            updateMapMarkers(data.data);
            document.getElementById('hospitalCount').textContent = data.count;
        } else {
            showToast('Failed to load hospitals', 'error');
        }
    } catch (error) {
        console.error('Error loading hospitals:', error);
        showToast('Connection error. Please check if the backend is running.', 'error');
    } finally {
        showLoading(false);
    }
}

// ==================== DISPLAY HOSPITALS ====================
function displayHospitals(hospitals) {
    const hospitalList = document.getElementById('hospitalList');
    
    if (hospitals.length === 0) {
        hospitalList.innerHTML = `
            <div style="grid-column: 1/-1; text-align: center; padding: 3rem; color: var(--gray-600);">
                <h3>No hospitals found</h3>
                <p>Try adjusting your search criteria</p>
            </div>
        `;
        return;
    }
    
    hospitalList.innerHTML = hospitals.map(hospital => `
        <div class="hospital-card">
            <div class="hospital-header">
                <div>
                    <h3 class="hospital-name">${hospital.name}</h3>
                    <p class="hospital-address">📍 ${hospital.address}</p>
                    <p class="hospital-phone">📞 ${hospital.phone}</p>
                </div>
            </div>
            
            <div class="hospital-resources">
                <div class="resource-item">
                    <span class="resource-icon">🛏️</span>
                    <div>
                        <div class="resource-label">Beds</div>
                        <div class="resource-value">${hospital.beds_available || 0}</div>
                    </div>
                </div>
                <div class="resource-item">
                    <span class="resource-icon">🏥</span>
                    <div>
                        <div class="resource-label">ICU</div>
                        <div class="resource-value">${hospital.icu_available || 0}</div>
                    </div>
                </div>
                <div class="resource-item">
                    <span class="resource-icon">💨</span>
                    <div>
                        <div class="resource-label">Oxygen</div>
                        <div class="resource-value">${hospital.oxygen_cylinders || 0}</div>
                    </div>
                </div>
                <div class="resource-item">
                    <span class="resource-icon">🩸</span>
                    <div>
                        <div class="resource-label">Blood</div>
                        <div class="resource-value">${hospital.blood_units || 0}</div>
                    </div>
                </div>
                <div class="resource-item">
                    <span class="resource-icon">👨‍⚕️</span>
                    <div>
                        <div class="resource-label">Doctors</div>
                        <div class="resource-value">${hospital.doctors_available || 0}</div>
                    </div>
                </div>
            </div>
            
            <div class="hospital-actions">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}" 
                   target="_blank" 
                   class="btn btn-primary btn-small">
                    🗺️ Route
                </a>
                <button onclick="openNotifyModal(${hospital.id})" class="btn btn-secondary btn-small">
                    🔔 Notify
                </button>
                <button onclick="showHospitalDetails(${hospital.id})" class="btn btn-outline btn-small">
                    ℹ️ Details
                </button>
            </div>
            
            <p style="font-size: 0.75rem; color: var(--gray-600); text-align: center; margin-top: 0.5rem;">
                Updated: ${formatTimestamp(hospital.last_updated)}
            </p>
        </div>
    `).join('');
}

// ==================== MAP MARKERS ====================
function updateMapMarkers(hospitals) {
    markers.forEach(marker => map.removeLayer(marker));
    markers = [];
    
    hospitals.forEach(hospital => {
        const markerIcon = L.divIcon({
            className: 'custom-marker',
            html: `<div style="background: #e74c3c; width: 30px; height: 30px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; border: 3px solid white; box-shadow: 0 2px 6px rgba(0,0,0,0.3);">🏥</div>`,
            iconSize: [30, 30]
        });
        
        const marker = L.marker([hospital.latitude, hospital.longitude], { icon: markerIcon })
            .addTo(map);
        
        const popupContent = `
            <div class="popup-content">
                <div class="popup-header">
                    <div class="popup-title">${hospital.name}</div>
                    <div class="popup-address">${hospital.address}</div>
                </div>
                <div class="popup-resources">
                    <div class="popup-resource">🛏️ Beds: <strong>${hospital.beds_available || 0}</strong></div>
                    <div class="popup-resource">🏥 ICU: <strong>${hospital.icu_available || 0}</strong></div>
                    <div class="popup-resource">💨 Oxygen: <strong>${hospital.oxygen_cylinders || 0}</strong></div>
                    <div class="popup-resource">🩸 Blood: <strong>${hospital.blood_units || 0}</strong></div>
                    <div class="popup-resource">👨‍⚕️ Doctors: <strong>${hospital.doctors_available || 0}</strong></div>
                </div>
                <div class="popup-actions">
                    <a href="https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}" 
                       target="_blank" 
                       class="popup-btn popup-btn-primary">
                        🗺️ Route
                    </a>
                    <button onclick="openNotifyModal(${hospital.id})" class="popup-btn popup-btn-secondary">
                        🔔 Notify
                    </button>
                </div>
                <div class="popup-updated">Updated: ${formatTimestamp(hospital.last_updated)}</div>
            </div>
        `;
        
        marker.bindPopup(popupContent, {
            maxWidth: 300,
            className: 'custom-popup'
        });
        
        markers.push(marker);
    });
}

// ==================== EVENT LISTENERS ====================
function setupEventListeners() {
    document.getElementById('searchBtn').addEventListener('click', () => {
        const query = document.getElementById('searchInput').value;
        loadHospitals(query);
    });
    
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const query = document.getElementById('searchInput').value;
            loadHospitals(query);
        }
    });
    
    document.getElementById('clearBtn').addEventListener('click', () => {
        document.getElementById('searchInput').value = '';
        loadHospitals();
    });
    
    document.querySelector('.close-modal').addEventListener('click', closeNotifyModal);
    
    window.addEventListener('click', (e) => {
        const modal = document.getElementById('notifyModal');
        if (e.target === modal) {
            closeNotifyModal();
        }
    });
    
    document.getElementById('notifyForm').addEventListener('submit', handleNotifySubmit);
}

// ==================== NOTIFICATION MODAL ====================
function openNotifyModal(hospitalId) {
    document.getElementById('notifyHospitalId').value = hospitalId;
    document.getElementById('notifyModal').classList.add('show');
}

function closeNotifyModal() {
    document.getElementById('notifyModal').classList.remove('show');
    document.getElementById('notifyForm').reset();
}

async function handleNotifySubmit(e) {
    e.preventDefault();
    
    const hospitalId = document.getElementById('notifyHospitalId').value;
    const email = document.getElementById('notifyEmail').value;
    const resourceType = document.getElementById('notifyResource').value;
    
    try {
        const response = await fetch(`${API_URL}/api/notify`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                hospital_id: parseInt(hospitalId),
                email: email,
                resource_type: resourceType,
                threshold: 1
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            showToast(data.message, 'success');
            closeNotifyModal();
        } else {
            showToast(data.error || 'Failed to register notification', 'error');
        }
    } catch (error) {
        console.error('Notification error:', error);
        showToast('Connection error. Please try again.', 'error');
    }
}

// ==================== BROWSER NOTIFICATIONS ====================
function requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission().then(permission => {
            if (permission === 'granted') {
                console.log('Notification permission granted');
            }
        });
    }
}

function showBrowserNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, {
            body: message,
            icon: '🏥',
            badge: '🏥'
        });
    }
}

// ==================== AUTO UPDATE ====================
function startAutoUpdate() {
    updateTimer = setInterval(() => {
        const searchQuery = document.getElementById('searchInput').value;
        loadHospitals(searchQuery);
    }, UPDATE_INTERVAL);
}

function stopAutoUpdate() {
    if (updateTimer) {
        clearInterval(updateTimer);
    }
}

// ==================== HOSPITAL DETAILS ====================
async function showHospitalDetails(hospitalId) {
    try {
        const response = await fetch(`${API_URL}/api/hospital/${hospitalId}`);
        const data = await response.json();
        
        if (data.success) {
            const hospital = data.data;
            alert(`Hospital Details:\n\nName: ${hospital.name}\nAddress: ${hospital.address}\nPhone: ${hospital.phone}\nSpecialities: ${hospital.specialities || 'General'}\n\nCurrent Resources:\n🛏️ Beds: ${hospital.beds_available || 0}\n🏥 ICU: ${hospital.icu_available || 0}\n💨 Oxygen: ${hospital.oxygen_cylinders || 0}\n🩸 Blood: ${hospital.blood_units || 0}\n👨‍⚕️ Doctors: ${hospital.doctors_available || 0}\n\nLast Updated: ${formatTimestamp(hospital.last_updated)}`);
        }
    } catch (error) {
        console.error('Error fetching hospital details:', error);
        showToast('Failed to load hospital details', 'error');
    }
}

// ==================== UTILITY FUNCTIONS ====================
function showLoading(show) {
    const overlay = document.getElementById('loadingOverlay');
    if (show) {
        overlay.classList.add('show');
    } else {
        overlay.classList.remove('show');
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast toast-${type} show`;
    
    setTimeout(() => {
        toast.className = 'toast';
    }, 3000);
}

function formatTimestamp(timestamp) {
    if (!timestamp) return 'Never';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
}

window.addEventListener('beforeunload', () => {
    stopAutoUpdate();
});