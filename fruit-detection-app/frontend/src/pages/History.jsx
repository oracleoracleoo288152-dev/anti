import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, Tag, ChevronRight, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';
const BACKEND_URL = 'http://localhost:5000'; // For images

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await axios.get(`${API_URL}/history`);
        setHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div className="animate-spin text-gradient" style={{ fontSize: '3rem' }}>⌛</div>
        <div style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>Loading Detection History...</div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="history-header">
        <div>
          <h1>Detection <span className="text-gradient">History</span></h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px', fontSize: '1.1rem' }}>Review your past AI scans and their confidence scores.</p>
        </div>
        <div className="badge" style={{ padding: '8px 16px', fontSize: '1rem', background: 'rgba(217, 70, 239, 0.15)', borderColor: 'rgba(217, 70, 239, 0.3)', color: '#f0abfc' }}>
          {history.length} Detections Total
        </div>
      </div>

      {history.length === 0 ? (
        <div className="glass-panel" style={{ padding: '80px 48px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <AlertCircle size={64} color="var(--text-secondary)" opacity={0.5} />
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>No History Found</h2>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 400 }}>You haven't scanned any fruits yet. Head over to the Detect page to upload your first image.</p>
        </div>
      ) : (
        <div className="history-grid">
          {history.map((item) => (
            <div key={item._id} className="history-card glass">
              <div className="history-img-wrapper">
                <img 
                  src={`${BACKEND_URL}${item.imageUrl}`} 
                  alt={item.fruitName} 
                  className="history-img" 
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/18181b/a1a1aa?text=Image+Not+Found';
                  }}
                />
              </div>
              <div className="history-info">
                <div className="history-meta">
                  <span className="badge">
                    {(item.confidence * 100).toFixed(1)}% Match
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={14} />
                    {new Date(item.detectedAt).toLocaleDateString()}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '4px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Tag size={20} color="var(--accent-2)" />
                    <div className="history-fruit">{item.fruitName}</div>
                  </div>
                  <ChevronRight size={20} color="var(--text-secondary)" style={{ opacity: 0.5 }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
