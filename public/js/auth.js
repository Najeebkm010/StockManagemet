document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login');
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        try {
            const response = await fetch('http://localhost:3000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ username, password })
            });
            
            const data = await response.json();
            console.log(data,"testing")
            if (response.ok) {
                // Store the token
                localStorage.setItem('token', data.token);
                localStorage.setItem('userType', data.userType);
                
                // Redirect based on userType
                if (data.userType === 1) {
                    window.location.href = '/admin.html';
                } else {
                    window.location.href = '/staff.html';
                }
            } else {
                alert(data.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            alert('Login failed. Please try again.');
        }
    });
});