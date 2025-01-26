// Initialize current requests array
let currentRequests = [];


document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in and is staff
    const token = localStorage.getItem('token');
    const userType = localStorage.getItem('userType');

        if (!token) {
        window.location.href = '/index.html';
        return;
    }

        // Add event listeners
    document.getElementById('stockRequestForm').addEventListener('submit', handleAddRequest);
    document.getElementById('submitAllRequests').addEventListener('click', handleSubmitAll);

    // Load previous requests
    loadPreviousRequests();
});

console.log('Current Requests:', currentRequests);

// Handle adding a new request to the list
async function handleAddRequest(e) {
    e.preventDefault();

    const category = document.getElementById('category').value;
    const description = document.getElementById('description').value;
    const quantity = document.getElementById('quantity').value;
    const priority = document.getElementById('priority').value;

    const newRequest = {
        category,
        description,
        quantity,
        priority
    };

    // Add to current requests array
    currentRequests.push(newRequest);

    // Update the table
    updateCurrentRequestsTable();

    // Enable submit button if there are requests
    document.getElementById('submitAllRequests').disabled = currentRequests.length === 0;

    // Clear form
    e.target.reset();
}

// Update the current requests table
function updateCurrentRequestsTable() {
    const tableBody = document.getElementById('currentRequestsList');
    tableBody.innerHTML = currentRequests.map((request, index) => `
        <tr>
            <td>${request.category}</td>
            <td>${request.description}</td>
            <td>${request.quantity}</td>
            <td>${request.priority || '-'}</td>
            <td>
                <button onclick="editRequest(${index})" class="btn btn-warning btn-sm me-2">
                    Edit
                </button>
                <button onclick="deleteRequest(${index})" class="btn btn-danger btn-sm">
                    Delete
                </button>
            </td>
        </tr>
    `).join('');
}

// Edit a request in the current list
function editRequest(index) {
    const request = currentRequests[index];
    
    // Fill the form with request data
    document.getElementById('category').value = request.category;
    document.getElementById('description').value = request.description;
    document.getElementById('quantity').value = request.quantity;
    document.getElementById('priority').value = request.priority || '';

    // Remove the request from current list
    currentRequests.splice(index, 1);
    updateCurrentRequestsTable();
    
    // Update submit button state
    document.getElementById('submitAllRequests').disabled = currentRequests.length === 0;
}

// Delete a request from the current list
function deleteRequest(index) {
    if (confirm('Are you sure you want to delete this request?')) {
        currentRequests.splice(index, 1);
        updateCurrentRequestsTable();
        document.getElementById('submitAllRequests').disabled = currentRequests.length === 0;
    }
}

const API_BASE_URL = `${window.location.origin}`;

// Submit all current requests
async function handleSubmitAll() {
    try {
        // Submit each request
        for (const request of currentRequests) {
            const response = await fetch(`${API_BASE_URL}/api/stock/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                throw new Error('Failed to submit request');
            }
        }

        // Send email with new and pending requests
        await sendEmailWithRequests();

        // Show success modal
        const successModal = new bootstrap.Modal(document.getElementById('successModal'));
        successModal.show();

        // Clear current requests
        currentRequests = [];
        updateCurrentRequestsTable();
        document.getElementById('submitAllRequests').disabled = true;

        // Reload previous requests
        loadPreviousRequests();
    } catch (error) {
        console.error('Error submitting requests:', error);
        alert('Failed to submit requests. Please try again.');
    }
}

// New function to send email with requests
async function sendEmailWithRequests() {
    try {
        const staffName = localStorage.getItem('username'); // Assume username is stored
        // const newRequests = currentRequests; // Newly submitted requests
        
        // Fetch pending requests
        const pendingResponse = await fetch(`${API_BASE_URL}/api/stock/requests?status=pending`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!pendingResponse.ok) {
            throw new Error('Failed to fetch pending requests');
        }
        
        const AllpendingRequests = await pendingResponse.json();
             console.log('AllpendingRequests:',AllpendingRequests);
             
        const pendingRequests = AllpendingRequests.pop()
            console.log('pendingRequests:',pendingRequests);
            

        // Send email
        const emailResponse = await fetch(`${API_BASE_URL}/api/send-email/sendEmail`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify({
                staffName,
                pendingRequests,
                AllpendingRequests

            })
        });
             console.log(emailResponse , "email-Resp")
        if (!emailResponse.ok) {
            throw new Error('Failed to send email');
        }
    } catch (error) {
        console.error('Error sending email:', error);
        alert('Failed to send email notification');
    }
}

// Load previous requests
async function loadPreviousRequests() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/stock/requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to load previous requests');
        }

        const requests = await response.json();
        const tableBody = document.getElementById('previousRequestsList');
        
        tableBody.innerHTML = requests.map(request => `
            <tr>
                <td>${request.category}</td>
                <td>${request.description}</td>
                <td>${request.quantity}</td>
                <td>
                    <span class="badge ${getStatusBadgeClass(request.status)}">
                        ${request.status}
                    </span>
                </td>
                <td>${new Date(request.submittedAt).toLocaleString()}</td>
            </tr>
        `).join('');
    } catch (error) {
        console.error('Error loading previous requests:', error);
        alert('Failed to load previous requests');
    }
}

// Get appropriate badge class for status
function getStatusBadgeClass(status) {
    switch (status.toLowerCase()) {
        case 'pending':
            return 'bg-warning';
        case 'released':
            return 'bg-success';
        case 'rejected':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}

// Logout function
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userType');
    window.location.href = '/index.html';
}

// Format date for display
function formatDate(date) {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}