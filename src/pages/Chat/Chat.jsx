import React, { useContext, useEffect, useState } from 'react'
import './Chat.css'
import LeftSidebar from '../../components/LeftSidebar/LeftSidebar'
import RightSidebar from '../../components/RightSidebar/RightSidebar'
import ChatBox from '../../components/ChatBox/ChatBox'
import { AppContext } from '../../context/AppContext'


const Chat = () => {

    const { chatData, userData } = useContext(AppContext);
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (chatData && userData) {
            setLoading(false)

        }
    }, [chatData, userData])


    return (
        <div className='chat'>
            {
                loading
                    ?
                    <div class="loader">
                        <p class="text">
                            <span class="letter letter1">L</span>
                            <span class="letter letter2">o</span>
                            <span class="letter letter3">a</span>
                            <span class="letter letter4">d</span>
                            <span class="letter letter5">i</span>
                            <span class="letter letter6">n</span>
                            <span class="letter letter7">g</span>
                            <span class="letter letter8">.</span>
                            <span class="letter letter9">.</span>
                            <span class="letter letter10">.</span>
                        </p>
                    </div>
                    :

                    <div className="chat-container">
                        <LeftSidebar />
                        <ChatBox />
                        <RightSidebar />
                    </div>
            }
        </div>
    )
}

export default Chat
