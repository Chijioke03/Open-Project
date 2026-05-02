/* ============================================
   MARKETPLACE FUNCTIONALITY
   ============================================ */

// DOM Elements
const offerForm = document.getElementById('offer-form');
const offersList = document.getElementById('offers-list');
const noOffersMessage = document.getElementById('no-offers');
const messageContainer = document.getElementById('message-container');
const messageText = document.getElementById('message-text');

// ============================================
// INITIALIZATION
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    loadOffers();
    setupFormValidation();
});

// ============================================
// FORM HANDLING
// ============================================

offerForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(offerForm);
    const offer = {
        id: Date.now().toString(),
        type: formData.get('type'),
        amount: parseFloat(formData.get('amount')),
        interestRate: parseFloat(formData.get('interestRate')),
        duration: parseInt(formData.get('duration')),
        description: formData.get('description') || '',
        contactMethod: formData.get('contactMethod'),
        timestamp: new Date().toISOString(),
        userEmail: localStorage.getItem('userEmail') || 'Anonymous'
    };

    // Validate offer
    if (!validateOffer(offer)) {
        return;
    }

    // Save offer
    saveOffer(offer);

    // Reset form and show success
    offerForm.reset();
    showMessage('Offer posted successfully!', 'success');

    // Reload offers
    loadOffers();
});

// ============================================
// VALIDATION
// ============================================

function validateOffer(offer) {
    if (!offer.type || !offer.amount || !offer.interestRate || !offer.duration || !offer.contactMethod) {
        showMessage('Please fill in all required fields.', 'error');
        return false;
    }

    if (offer.amount < 100 || offer.amount > 100000) {
        showMessage('Amount must be between ₦1000 and ₦100,000.', 'error');
        return false;
    }

    if (offer.interestRate < 0 || offer.interestRate > 50) {
        showMessage('Interest rate must be between 0% and 50%.', 'error');
        return false;
    }

    if (offer.duration < 1 || offer.duration > 120) {
        showMessage('Duration must be between 1 and 120 months.', 'error');
        return false;
    }

    return true;
}

function setupFormValidation() {
    // Real-time validation for amount
    document.getElementById('amount').addEventListener('input', function(e) {
        const value = parseFloat(e.target.value);
        if (value < 100) {
            e.target.setCustomValidity('Minimum amount is ₦1000');
        } else if (value > 100000) {
            e.target.setCustomValidity('Maximum amount is ₦100,000');
        } else {
            e.target.setCustomValidity('');
        }
    });

    // Real-time validation for interest rate
    document.getElementById('interest-rate').addEventListener('input', function(e) {
        const value = parseFloat(e.target.value);
        if (value < 0) {
            e.target.setCustomValidity('Interest rate cannot be negative');
        } else if (value > 50) {
            e.target.setCustomValidity('Maximum interest rate is 50%');
        } else {
            e.target.setCustomValidity('');
        }
    });

    // Real-time validation for duration
    document.getElementById('duration').addEventListener('input', function(e) {
        const value = parseInt(e.target.value);
        if (value < 1) {
            e.target.setCustomValidity('Minimum duration is 1 month');
        } else if (value > 120) {
            e.target.setCustomValidity('Maximum duration is 120 months');
        } else {
            e.target.setCustomValidity('');
        }
    });
}

// ============================================
// DATA MANAGEMENT
// ============================================

function saveOffer(offer) {
    const offers = getOffers();
    offers.push(offer);
    localStorage.setItem('marketplace_offers', JSON.stringify(offers));
}

function getOffers() {
    const offers = localStorage.getItem('marketplace_offers');
    return offers ? JSON.parse(offers) : [];
}

function loadOffers() {
    const offers = getOffers();
    const filteredOffers = filterOffersList(offers);

    offersList.innerHTML = '';

    if (filteredOffers.length === 0) {
        noOffersMessage.style.display = 'block';
        return;
    }

    noOffersMessage.style.display = 'none';

    filteredOffers.forEach(offer => {
        const offerCard = createOfferCard(offer);
        offersList.appendChild(offerCard);
    });
}

function filterOffers() {
    loadOffers();
}

function filterOffersList(offers) {
    const filterType = document.getElementById('filter-type').value;
    const searchAmount = document.getElementById('search-amount').value.toLowerCase();

    return offers.filter(offer => {
        // Filter by type
        if (filterType !== 'all' && offer.type !== filterType) {
            return false;
        }

        // Filter by amount search
        if (searchAmount && !offer.amount.toString().includes(searchAmount)) {
            return false;
        }

        return true;
    }).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by newest first
}

// ============================================
// UI COMPONENTS
// ============================================

