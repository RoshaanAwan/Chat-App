import React from 'react'
import './LeftSidebar.css'
import assets from '../../assets/assets'
import { useNavigate } from 'react-router-dom'

const LeftSidebar = () => {

    const navigate = useNavigate()
    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' />
                    <div className="menu">
                        <img src={assets.menu_icon} />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p onClick={() => navigate('/profile')}>Logout</p>
                        </div>
                    </div>
                </div>

                <div className="ls-search">
                    <img src={assets.search_icon} />
                    <input type="text" placeholder='Search Here...' />
                </div>
            </div>
            <div className="ls-list">
                {Array(12).fill("").map((item, index) => (
                    <div className="friends" key={index}>
                        <img src={assets.profile_img} />
                        <div>
                            <p>Roshaan Ali</p>
                            <span>Hi, How Are You? </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>

    )
}

export default LeftSidebar
