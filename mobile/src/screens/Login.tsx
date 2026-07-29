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
  IonText,
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

  const handleFillDemoMember = () => {
    setEmail("member@bilcode.com");
    setPassword("password123");
  };

  const handleFillDemoAdmin = () => {
    setEmail("admin@projectpulse.com");
    setPassword("password");
  };

  return (
    <IonPage id="login-page">
      <IonHeader className="ion-no-border">
        <IonToolbar color="primary">
          <IonTitle>ProjectPulse Mobile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding login-content">
        <div className="login-container">
          <div className="brand-header">
            <div className="brand-icon-wrapper">
              <IonIcon icon={briefcaseOutline} className="brand-icon" />
            </div>
            <h2>ProjectPulse</h2>
            <p className="brand-subtitle">Platform Task & Progres Tim Member</p>
            <IonBadge color="tertiary" className="role-badge">
              <IonIcon icon={personOutline} style={{ marginRight: "4px" }} />{" "}
              Role: Member App
            </IonBadge>
          </div>

          <IonCard className="login-card">
            <IonCardHeader>
              <IonCardTitle>Masuk ke Akun Anda</IonCardTitle>
              <IonCardSubtitle>
                Gunakan akun member untuk melihat task & progres
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

          <div className="demo-credentials">
            <IonText color="medium">
              <p
                style={{
                  textAlign: "center",
                  fontSize: "0.85rem",
                  marginBottom: "8px",
                }}
              >
                Quick Test Credentials (Klik untuk isi cepat):
              </p>
            </IonText>
            <div className="demo-buttons">
              <IonButton
                fill="outline"
                size="small"
                onClick={handleFillDemoMember}
              >
                Member (Developer)
              </IonButton>
              <IonButton
                fill="outline"
                color="secondary"
                size="small"
                onClick={handleFillDemoAdmin}
              >
                Admin (PM)
              </IonButton>
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
