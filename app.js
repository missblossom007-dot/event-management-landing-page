// Mock Data
let events = [
    {
        id: 1,
        title: "Konser Musik Jazz Malam",
        date: "2025-12-15",
        time: "19:00",
        location: "Jakarta Convention Center",
        category: "musik",
        price: 250000,
        availableSeats: 500,
        description: "Nikmati malam yang penuh dengan alunan musik jazz dari musisi terbaik Indonesia dan internasional.",
        icon: "🎵",
        organizerId: 1,
        reviews: [],
        averageRating: 0
    },
    {
        id: 2,
        title: "Workshop Web Development",
        date: "2025-12-10",
        time: "09:00",
        location: "Tech Hub Bandung",
        category: "teknologi",
        price: 150000,
        availableSeats: 50,
        description: "Belajar membuat website modern dengan teknologi terkini. Cocok untuk pemula hingga menengah.",
        icon: "💻",
        organizerId: 2,
        reviews: [],
        averageRating: 0
    },
    {
        id: 3,
        title: "Marathon Jakarta 2025",
        date: "2025-12-20",
        time: "05:00",
        location: "Bundaran HI, Jakarta",
        category: "olahraga",
        price: 100000,
        availableSeats: 1000,
        description: "Ikuti marathon tahunan terbesar di Jakarta. Tersedia kategori 5K, 10K, dan 21K.",
        icon: "🏃",
        organizerId: 3,
        reviews: [],
        averageRating: 0
    },
    {
        id: 4,
        title: "Pameran Seni Kontemporer",
        date: "2025-12-08",
        time: "10:00",
        location: "Galeri Nasional Indonesia",
        category: "seni",
        price: 50000,
        availableSeats: 200,
        description: "Pameran karya seni kontemporer dari seniman lokal dan internasional.",
        icon: "🎨",
        organizerId: 4,
        reviews: [],
        averageRating: 0
    },
    {
        id: 5,
        title: "Startup Pitch Competition",
        date: "2025-12-18",
        time: "13:00",
        location: "Surabaya Business Center",
        category: "bisnis",
        price: 0,
        availableSeats: 300,
        description: "Kompetisi pitch untuk startup. Hadiah total 500 juta rupiah!",
        icon: "💼",
        organizerId: 5,
        reviews: [],
        averageRating: 0
    },
    {
        id: 6,
        title: "Festival Kuliner Nusantara",
        date: "2025-12-25",
        time: "11:00",
        location: "Lapangan Banteng, Jakarta",
        category: "makanan",
        price: 0,
        availableSeats: 2000,
        description: "Jelajahi kekayaan kuliner Indonesia dari Sabang sampai Merauke.",
        icon: "🍜",
        organizerId: 1,
        reviews: [],
        averageRating: 0
    }
];

// Organizers data
let organizers = [
    {
        id: 1,
        name: "EventKu Productions",
        email: "contact@eventkuproductions.com",
        totalEvents: 15,
        averageRating: 4.5,
        totalReviews: 120
    },
    {
        id: 2,
        name: "Tech Learning Hub",
        email: "info@techlearninghub.com",
        totalEvents: 8,
        averageRating: 4.8,
        totalReviews: 45
    },
    {
        id: 3,
        name: "Jakarta Sports Club",
        email: "admin@jakartasports.com",
        totalEvents: 12,
        averageRating: 4.2,
        totalReviews: 89
    },
    {
        id: 4,
        name: "Art Gallery Indonesia",
        email: "curator@artgallery.id",
        totalEvents: 20,
        averageRating: 4.6,
        totalReviews: 156
    },
    {
        id: 5,
        name: "Startup Indonesia",
        email: "hello@startupindonesia.com",
        totalEvents: 6,
        averageRating: 4.3,
        totalReviews: 34
    }
];

// Transaction System
let transactions = [];
let userPoints = 50000; // User's current points balance
let transactionIdCounter = 1;
let reviews = []; // User reviews
let reviewIdCounter = 1;

// Authentication System
let users = [];
let currentUser = null;
let userIdCounter = 1;

// Transaction Status Constants
const TRANSACTION_STATUS = {
    WAITING_PAYMENT: 'waiting_payment',
    WAITING_CONFIRMATION: 'waiting_confirmation', 
    DONE: 'done',
    REJECTED: 'rejected',
    EXPIRED: 'expired',
    CANCELED: 'canceled'
};

// Timer for automatic status changes
let transactionTimers = new Map();

// DOM Elements
const eventsGrid = document.getElementById('eventsGrid');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const searchBtn = document.getElementById('searchBtn');
const eventModal = document.getElementById('eventModal');
const createEventModal = document.getElementById('createEventModal');
const createEventBtn = document.getElementById('createEventBtn');
const closeCreateModal = document.getElementById('closeCreateModal');
const createEventForm = document.getElementById('createEventForm');
const hamburger = document.getElementById('hamburger');
const navLinks = document.getElementById('navLinks');
const transactionModal = document.getElementById('transactionModal');
const paymentModal = document.getElementById('paymentModal');
const reviewModal = document.getElementById('reviewModal');
const writeReviewModal = document.getElementById('writeReviewModal');
const writeReviewForm = document.getElementById('writeReviewForm');
const loginModal = document.getElementById('loginModal');
const registerModal = document.getElementById('registerModal');
const profileModal = document.getElementById('profileModal');
const dashboardModal = document.getElementById('dashboardModal');
const editEventModal = document.getElementById('editEventModal');
const transactionManagementModal = document.getElementById('transactionManagementModal');
const attendeeModal = document.getElementById('attendeeModal');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const editEventForm = document.getElementById('editEventForm');
const myTransactionsBtn = document.getElementById('myTransactionsBtn');
const pointsDisplay = document.getElementById('pointsDisplay');

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadUserData();
    updateAuthUI();
    displayEvents(events);
    updatePointsDisplay();
    loadTransactionsFromStorage();
    initializeSampleReviews();
    initializeAuthEventListeners();
});

// Event Listeners
searchBtn.addEventListener('click', filterEvents);
searchInput.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') filterEvents();
});
categoryFilter.addEventListener('change', filterEvents);

// Hamburger Menu Toggle
hamburger.addEventListener('click', (e) => {
    e.stopPropagation();
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
        if (link.id !== 'createEventBtn') {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        }
    });
});

// Close mobile menu when clicking outside
document.addEventListener('click', (e) => {
    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('active');
    }
});

createEventBtn.addEventListener('click', (e) => {
    e.preventDefault();
    createEventModal.style.display = 'block';
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
});

closeCreateModal.addEventListener('click', () => {
    createEventModal.style.display = 'none';
});

createEventForm.addEventListener('submit', (e) => {
    e.preventDefault();
    createNewEvent();
});

// Close modals when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === eventModal) {
        eventModal.style.display = 'none';
    }
    if (e.target === createEventModal) {
        createEventModal.style.display = 'none';
    }
});

// Functions
function displayEvents(eventsToDisplay) {
    eventsGrid.innerHTML = '';
    
    if (eventsToDisplay.length === 0) {
        eventsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: #666;">Tidak ada event ditemukan.</p>';
        return;
    }
    
    eventsToDisplay.forEach(event => {
        const eventCard = createEventCard(event);
        eventsGrid.appendChild(eventCard);
    });
}

function createEventCard(event) {
    const card = document.createElement('div');
    card.className = 'event-card';
    card.onclick = () => showEventDetails(event);
    
    const formattedDate = formatDate(event.date);
    const formattedPrice = event.price === 0 ? 'GRATIS' : `Rp ${event.price.toLocaleString('id-ID')}`;
    
    card.innerHTML = `
        <div class="event-image">${event.icon}</div>
        <div class="event-content">
            <span class="event-category">${event.category.toUpperCase()}</span>
            <h4 class="event-title">${event.title}</h4>
            <p class="event-date">📅 ${formattedDate} • ${event.time}</p>
            <p class="event-location">📍 ${event.location}</p>
            <p class="event-price">${formattedPrice}</p>
            ${event.averageRating > 0 ? 
                `<div class="rating-display">
                    <span class="star active">⭐</span>
                    <span class="rating-number">${event.averageRating.toFixed(1)} (${event.reviews.length})</span>
                </div>` : 
                ''
            }
        </div>
    `;
    
    return card;
}

