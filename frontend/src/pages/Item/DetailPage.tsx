// src/pages/Item/DetailPage.tsx

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getSingleItem, type Item } from '../../services/itemService';
import { getUserRole, getCurrentUserId } from '../../services/authService';
import styles from './DetailPage.module.css'; 

// 🌟 1. (ถูกต้อง) ดึง Base URL (ใช้วิธีของ VITE)
const IMAGE_BASE_URL = import.meta.env.VITE_IMAGE_BASE_URL;

const ItemDetailPage: React.FC = () => {
    const navigate = useNavigate();
    const { id } = useParams<{ id: string }>(); 
    
    const [item, setItem] = useState<Item | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    // 2. (ถูกต้อง) ดึงข้อมูล User (ใช้ 'user_id' ตัวเล็ก)
    const currentUserId = getCurrentUserId();
    const isAdmin = getUserRole() === 1;
    const isOwner = item?.user_id === currentUserId;

    useEffect(() => {
        if (!id) {
            setError("No item ID provided.");
            setLoading(false);
            return;
        }

        console.log(`[DetailPage] Fetching data for item ID: ${id}`);
        const fetchData = async () => {
            try {
                setLoading(true);
                const itemData = await getSingleItem(id); 
                setItem(itemData);

                // 🌟 (ถูกต้อง) ตั้งค่ารูปแรก (ใช้ 'images' และ 'image' ตัวเล็ก)
                if (itemData.images && itemData.images.length > 0) {
                    setSelectedImage(itemData.images[0].image); 
                }

            } catch (err: any) {
                setError(err.message);
                if (err.message.includes('authenticated') || err.message.includes('token')) {
                    navigate('/login', { replace: true });
                }
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id, navigate]);

    // ... (Functions: handleEdit, handleDelete, handleMakeOffer - ถูกต้อง) ...
    const handleEdit = () => {
        alert('Edit function not implemented yet.');
    };
    const handleDelete = () => {
        alert('Delete function not implemented yet.');
    };
    const handleMakeOffer = () => {
        alert('Make an Offer function not implemented yet.');
    };
    // ----------------------------

    if (loading) {
        return <div className={styles.pageContainer}><p>Loading item details...</p></div>;
    }
    if (error) {
        return <div className={styles.pageContainer}><p style={{ color: 'red' }}>Error: {error}</p></div>;
    }
    if (!item) {
        return <div className={styles.pageContainer}><p>Item not found.</p></div>;
    }

    // 4. (ถูกต้อง) ประกอบร่าง URL
    const mainImageUrl = (selectedImage && IMAGE_BASE_URL)
        ? `${IMAGE_BASE_URL}${selectedImage}` 
        : "https://via.placeholder.com/400"; 

    return (
        <div className={styles.pageContainer}>
            <button className={styles.backButton} onClick={() => navigate(-1)}>← Back</button>
            
            <div className={styles.detailLayout}>
                
                {/* 5. (ถูกต้อง) ส่วนแสดงรูปภาพ */}
                <div className={styles.imageSection}>
                    <img 
                        src={mainImageUrl}
                        alt={item.title} 
                        className={styles.mainImage} 
                    />
                    
                    {/* (ถูกต้อง) Gallery (ใช้ 'images' และ 'image' ตัวเล็ก) */}
                    {item.images && item.images.length > 1 && (
                        <div className={styles.thumbnailGallery}>
                            {item.images.map((img) => (
                                <img
                                    key={img.ID} // 🌟 (ถูกต้อง) 'ID' (ตัวใหญ่) มาจาก gorm.Model
                                    src={`${IMAGE_BASE_URL}${img.image}`} 
                                    alt={`${item.title} thumbnail ${img.ID}`}
                                    className={`${styles.thumbnail} ${selectedImage === img.image ? styles.thumbnailActive : ''}`}
                                    onClick={() => setSelectedImage(img.image)} 
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* 6. (ถูกต้อง) ส่วนแสดงข้อมูล (ใช้ 'category', 'condition', 'user' ตัวเล็ก) */}
                <div className={styles.infoSection}>
                    <h1 className={styles.title}>{item.title}</h1>
                    
                    <div className={styles.tagGroup}>
                        <span className={styles.tag}>{item.category?.name || 'Category'}</span>
                        <span className={styles.tag}>{item.condition?.condition_name || 'Condition'}</span>
                    </div>

                    <div className={styles.infoBlock}>
                        <h3>Description</h3>
                        <p>{item.description}</p>
                    </div>

                    <div className={styles.infoBlock}>
                        <h3>Desired Exchange</h3>
                        <p>{item.desired_exchange}</p>
                    </div>
                    
                    <div className={styles.infoBlock}>
                        <h3>Meetup</h3>
                        <p><strong>Location:</strong> {item.meetup_location}</p>
                        <p><strong>Availability:</strong> {item.meetup_availability}</p>
                    </div>

                    <div className={styles.infoBlock}>
                        <h3>Posted By</h3>
                        <p>{item.user?.username || 'Unknown User'}</p>
                    </div>

                    {/* 7. (ถูกต้อง) ปุ่ม Actions */}
                    <div className={styles.actionButtons}>
                        {isOwner || isAdmin ? (
                            <>
                                <button className={styles.editButton} onClick={handleEdit}>Edit Item</button>
                                <button className={styles.deleteButton} onClick={handleDelete}>Delete Item</button>
                            </>
                        ) : (
                            <button className={styles.contactButton} onClick={handleMakeOffer}>Make an Offer</button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ItemDetailPage;