import React, { useEffect, useState } from 'react';
import axiosLocalApi from '../../../api/local-api'; // Ensure axios is configured correctly
import Headers from '../../Header';
import { useNavigate } from 'react-router-dom';
import './RevisionUser.css';
import Footer from '../../Footer';
import Sidebar from '../../User/SideBar'; // Import the new Sidebar component
import Headers2 from '../../Headers2';

export default function RevisionUser() {
    const [subjects, setSubjects] = useState([]); // Store subject data
    const [selectedSubject, setSelectedSubject] = useState(null); // Store selected subject
    const navigate = useNavigate(); // Initialize useNavigate

    // Initial loading
    useEffect(() => {
        getAllSubjects();
    }, []);

    // API call to get subjects
    const getAllSubjects = async () => {
        try {
            const resp = await axiosLocalApi.get('/public/subjects'); // Call API to fetch subjects
            console.log('Dữ liệu nhận được:', resp.data);
            setSubjects(resp.data); // Store data in state
        } catch (error) {
            if (error.response) {
                console.error('Lỗi từ server:', error.response.data);
            } else if (error.request) {
                console.error('Không có phản hồi từ server:', error.request);
            } else {
                console.error('Lỗi khác:', error.message);
            }
        }
    };

    // Handle selecting chapters
    const handleSelectChapters = (subjectId) => {
        navigate(`/listChap`, { state: { subjectId } });
    };

    // Handle selecting a subject in sidebar
    const handleSelectSubject = (subjectId) => {
        const selected = subjects.find(subject => subject.subjectId === subjectId);
        setSelectedSubject(selected);
    };

    return (
        <div>
            {/* <Headers /> */}
            <Headers2 />
            <div className="revision">
                {/* Sidebar */}
                <Sidebar 
                    subjects={subjects} 
                    selectedSubject={selectedSubject} 
                    onSelectSubject={handleSelectSubject} 
                />

                {/* Main Content */}
                <div className="content">
                    <section className='category-re'>
                        <div className="container-re">
                            {/* Display details of selected subject */}
                            {selectedSubject ? (
                                <div className="card">
                                <div className='card-img-com'>
                                            <div className='card-img'>
                                            <img src='/computer.png'></img>
                                            </div>
                                            </div>
                                    <div className='card-two'>
                                        <div className="card-content">
                                            <h3>{selectedSubject.name}</h3>
                                        </div>
                                        <div className='card-button-re'>
                                        <button
                                            className="card-button"
                                            onClick={() => 
                                                // navigate(`/subject/${selectedSubject.subjectId}`)
                                                handleSelectChapters(selectedSubject.subjectId)
                                            } // Navigate to chapters page
                                        >
                                            Chọn chương
                                        </button>
                                        </div>
                                    </div>
                                </div>

                            ) : (
                                <div className="subject-list">
                                    {subjects.map((item) => (
                                        <div className="card" key={item.subjectId}>
                                        <div className='card-img-com'>
                                            <div className='card-img'>
                                            <img src='/computer.png'></img>
                                            </div>
                                            </div>
                                            <div className='card-two'>
                                                <div className="card-content">
                                                    <h3>{item.name}</h3> {/* Display subject name */}
                                                </div>
                                                <div className='card-button-re'>
                                                <button
                                                    className="card-button"
                                                    onClick={() => handleSelectChapters(item.subjectId)} // Navigate to chapters of the subject
                                                >
                                                    Chọn chương
                                                </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                    </section>
                </div>
            </div>
            <Footer />
        </div>
    );
}