function showEventDetails(event) {
    const formattedDate = formatDate(event.date);
    const formattedPrice = event.price === 0 ? 'GRATIS' : `Rp ${event.price.toLocaleString('id-ID')}`;
    const organizer = organizers.find(o => o.id === event.organizerId);
    
    // Check if user can review this event (has attended)
    const canReview = canUserReviewEvent(event.id);
    const userReview = getUserReviewForEvent(event.id);
    
    const modalBody = document.getElementById('modalBody');
    modalBody.innerHTML = `
        <div style="text-align: center; font-size: 5rem; margin-bottom: 1rem;">${event.icon}</div>
        <h2>${event.title}</h2>
        <span class="event-category">${event.category.toUpperCase()}</span>
        
        ${event.averageRating > 0 ? `
            <div class="rating-display">
                <span class="average-rating">
                    ⭐ ${event.averageRating.toFixed(1)} (${event.reviews.length} review${event.reviews.length !== 1 ? 's' : ''})
                </span>
            </div>
        ` : ''}
        
        <p style="margin-top: 1rem;"><strong>📅 Tanggal:</strong> ${formattedDate}</p>
        <p><strong>🕐 Waktu:</strong> ${event.time} WIB</p>
        <p><strong>📍 Lokasi:</strong> ${event.location}</p>
        <p><strong>💰 Harga:</strong> ${formattedPrice}</p>
        <p><strong>🎫 Kursi Tersedia:</strong> ${event.availableSeats}</p>
        <p style="margin-top: 1rem; line-height: 1.8;">${event.description}</p>
        
        ${organizer ? `
            <div class="organizer-profile">
                <div class="organizer-info">
                    <div class="organizer-avatar">${organizer.name.charAt(0)}</div>
                    <div class="organizer-details">
                        <h4>${organizer.name}</h4>
                        <div class="organizer-stats">
                            <span>⭐ ${organizer.averageRating.toFixed(1)}</span>
                            <span>📅 ${organizer.totalEvents} events</span>
                            <span>💬 ${organizer.totalReviews} reviews</span>
                        </div>
                    </div>
                </div>
            </div>
        ` : ''}
        
        <div class="modal-buttons" style="margin-top: 1.5rem; display: flex; gap: 1rem; flex-wrap: wrap;">
            ${event.availableSeats > 0 ? 
                `<button class="btn-submit" onclick="startTransaction(${event.id})">Beli Tiket Sekarang</button>` :
                `<button class="btn-disabled" disabled>Tiket Habis</button>`
            }
            <button class="review-button" onclick="showEventReviews(${event.id})">Lihat Review</button>
            ${canReview && !userReview ? 
                `<button class="review-button" onclick="showWriteReview(${event.id})">Tulis Review</button>` : 
                ''
            }
            ${userReview ? 
                `<button class="review-button" onclick="editReview(${userReview.id})">Edit Review Saya</button>` : 
                ''
            }
        </div>
    `;
    
    eventModal.style.display = 'block';
}

function filterEvents() {
    const searchTerm = searchInput.value.toLowerCase();
    const category = categoryFilter.value;
    
    let filtered = events.filter(event => {
        const matchesSearch = event.title.toLowerCase().includes(searchTerm) ||
                            event.description.toLowerCase().includes(searchTerm) ||
                            event.location.toLowerCase().includes(searchTerm);
        const matchesCategory = category === '' || event.category === category;
        
        return matchesSearch && matchesCategory;
    });
    
    displayEvents(filtered);
}

function createNewEvent() {
    const newEvent = {
        id: events.length + 1,
        title: document.getElementById('eventTitle').value,
        date: document.getElementById('eventDate').value,
        time: document.getElementById('eventTime').value,
        location: document.getElementById('eventLocation').value,
        category: document.getElementById('eventCategory').value,
        price: parseInt(document.getElementById('eventPrice').value) || 0,
        availableSeats: parseInt(document.getElementById('eventSeats').value) || 100,
        description: document.getElementById('eventDescription').value,
        icon: getCategoryIcon(document.getElementById('eventCategory').value)
    };
    
    events.unshift(newEvent);
    displayEvents(events);
    createEventModal.style.display = 'none';
    createEventForm.reset();
    
    alert('Event berhasil dibuat!');
}

function getCategoryIcon(category) {
    const icons = {
        'musik': '🎵',
        'teknologi': '💻',
        'olahraga': '🏃',
        'seni': '🎨',
        'bisnis': '💼',
        'makanan': '🍜'
    };
    return icons[category] || '🎉';
}

function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', options);
}

// Close modal buttons
document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
        this.closest('.modal').style.display = 'none';
    });
});

// Transaction Functions
function updatePointsDisplay() {
    if (pointsDisplay && currentUser) {
        pointsDisplay.textContent = `Points: ${currentUser.points.toLocaleString('id-ID')}`;
    }
}

function startTransaction(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.availableSeats <= 0) {
        alert('Event tidak tersedia atau tiket sudah habis!');
        return;
    }
    
    eventModal.style.display = 'none';
    showTransactionModal(event);
}

function showTransactionModal(event) {
    const modalBody = document.getElementById('transactionModalBody');
    const maxPoints = Math.min(currentUser.points, event.price);
    
    modalBody.innerHTML = `
        <h2>Beli Tiket: ${event.title}</h2>
        <div class="transaction-details">
            <p><strong>Harga Tiket:</strong> Rp ${event.price.toLocaleString('id-ID')}</p>
            <p><strong>Points Tersedia:</strong> ${currentUser.points.toLocaleString('id-ID')}</p>
            
            <div class="points-section">
                <label for="pointsToUse">Gunakan Points (maksimal ${maxPoints.toLocaleString('id-ID')}):</label>
                <input type="number" id="pointsToUse" min="0" max="${maxPoints}" value="0" onchange="calculateFinalPrice(${event.price})">
            </div>
            
            <div class="price-calculation">
                <p><strong>Harga Asli:</strong> Rp ${event.price.toLocaleString('id-ID')}</p>
                <p><strong>Potongan Points:</strong> <span id="pointsDiscount">Rp 0</span></p>
                <p class="final-price"><strong>Total Bayar:</strong> <span id="finalPrice">Rp ${event.price.toLocaleString('id-ID')}</span></p>
            </div>
            
            <div class="quantity-section">
                <label for="ticketQuantity">Jumlah Tiket:</label>
                <input type="number" id="ticketQuantity" min="1" max="${Math.min(10, event.availableSeats)}" value="1" onchange="calculateFinalPrice(${event.price})">
            </div>
        </div>
        
        <div class="modal-buttons">
            <button class="btn-cancel" onclick="closeTransactionModal()">Batal</button>
            <button class="btn-submit" onclick="createTransaction(${event.id})">Lanjut ke Pembayaran</button>
        </div>
    `;
    
    transactionModal.style.display = 'block';
}

function calculateFinalPrice(originalPrice) {
    const pointsToUse = parseInt(document.getElementById('pointsToUse').value) || 0;
    const quantity = parseInt(document.getElementById('ticketQuantity').value) || 1;
    
    const totalOriginalPrice = originalPrice * quantity;
    const totalPointsDiscount = pointsToUse * quantity;
    const finalPrice = Math.max(0, totalOriginalPrice - totalPointsDiscount);
    
    document.getElementById('pointsDiscount').textContent = `Rp ${totalPointsDiscount.toLocaleString('id-ID')}`;
    document.getElementById('finalPrice').textContent = `Rp ${finalPrice.toLocaleString('id-ID')}`;
}

function createTransaction(eventId) {
    const event = events.find(e => e.id === eventId);
    const pointsToUse = parseInt(document.getElementById('pointsToUse').value) || 0;
    const quantity = parseInt(document.getElementById('ticketQuantity').value) || 1;
    
    if (quantity > event.availableSeats) {
        alert('Jumlah tiket melebihi kursi yang tersedia!');
        return;
    }
    
    if (pointsToUse > currentUser.points) {
        alert('Points tidak mencukupi!');
        return;
    }
    
    const totalOriginalPrice = event.price * quantity;
    const totalPointsDiscount = pointsToUse * quantity;
    const finalPrice = Math.max(0, totalOriginalPrice - totalPointsDiscount);
    
    const transaction = {
        id: transactionIdCounter++,
        userId: currentUser.id,
        eventId: eventId,
        eventTitle: event.title,
        quantity: quantity,
        originalPrice: totalOriginalPrice,
        pointsUsed: pointsToUse * quantity,
        finalPrice: finalPrice,
        status: TRANSACTION_STATUS.WAITING_PAYMENT,
        createdAt: new Date(),
        paymentProof: null,
        expiresAt: new Date(Date.now() + 2 * 60 * 60 * 1000) // 2 hours from now
    };
    
    transactions.push(transaction);
    
    // Reserve seats and deduct points
    event.availableSeats -= quantity;
    currentUser.points -= pointsToUse * quantity;
    updatePointsDisplay();
    saveUserData();
    
    // Set expiration timer
    setTransactionTimer(transaction.id, 2 * 60 * 60 * 1000); // 2 hours
    
    closeTransactionModal();
    showPaymentModal(transaction);
}

