import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  BsActivity,
  BsLock,
  BsPerson,
  BsExclamationTriangle,
} from "react-icons/bs";
import { useAuth } from "../hooks/useAuth";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, error: authError, clearError } = useAuth();

  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("password");
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
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light px-3">
      <div
        className="card border-0 shadow-lg p-4 p-md-5 rounded-4"
        style={{ maxWidth: "440px", width: "100%" }}
      >
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center bg-primary bg-gradient text-white rounded-4 p-3 mb-3 shadow">
            <BsActivity size={32} />
          </div>
          <h4 className="fw-bold text-dark mb-1">ProjectPulse Admin</h4>
          <p className="text-muted fs-7">
            Masuk dengan token Sanctum sebagai Admin / PM
          </p>
        </div>

        {displayError && (
          <div
            className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 fs-7 mb-3 rounded-3"
            role="alert"
          >
            <BsExclamationTriangle className="flex-shrink-0" size={18} />
            <div>{displayError}</div>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <label className="form-label fw-semibold fs-7 text-secondary">
              Email Admin
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <BsPerson />
              </span>
              <input
                type="email"
                className="form-control border-start-0 ps-0"
                placeholder="admin@example.com"
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold fs-7 text-secondary">
              Kata Sandi
            </label>
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <BsLock />
              </span>
              <input
                type="password"
                className="form-control border-start-0 ps-0"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary w-100 py-2.5 rounded-3 fw-semibold shadow-sm d-flex align-items-center justify-content-center gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm"
                  role="status"
                  aria-hidden="true"
                ></span>
                <span>Memproses Login...</span>
              </>
            ) : (
              <span>Masuk ke Dashboard</span>
            )}
          </button>
        </form>

        <div className="text-center mt-4">
          <small className="text-muted">
            Bilcode Technology &bull; Sanctum Token Auth
          </small>
        </div>
      </div>
    </div>
  );
};
