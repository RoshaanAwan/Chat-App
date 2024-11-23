import React, { useState } from 'react';
import './Login.css';
import assets from '../../assets/assets';
import { signup, login, resetPass } from '../../config/firebase';
import { toast } from 'react-toastify'; // Importing toast
import 'react-toastify/dist/ReactToastify.css'; // Importing toast styles

const Login = () => {
    const [currentState, setCurrentState] = useState('Sign Up');
    const [userName, setUserName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false); // Loading state for button disable

    const validateEmail = (email) => {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        return regex.test(email);
    };

    const onSubmitHandler = async (event) => {
        event.preventDefault();
        if (!validateEmail(email)) {
            toast.error('Please enter a valid email address.');
            return;
        }

        setLoading(true);

        try {
            if (currentState === 'Sign Up') {
                await signup(userName, email, password);
                toast.success('Sign Up Successful');
            } else {
                await login(email, password);
                toast.success('Login Successful');
            }
        } catch (error) {
            toast.error(`${currentState} Failed: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login">
            <img src={assets.logo_big} className="logo" alt="Logo" />
            <form onSubmit={onSubmitHandler} className="login-form">
                <h2>{currentState}</h2>
                {currentState === 'Sign Up' && (
                    <input
                        onChange={(e) => setUserName(e.target.value)}
                        value={userName}
                        type="text"
                        className="form-input"
                        placeholder="Your Username"
                        required
                    />
                )}
                <input
                    type="email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    className="form-input"
                    placeholder="Enter Your Email Here"
                    required
                />
                <input
                    type="password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    className="form-input"
                    placeholder="Enter Your Password"
                    required
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Processing...' : currentState === 'Sign Up' ? 'Create Account' : 'Login'}
                </button>
                <div className="login-term">
                    <input type="checkbox" required />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>
                <div className="login-forgot">
                    {currentState === 'Sign Up' ? (
                        <p className="login-toggle">
                            Already have an account{' '}
                            <span onClick={() => setCurrentState('Login')}>Login Here</span>
                        </p>
                    ) : (
                        <p className="login-toggle">
                            Create An Account{' '}
                            <span onClick={() => setCurrentState('Sign Up')}>Click Here</span>
                        </p>
                    )}
                    {currentState === "Login" ? (
                        <p className="login-toggle">
                            Forgot Password
                            <span  onClick={() => resetPass(email)}> Reset Here</span>
                        </p>
                    ) : null}
                </div>
            </form>
        </div>
    );
};

export default Login;
