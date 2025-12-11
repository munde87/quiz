import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';
import 'react-toastify/dist/ReactToastify.css';

function Login() {
    const [loginInfo, setLoginInfo] = useState({ email: '', password: '' });
    const navigate = useNavigate();

    // Update state when user types
    const handleChange = e => {
        const { name, value } = e.target;
        setLoginInfo({ ...loginInfo, [name]: value });
    };

    // Handle login form submission
    const handleLogin = async e => {
        e.preventDefault();
        const { email, password } = loginInfo;

        if (!email || !password) return handleError('Email and password are required');

        try {
            const response = await fetch('https://quiz-3gm7.vercel.app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(loginInfo)
            });

            const result = await response.json();

            if (result.success) {
                handleSuccess(result.message);

                // Store JWT and username
                localStorage.setItem('token', result.token);
                localStorage.setItem('loggedInUser', result.name);

                // Navigate to home after a short delay
                setTimeout(() => navigate('/home'), 1000);
            } else {
                handleError(result.message || 'Login failed');
            }

        } catch (err) {
            handleError(err.message || 'Login failed');
        }
    };

    return (
        <div className='container'>
            <h1>Login</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Email</label>
                    <input
                        type='email'
                        name='email'
                        value={loginInfo.email}
                        onChange={handleChange}
                        placeholder='Enter your email...'
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type='password'
                        name='password'
                        value={loginInfo.password}
                        onChange={handleChange}
                        placeholder='Enter your password...'
                    />
                </div>
                <button type='submit'>Login</button>
                <span>
                    Don't have an account? <Link to='/signup'>Signup</Link>
                </span>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Login;
