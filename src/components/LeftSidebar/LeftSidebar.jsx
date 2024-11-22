import React, { useContext, useState } from 'react';
import './LeftSidebar.css';
import assets from '../../assets/assets';
import { useNavigate } from 'react-router-dom';
import { arrayUnion, collection, doc, query, serverTimestamp, setDoc, updateDoc, where } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { getDocs } from 'firebase/firestore';
import { AppContext } from '../../context/AppContext';
import { toast } from 'react-toastify';

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { userData, chatData, chatUser, setChatUser, setMessagesId } = useContext(AppContext);
    const [user, setUser] = useState(null);
    const [showSearch, setShowSearch] = useState(false);

    const inputHandler = async (e) => {
        try {
            const input = e.target.value;
            if (input) {
                setShowSearch(true);
                const userRef = collection(db, 'users');
                const q = query(userRef, where("username", "==", input.toLowerCase()));
                const querySnap = await getDocs(q);
                if (!querySnap.empty && querySnap.docs[0].data().id !== userData.id) {
                    let userExist = false;
                    chatData.map((user) => {
                        if (user.rId === querySnap.docs[0].data().id) {
                            userExist = true;
                        }
                    });
                    if (!userExist) {
                        setUser(querySnap.docs[0].data());
                    }
                } else {
                    setUser(null);
                }
            } else {
                setShowSearch(false);
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    };

    const addChat = async () => {
        const messagesRef = collection(db, 'messages');
        const chatsRef = collection(db, 'chats');
        try {
            const newMessageRef = doc(messagesRef);

            // Create a new messages document
            await setDoc(newMessageRef, {
                createAt: serverTimestamp(),
                messages: []
            });

            // Update chat data for both users
            const newChatData = {
                messageId: newMessageRef.id,
                lastMessage: "",
                rId: user.id,
                updatedAt: Date.now(),
                messageSeen: true,
            };

            await updateDoc(doc(chatsRef, user.id), {
                chatsData: arrayUnion({ ...newChatData, rId: userData.id }),
            });

            await updateDoc(doc(chatsRef, userData.id), {
                chatsData: arrayUnion(newChatData),
            });

        } catch (error) {
            toast.error(error.message);
        }
    };

    const setChat = async (item) => {
        setMessagesId(item.messageId);
        setChatUser(item);
    };

    return (
        <div className='ls'>
            <div className="ls-top">
                <div className="ls-nav">
                    <img src={assets.logo} className='logo' alt="Logo" />
                    <div className="menu">
                        <img src={assets.menu_icon} alt="Menu Icon" />
                        <div className="sub-menu">
                            <p onClick={() => navigate('/profile')}>Edit Profile</p>
                            <hr />
                            <p onClick={() => navigate('/profile')}>Logout</p>
                        </div>
                    </div>
                </div>

                <div className="ls-search">
                    <img src={assets.search_icon} alt="Search Icon" />
                    <input onChange={inputHandler} type="text" placeholder='Search Here...' />
                </div>
            </div>

            <div className="ls-list">
                {showSearch && user ? (
                    <div onClick={addChat} className='friends add-user'>
                        <img src={user.avatar} alt="User Avatar" />
                        <p>{user.name}</p>
                    </div>
                ) : (
                    chatData?.map((item, index) => (
                        <div onClick={() => setChat(item)} className="friends" key={index}>
                            <img src={item.userData.avatar} alt={`${item.userData.name}'s avatar`} />
                            <div>
                                <p>{item.userData.name}</p>
                                <span>{item.lastMessage || "No messages yet"}</span>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default LeftSidebar;
