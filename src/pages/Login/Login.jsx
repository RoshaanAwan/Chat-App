import React, { useState } from 'react'
import './Login.css'
import assets from '../../assets/assets'
import { signup, login } from '../../config/firebase'

const Login = () => {

    const [currentState, setCurrentState] = useState("Sign Up")
    const [userName, setUserName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")


    const onSubmitHandler = (event) => {
        event.preventDefault();
        if (currentState === "Sign Up") {
            signup(userName, email, password)

        }
        else {
            login(email, password)
        }
    }




    return (
        <div className='login'>
            <img src={assets.logo_big} className="logo" />
            <form onSubmit={onSubmitHandler} className='login-form'>
                <h2>{currentState}</h2>
                {currentState === "Sign Up" ? <input onChange={(e) => setUserName(e.target.value)} value={userName} type="text" className="form-input" placeholder='Your Username' required /> : null}
                <input type="email" onChange={(e) => setEmail(e.target.value)} value={email} className="form-input" placeholder='Enter Your Email Here' required />
                <input type="password" onChange={(e) => setPassword(e.target.value)} value={password} className="form-input" placeholder='Enter Your Password' required />
                <button type="submit">{currentState === "Sign Up" ? "Create Account" : "Login"}</button>
                <div className="login-term">
                    <input type="checkbox" required />
                    <p>Agree to the terms of use & privacy policy.</p>
                </div>
                <div className="login-forgot">
                    {currentState === "Sign Up" ?
                        <p className="login-toggle">Already have an account <span onClick={() => setCurrentState("Login")}>Login Here</span></p>
                        :
                        <p className="login-toggle">Create An Account <span onClick={() => setCurrentState("Sign Up")}>Click Here</span></p>
                    }
                </div>
            </form>
        </div>
    )
}

export default Login
