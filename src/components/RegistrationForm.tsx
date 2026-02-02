import React, { useState } from 'react';
import type { UserDetails } from '../services/bookingService';

interface Props {
  onSubmit: (details: UserDetails) => void;
  onCancel: () => void;
  loading: boolean;
}

export const RegistrationForm = ({ onSubmit, onCancel, loading }: Props) => {
  const [formData, setFormData] = useState<UserDetails>({
    name: '',
    phone: '',
    email: '',
    studentId: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="modal-overlay" style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(31, 41, 55, 0.4)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      backdropFilter: 'blur(12px)',
      padding: '20px'
    }}>
      <div className="glass-card" style={{
        maxWidth: '450px',
        width: '100%',
        padding: '32px',
        background: 'rgba(255,255,255,0.9)',
        boxShadow: '0 20px 60px -10px rgba(0,0,0,0.3)',
        border: '1px solid rgba(255,255,255,0.8)'
      }}>
        <h2 style={{
          textAlign: 'left',
          marginBottom: '24px',
          fontSize: '1.8rem',
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontWeight: 800
        }}>
          <span style={{
            borderLeft: '6px solid #6366f1',
            paddingLeft: '16px',
            display: 'block',
            lineHeight: '1.2'
          }}>填寫報名資料</span>
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div>
            <label className="slot-name" style={{ fontSize: '1.1rem', marginBottom: '10px', display: 'block', color: '#374151' }}>
              👤 姓名 Name
            </label>
            <input
              required
              type="text"
              placeholder="請輸入姓名 / Your Name"
              value={formData.name}
              onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
              style={{ background: '#f9fafb' }}
            />
          </div>

          <div>
            <label className="slot-name" style={{ fontSize: '1.1rem', marginBottom: '10px', display: 'block', color: '#374151' }}>
              📞 電話 Phone
            </label>
            <input
              required
              type="tel"
              placeholder="09xx-xxx-xxx"
              value={formData.phone}
              onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              style={{ background: '#f9fafb' }}
            />
          </div>

          <div>
            <label className="slot-name" style={{ fontSize: '1.1rem', marginBottom: '10px', display: 'block', color: '#374151' }}>
              ✉️ Email (選填)
            </label>
            <input
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={e => setFormData(prev => ({ ...prev, email: e.target.value }))}
              style={{ background: '#f9fafb' }}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', marginTop: '12px' }}>
            <button type="button" onClick={onCancel} className="btn-secondary" disabled={loading} style={{
              borderRadius: '16px',
              fontSize: '1.1rem',
              justifyContent: 'center'
            }}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{
              borderRadius: '16px',
              fontSize: '1.1rem',
              justifyContent: 'center',
              boxShadow: '0 4px 15px rgba(79, 70, 229, 0.4)'
            }}>
              {loading ? '處理中...' : '確認報名 →'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

};