function showPaymentModal(transaction) {
    const modalBody = document.getElementById('paymentModalBody');
    const timeLeft = Math.max(0, transaction.expiresAt - new Date());
    
    modalBody.innerHTML = `
        <h2>Upload Bukti Pembayaran</h2>
        <div class="payment-details">
            <p><strong>ID Transaksi:</strong> #${transaction.id}</p>
            <p><strong>Event:</strong> ${transaction.eventTitle}</p>
            <p><strong>Jumlah Tiket:</strong> ${transaction.quantity}</p>
            <p><strong>Total Bayar:</strong> Rp ${transaction.finalPrice.toLocaleString('id-ID')}</p>
            
            <div class="countdown-timer">
                <p><strong>Waktu Tersisa:</strong> <span id="countdown-${transaction.id}"></span></p>
            </div>
            
            <div class="payment-instructions">
                <h4>Instruksi Pembayaran:</h4>
                <p>1. Transfer ke rekening: BCA 7625042330 a.n. Indri Anjar Kartika</p>
                <p>2. Upload bukti transfer di bawah ini</p>
                <p>3. Tunggu konfirmasi dari admin (maksimal 3 hari)</p>
            </div>
            
            <div class="file-upload">
                <label for="paymentProof">Upload Bukti Pembayaran:</label>
                <input type="file" id="paymentProof" accept="image/*" onchange="previewPaymentProof(event)">
                <div id="proofPreview"></div>
            </div>
        </div>
        
        <div class="modal-buttons">
            <button class="btn-cancel" onclick="cancelTransaction(${transaction.id})">Batalkan Transaksi</button>
            <button class="btn-submit" onclick="submitPaymentProof(${transaction.id})">Upload Bukti</button>
        </div>
    `;
    
    paymentModal.style.display = 'block';
    startCountdown(transaction.id, timeLeft);
}

function startCountdown(transactionId, timeLeft) {
    const countdownElement = document.getElementById(`countdown-${transactionId}`);
    if (!countdownElement) return;
    
    const timer = setInterval(() => {
        timeLeft -= 1000;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            expireTransaction(transactionId);
            return;
        }
        
        const hours = Math.floor(timeLeft / (1000 * 60 * 60));
        const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
        
        countdownElement.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

function previewPaymentProof(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('proofPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            preview.innerHTML = `<img src="${e.target.result}" style="max-width: 200px; max-height: 200px; margin-top: 10px;">`;
        };
        reader.readAsDataURL(file);
    }
}

function submitPaymentProof(transactionId) {
    const fileInput = document.getElementById('paymentProof');
    const transaction = transactions.find(t => t.id === transactionId);
    
    if (!fileInput.files[0]) {
        alert('Silakan pilih file bukti pembayaran!');
        return;
    }
    
    if (!transaction) {
        alert('Transaksi tidak ditemukan!');
        return;
    }
    
    // Simulate file upload
    transaction.paymentProof = fileInput.files[0].name;
    transaction.status = TRANSACTION_STATUS.WAITING_CONFIRMATION;
    
    // Clear expiration timer and set admin confirmation timer (3 days)
    clearTransactionTimer(transactionId);
    setTransactionTimer(transactionId, 3 * 24 * 60 * 60 * 1000); // 3 days
    
    paymentModal.style.display = 'none';
    alert('Bukti pembayaran berhasil diupload! Menunggu konfirmasi admin.');
}

function cancelTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    // Rollback: restore seats and points
    const event = events.find(e => e.id === transaction.eventId);
    if (event) {
        event.availableSeats += transaction.quantity;
    }
    currentUser.points += transaction.pointsUsed;
    updatePointsDisplay();
    saveUserData();
    
    transaction.status = TRANSACTION_STATUS.CANCELED;
    clearTransactionTimer(transactionId);
    
    paymentModal.style.display = 'none';
    alert('Transaksi dibatalkan. Points dan kursi telah dikembalikan.');
}

function expireTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;
    
    // Rollback: restore seats and points
    const event = events.find(e => e.id === transaction.eventId);
    if (event) {
        event.availableSeats += transaction.quantity;
    }
    currentUser.points += transaction.pointsUsed;
    updatePointsDisplay();
    saveUserData();
    
    transaction.status = TRANSACTION_STATUS.EXPIRED;
    clearTransactionTimer(transactionId);
    
    if (paymentModal.style.display === 'block') {
        paymentModal.style.display = 'none';
    }
    
    alert('Transaksi telah kedaluwarsa. Points dan kursi telah dikembalikan.');
}

function setTransactionTimer(transactionId, duration) {
    const timer = setTimeout(() => {
        const transaction = transactions.find(t => t.id === transactionId);
        if (!transaction) return;
        
        if (transaction.status === TRANSACTION_STATUS.WAITING_PAYMENT) {
            expireTransaction(transactionId);
        } else if (transaction.status === TRANSACTION_STATUS.WAITING_CONFIRMATION) {
            // Auto-cancel if admin doesn't respond in 3 days
            cancelTransaction(transactionId);
            alert('Transaksi dibatalkan karena tidak ada konfirmasi admin dalam 3 hari.');
        }
    }, duration);
    
    transactionTimers.set(transactionId, timer);
}

function clearTransactionTimer(transactionId) {
    const timer = transactionTimers.get(transactionId);
    if (timer) {
        clearTimeout(timer);
        transactionTimers.delete(transactionId);
    }
}

