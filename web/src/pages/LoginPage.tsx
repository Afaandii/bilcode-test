import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsActivity,
  BsLock,
  BsPerson,
  BsExclamationTriangle,
  BsShieldCheck,
  BsPeopleFill,
  BsGraphUpArrow,
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err: any) {
      setLocalError(
        err.message ||
          "Login gagal. Silakan periksa kembali email dan kata sandi Anda.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const displayError = localError || authError;

  return (
    <div className="login-page">
      {/* ── Brand Panel (kiri) ── */}
      <div className="login-brand-panel">
        {/* Floating orbs dekoratif */}
        <div className="login-orb login-orb-1" />
        <div className="login-orb login-orb-2" />
        <div className="login-orb login-orb-3" />
        <div className="login-orb login-orb-4" />

        <div className="login-brand-content">
          <div className="login-brand-logo">
            <BsActivity />
          </div>
          <h1 className="login-brand-title">ProjectPulse</h1>
          <p className="login-brand-subtitle">
            Platform manajemen proyek terpadu untuk tim Admin & Project Manager
            yang modern dan efisien.
          </p>

          <div className="login-brand-features">
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon">
                <BsShieldCheck />
              </div>
              <span className="login-brand-feature-text">
                Autentikasi aman dengan Laravel Sanctum Token
              </span>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon">
                <BsPeopleFill />
              </div>
              <span className="login-brand-feature-text">
                Kelola klien, tim, dan proyek dalam satu dashboard
              </span>
            </div>
            <div className="login-brand-feature">
              <div className="login-brand-feature-icon">
                <BsGraphUpArrow />
              </div>
              <span className="login-brand-feature-text">
                Laporan real-time dan analitik progres proyek
              </span>
            </div>
          </div>
        </div>

        <div className="login-brand-footer">
          © 2025 Bilcode Technology. All rights reserved.
        </div>
      </div>

      {/* ── Form Panel (kanan) ── */}
      <div className="login-form-panel">
        <div className="login-card">
          {/* Header */}
          <div className="login-card-header">
            <div className="login-card-icon">
              <BsActivity />
            </div>
            <h2 className="login-card-title">ProjectPulse Admin</h2>
            <p className="login-card-desc">
              Masuk dengan token Sanctum sebagai Admin / PM
            </p>
          </div>

          {/* Error Alert */}
          {displayError && (
            <div className="login-alert-error" role="alert">
              <BsExclamationTriangle
                className="login-alert-error-icon"
                size={16}
              />
              <div>{displayError}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <div className="login-form-group">
              <label className="login-form-label">Email Admin</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <BsPerson />
                </span>
                <input
                  type="email"
                  className="login-input"
                  placeholder="admin@example.com"
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <div className="login-form-group">
              <label className="login-form-label">Kata Sandi</label>
              <div className="login-input-wrapper">
                <span className="login-input-icon">
                  <BsLock />
                </span>
                <input
                  type="password"
                  className="login-input"
                  placeholder="••••••••"
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>
            </div>

            <button
              type="submit"
              className="login-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="login-spinner"
                    role="status"
                    aria-hidden="true"
                  />
                  <span>Memproses Login...</span>
                </>
              ) : (
                <span>Masuk ke Dashboard</span>
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="login-card-footer">
            <p className="login-card-footer-text">
              <span>Bilcode Technology</span> &bull; Sanctum Token Auth
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
