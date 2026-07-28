import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BsActivity, BsLock, BsPerson } from 'react-icons/bs';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate login for PM / Admin
    navigate('/dashboard');
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div className="card border-0 shadow-lg p-4 p-md-5 rounded-4" style={{ maxWidth: '440px', width: '100%' }}>
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient text-white rounded-4 p-3 mb-3 shadow">
            <BsActivity size={32} />
          </div>
          <h4 className="fw-bold text-dark mb-1">ProjectPulse Admin</h4>
          <p className="text-muted fs-7">Masuk sebagai Admin / PM untuk mengelola proyek</p>
        </div>

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold fs-7 text-secondary">Email / Username</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <BsPerson />
              </span>
              <input 
                type="email" 
                className="form-control border-start-0 ps-0" 
                placeholder="admin@bilcode.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold fs-7 text-secondary">Kata Sandi</label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <BsLock />
              </span>
              <input 
                type="password" 
                className="form-control border-start-0 ps-0" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm">
            Masuk ke Dashboard
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">Bilcode Technology Technical Test</small>
        </div>
      </div>
    </div>
  );
};
