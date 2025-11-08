// src/pages/Dashboard/index.tsx (ฉบับ Redesign)

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './DashboardPage.module.css'; 

import { getAllItems, getLookupData, type Item, type Category } from '../../services/itemService'; 
import { getUserRole, getCurrentUserId } from '../../services/authService';

// 🌟 FIX 1: แก้ไข Item Card Component (ย่อย) 🌟
const ItemCard: React.FC<{ item: Item }> = ({ item }) => {
    const navigate = useNavigate(); 
    
    // 🌟 FIX: อ่านจาก item.images (ตัวเล็ก) 🌟
    const imageUrl = (item.images && item.images.length > 0) 
        ? item.images[0].image
        : "https://via.placeholder.com/200";

    const handleClick = () => {
        console.log(`[Dashboard] Item card clicked. Navigating to /item/${item.ID}`);
        navigate(`/item/${item.ID}`); 
    };

    return (
        <div className={styles.itemCard} onClick={handleClick}> 
            <div className={styles.itemImageWrapper}>
                <img src={imageUrl} alt={item.title} className={styles.itemImage} />
            </div>
            <div className={styles.itemCardContent}>
                <h3 className={styles.itemTitle}>{item.title}</h3>
                {/* 🌟 FIX: อ่านจาก item.category (ตัวเล็ก) 🌟 */}
                <p className={styles.itemCategory}>{item.category?.name || 'Category'}</p>
                {/* 🌟 FIX: อ่านจาก item.condition (ตัวเล็ก) 🌟 */}
                <p className={styles.itemCondition}>
                    {item.condition?.condition_name || 'Condition'}
                </p>
            </div>
        </div>
    );
};


// Component หลัก (Dashboard)
const DashboardPage: React.FC = () => {
    const navigate = useNavigate();
    const isAdmin = getUserRole() === 1;
    const currentUserId = getCurrentUserId(); 

    const [items, setItems] = useState<Item[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [activityItems, setActivityItems] = useState<Item[]>([]); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [activeCategory, setActiveCategory] = useState<string>('All');

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [itemData, categoryData] = await Promise.all([
                    getAllItems(),
                    getLookupData('categories')
                ]);
                
                setItems(itemData);
                setCategories(categoryData as Category[]);
                
                if (currentUserId) {
                    const myActivities = itemData.filter(item => item.user_id === currentUserId);
                    setActivityItems(myActivities.slice(0, 3)); 
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
    }, [navigate, currentUserId]); 

    // 🌟 FIX: กรองโดยใช้ item.category (ตัวเล็ก) 🌟
    const filteredItems = items.filter(item => {
        if (activeCategory === 'All') return true;
        return item.category?.name === activeCategory; 
    });

    return (
        <div className={styles.dashboardPage}>
            
            {/* --- Main Content Area --- */}
            <main className={styles.mainContent}>
                {/* --- Search Bar --- */}
                <div className={styles.searchBarContainer}>
                    <span>🔍</span>
                    <input type="text" placeholder="Search for items..." className={styles.searchInput} />
                </div>

                {/* --- Categories --- */}
                <section className={styles.sectionContainer}>
                    <h2 className={styles.sectionTitle}>Categories</h2>
                    <nav className={styles.categoryNav}>
                        <button 
                            className={`${styles.categoryLink} ${activeCategory === 'All' ? styles.categoryLinkActive : ''}`}
                            onClick={() => setActiveCategory('All')}
                        >
                            All
                        </button>
                        {categories.map(cat => (
                            <button 
                                key={cat.ID}
                                className={`${styles.categoryLink} ${activeCategory === cat.name ? styles.categoryLinkActive : ''}`}
                                onClick={() => setActiveCategory(cat.name)}
                            >
                                {cat.name}
                            </button>
                        ))}
                    </nav>
                </section>

                {/* --- Item Grid (แสดงข้อมูลจริง) --- */}
                <section className={styles.sectionContainer}>
                    <h2 className={styles.sectionTitle}>{activeCategory === 'All' ? 'Featured Items' : activeCategory}</h2>
                    {loading && <p>Loading items...</p>}
                    {error && <p style={{ color: 'red' }}>Error: {error}</p>}
                    
                    <div className={styles.itemGrid}>
                        {filteredItems.map(item => (
                            <ItemCard key={item.ID} item={item} />
                        ))}
                    </div>
                </section>
            </main>

            {/* --- Activity Feed (แสดงข้อมูลจริง) --- */}
            <aside className={styles.activitySidebar}>
                <h2 className={styles.sectionTitle}>Your Activity</h2>
                <div className={styles.activityFeed}>
                    
                    {loading && <p>Loading activity...</p>}
                    
                    {activityItems.length === 0 && !loading && <p>You have no posted items yet.</p>}
                    
                    {activityItems.map(item => (
                        <div className={styles.activityItem} key={item.ID}>
                            <div className={styles.activityIcon}>📝</div>
                            <div>
                                <p className={styles.activityText}>Posted: <strong>{item.title}</strong></p>
                                <span className={styles.activityTime}>Recently</span> 
                            </div>
                        </div>
                    ))}
                    
                </div>
            </aside>

            {/* --- Floating Action Button (FAB) --- */}
            {!isAdmin && (
                <button className={styles.fab} onClick={() => navigate('/items/new')}>
                    Post Item
                </button>
            )}
        </div>
    );
};

export default DashboardPage;