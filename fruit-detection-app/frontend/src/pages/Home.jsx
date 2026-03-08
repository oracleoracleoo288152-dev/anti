import React, { useState, useRef } from 'react';
import axios from 'axios';
import { UploadCloud, Image as ImageIcon, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

const API_URL = 'http://localhost:5000/api';

export default function Home() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const processFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith('image/')) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files[0];
    processFile(droppedFile);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    processFile(selectedFile);
  };

  const triggerFileInput = () => {
    fileInputRef.current.click();
  };

  const handleDetect = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('image', file);

    try {
      const response = await axios.post(`${API_URL}/detect`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      // Small timeout for better UX feeling of "processing"
      setTimeout(() => {
        setResult(response.data.detection);
        setLoading(false);
      }, 1500); // slightly longer for the scan animation
    } catch (error) {
      console.error('Detection failed:', error);
      alert('Detection failed. Ensure backend is running.');
      setLoading(false);
    }
  };

  const resetDetection = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
  };

  return (
    <div className="upload-container">
      <div className="upload-header">
        <h1>Detect Fruits in <span className="text-gradient">Real-Time</span></h1>
        <p>Upload an image of a fruit and our advanced YOLO AI model will instantly identify it with high-precision confidence.</p>
      </div>

      {!preview ? (
        <div 
          className={`upload-area glass ${isDragging ? 'drag-active' : ''}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={triggerFileInput}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/*" 
            style={{ display: 'none' }} 
          />
          <div className="upload-icon-wrapper">
            <UploadCloud size={48} />
          </div>
          <h2>Drag & Drop an image here</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '12px' }}>or click to browse from your computer</p>
          <div style={{ marginTop: '24px', display: 'flex', gap: '8px', opacity: 0.6 }}>
            <span className="badge">JPG</span>
            <span className="badge">PNG</span>
            <span className="badge">WEBP</span>
          </div>
        </div>
      ) : (
        <div className="preview-container glass-panel">
          <div className="preview-image-wrapper">
            <img src={preview} alt="Upload preview" className="preview-image" />
            {loading && <div className="scanning-overlay"></div>}
            {result && (
              <div style={{ position: 'absolute', top: 16, right: 16, background: 'var(--success)', color: 'white', padding: '8px 16px', borderRadius: 20, display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600, boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)', animation: 'slideUp 0.3s ease-out' }}>
                <CheckCircle2 size={18} /> Match Found
              </div>
            )}
          </div>
          
          {!result && (
            <div style={{ display: 'flex', gap: '16px', width: '100%', justifyContent: 'center' }}>
              <button className="btn-secondary" onClick={resetDetection} disabled={loading}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleDetect} disabled={loading} style={{ minWidth: 200 }}>
                {loading ? (
                  <><Loader2 size={20} className="animate-spin" /> Analyzing Image...</>
                ) : (
                  <><Sparkles size={20} /> Detect Fruit</>
                )}
              </button>
            </div>
          )}

          {result && (
            <div className="result-card glass">
              <div className="result-title">Detected Fruit</div>
              <div className="result-fruit text-gradient">{result.fruitName}</div>
              
              <div className="confidence-wrapper">
                <div className="confidence-header">
                  <span>Confidence Score</span>
                  <span>{(result.confidence * 100).toFixed(1)}%</span>
                </div>
                <div className="confidence-bar-bg">
                  <div 
                    className="confidence-bar-fill" 
                    style={{ width: `${result.confidence * 100}%` }}
                  ></div>
                </div>
              </div>

              <button className="btn-secondary" style={{ marginTop: '40px' }} onClick={resetDetection}>
                <ImageIcon size={20} /> Detect Another
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
