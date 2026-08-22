import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

export function AuthView() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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

  const fillDemoAdmin = () => {
    setEmail('admin@nltask.local');
    setPassword('admin123456');
    setErrorMsg(null);
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        width: '100vw',
        background: '#0B1220',
        overflow: 'hidden',
        userSelect: 'none',
      }}
    >
      {/* Left Panel - Brand Showcase & Feature Spotlight (52% width) */}
      <div
        style={{
          flex: '1.15',
          background: 'radial-gradient(circle at 20% 20%, rgba(37, 99, 235, 0.25) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(124, 58, 237, 0.2) 0%, transparent 50%), linear-gradient(160deg, #152A63 0%, #0B1220 100%)',
          color: '#fff',
          padding: '48px 56px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          position: 'relative',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <img
              src="/logo.png"
              alt="NLTECH Logo"
              style={{
                width: '42px',
                height: '42px',
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 10px rgba(0,0,0,0.3))',
              }}
            />
            <div>
              <div style={{ font: "700 20px 'Space Grotesk', sans-serif", color: '#fff', letterSpacing: '.03em' }}>
                NLTECH
              </div>
              <div style={{ font: '600 10.5px sans-serif', color: 'rgba(255,255,255,0.6)', letterSpacing: '.08em' }}>
                SOFTWARE TECHNOLOGY SOLUTION
              </div>
            </div>
          </div>

          <div
            style={{
              font: '700 11px sans-serif',
              background: 'rgba(255, 255, 255, 0.1)',
              color: '#93C5FD',
              padding: '4px 10px',
              borderRadius: '6px',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              letterSpacing: '.05em',
            }}
          >
            ENTERPRISE EDITION
          </div>
        </div>

        {/* Center Hero Spotlight */}
        <div style={{ margin: '40px 0', maxWidth: '540px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.05)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
                flex: 'none',
              }}
            >
              <img
                src="/logo.png"
                alt="NLTECH Diamond"
                style={{
                  width: '82px',
                  height: '82px',
                  objectFit: 'contain',
                  filter: 'drop-shadow(0 8px 16px rgba(37,99,235,0.4))',
                }}
              />
            </div>
            <div>
              <div
                style={{
                  font: '700 12px sans-serif',
                  color: '#60A5FA',
                  textTransform: 'uppercase',
                  letterSpacing: '.12em',
                  marginBottom: '4px',
                }}
              >
                NLTASK WORKSPACE
              </div>
              <div style={{ font: "700 28px/1.25 'Space Grotesk', sans-serif", color: '#fff' }}>
                Quản lý &amp; Tối ưu Năng suất
              </div>
            </div>
          </div>

          <div
            style={{
              font: '500 15px/1.6 sans-serif',
              color: 'rgba(255, 255, 255, 0.75)',
              marginBottom: '32px',
            }}
          >
            Giải pháp công nghệ phần mềm chuyên nghiệp từ NLTECH. Lập kế hoạch, theo dõi tiến độ và tối ưu hóa năng suất làm việc mỗi ngày.
          </div>

          {/* 3 Highlight Cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#93C5FD',
                  flex: 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                </svg>
              </div>
              <div>
                <div style={{ font: '700 14px sans-serif', color: '#fff' }}>Nhắc nhở thông minh</div>
                <div style={{ font: '500 12.5px sans-serif', color: 'rgba(255, 255, 255, 0.6)' }}>Thông báo đẩy &amp; âm thanh đúng giờ</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(168, 85, 247, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#D8B4FE',
                  flex: 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <div>
                <div style={{ font: '700 14px sans-serif', color: '#fff' }}>Báo cáo hiệu suất trực quan</div>
                <div style={{ font: '500 12.5px sans-serif', color: 'rgba(255, 255, 255, 0.6)' }}>Biểu đồ 7 ngày &amp; phân loại danh mục chi tiết</div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                padding: '12px 16px',
                background: 'rgba(255, 255, 255, 0.06)',
                borderRadius: '10px',
                border: '1px solid rgba(255, 255, 255, 0.08)',
              }}
            >
              <div
                style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'rgba(16, 185, 129, 0.25)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#6EE7B7',
                  flex: 'none',
                }}
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
              </div>
              <div>
                <div style={{ font: '700 14px sans-serif', color: '#fff' }}>Bảo mật chuẩn Enterprise</div>
                <div style={{ font: '500 12.5px sans-serif', color: 'rgba(255, 255, 255, 0.6)' }}>Xác thực JWT an toàn &amp; phân quyền thành viên</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ font: '500 12.5px sans-serif', color: 'rgba(255, 255, 255, 0.45)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>© 2026 NLTECH. All rights reserved.</span>
          <span>Phiên bản v1.0.0</span>
        </div>
      </div>

      {/* Right Panel - Grand Login Form (48% width) */}
      <div
        style={{
          flex: '1',
          background: '#F8FAFC',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '40px',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '430px',
            background: '#fff',
            borderRadius: '10px',
            padding: '40px 36px',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08), 0 2px 6px rgba(15, 23, 42, 0.03)',
            border: '1px solid rgba(226, 232, 240, 0.9)',
          }}
        >
          {/* Form Header */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
              <img
                src="/logo.png"
                alt="NLTECH Logo"
                style={{ width: '32px', height: '32px', objectFit: 'contain' }}
              />
              <span style={{ font: "700 15px 'Space Grotesk', sans-serif", color: '#2563EB', letterSpacing: '.05em' }}>
                NLTECH
              </span>
            </div>

            <div style={{ font: "700 26px/1.25 'Space Grotesk', sans-serif", color: '#0F172A' }}>
              Đăng nhập hệ thống
            </div>
            <div style={{ font: '500 14px sans-serif', color: '#64748B', marginTop: '6px' }}>
              Vui lòng nhập tài khoản để truy cập không gian NLTASK
            </div>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div
              style={{
                background: '#FEE2E2',
                border: '1px solid #FECACA',
                borderRadius: '10px',
                padding: '12px 16px',
                marginBottom: '20px',
                color: '#DC2626',
                fontSize: '13.5px',
                fontWeight: 500,
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
              }}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flex: 'none' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {/* Email Field */}
            <div>
              <label style={{ display: 'block', fontSize: '13.5px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                Địa chỉ Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: '#94A3B8', display: 'flex' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@nltask.local"
                  required
                  style={{
                    width: '100%',
                    padding: '13px 14px 13px 42px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    fontSize: '15px',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    transition: 'border 0.15s ease',
                  }}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <label style={{ fontSize: '13.5px', fontWeight: 600, color: '#334155' }}>
                  Mật khẩu
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  {showPassword ? 'Ẩn' : 'Hiện'}
                </button>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '14px', color: '#94A3B8', display: 'flex' }}>
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  style={{
                    width: '100%',
                    padding: '13px 14px 13px 42px',
                    borderRadius: '10px',
                    border: '1px solid #CBD5E1',
                    outline: 'none',
                    fontSize: '15px',
                    background: '#F8FAFC',
                    color: '#0F172A',
                    boxSizing: 'border-box',
                    transition: 'border 0.15s ease',
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                marginTop: '6px',
                width: '100%',
                padding: '14px',
                borderRadius: '10px',
                background: isSubmitting ? '#94A3B8' : 'linear-gradient(135deg, #2563EB 0%, #152A63 100%)',
                color: '#fff',
                border: 'none',
                font: "700 15.5px 'Space Grotesk', sans-serif",
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
                boxShadow: isSubmitting ? 'none' : '0 8px 20px -6px rgba(37, 99, 235, 0.5)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {isSubmitting ? (
                <>
                  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" fill="none" strokeWidth="2.5" style={{ animation: 'spin 1s linear infinite' }}>
                    <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
                    <path d="M12 2a10 10 0 0 1 10 10" />
                  </svg>
                  Đang đăng nhập...
                </>
              ) : (
                <>
                  Đăng nhập
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div
            style={{
              marginTop: '22px',
              padding: '12px 14px',
              background: '#F1F5F9',
              borderRadius: '8px',
              border: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ font: '700 12px sans-serif', color: '#334155' }}>Tài khoản Admin mặc định</div>
              <div style={{ font: '500 11.5px sans-serif', color: '#64748B' }}>admin@nltask.local</div>
            </div>
            <button
              type="button"
              onClick={fillDemoAdmin}
              style={{
                background: '#fff',
                border: '1px solid #CBD5E1',
                borderRadius: '6px',
                padding: '5px 10px',
                fontSize: '12px',
                fontWeight: 600,
                color: '#2563EB',
                cursor: 'pointer',
              }}
            >
              Điền nhanh
            </button>
          </div>

          {/* Security & System Footer */}
          <div
            style={{
              marginTop: '24px',
              textAlign: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              font: '500 12px sans-serif',
              color: '#94A3B8',
            }}
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Bảo mật 256-bit SSL &amp; JWT Token
          </div>
        </div>
      </div>
    </div>
  );
}
