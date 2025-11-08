import { Toast } from "../../assets/js/toast.js";

// Simple form validation
document.querySelector('form').addEventListener('submit', function (e) {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    if (email && password) {
        // Add success animation
        const button = document.querySelector('button[type="submit"]');
        button.innerHTML = '<svg class="animate-spin h-5 w-5" viewBox="0 0 24 24"><circle class="opacity-50" fill="#0000" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span class="ml-2">Loging...</span>';
        button.classList.add('flex', 'items-center', 'justify-center', 'gap-2');

        fetch(`API/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: `email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`
        })
            .then(response => response.json()) // ✅ now you can directly use .json()
            .then(data => {
                if (data.status === 'success') {
                    Toast({ type: 'success', title: 'Welcome', msg: data.msg });
                    setTimeout(() => {
                        window.location.href = '/NIT/exam/public';
                    }, 1000);
                } else if (data.status === 'Warning') {
                    Toast({ type: 'warning', title: 'Warning', msg: data.msg });
                } else {
                    Toast({ type: 'error', title: 'Error', msg: data.msg || 'Login faild. Try again later' });
                    button.innerHTML = 'Sign In Again';
                }
            })
            .catch(error => {
                // Response error handling
                Toast({
                    type: 'error',
                    title: 'Error!',
                    msg: 'Login failed'
                });
                button.innerHTML = 'Sign In';
            });

    } else {
        // Add error animation
        const inputs = document.querySelectorAll('input');
        inputs.forEach(input => {
            if (!input.value) {
                input.classList.add('pulse-error');
                // input.style.boxShadow = '0 0 10px rgba(239, 0, 0, 0.7)';
                setTimeout(() => {
                    input.classList.remove('pulse-error');
                    // input.style.boxShadow = '';
                }, 2000);
            }
        });

        // alert('Please fill in all fields');
    }
});

// Add focus effects to inputs
const inputs = document.querySelectorAll('input[type="text"], input[type="password"]');
inputs.forEach(input => {
    input.addEventListener('focus', function () {
        this.parentElement.classList.add('transform', 'scale-105');
        this.parentElement.classList.add('transition-transform', 'duration-300');
    });

    input.addEventListener('blur', function () {
        this.parentElement.classList.remove('transform', 'scale-105');
    });
});