function createOfferCard(offer) {
    const card = document.createElement('div');
    card.className = 'offer-card';

    const typeText = offer.type === 'lend' ? 'Lending Offer' : 'Borrowing Request';
    const typeClass = offer.type === 'lend' ? 'lend' : 'borrow';

    card.innerHTML = `
        <div class="offer-header">
            <span class="offer-type ${typeClass}">${typeText}</span>
            <span class="timestamp">${formatTimestamp(offer.timestamp)}</span>
        </div>

        <div class="offer-amount">₦${offer.amount.toLocaleString()}</div>

        <div class="offer-details">
            <div class="detail-item">
                <span class="detail-label">Interest Rate</span>
                <span class="detail-value">${offer.interestRate}%</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Duration</span>
                <span class="detail-value">${offer.duration} months</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Monthly Payment</span>
                <span class="detail-value">₦${calculateMonthlyPayment(offer).toFixed(2)}</span>
            </div>
            <div class="detail-item">
                <span class="detail-label">Total Repayment</span>
                <span class="detail-value">₦${calculateTotalRepayment(offer).toFixed(2)}</span>
            </div>
        </div>

        ${offer.description ? `<div class="offer-description">${escapeHtml(offer.description)}</div>` : ''}

        <div class="offer-actions">
            <span class="contact-method">Contact via ${capitalizeFirst(offer.contactMethod)}</span>
            <button class="btn-contact" onclick="contactOffer('${offer.id}')">Contact</button>
        </div>
    `;

    return card;
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

function calculateMonthlyPayment(offer) {
    const principal = offer.amount;
    const monthlyRate = offer.interestRate / 100 / 12;
    const numPayments = offer.duration;

    if (monthlyRate === 0) {
        return principal / numPayments;
    }

    return principal * (monthlyRate * Math.pow(1 + monthlyRate, numPayments)) /
           (Math.pow(1 + monthlyRate, numPayments) - 1);
}

function calculateTotalRepayment(offer) {
    return calculateMonthlyPayment(offer) * offer.duration;
}

function formatTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
}

function capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// USER INTERACTIONS
// ============================================

function contactOffer(offerId) {
    const offers = getOffers();
    const offer = offers.find(o => o.id === offerId);

    if (!offer) {
        showMessage('Offer not found.', 'error');
        return;
    }

    // In a real app, this would open a chat or send a message
    // For now, we'll just show a contact message
    const contactMessage = `Contacting ${offer.userEmail} via ${capitalizeFirst(offer.contactMethod)} for ${offer.type === 'lend' ? 'lending' : 'borrowing'} offer of $${offer.amount.toLocaleString()}`;

    if (confirm(`${contactMessage}\n\nThis would normally open a chat or send a message. Continue?`)) {
        showMessage('Contact request sent! (This is a demo)', 'success');
    }
}

function logout() {
    if (confirm('Are you sure you want to logout?')) {
        localStorage.removeItem('userEmail');
        localStorage.removeItem('rememberMe');
        window.location.href = 'index.html';
    }
}

// ============================================
// MESSAGES
// ============================================

function showMessage(text, type) {
    messageText.textContent = text;
    messageContainer.className = `message-container message ${type}`;
    messageContainer.style.display = 'block';

    // Auto-hide after 5 seconds
    setTimeout(() => {
        hideMessage();
    }, 5000);
}

function hideMessage() {
    messageContainer.style.display = 'none';
}

// ============================================
// SAMPLE DATA (for demo purposes)
// ============================================

function addSampleData() {
    const sampleOffers = [
        {
            id: 'sample1',
            type: 'lend',
            amount: 5000,
            interestRate: 8.5,
            duration: 12,
            description: 'Looking to lend money to creditworthy borrowers. Prefer personal loans for education or small business.',
            contactMethod: 'email',
            timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
            userEmail: 'lender1@example.com'
        },
        {
            id: 'sample2',
            type: 'borrow',
            amount: 2500,
            interestRate: 12.0,
            duration: 6,
            description: 'Need funds for home improvement project. Have steady income and good credit score.',
            contactMethod: 'platform',
            timestamp: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
            userEmail: 'borrower1@example.com'
        },
        {
            id: 'sample3',
            type: 'lend',
            amount: 10000,
            interestRate: 7.2,
            duration: 24,
            description: 'Experienced lender seeking borrowers with solid repayment history.',
            contactMethod: 'phone',
            timestamp: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
            userEmail: 'lender2@example.com'
        }
    ];

    const existingOffers = getOffers();
    if (existingOffers.length === 0) {
        localStorage.setItem('marketplace_offers', JSON.stringify(sampleOffers));
        loadOffers();
    }
}

// Add sample data on first load
document.addEventListener('DOMContentLoaded', function() {
    addSampleData();
});