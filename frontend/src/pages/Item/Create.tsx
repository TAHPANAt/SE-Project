// src/pages/Item/Create.tsx

import React, { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    createItem, 
    getLookupData, 
    uploadFile, // 🌟 1. Import uploadFile
    type ItemCreationPayload, 
    type Category, 
    type Condition 
} from '../../services/itemService';
import styles from './CreateItemPage.module.css'; 

const CreateItemPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [isUploading, setIsUploading] = useState(false); // 🌟 State สำหรับการ Upload
    const [error, setError] = useState<string | null>(null);
    const [categories, setCategories] = useState<Category[]>([]);
    const [conditions, setConditions] = useState<Condition[]>([]);
    
    // 🌟 2. สร้าง State ใหม่สำหรับเก็บ File Object 🌟
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    
    const [formData, setFormData] = useState<Omit<ItemCreationPayload, 'image'>>({
        title: '',
        description: '',
        condition_id: 0,
        category_id: 0,
        meetup_location: '',
        desired_exchange: '',
        meetup_availability: '',
    });

    // --- Fetch Master Data (Categories/Conditions) ---
    useEffect(() => {
        const loadMasterData = async () => {
            try {
                const [categoryData, conditionData] = await Promise.all([
                    getLookupData('categories'), 
                    getLookupData('conditions')  
                ]);
                setCategories(categoryData as Category[]);
                setConditions(conditionData as Condition[]);
                setLoading(false);
            } catch (err: any) {
                setError("Failed to load necessary data (Categories/Conditions).");
                setLoading(false);
            }
        };
        loadMasterData();
    }, [navigate]);

    // --- Handlers ---
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const handleIdChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: parseInt(value) || 0 })); 
    };

    // 🌟 3. Handler สำหรับ File Input (เก็บ File Object) 🌟
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(files); // เก็บ File Object ไว้
        }
    };

    // 🌟 4. Handle Form Submission (อัปโหลดไฟล์ และ "ตัด" ชื่อไฟล์) 🌟
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        if (formData.condition_id === 0 || formData.category_id === 0) {
            setError("Please select a valid Category and Condition.");
            setLoading(false);
            return;
        }

        try {
            // --- ขั้นตอนที่ 1: อัปโหลดไฟล์ (ถ้ามี) ---
            
            // 🌟 เปลี่ยนชื่อตัวแปรเพื่อความชัดเจน 🌟
            const uploadedImageFilenames: string[] = []; 
            
            if (selectedFiles.length > 0) {
                setIsUploading(true); 
                
                const uploadPromises = selectedFiles.map(file => uploadFile(file));
                // สมมติว่า uploadResults คือ [{ url: "http://.../file1.jpg" }, { url: "http://.../file2.png" }]
                const uploadResults = await Promise.all(uploadPromises);
                
                // 🌟 นี่คือส่วนที่แก้ไข: วนลูปและ "ตัด" เอาเฉพาะชื่อไฟล์
                uploadResults.forEach(result => {
                    // สมมติ result.url คือ URL เต็ม เช่น "http://bucket.s3.com/path/image1.jpg?token=..."
                    const fullUrl = result.url; 

                    try {
                        // 1. สร้าง URL Object
                        const urlObject = new URL(fullUrl); 
                        
                        // 2. ดึง Pathname (เช่น "/path/image1.jpg")
                        const pathname = urlObject.pathname; 
                        
                        // 3. ตัดเอาเฉพาะส่วนสุดท้ายหลังเครื่องหมาย /
                        const filename = pathname.substring(pathname.lastIndexOf('/') + 1);
                        
                        // 4. เก็บ "ชื่อไฟล์" (เช่น "image1.jpg") ลงใน Array
                        uploadedImageFilenames.push(filename); 

                    } catch (err) {
                        console.error("Could not parse filename from URL:", fullUrl, err);
                        // (คุณอาจจะอยาก handle error นี้ เช่น แจ้งเตือนผู้ใช้)
                    }
                });
                
                setIsUploading(false); 
            }

            // --- ขั้นตอนที่ 2: สร้าง Item (ส่ง "ชื่อไฟล์" ที่ได้) ---
            const finalPayload: ItemCreationPayload = {
                ...formData,
                // 🌟 ส่ง Key "image" ที่มี Array ของ "ชื่อไฟล์" 🌟
                image: uploadedImageFilenames, 
            };

            await createItem(finalPayload); 
            
            alert(`Item '${formData.title}' created successfully!`);
            navigate('/items'); 
            
        } catch (err: any) {
            console.error("❌ [CreateItem] Creation Error:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
            setIsUploading(false);
        }
    };

    if (loading) {
        return <div style={{ padding: '20px' }}>Loading form data...</div>;
    }

    return (
        <div className={styles.pageContainer}>
            <div className={styles.formContainer}>
                
                <h2 className={styles.pageTitle}>📝 Register New Item</h2>
            
                <form onSubmit={handleSubmit}>
                    
                    <div className={styles.formGrid}>
                        {/* ... (Title, Description, Condition, Category, etc. - คงเดิม) ... */}
                        <div className={`${styles.formGroup} ${styles.spanFull}`}>
                            <label className={styles.formLabel} htmlFor="title">Title</label>
                            <input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required className={styles.formInput} />
                        </div>
                        <div className={`${styles.formGroup} ${styles.spanFull}`}>
                            <label className={styles.formLabel} htmlFor="description">Description</label>
                            <textarea id="description" name="description" value={formData.description} onChange={handleChange} required className={styles.formTextarea} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="condition_id">Condition</label>
                            <select id="condition_id" name="condition_id" value={formData.condition_id} onChange={handleIdChange} required className={styles.formSelect}>
                                <option value={0}>Select Condition</option>
                                {conditions.map(c => (
                                    <option key={c.ID} value={c.ID}>{c.condition_name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="category_id">Category</label>
                            <select id="category_id" name="category_id" value={formData.category_id} onChange={handleIdChange} required className={styles.formSelect}>
                                <option value={0}>Select Category</option>
                                {categories.map(c => (
                                    <option key={c.ID} value={c.ID}>{c.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="desired_exchange">Desired Exchange</label>
                            <input type="text" id="desired_exchange" name="desired_exchange" value={formData.desired_exchange} onChange={handleChange} className={styles.formInput} />
                        </div>
                        <div className={styles.formGroup}>
                            <label className={styles.formLabel} htmlFor="meetup_location">Meetup Location</label>
                            <input type="text" id="meetup_location" name="meetup_location" value={formData.meetup_location} onChange={handleChange} className={styles.formInput} />
                        </div>
                        <div className={`${styles.formGroup} ${styles.spanFull}`}>
                            <label className={styles.formLabel} htmlFor="meetup_availability">Availability</label>
                            <input type="text" id="meetup_availability" name="meetup_availability" value={formData.meetup_availability} onChange={handleChange} className={styles.formInput} />
                        </div>

                        {/* 🌟 5. เปลี่ยน Input เป็น File 🌟 */}
                        <div className={`${styles.formGroup} ${styles.spanFull}`}>
                            <label className={styles.formLabel} htmlFor="fileUpload">Add Images</label>
                            <input 
                                type="file" 
                                id="fileUpload"
                                multiple 
                                accept="image/png, image/jpeg" 
                                onChange={handleFileChange}
                                className={styles.formInput} 
                            />
                            
                            {selectedFiles.length > 0 && (
                                <div className={styles.fileList}>
                                    <strong>Selected files ({selectedFiles.length}):</strong>
                                    <ul>
                                        {selectedFiles.map((file, index) => (
                                            <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {error && <p className={styles.errorMessage}>{error}</p>}

                    {/* ปุ่ม Submit */}
                    <div className={styles.buttonContainer}>
                        <button type="button" className={styles.backButton} onClick={() => navigate('/items')}>
                            Cancel
                        </button>
                        <button type="submit" disabled={loading || isUploading} className={styles.submitButton}>
                            {isUploading ? 'Uploading images...' : (loading ? 'Creating...' : 'Register Item')}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default CreateItemPage;