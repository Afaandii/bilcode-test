import React, { useState } from "react";
import {
  IonPage,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonToast,
  IonSpinner,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonBadge,
  useIonRouter,
} from "@ionic/react";
import {
  mailOutline,
  lockClosedOutline,
  logInOutline,
  eyeOutline,
  eyeOffOutline,
  briefcaseOutline,
  personOutline,
  alertCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import "./Login.css";

const Login: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const { login, isLoading } = useAuth();
  const router = useIonRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email || !password) {
      setErrorMessage("Silakan isi email dan password.");
      return;
    }

    try {
      const result = await login(email, password);

      if (result.success) {
        setToastMessage("Login berhasil!");
        setShowToast(true);
        router.push("/home", "forward", "replace");
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan sistem saat login.");
    }
  };

  return (
    <IonPage id="login-page">
      <IonHeader className="ion-no-border login-header">
        <IonToolbar>
          <IonTitle>ProjectPulse Mobile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="login-content" fullscreen scrollY={true}>
        {/*
          login-page-wrapper:
          - Fills 100vh with the animated gradient background
          - Contains orbs (position:absolute) and centered form
          - This is the safest pattern for Ionic: one wrapper div
            inside IonContent handles everything
        */}
        <div className="login-page-wrapper">
          {/* Floating glow orbs */}
          <div className="login-bg-orb orb-1" />
          <div className="login-bg-orb orb-2" />
          <div className="login-bg-orb orb-3" />

          {/* Centered form content */}
          <div className="login-scroll-content">
            <div className="login-container">
              {/* Brand Header */}
              <div className="brand-header">
                <div className="brand-icon-wrapper">
                  <IonIcon icon={briefcaseOutline} className="brand-icon" />
                </div>
                <h2>ProjectPulse</h2>
                <p className="brand-subtitle">
                  Platform Task &amp; Progres Tim Member
                </p>
                <IonBadge color="tertiary" className="role-badge">
                  <IonIcon
                    icon={personOutline}
                    style={{ marginRight: "4px" }}
                  />{" "}
                  Role: Member App
                </IonBadge>
              </div>

              {/* Login Card */}
              <IonCard className="login-card">
                <IonCardHeader>
                  <IonCardTitle>Masuk ke Akun Anda</IonCardTitle>
                  <IonCardSubtitle>
                    Gunakan akun member untuk melihat task &amp; progres
                  </IonCardSubtitle>
                </IonCardHeader>

                <IonCardContent>
                  {errorMessage && (
                    <div className="error-banner">
                      <IonIcon icon={alertCircleOutline} />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleLogin}>
                    <IonItem className="input-item" lines="full">
                      <IonIcon
                        icon={mailOutline}
                        slot="start"
                        className="input-icon"
                      />
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onIonInput={(e) => setEmail(e.detail.value!)}
                        required
                        placeholder="nama@perusahaan.com"
                      />
                    </IonItem>

                    <IonItem className="input-item" lines="full">
                      <IonIcon
                        icon={lockClosedOutline}
                        slot="start"
                        className="input-icon"
                      />
                      <IonLabel position="floating">Password</IonLabel>
                      <IonInput
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onIonInput={(e) => setPassword(e.detail.value!)}
                        required
                        placeholder="Masukkan password"
                      />
                      <IonButton
                        fill="clear"
                        slot="end"
                        className="password-toggle"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        <IonIcon
                          icon={showPassword ? eyeOffOutline : eyeOutline}
                          slot="icon-only"
                        />
                      </IonButton>
                    </IonItem>

                    <div className="ion-margin-top">
                      <IonButton
                        expand="block"
                        type="submit"
                        disabled={isLoading}
                        shape="round"
                        className="login-button"
                      >
                        {isLoading ? (
                          <>
                            <IonSpinner
                              name="crescent"
                              style={{ marginRight: "8px" }}
                            />
                            Memproses...
                          </>
                        ) : (
                          <>
                            <IonIcon icon={logInOutline} slot="start" />
                            Masuk
                          </>
                        )}
                      </IonButton>
                    </div>
                  </form>
                </IonCardContent>
              </IonCard>
            </div>
          </div>
        </div>

        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={2000}
          color="success"
        />
      </IonContent>
    </IonPage>
  );
};

export default Login;
