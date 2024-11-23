import React, { useContext, useEffect, useState } from "react";
import "./ChatBox.css";
import assets from "../../assets/assets";
import { AppContext } from "../../context/AppContext";
import { arrayUnion, doc, onSnapshot, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { toast } from "react-toastify";

const ChatBox = () => {
    const { userData, messagesId, chatUser, messages, setMessages, chatVisible, setChatVisible } = useContext(AppContext);
    const [input, setInput] = useState("");

    const sendMessage = async () => {
        try {
            if (input && messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        id: Date.now(),
                        sId: userData.id,
                        text: input,
                        createdAt: new Date(),
                    }),
                });
            }
            setInput(""); // Clear input
        } catch (error) {
            toast.error("Error sending message: " + error.message);
        }
    };

    const sendImage = async (e) => {
        try {
            const file = e.target.files[0];
            if (!file) return;

            const formData = new FormData();
            formData.append("image", file);

            const response = await fetch("http://localhost:5000/upload", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (!response.ok) throw new Error(result.error);

            const imageUrl = result.imageUrl; // URL to access the uploaded image

            if (messagesId) {
                await updateDoc(doc(db, "messages", messagesId), {
                    messages: arrayUnion({
                        id: Date.now(),
                        sId: userData.id,
                        image: `http://localhost:5000${imageUrl}`, // Full image URL
                        text: "",
                        createdAt: new Date(),
                    }),
                });
            }
        } catch (error) {
            toast.error("Failed to upload image: " + error.message);
        }
    };

    useEffect(() => {
        if (messagesId) {
            const unSub = onSnapshot(doc(db, "messages", messagesId), (res) => {
                const data = res.data();
                if (data) {
                    setMessages([...data.messages]);
                }
            });

            return () => unSub();
        }
    }, [messagesId]);

    return chatUser ? (
        <div className={`chat-box ${chatVisible ? "" : "hidden"}`}>
            <div className="chat-user">
                <img src={chatUser.userData.avatar} alt="User Avatar" />
                <p>
                    {chatUser.userData.name} {Date.now() - chatUser.userData.lastSeen <= 70000 ? <img src={assets.green_dot} alt="" /> : null}
                </p>
                <img src={assets.help_icon} className="help" alt="Help Icon" />
                <img onClick={() => setChatVisible(false)} src={assets.arrow_icon} style={{ cursor:"pointer"}} className="arrow" alt="arrow_icon" />
            </div>

            <div className="chat-msg">
                {messages.slice().reverse().map((msg, index) => (
                    <div key={index} className={msg.sId === userData.id ? "s-msg" : "r-msg"}>
                        {msg.image ? (
                            <img
                                src={msg.image}
                                alt="Sent"
                                style={{ maxWidth: "200px", borderRadius: "8px", margin: "10px 0" }}
                            />
                        ) : (
                            <p className="msg">{msg.text}</p>
                        )}
                        <div>
                            <img
                                src={msg.sId === userData.id ? userData.avatar : chatUser.userData.avatar}
                                alt="Profile"
                            />
                            <p>{new Date(msg.createdAt.seconds * 1000).toLocaleTimeString()}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="chat-input">
                <input
                    type="text"
                    placeholder="Send a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                />
                <input
                    type="file"
                    onChange={sendImage}
                    id="image"
                    accept="image/png, image/jpeg"
                    hidden
                />
                <label htmlFor="image">
                    <img src={assets.gallery_icon} alt="Gallery Icon" />
                </label>
                <img src={assets.send_button} alt="Send Button" onClick={sendMessage} />
            </div>
        </div>
    ) : (
        <div className={`chat-welcome ${chatVisible ? "" : "hidden"}`}>
            <img src={assets.logo_icon} alt="Logo Icon" />
            <p>Chat Anytime, Anywhere</p>
        </div>
    );
};

export default ChatBox;