function showMyTransactions() {
    const modalBody = document.getElementById('transactionModalBody');
    
    if (transactions.length === 0) {
        modalBody.innerHTML = `
            <h2>Transaksi Saya</h2>
            <p style="text-align: center; color: #666; margin: 2rem 0;">Belum ada transaksi.</p>
        `;
    } else {
        const transactionsList = transactions.map(transaction => {
            const statusClass = getStatusClass(transaction.status);
            const statusText = getStatusText(transaction.status);
            
            return `
                <div class="transaction-item">
                    <div class="transaction-header">
                        <h4>${transaction.eventTitle}</h4>
                        <span class="status ${statusClass}">${statusText}</span>
                    </div>
                    <p><strong>ID:</strong> #${transaction.id}</p>
                    <p><strong>Jumlah Tiket:</strong> ${transaction.quantity}</p>
                    <p><strong>Total Bayar:</strong> Rp ${transaction.finalPrice.toLocaleString('id-ID')}</p>
                    <p><strong>Points Digunakan:</strong> ${transaction.pointsUsed.toLocaleString('id-ID')}</p>
                    <p><strong>Tanggal:</strong> ${new Date(transaction.createdAt).toLocaleDateString('id-ID')}</p>
                    ${transaction.status === TRANSACTION_STATUS.WAITING_PAYMENT ? 
                        `<button class="btn-small" onclick="showPaymentModal(${JSON.stringify(transaction).replace(/"/g, '&quot;')})">Lanjut Bayar</button>` : 
                        ''
                    }
                </div>
            `;
        }).join('');
        
        modalBody.innerHTML = `
            <h2>Transaksi Saya</h2>
            <div class="transactions-list">
                ${transactionsList}
            </div>
        `;
    }
    
    transactionModal.style.display = 'block';
}

function getStatusClass(status) {
    const classes = {
        [TRANSACTION_STATUS.WAITING_PAYMENT]: 'waiting',
        [TRANSACTION_STATUS.WAITING_CONFIRMATION]: 'pending',
        [TRANSACTION_STATUS.DONE]: 'success',
        [TRANSACTION_STATUS.REJECTED]: 'error',
        [TRANSACTION_STATUS.EXPIRED]: 'error',
        [TRANSACTION_STATUS.CANCELED]: 'error'
    };
    return classes[status] || '';
}

function getStatusText(status) {
    const texts = {
        [TRANSACTION_STATUS.WAITING_PAYMENT]: 'Menunggu Pembayaran',
        [TRANSACTION_STATUS.WAITING_CONFIRMATION]: 'Menunggu Konfirmasi',
        [TRANSACTION_STATUS.DONE]: 'Selesai',
        [TRANSACTION_STATUS.REJECTED]: 'Ditolak',
        [TRANSACTION_STATUS.EXPIRED]: 'Kedaluwarsa',
        [TRANSACTION_STATUS.CANCELED]: 'Dibatalkan'
    };
    return texts[status] || status;
}

function closeTransactionModal() {
    transactionModal.style.display = 'none';
}

// Admin Functions (for demo purposes)
function approveTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        transaction.status = TRANSACTION_STATUS.DONE;
        clearTransactionTimer(transactionId);
        alert('Transaksi disetujui!');
    }
}

function rejectTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        // Rollback: restore seats and points
        const event = events.find(e => e.id === transaction.eventId);
        if (event) {
            event.availableSeats += transaction.quantity;
        }
        currentUser.points += transaction.pointsUsed;
        updatePointsDisplay();
        saveUserData();
        
        transaction.status = TRANSACTION_STATUS.REJECTED;
        clearTransactionTimer(transactionId);
        saveTransactionsToStorage();
        alert('Transaksi ditolak. Points dan kursi telah dikembalikan.');
    }
}

// Storage Functions
function saveTransactionsToStorage() {
    localStorage.setItem('eventku_transactions', JSON.stringify(transactions));
    if (currentUser) {
        localStorage.setItem('eventku_user_points', currentUser.points.toString());
    }
    localStorage.setItem('eventku_events', JSON.stringify(events));
    saveUserData();
}

function loadTransactionsFromStorage() {
    const savedTransactions = localStorage.getItem('eventku_transactions');
    const savedEvents = localStorage.getItem('eventku_events');
    
    if (savedTransactions && currentUser) {
        transactions = JSON.parse(savedTransactions);
        // Filter transactions for current user
        transactions = transactions.filter(t => t.userId === currentUser.id);
        
        // Restart timers for active transactions
        transactions.forEach(transaction => {
            if (transaction.status === TRANSACTION_STATUS.WAITING_PAYMENT) {
                const timeLeft = new Date(transaction.expiresAt) - new Date();
                if (timeLeft > 0) {
                    setTransactionTimer(transaction.id, timeLeft);
                } else {
                    expireTransaction(transaction.id);
                }
            } else if (transaction.status === TRANSACTION_STATUS.WAITING_CONFIRMATION) {
                // Set 3-day timer from creation date
                const timeLeft = (new Date(transaction.createdAt).getTime() + 3 * 24 * 60 * 60 * 1000) - new Date().getTime();
                if (timeLeft > 0) {
                    setTransactionTimer(transaction.id, timeLeft);
                } else {
                    cancelTransaction(transaction.id);
                }
            }
        });
    }
    
    if (savedEvents) {
        events = JSON.parse(savedEvents);
        displayEvents(events);
    }
}

// Review System Functions
function canUserReviewEvent(eventId) {
    // User can review if they have a completed transaction for this event
    return transactions.some(t => 
        t.eventId === eventId && 
        t.status === TRANSACTION_STATUS.DONE
    );
}

function getUserReviewForEvent(eventId) {
    return reviews.find(r => r.eventId === eventId);
}

function showEventReviews(eventId) {
    const event = events.find(e => e.id === eventId);
    const organizer = organizers.find(o => o.id === event.organizerId);
    
    const modalBody = document.getElementById('reviewModalBody');
    
    if (event.reviews.length === 0) {
        modalBody.innerHTML = `
            <h2>Review untuk ${event.title}</h2>
            <div class="no-reviews">
                <p>Belum ada review untuk event ini.</p>
            </div>
        `;
    } else {
        const reviewsList = event.reviews.map(review => `
            <div class="review-item">
                <div class="review-header">
                    <span class="reviewer-name">${review.reviewerName}</span>
                    <span class="review-date">${new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
                </div>
                <div class="rating-display">
                    ${generateStarDisplay(review.rating)}
                    <span class="rating-number">${review.rating}/5</span>
                </div>
                <div class="review-comment">${review.comment}</div>
            </div>
        `).join('');
        
        modalBody.innerHTML = `
            <h2>Review untuk ${event.title}</h2>
            <div class="review-stats">
                <div class="average-rating">
                    ⭐ ${event.averageRating.toFixed(1)} dari ${event.reviews.length} review${event.reviews.length !== 1 ? 's' : ''}
                </div>
            </div>
            
            ${organizer ? `
                <div class="organizer-profile">
                    <h3>Tentang Penyelenggara</h3>
                    <div class="organizer-info">
                        <div class="organizer-avatar">${organizer.name.charAt(0)}</div>
                        <div class="organizer-details">
                            <h4>${organizer.name}</h4>
                            <div class="organizer-stats">
                                <span>⭐ ${organizer.averageRating.toFixed(1)} rating keseluruhan</span>
                                <span>📅 ${organizer.totalEvents} total events</span>
                                <span>💬 ${organizer.totalReviews} total reviews</span>
                            </div>
                        </div>
                    </div>
                </div>
            ` : ''}
            
            <div class="review-section">
                <h3>Semua Review</h3>
                ${reviewsList}
            </div>
        `;
    }
    
    reviewModal.style.display = 'block';
}

function showWriteReview(eventId) {
    const event = events.find(e => e.id === eventId);
    
    document.getElementById('reviewEventId').value = eventId;
    document.getElementById('reviewRating').value = '';
    document.getElementById('reviewComment').value = '';
    
    // Reset star rating
    document.querySelectorAll('.star').forEach(star => {
        star.classList.remove('active');
    });
    
    writeReviewModal.style.display = 'block';
}

function editReview(reviewId) {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;
    
    document.getElementById('reviewEventId').value = review.eventId;
    document.getElementById('reviewRating').value = review.rating;
    document.getElementById('reviewComment').value = review.comment;
    
    // Set star rating
    document.querySelectorAll('.star').forEach((star, index) => {
        if (index < review.rating) {
            star.classList.add('active');
        } else {
            star.classList.remove('active');
        }
    });
    
    // Change form to edit mode
    writeReviewForm.setAttribute('data-edit-id', reviewId);
    
    writeReviewModal.style.display = 'block';
}

function generateStarDisplay(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        stars += `<span class="star ${i <= rating ? 'active' : ''}">★</span>`;
    }
    return stars;
}

function submitReview(eventId, rating, comment, editId = null) {
    const event = events.find(e => e.id === eventId);
    if (!event) return;
    
    if (editId) {
        // Edit existing review
        const reviewIndex = reviews.findIndex(r => r.id === editId);
        const eventReviewIndex = event.reviews.findIndex(r => r.id === editId);
        
        if (reviewIndex !== -1 && eventReviewIndex !== -1) {
            reviews[reviewIndex].rating = rating;
            reviews[reviewIndex].comment = comment;
            reviews[reviewIndex].updatedAt = new Date();
            
            event.reviews[eventReviewIndex].rating = rating;
            event.reviews[eventReviewIndex].comment = comment;
            event.reviews[eventReviewIndex].updatedAt = new Date();
        }
    } else {
        // Create new review
        const review = {
            id: reviewIdCounter++,
            eventId: eventId,
            rating: rating,
            comment: comment,
            reviewerName: 'User', // In real app, this would be the logged-in user's name
            createdAt: new Date()
        };
        
        reviews.push(review);
        event.reviews.push(review);
    }
    
    // Recalculate average rating
    event.averageRating = event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length;
    
    // Update organizer stats
    updateOrganizerStats(event.organizerId);
    
    writeReviewModal.style.display = 'none';
    alert(editId ? 'Review berhasil diperbarui!' : 'Review berhasil dikirim!');
    
    // Refresh event display
    displayEvents(events);
}

function updateOrganizerStats(organizerId) {
    const organizer = organizers.find(o => o.id === organizerId);
    if (!organizer) return;
    
    const organizerEvents = events.filter(e => e.organizerId === organizerId);
    const allReviews = organizerEvents.flatMap(e => e.reviews);
    
    if (allReviews.length > 0) {
        organizer.averageRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;
        organizer.totalReviews = allReviews.length;
    }
}

function showMyReviews() {
    const modalBody = document.getElementById('transactionModalBody');
    
    if (reviews.length === 0) {
        modalBody.innerHTML = `
            <h2>Review Saya</h2>
            <p style="text-align: center; color: #666; margin: 2rem 0;">Belum ada review yang ditulis.</p>
        `;
    } else {
        const reviewsList = reviews.map(review => {
            const event = events.find(e => e.id === review.eventId);
            return `
                <div class="review-item">
                    <div class="review-header">
                        <h4>${event ? event.title : 'Event tidak ditemukan'}</h4>
                        <span class="review-date">${new Date(review.createdAt).toLocaleDateString('id-ID')}</span>
                    </div>
                    <div class="rating-display">
                        ${generateStarDisplay(review.rating)}
                        <span class="rating-number">${review.rating}/5</span>
                    </div>
                    <div class="review-comment">${review.comment}</div>
                    <button class="review-button" onclick="editReview(${review.id})">Edit Review</button>
                </div>
            `;
        }).join('');
        
        modalBody.innerHTML = `
            <h2>Review Saya</h2>
            <div class="review-section">
                ${reviewsList}
            </div>
        `;
    }
    
    transactionModal.style.display = 'block';
}

// Event Listeners for Review System
document.addEventListener('DOMContentLoaded', function() {
    // Star rating interaction
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.getElementById('reviewRating').value = rating;
            
            // Update visual feedback
            document.querySelectorAll('.star').forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
        
        star.addEventListener('mouseover', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            document.querySelectorAll('.star').forEach((s, index) => {
                if (index < rating) {
                    s.style.color = '#ffd700';
                } else {
                    s.style.color = '#ddd';
                }
            });
        });
    });
    
    // Write review form submission
    if (writeReviewForm) {
        writeReviewForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const eventId = parseInt(document.getElementById('reviewEventId').value);
            const rating = parseInt(document.getElementById('reviewRating').value);
            const comment = document.getElementById('reviewComment').value.trim();
            const editId = this.getAttribute('data-edit-id');
            
            if (!rating) {
                alert('Silakan pilih rating!');
                return;
            }
            
            if (!comment) {
                alert('Silakan tulis komentar!');
                return;
            }
            
            submitReview(eventId, rating, comment, editId ? parseInt(editId) : null);
            
            // Reset form
            this.removeAttribute('data-edit-id');
            this.reset();
        });
    }
});

// Initialize sample reviews for demonstration
function initializeSampleReviews() {
    // Add sample reviews to events
    const sampleReviews = [
        {
            id: 1,
            eventId: 1,
            rating: 5,
            comment: "Event yang luar biasa! Musiknya sangat bagus dan suasananya sangat menyenangkan. Pasti akan datang lagi tahun depan!",
            reviewerName: "Ahmad Rizki",
            createdAt: new Date('2024-12-01')
        },
        {
            id: 2,
            eventId: 1,
            rating: 4,
            comment: "Konser jazz yang berkualitas tinggi. Sound system bagus, hanya saja tempat parkir agak terbatas.",
            reviewerName: "Sari Dewi",
            createdAt: new Date('2024-12-02')
        },
        {
            id: 3,
            eventId: 2,
            rating: 5,
            comment: "Workshop yang sangat bermanfaat! Materinya up-to-date dan instrukturnya sangat kompeten. Highly recommended!",
            reviewerName: "Budi Santoso",
            createdAt: new Date('2024-12-03')
        },
        {
            id: 4,
            eventId: 3,
            rating: 4,
            comment: "Marathon yang well-organized. Rute bagus dan support station lengkap. Cuma cuacanya agak panas.",
            reviewerName: "Lisa Permata",
            createdAt: new Date('2024-12-04')
        }
    ];
    
    // Add reviews to events and calculate ratings
    sampleReviews.forEach(review => {
        const event = events.find(e => e.id === review.eventId);
        if (event) {
            event.reviews.push(review);
        }
    });
    
    // Calculate average ratings
    events.forEach(event => {
        if (event.reviews.length > 0) {
            event.averageRating = event.reviews.reduce((sum, r) => sum + r.rating, 0) / event.reviews.length;
        }
    });
    
    // Update organizer stats
    organizers.forEach(organizer => {
        updateOrganizerStats(organizer.id);
    });
    
    // Add sample completed transaction so user can write reviews
    const sampleTransaction = {
        id: 999,
        eventId: 1,
        eventTitle: "Konser Musik Jazz Malam",
        quantity: 1,
        originalPrice: 250000,
        pointsUsed: 0,
        finalPrice: 250000,
        status: TRANSACTION_STATUS.DONE,
        createdAt: new Date('2024-11-15'),
        paymentProof: 'sample_proof.jpg'
    };
    
    transactions.push(sampleTransaction);
}

// Authentication System Functions
function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function showLogin() {
    loginModal.style.display = 'block';
}

function showRegister() {
    registerModal.style.display = 'block';
}

function login(email, password) {
    const user = users.find(u => u.email === email && u.password === password);
    if (user) {
        currentUser = user;
        userPoints = user.points;
        saveUserData();
        updateAuthUI();
        updatePointsDisplay();
        loginModal.style.display = 'none';
        alert(`Selamat datang, ${user.name}!`);
        return true;
    }
    return false;
}

function register(userData) {
    // Check if email already exists
    if (users.find(u => u.email === userData.email)) {
        return { success: false, message: 'Email sudah terdaftar!' };
    }
    
    // Validate referral code if provided
    let referrer = null;
    if (userData.referralCode) {
        referrer = users.find(u => u.referralCode === userData.referralCode);
        if (!referrer) {
            return { success: false, message: 'Kode referral tidak valid!' };
        }
    }
    
    // Create new user
    const newUser = {
        id: userIdCounter++,
        name: userData.name,
        email: userData.email,
        password: userData.password,
        role: userData.role,
        referralCode: generateReferralCode(),
        referredBy: referrer ? referrer.id : null,
        points: userData.role === 'customer' ? 50000 : 0, // Customers get starting points
        createdAt: new Date(),
        totalReferrals: 0
    };
    
    users.push(newUser);
    
    // Give bonus points to referrer
    if (referrer) {
        referrer.points += 25000; // Referral bonus
        referrer.totalReferrals++;
    }
    
    // Auto login after registration
    currentUser = newUser;
    userPoints = newUser.points;
    saveUserData();
    updateAuthUI();
    updatePointsDisplay();
    
    return { success: true, message: 'Akun berhasil dibuat!' };
}

function logout() {
    currentUser = null;
    userPoints = 0;
    saveUserData();
    updateAuthUI();
    updatePointsDisplay();
    
    // Clear user-specific data
    transactions = [];
    reviews = [];
    
    alert('Anda telah logout.');
}

function updateAuthUI() {
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    const dashboardLink = document.getElementById('dashboardLink');
    const transactionsLink = document.getElementById('transactionsLink');
    const reviewsLink = document.getElementById('reviewsLink');
    const createEventBtn = document.getElementById('createEventBtn');
    const pointsDisplay = document.getElementById('pointsDisplay');
    
    if (currentUser) {
        // User is logged in
        loginBtn.style.display = 'none';
        registerBtn.style.display = 'none';
        logoutBtn.style.display = 'block';
        
        if (currentUser.role === 'organizer') {
            // Organizer specific UI
            dashboardLink.style.display = 'block';
            createEventBtn.style.display = 'block';
            transactionsLink.style.display = 'none';
            reviewsLink.style.display = 'none';
            pointsDisplay.style.display = 'none';
        } else {
            // Customer specific UI
            dashboardLink.style.display = 'none';
            createEventBtn.style.display = 'none';
            transactionsLink.style.display = 'block';
            reviewsLink.style.display = 'block';
            pointsDisplay.style.display = 'block';
        }
        
        // Update user info in navigation
        logoutBtn.innerHTML = `<span onclick="showProfile(); event.stopPropagation();">${currentUser.name}</span> | Logout`;
    } else {
        // User is not logged in
        loginBtn.style.display = 'block';
        registerBtn.style.display = 'block';
        logoutBtn.style.display = 'none';
        dashboardLink.style.display = 'none';
        transactionsLink.style.display = 'none';
        reviewsLink.style.display = 'none';
        createEventBtn.style.display = 'none';
        pointsDisplay.style.display = 'none';
    }
}

function requireAuth(action) {
    if (!currentUser) {
        alert('Anda harus login terlebih dahulu!');
        showLogin();
        return false;
    }
    return true;
}

function requireRole(requiredRole) {
    if (!currentUser) {
        alert('Anda harus login terlebih dahulu!');
        showLogin();
        return false;
    }
    
    if (currentUser.role !== requiredRole) {
        alert(`Akses ditolak! Fitur ini hanya untuk ${requiredRole}.`);
        return false;
    }
    
    return true;
}

function showProfile() {
    if (!requireAuth()) return;
    
    const modalBody = document.getElementById('profileModalBody');
    modalBody.innerHTML = `
        <h2>Profil Pengguna</h2>
        <div class="user-info">
            <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
            <div>
                <h3>${currentUser.name}</h3>
                <span class="role-badge ${currentUser.role}">${currentUser.role}</span>
            </div>
        </div>
        
        <div style="margin-top: 1.5rem;">
            <p><strong>Email:</strong> ${currentUser.email}</p>
            <p><strong>Points:</strong> ${currentUser.points.toLocaleString('id-ID')}</p>
            <p><strong>Bergabung:</strong> ${new Date(currentUser.createdAt).toLocaleDateString('id-ID')}</p>
        </div>
        
        <div class="referral-section">
            <h4>Kode Referral Anda</h4>
            <p>Bagikan kode ini untuk mendapatkan bonus 25,000 points setiap ada yang mendaftar!</p>
            <div>
                <span class="referral-code">${currentUser.referralCode}</span>
                <button class="copy-button" onclick="copyReferralCode()">Copy</button>
            </div>
            <p><strong>Total Referral:</strong> ${currentUser.totalReferrals} orang</p>
        </div>
    `;
    
    profileModal.style.display = 'block';
}

function copyReferralCode() {
    navigator.clipboard.writeText(currentUser.referralCode).then(() => {
        alert('Kode referral berhasil disalin!');
    });
}

function saveUserData() {
    localStorage.setItem('eventku_users', JSON.stringify(users));
    localStorage.setItem('eventku_current_user', JSON.stringify(currentUser));
}

function loadUserData() {
    const savedUsers = localStorage.getItem('eventku_users');
    const savedCurrentUser = localStorage.getItem('eventku_current_user');
    
    if (savedUsers) {
        users = JSON.parse(savedUsers);
        userIdCounter = Math.max(...users.map(u => u.id), 0) + 1;
    }
    
    if (savedCurrentUser) {
        currentUser = JSON.parse(savedCurrentUser);
        if (currentUser) {
            userPoints = currentUser.points;
        }
    }
    
    // Initialize with sample users if empty
    if (users.length === 0) {
        initializeSampleUsers();
    }
}

function initializeSampleUsers() {
    const sampleUsers = [
        {
            id: 1,
            name: "Admin EventKu",
            email: "admin@eventku.com",
            password: "admin123",
            role: "organizer",
            referralCode: "ADMIN001",
            referredBy: null,
            points: 0,
            createdAt: new Date('2024-01-01'),
            totalReferrals: 5
        },
        {
            id: 2,
            name: "Customer Demo",
            email: "customer@demo.com",
            password: "demo123",
            role: "customer",
            referralCode: "CUST001",
            referredBy: null,
            points: 75000,
            createdAt: new Date('2024-06-01'),
            totalReferrals: 2
        }
    ];
    
    users = sampleUsers;
    userIdCounter = 3;
    saveUserData();
}

function initializeAuthEventListeners() {
    // Login form
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            if (login(email, password)) {
                this.reset();
            } else {
                alert('Email atau password salah!');
            }
        });
    }
    
    // Register form
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('registerConfirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Password tidak cocok!');
                return;
            }
            
            const userData = {
                name: document.getElementById('registerName').value,
                email: document.getElementById('registerEmail').value,
                password: password,
                role: document.getElementById('registerRole').value,
                referralCode: document.getElementById('referralCode').value.trim()
            };
            
            const result = register(userData);
            if (result.success) {
                alert(result.message);
                registerModal.style.display = 'none';
                this.reset();
            } else {
                alert(result.message);
            }
        });
    }
}

// Override existing functions to require authentication
const originalStartTransaction = startTransaction;
startTransaction = function(eventId) {
    if (!requireAuth()) return;
    if (!requireRole('customer')) return;
    originalStartTransaction(eventId);
};

const originalShowWriteReview = showWriteReview;
showWriteReview = function(eventId) {
    if (!requireAuth()) return;
    if (!requireRole('customer')) return;
    originalShowWriteReview(eventId);
};

const originalShowMyTransactions = showMyTransactions;
showMyTransactions = function() {
    if (!requireAuth()) return;
    originalShowMyTransactions();
};

const originalShowMyReviews = showMyReviews;
showMyReviews = function() {
    if (!requireAuth()) return;
    originalShowMyReviews();
};

// Update create event to require organizer role
createEventBtn.addEventListener('click', (e) => {
    e.preventDefault();
    if (!requireAuth()) return;
    if (!requireRole('organizer')) return;
    createEventModal.style.display = 'block';
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
});

// Dashboard System Functions
function showDashboard() {
    if (!requireRole('organizer')) return;
    
    const modalBody = document.getElementById('dashboardModalBody');
    modalBody.innerHTML = `
        <div class="dashboard-header">
            <h2>Dashboard Organizer</h2>
            <div class="user-info">
                <div class="user-avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
                <span>${currentUser.name}</span>
            </div>
        </div>
        
        <div class="dashboard-tabs">
            <button class="dashboard-tab active" onclick="showDashboardTab('overview')">Overview</button>
            <button class="dashboard-tab" onclick="showDashboardTab('events')">Kelola Event</button>
            <button class="dashboard-tab" onclick="showDashboardTab('transactions')">Transaksi</button>
            <button class="dashboard-tab" onclick="showDashboardTab('statistics')">Statistik</button>
        </div>
        
        <div class="dashboard-content" id="dashboardContent">
            <!-- Content will be loaded here -->
        </div>
    `;
    
    dashboardModal.style.display = 'block';
    showDashboardTab('overview');
}

function showDashboardTab(tab) {
    // Update active tab
    document.querySelectorAll('.dashboard-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    
    const content = document.getElementById('dashboardContent');
    
    switch(tab) {
        case 'overview':
            showDashboardOverview(content);
            break;
        case 'events':
            showEventManagement(content);
            break;
        case 'transactions':
            showTransactionManagement(content);
            break;
        case 'statistics':
            showStatistics(content);
            break;
    }
}

function showDashboardOverview(content) {
    const organizerEvents = events.filter(e => e.organizerId === currentUser.id);
    const organizerTransactions = getAllTransactions().filter(t => {
        const event = events.find(e => e.id === t.eventId);
        return event && event.organizerId === currentUser.id;
    });
    
    const totalRevenue = organizerTransactions
        .filter(t => t.status === TRANSACTION_STATUS.DONE)
        .reduce((sum, t) => sum + t.finalPrice, 0);
    
    const totalCustomers = new Set(organizerTransactions
        .filter(t => t.status === TRANSACTION_STATUS.DONE)
        .map(t => t.userId)).size;
    
    const pendingTransactions = organizerTransactions
        .filter(t => t.status === TRANSACTION_STATUS.WAITING_CONFIRMATION).length;
    
    content.innerHTML = `
        <div class="stats-grid">
            <div class="stat-card events">
                <h3>${organizerEvents.length}</h3>
                <p>Total Event</p>
            </div>
            <div class="stat-card revenue">
                <h3>Rp ${totalRevenue.toLocaleString('id-ID')}</h3>
                <p>Total Pendapatan</p>
            </div>
            <div class="stat-card customers">
                <h3>${totalCustomers}</h3>
                <p>Total Customer</p>
            </div>
            <div class="stat-card">
                <h3>${pendingTransactions}</h3>
                <p>Transaksi Pending</p>
            </div>
        </div>
        
        <div class="chart-container">
            <h3>Event Terpopuler</h3>
            ${generatePopularEventsChart(organizerEvents, organizerTransactions)}
        </div>
        
        <div class="chart-container">
            <h3>Transaksi Terbaru</h3>
            ${generateRecentTransactionsTable(organizerTransactions.slice(-5))}
        </div>
    `;
}

function showEventManagement(content) {
    const organizerEvents = events.filter(e => e.organizerId === currentUser.id);
    
    content.innerHTML = `
        <div class="filter-section">
            <select id="eventStatusFilter" onchange="filterEventManagement()">
                <option value="">Semua Status</option>
                <option value="active">Aktif</option>
                <option value="past">Selesai</option>
            </select>
            <input type="text" id="eventSearchFilter" placeholder="Cari event..." onkeyup="filterEventManagement()">
        </div>
        
        <div class="event-management-grid" id="eventManagementGrid">
            ${organizerEvents.map(event => generateEventManagementCard(event)).join('')}
        </div>
    `;
}

function generateEventManagementCard(event) {
    const eventTransactions = getAllTransactions().filter(t => t.eventId === event.id);
    const soldTickets = eventTransactions
        .filter(t => t.status === TRANSACTION_STATUS.DONE)
        .reduce((sum, t) => sum + t.quantity, 0);
    const revenue = eventTransactions
        .filter(t => t.status === TRANSACTION_STATUS.DONE)
        .reduce((sum, t) => sum + t.finalPrice, 0);
    
    const isActive = new Date(event.date) > new Date();
    
    return `
        <div class="event-management-card">
            <div class="event-management-header">
                <div>
                    <h3 class="event-management-title">${event.title}</h3>
                    <p style="color: #666; margin: 0.5rem 0;">
                        📅 ${formatDate(event.date)} • ${event.time} WIB<br>
                        📍 ${event.location}
                    </p>
                    <span class="role-badge ${isActive ? 'organizer' : ''}">${isActive ? 'Aktif' : 'Selesai'}</span>
                </div>
                <div class="event-management-actions">
                    <button class="btn-small btn-edit" onclick="editEvent(${event.id})">Edit</button>
                    <button class="btn-small btn-attendees" onclick="showAttendees(${event.id})">Peserta</button>
                    <button class="btn-small btn-delete" onclick="deleteEvent(${event.id})">Hapus</button>
                </div>
            </div>
            
            <div class="event-stats">
                <div class="event-stat">
                    <div class="event-stat-number">${soldTickets}</div>
                    <div class="event-stat-label">Tiket Terjual</div>
                </div>
                <div class="event-stat">
                    <div class="event-stat-number">${event.availableSeats}</div>
                    <div class="event-stat-label">Sisa Kursi</div>
                </div>
                <div class="event-stat">
                    <div class="event-stat-number">Rp ${revenue.toLocaleString('id-ID')}</div>
                    <div class="event-stat-label">Pendapatan</div>
                </div>
                <div class="event-stat">
                    <div class="event-stat-number">${event.averageRating.toFixed(1)}</div>
                    <div class="event-stat-label">Rating</div>
                </div>
            </div>
        </div>
    `;
}

function showTransactionManagement(content) {
    const organizerTransactions = getAllTransactions().filter(t => {
        const event = events.find(e => e.id === t.eventId);
        return event && event.organizerId === currentUser.id;
    });
    
    const pendingTransactions = organizerTransactions.filter(t => 
        t.status === TRANSACTION_STATUS.WAITING_CONFIRMATION
    );
    
    content.innerHTML = `
        <div class="filter-section">
            <select id="transactionStatusFilter" onchange="filterTransactionManagement()">
                <option value="">Semua Status</option>
                <option value="waiting_confirmation">Menunggu Konfirmasi</option>
                <option value="done">Selesai</option>
                <option value="rejected">Ditolak</option>
            </select>
            <select id="transactionEventFilter" onchange="filterTransactionManagement()">
                <option value="">Semua Event</option>
                ${events.filter(e => e.organizerId === currentUser.id).map(e => 
                    `<option value="${e.id}">${e.title}</option>`
                ).join('')}
            </select>
        </div>
        
        <h3>Transaksi Menunggu Konfirmasi ${pendingTransactions.length > 0 ? `<span class="notification-badge">${pendingTransactions.length}</span>` : ''}</h3>
        
        <table class="transaction-management-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Event</th>
                    <th>Jumlah</th>
                    <th>Total</th>
                    <th>Bukti Bayar</th>
                    <th>Status</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody id="transactionManagementTable">
                ${organizerTransactions.map(t => generateTransactionRow(t)).join('')}
            </tbody>
        </table>
    `;
}

function generateTransactionRow(transaction) {
    const event = events.find(e => e.id === transaction.eventId);
    const customer = users.find(u => u.id === transaction.userId) || { name: 'Unknown User' };
    
    return `
        <tr>
            <td>#${transaction.id}</td>
            <td>${customer.name}</td>
            <td>${event ? event.title : 'Unknown Event'}</td>
            <td>${transaction.quantity} tiket</td>
            <td>Rp ${transaction.finalPrice.toLocaleString('id-ID')}</td>
            <td>
                ${transaction.paymentProof ? 
                    `<img src="#" alt="Bukti Bayar" class="payment-proof" onclick="alert('Bukti: ${transaction.paymentProof}')">` : 
                    '-'
                }
            </td>
            <td><span class="status ${getStatusClass(transaction.status)}">${getStatusText(transaction.status)}</span></td>
            <td>
                ${transaction.status === TRANSACTION_STATUS.WAITING_CONFIRMATION ? `
                    <div class="transaction-actions">
                        <button class="btn-approve" onclick="approveTransactionDashboard(${transaction.id})">Terima</button>
                        <button class="btn-reject" onclick="rejectTransactionDashboard(${transaction.id})">Tolak</button>
                    </div>
                ` : '-'}
            </td>
        </tr>
    `;
}

function showStatistics(content) {
    const organizerEvents = events.filter(e => e.organizerId === currentUser.id);
    const organizerTransactions = getAllTransactions().filter(t => {
        const event = events.find(e => e.id === t.eventId);
        return event && event.organizerId === currentUser.id;
    });
    
    content.innerHTML = `
        <div class="filter-section">
            <select id="statsTimeFilter" onchange="updateStatistics()">
                <option value="year">Per Tahun</option>
                <option value="month">Per Bulan</option>
                <option value="day">Per Hari</option>
            </select>
            <input type="month" id="statsMonthFilter" onchange="updateStatistics()">
        </div>
        
        <div class="chart-container">
            <h3>Pendapatan</h3>
            <div id="revenueChart">${generateRevenueChart(organizerTransactions)}</div>
        </div>
        
        <div class="chart-container">
            <h3>Penjualan Tiket</h3>
            <div id="ticketChart">${generateTicketChart(organizerTransactions)}</div>
        </div>
        
        <div class="chart-container">
            <h3>Event Performance</h3>
            <div id="performanceChart">${generateEventPerformanceChart(organizerEvents, organizerTransactions)}</div>
        </div>
    `;
}

function generateRevenueChart(transactions) {
    const monthlyRevenue = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    for (let i = 1; i <= 12; i++) {
        monthlyRevenue[i] = 0;
    }
    
    // Calculate revenue by month
    transactions
        .filter(t => t.status === TRANSACTION_STATUS.DONE)
        .forEach(t => {
            const date = new Date(t.createdAt);
            if (date.getFullYear() === currentYear) {
                monthlyRevenue[date.getMonth() + 1] += t.finalPrice;
            }
        });
    
    const maxRevenue = Math.max(...Object.values(monthlyRevenue));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `
        <div class="chart">
            ${Object.entries(monthlyRevenue).map(([month, revenue]) => `
                <div class="chart-bar" 
                     style="height: ${maxRevenue > 0 ? (revenue / maxRevenue) * 250 : 0}px"
                     data-value="${(revenue / 1000000).toFixed(1)}M"></div>
            `).join('')}
        </div>
        <div class="chart-labels">
            ${months.map(month => `<div class="chart-label">${month}</div>`).join('')}
        </div>
    `;
}

function generateTicketChart(transactions) {
    const monthlyTickets = {};
    const currentYear = new Date().getFullYear();
    
    // Initialize months
    for (let i = 1; i <= 12; i++) {
        monthlyTickets[i] = 0;
    }
    
    // Calculate tickets by month
    transactions
        .filter(t => t.status === TRANSACTION_STATUS.DONE)
        .forEach(t => {
            const date = new Date(t.createdAt);
            if (date.getFullYear() === currentYear) {
                monthlyTickets[date.getMonth() + 1] += t.quantity;
            }
        });
    
    const maxTickets = Math.max(...Object.values(monthlyTickets));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    
    return `
        <div class="chart">
            ${Object.entries(monthlyTickets).map(([month, tickets]) => `
                <div class="chart-bar" 
                     style="height: ${maxTickets > 0 ? (tickets / maxTickets) * 250 : 0}px"
                     data-value="${tickets}"></div>
            `).join('')}
        </div>
        <div class="chart-labels">
            ${months.map(month => `<div class="chart-label">${month}</div>`).join('')}
        </div>
    `;
}

function generateEventPerformanceChart(events, transactions) {
    return events.map(event => {
        const eventTransactions = transactions.filter(t => t.eventId === event.id && t.status === TRANSACTION_STATUS.DONE);
        const soldTickets = eventTransactions.reduce((sum, t) => sum + t.quantity, 0);
        const totalSeats = soldTickets + event.availableSeats;
        const occupancyRate = totalSeats > 0 ? (soldTickets / totalSeats) * 100 : 0;
        
        return `
            <div class="event-stat" style="margin-bottom: 1rem; padding: 1rem; border: 1px solid #ddd; border-radius: 5px;">
                <h4 style="margin: 0 0 0.5rem 0;">${event.title}</h4>
                <div style="display: flex; justify-content: space-between;">
                    <span>Occupancy: ${occupancyRate.toFixed(1)}%</span>
                    <span>Rating: ${event.averageRating.toFixed(1)}/5</span>
                </div>
                <div style="background: #f0f0f0; height: 10px; border-radius: 5px; margin-top: 0.5rem;">
                    <div style="background: var(--primary-color); height: 100%; width: ${occupancyRate}%; border-radius: 5px;"></div>
                </div>
            </div>
        `;
    }).join('');
}

function generatePopularEventsChart(events, transactions) {
    const eventPopularity = events.map(event => {
        const eventTransactions = transactions.filter(t => t.eventId === event.id && t.status === TRANSACTION_STATUS.DONE);
        const soldTickets = eventTransactions.reduce((sum, t) => sum + t.quantity, 0);
        return { event, soldTickets };
    }).sort((a, b) => b.soldTickets - a.soldTickets).slice(0, 5);
    
    if (eventPopularity.length === 0) {
        return '<p style="text-align: center; color: #666;">Belum ada data penjualan tiket.</p>';
    }
    
    const maxTickets = eventPopularity[0].soldTickets;
    
    return `
        <div class="chart">
            ${eventPopularity.map(({ event, soldTickets }) => `
                <div class="chart-bar" 
                     style="height: ${maxTickets > 0 ? (soldTickets / maxTickets) * 200 : 0}px"
                     data-value="${soldTickets}"></div>
            `).join('')}
        </div>
        <div class="chart-labels">
            ${eventPopularity.map(({ event }) => `
                <div class="chart-label" style="font-size: 0.7rem;">${event.title.substring(0, 10)}...</div>
            `).join('')}
        </div>
    `;
}

function generateRecentTransactionsTable(transactions) {
    if (transactions.length === 0) {
        return '<p style="text-align: center; color: #666;">Belum ada transaksi.</p>';
    }
    
    return `
        <table class="transaction-management-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Customer</th>
                    <th>Event</th>
                    <th>Total</th>
                    <th>Status</th>
                    <th>Tanggal</th>
                </tr>
            </thead>
            <tbody>
                ${transactions.map(t => {
                    const event = events.find(e => e.id === t.eventId);
                    const customer = users.find(u => u.id === t.userId) || { name: 'Unknown User' };
                    return `
                        <tr>
                            <td>#${t.id}</td>
                            <td>${customer.name}</td>
                            <td>${event ? event.title : 'Unknown Event'}</td>
                            <td>Rp ${t.finalPrice.toLocaleString('id-ID')}</td>
                            <td><span class="status ${getStatusClass(t.status)}">${getStatusText(t.status)}</span></td>
                            <td>${new Date(t.createdAt).toLocaleDateString('id-ID')}</td>
                        </tr>
                    `;
                }).join('')}
            </tbody>
        </table>
    `;
}

// Event Management Functions
function editEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.organizerId !== currentUser.id) {
        alert('Event tidak ditemukan atau Anda tidak memiliki akses!');
        return;
    }
    
    // Populate form
    document.getElementById('editEventId').value = event.id;
    document.getElementById('editEventTitle').value = event.title;
    document.getElementById('editEventDate').value = event.date;
    document.getElementById('editEventTime').value = event.time;
    document.getElementById('editEventLocation').value = event.location;
    document.getElementById('editEventCategory').value = event.category;
    document.getElementById('editEventPrice').value = event.price;
    document.getElementById('editEventSeats').value = event.availableSeats;
    document.getElementById('editEventDescription').value = event.description;
    
    editEventModal.style.display = 'block';
}

function deleteEvent(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.organizerId !== currentUser.id) {
        alert('Event tidak ditemukan atau Anda tidak memiliki akses!');
        return;
    }
    
    // Check if there are active transactions
    const activeTransactions = getAllTransactions().filter(t => 
        t.eventId === eventId && 
        (t.status === TRANSACTION_STATUS.WAITING_PAYMENT || t.status === TRANSACTION_STATUS.WAITING_CONFIRMATION)
    );
    
    if (activeTransactions.length > 0) {
        alert('Tidak dapat menghapus event yang memiliki transaksi aktif!');
        return;
    }
    
    if (confirm(`Apakah Anda yakin ingin menghapus event "${event.title}"?`)) {
        const eventIndex = events.findIndex(e => e.id === eventId);
        events.splice(eventIndex, 1);
        
        // Refresh dashboard
        showDashboardTab('events');
        displayEvents(events);
        
        alert('Event berhasil dihapus!');
    }
}

function showAttendees(eventId) {
    const event = events.find(e => e.id === eventId);
    if (!event || event.organizerId !== currentUser.id) {
        alert('Event tidak ditemukan atau Anda tidak memiliki akses!');
        return;
    }
    
    const eventTransactions = getAllTransactions().filter(t => 
        t.eventId === eventId && t.status === TRANSACTION_STATUS.DONE
    );
    
    const modalBody = document.getElementById('attendeeModalBody');
    modalBody.innerHTML = `
        <h2>Daftar Peserta: ${event.title}</h2>
        <p><strong>Total Peserta:</strong> ${eventTransactions.reduce((sum, t) => sum + t.quantity, 0)} orang</p>
        
        <div class="attendee-list">
            ${eventTransactions.length === 0 ? 
                '<p style="text-align: center; color: #666;">Belum ada peserta yang terdaftar.</p>' :
                eventTransactions.map(t => {
                    const customer = users.find(u => u.id === t.userId) || { name: 'Unknown User', email: 'unknown@email.com' };
                    return `
                        <div class="attendee-item">
                            <div class="attendee-info">
                                <h4>${customer.name}</h4>
                                <p>📧 ${customer.email}</p>
                                <p>📅 ${new Date(t.createdAt).toLocaleDateString('id-ID')}</p>
                            </div>
                            <div class="attendee-stats">
                                <p><strong>${t.quantity} tiket</strong></p>
                                <p class="price">Rp ${t.finalPrice.toLocaleString('id-ID')}</p>
                                ${t.pointsUsed > 0 ? `<p style="color: #666; font-size: 0.8rem;">Points: ${t.pointsUsed.toLocaleString('id-ID')}</p>` : ''}
                            </div>
                        </div>
                    `;
                }).join('')
            }
        </div>
    `;
    
    attendeeModal.style.display = 'block';
}

// Transaction Management Functions
function approveTransactionDashboard(transactionId) {
    const transaction = getAllTransactions().find(t => t.id === transactionId);
    if (!transaction) {
        alert('Transaksi tidak ditemukan!');
        return;
    }
    
    const event = events.find(e => e.id === transaction.eventId);
    if (!event || event.organizerId !== currentUser.id) {
        alert('Anda tidak memiliki akses untuk transaksi ini!');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menerima transaksi ini?')) {
        transaction.status = TRANSACTION_STATUS.DONE;
        clearTransactionTimer(transactionId);
        
        // Send notification email (simulated)
        sendNotificationEmail(transaction.userId, 'approved', transaction);
        
        // Refresh transaction management
        showDashboardTab('transactions');
        
        alert('Transaksi berhasil diterima! Notifikasi email telah dikirim ke customer.');
    }
}

function rejectTransactionDashboard(transactionId) {
    const transaction = getAllTransactions().find(t => t.id === transactionId);
    if (!transaction) {
        alert('Transaksi tidak ditemukan!');
        return;
    }
    
    const event = events.find(e => e.id === transaction.eventId);
    if (!event || event.organizerId !== currentUser.id) {
        alert('Anda tidak memiliki akses untuk transaksi ini!');
        return;
    }
    
    if (confirm('Apakah Anda yakin ingin menolak transaksi ini? Points dan kursi akan dikembalikan.')) {
        // Rollback: restore seats and points
        event.availableSeats += transaction.quantity;
        
        const customer = users.find(u => u.id === transaction.userId);
        if (customer) {
            customer.points += transaction.pointsUsed;
        }
        
        transaction.status = TRANSACTION_STATUS.REJECTED;
        clearTransactionTimer(transactionId);
        
        // Send notification email (simulated)
        sendNotificationEmail(transaction.userId, 'rejected', transaction);
        
        // Save data
        saveUserData();
        saveTransactionsToStorage();
        
        // Refresh transaction management
        showDashboardTab('transactions');
        
        alert('Transaksi berhasil ditolak! Points dan kursi telah dikembalikan. Notifikasi email telah dikirim ke customer.');
    }
}

function sendNotificationEmail(userId, status, transaction) {
    // Simulate email notification
    const customer = users.find(u => u.id === userId);
    const event = events.find(e => e.id === transaction.eventId);
    
    if (!customer || !event) return;
    
    const emailContent = status === 'approved' ? 
        `Selamat! Pembayaran Anda untuk event "${event.title}" telah diterima. Silakan datang pada ${formatDate(event.date)} pukul ${event.time} WIB di ${event.location}.` :
        `Maaf, pembayaran Anda untuk event "${event.title}" ditolak. Points sebesar ${transaction.pointsUsed.toLocaleString('id-ID')} telah dikembalikan ke akun Anda.`;
    
    console.log(`📧 Email sent to ${customer.email}:`);
    console.log(`Subject: ${status === 'approved' ? 'Pembayaran Diterima' : 'Pembayaran Ditolak'} - ${event.title}`);
    console.log(`Content: ${emailContent}`);
    
    // In a real application, this would integrate with an email service
}

function getAllTransactions() {
    // Get all transactions from localStorage for all users
    const allTransactions = [];
    const savedTransactions = localStorage.getItem('eventku_transactions');
    
    if (savedTransactions) {
        allTransactions.push(...JSON.parse(savedTransactions));
    }
    
    // Add current user's transactions
    allTransactions.push(...transactions);
    
    // Remove duplicates based on ID
    const uniqueTransactions = allTransactions.filter((transaction, index, self) =>
        index === self.findIndex(t => t.id === transaction.id)
    );
    
    return uniqueTransactions;
}

// Event Listeners for Dashboard
if (editEventForm) {
    editEventForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const eventId = parseInt(document.getElementById('editEventId').value);
        const event = events.find(e => e.id === eventId);
        
        if (!event || event.organizerId !== currentUser.id) {
            alert('Event tidak ditemukan atau Anda tidak memiliki akses!');
            return;
        }
        
        // Update event data
        event.title = document.getElementById('editEventTitle').value;
        event.date = document.getElementById('editEventDate').value;
        event.time = document.getElementById('editEventTime').value;
        event.location = document.getElementById('editEventLocation').value;
        event.category = document.getElementById('editEventCategory').value;
        event.price = parseInt(document.getElementById('editEventPrice').value) || 0;
        event.availableSeats = parseInt(document.getElementById('editEventSeats').value) || 100;
        event.description = document.getElementById('editEventDescription').value;
        event.icon = getCategoryIcon(event.category);
        
        // Save and refresh
        localStorage.setItem('eventku_events', JSON.stringify(events));
        displayEvents(events);
        editEventModal.style.display = 'none';
        
        // Refresh dashboard if open
        if (dashboardModal.style.display === 'block') {
            showDashboardTab('events');
        }
        
        alert('Event berhasil diperbarui!');
    });
}