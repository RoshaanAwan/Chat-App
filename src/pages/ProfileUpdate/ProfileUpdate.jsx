import React, { useContext, useEffect, useState } from 'react';
import './ProfileUpdate.css';
import assets from '../../assets/assets';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../../config/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const ProfileUpdate = () => {
    const navigate = useNavigate();
    const [image, setImage] = useState(null);
    const [name, setName] = useState('');
    const [bio, setBio] = useState('');
    const [prevImage, setPrevImage] = useState('');
    const [uid, setUid] = useState('');
    const [loading, setLoading] = useState(true);
    const { setUserData } = useContext(AppContext);

    const ProfileUpdate = async (event) => {
        event.preventDefault();
        try {
            if (!prevImage && !image) {
                toast.error('Please Upload Your Profile Image');
                return;
            }

            let imgUrl = prevImage;

            if (image) {
                const formData = new FormData();
                formData.append('image', image);

                const response = await axios.post('http://localhost:5000/upload', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });

                imgUrl = response.data.imageUrl; // Get image URL from backend
            }

            const docRef = doc(db, 'users', uid);
            await updateDoc(docRef, {
                avatar: imgUrl,
                bio,
                name,
            });

            toast.success('Profile updated successfully!');
            const snap = await getDoc(docRef);
            setUserData(snap.data());
            navigate('/chat');
        } catch (error) {
            toast.error('Error updating profile: ' + error.message);
        }
    };

    useEffect(() => {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                setUid(user.uid);
                const docRef = doc(db, 'users', user.uid);
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    if (userData.name) setName(userData.name);
                    if (userData.bio) setBio(userData.bio);
                    if (userData.avatar) setPrevImage(userData.avatar);
                }
                setLoading(false);
            } else {
                navigate('/');
            }
        });
    }, []);

    if (loading) {
        return <div>Loading your profile...</div>; // Can enhance with a spinner or loading animation
    }

    return (
        <div className="profile">
            <div className="profile-container">
                <form onSubmit={ProfileUpdate}>
                    <h3>Profile Details</h3>
                    <label htmlFor="avatar">
                        <input
                            onChange={(e) => setImage(e.target.files[0])}
                            type="file"
                            id="avatar"
                            accept="image/png, image/jpg, image/jpeg"
                            hidden
                        />
                        <img
                            src={image ? URL.createObjectURL(image) : prevImage || assets.avatar_icon}
                            alt="Upload Profile Image"
                        />
                        Upload Profile Image
                    </label>
                    <input
                        onChange={(e) => setName(e.target.value)}
                        value={name}
                        type="text"
                        placeholder="Your Name"
                        required
                    />
                    <textarea
                        onChange={(e) => setBio(e.target.value)}
                        value={bio}
                        placeholder="Add Your Bio"
                        required
                    ></textarea>
                    <button type="submit">Save</button>
                </form>
                <img src={image ? URL.createObjectURL(image) : prevImage || assets.logo_icon} alt="" className="profile-pic" />
            </div>
        </div>
    );
};

export default ProfileUpdate;
