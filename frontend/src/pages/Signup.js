import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

function Signup() {
    const [signupInfo, setSignupInfo] = useState({ name: '', email: '', password: '' });
    const navigate = useNavigate();

    const handleChange = e => {
        const { name, value } = e.target;
        setSignupInfo({ ...signupInfo, [name]: value });
    };

    const handleSignup = async e => {
        e.preventDefault();
        const { name, email, password } = signupInfo;

        if (!name || !email || !password) return handleError('Name, email and password are required');

        try {
            const response = await fetch('https://quiz-api-smoky-one.vercel.app', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupInfo)
            });

            const result = await response.json();

            if (result.success) {
                handleSuccess(result.message);
                setTimeout(() => navigate('/login'), 1000);
            } else {
                handleError(result.message || 'Signup failed');
            }
        } catch (err) {
            handleError(err.message || 'Signup failed');
        }
    };

    return (
        <div className='container'>
            <h1>Signup</h1>
            <form onSubmit={handleSignup}>
                <div>
                    <label>Name</label>
                    <input type='text' name='name' value={signupInfo.name} onChange={handleChange} autoFocus placeholder='Enter your name...' />
                </div>
                <div>
                    <label>Email</label>
                    <input type='email' name='email' value={signupInfo.email} onChange={handleChange} placeholder='Enter your email...' />
                </div>
                <div>
                    <label>Password</label>
                    <input type='password' name='password' value={signupInfo.password} onChange={handleChange} placeholder='Enter your password...' />
                </div>
                <button type='submit'>Signup</button>
                <span>Already have an account? <Link to='/login'>Login</Link></span>
            </form>
            <ToastContainer />
        </div>
    );
}

export default Signup;
