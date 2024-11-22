import React, { useContext, useEffect, useState } from 'react';
import './ChatBox.css';
import assets from '../../assets/assets';
import { AppContext } from '../../context/AppContext';
import { arrayUnion, doc, getDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../../config/firebase';
import { toast } from 'react-toastify';

const ChatBox = () => {
    const { userData, messagesId, chatUser, messages, setMessages } = useContext(AppContext);
    const [input, setInput] = useState('');

    // Function to send a message
    const sendMessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        id: Date.now(),
                        sId: userData.id,
                        text: input,
                        createdAt: new Date(),
                    }),
                });

                const userIDs = [chatUser.rId, userData.id];
                for (const id of userIDs) {
                    const userChatsRef = doc(db, 'chats', id);
                    const userChatsSnapshot = await getDoc(userChatsRef);

                    if (userChatsSnapshot.exists()) {
                        const userChatData = userChatsSnapshot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);

                        if (chatIndex !== -1) {
                            // Ensure that the last message is updated
                            userChatData.chatsData[chatIndex].lastMessage = input.slice(0, 30); // Truncate the message if necessary
                            userChatData.chatsData[chatIndex].updatedAt = Date.now();
                            userChatData.chatsData[chatIndex].messageSeen = userChatData.chatsData[chatIndex].rId !== userData.id;

                            await updateDoc(userChatsRef, {
                                chatsData: userChatData.chatsData,
                            });
                        }
                    }
                }

            }
        } catch (error) {
            toast.error('Error sending message:', error);
        }
        setInput(''); // Clear input after sending the message
    };


    const sendImage = async (e) => {
        try {
            const fileUrl = await upload(e.target.files[0])
            if (fileUrl && messagesId) {
                await updateDoc(doc(db, 'messages', messagesId), {
                    messages: arrayUnion({
                        id: Date.now(),
                        sId: userData.id,
                        image: fileUrl,
                        text: input,
                        createdAt: new Date(),
                    }),

                })
                const userIDs = [chatUser.rId, userData.id];
                for (const id of userIDs) {
                    const userChatsRef = doc(db, 'chats', id);
                    const userChatsSnapshot = await getDoc(userChatsRef);

                    if (userChatsSnapshot.exists()) {
                        const userChatData = userChatsSnapshot.data();
                        const chatIndex = userChatData.chatsData.findIndex((c) => c.messageId === messagesId);

                        if (chatIndex !== -1) {
                            // Ensure that the last message is updated
                            userChatData.chatsData[chatIndex].lastMessage = "Image"; // Truncate the message if necessary
                            userChatData.chatsData[chatIndex].updatedAt = Date.now();
                            userChatData.chatsData[chatIndex].messageSeen = userChatData.chatsData[chatIndex].rId !== userData.id;

                            await updateDoc(userChatsRef, {
                                chatsData: userChatData.chatsData,
                            });
                        }
                    }
                }
            }
        }
        catch (error) {
            toast.error(error.message)

        }
    }


    // Fetch and listen to messages in real-time
    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, 'messages', messagesId), (res) => {
                const data = res.data();
                if (data) {
                    setMessages([...data.messages]); // Ensure new array reference
                }
            });

            return () => unSub(); // Cleanup subscription
        }
    }, [messagesId]);

    return chatUser ? (
        <div className="chat-box">
            {/* Chat Header */}
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="User Avatar" />
                <p>
                    {chatUser.userData.name} <img src={assets.green_dot} className="dot" alt="Online Status" />
                </p>
                <img src={assets.help_icon} className="help" alt="Help Icon" />
            </div>

            {/* Chat Messages */}
            <div className="chat-msg">
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? 's-msg' : 'r-msg'}>
                        <p className="msg">{msg.text}</p>
                        <div>
                            <img src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar} alt="Profile" />
                            <p>{new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Input */}
            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Send a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <input type="file" onChange={sendImage} id="image" accept="image/png, image/jpeg" hidden />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="Gallery Icon" />
                </label>
                <img src={assets.send_button} alt="Send Button" onClick={sendMessage} />
            </div>
        </div>
    ) : (
        <div className="chat-welcome">
            <img src={assets.logo_icon} alt="Logo Icon" />
            <p>Chat Anytime, Anywhere</p>
        </div>
    );
};

export default ChatBox;
