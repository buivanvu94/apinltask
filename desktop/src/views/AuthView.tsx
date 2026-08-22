import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function AuthView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMsg('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 401) {
          setErrorMsg('Email hoặc mật khẩu không chính xác.');
        } else if (err.code === 'ERR_NETWORK') {
          setErrorMsg('Không thể kết nối đến máy chủ backend (Port 4000).');
        } else {
          const apiErr = err.response?.data?.error;
          setErrorMsg(typeof apiErr === 'string' ? apiErr : 'Đăng nhập thất bại. Vui lòng thử lại.');
        }
      } else {
        setErrorMsg('Đã xảy ra lỗi không xác định.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #F0F4FF 0%, #F5F7FB 100%)',
      padding: '20px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: '420px',
        background: '#fff',
        borderRadius: '24px',
        padding: '36px 32px',
        boxShadow: '0 20px 40px -15px rgba(21, 42, 99, 0.12), 0 2px 6px rgba(15, 23, 42, 0.04)',
        border: '1px solid rgba(226, 232, 240, 0.8)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '28px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #3B7CF6, #152A63)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px -4px rgba(59, 124, 246, 0.4)',
          }}>
            <svg viewBox="0 0 24 24" width="22" height="22">
              <path d="M5 13l4 4L19 7" stroke="#fff" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div>
            <div style={{ font: "700 22px 'Space Grotesk', sans-serif", color: '#0F172A', letterSpacing: '.01em' }}>
              NLTASK
            </div>
            <div style={{ font: "500 13px sans-serif", color: '#64748B' }}>Đăng nhập để quản lý công việc</div>
          </div>
        </div>

        {errorMsg && (
          <div style={{
            background: '#FEE2E2',
            border: '1px solid #FECACA',
            borderRadius: '12px',
            padding: '11px 14px',
            marginBottom: '18px',
            color: '#DC2626',
            fontSize: '13px',
            fontWeight: 500,
            lineHeight: 1.4,
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nltask.local"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                fontSize: '14px',
                background: '#F8FAFC',
                color: '#0F172A',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
              Mật khẩu
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '12px',
                border: '1px solid #CBD5E1',
                outline: 'none',
                fontSize: '14px',
                background: '#F8FAFC',
                color: '#0F172A',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              marginTop: '8px',
              width: '100%',
              padding: '13px',
              borderRadius: '12px',
              background: isSubmitting ? '#94A3B8' : 'linear-gradient(135deg, #2563EB, #152A63)',
              color: '#fff',
              border: 'none',
              font: "700 14.5px 'Space Grotesk', sans-serif",
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              boxShadow: isSubmitting ? 'none' : '0 8px 20px -6px rgba(37, 99, 235, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
            }}
          >
            {isSubmitting ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <div style={{ marginTop: '24px', textAlign: 'center', fontSize: '12px', color: '#94A3B8' }}>
          NLTASK Desktop · Phiên bản 1.0.0
        </div>
      </div>
    </div>
  );
}
