import React from "react";
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardSubtitle,
  IonCardContent,
  IonBadge,
  useIonRouter,
} from "@ionic/react";
import {
  logOutOutline,
  personCircleOutline,
  checkmarkCircleOutline,
} from "ionicons/icons";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home: React.FC = () => {
  const { user, logout } = useAuth();
  const router = useIonRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login", "back", "replace");
  };

  return (
    <IonPage id="home-page">
      <IonHeader>
        <IonToolbar className="home-toolbar">
          <IonTitle>ProjectPulse - Profil</IonTitle>
          <IonButton
            slot="end"
            fill="clear"
            className="home-logout-btn"
            onClick={handleLogout}
          >
            <IonIcon icon={logOutOutline} slot="icon-only" />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="home-content">
        <div className="profile-wrapper">

          {/* ── Profile Hero Card ── */}
          <IonCard className="profile-hero-card">
            <IonCardContent>
              {/* Identity row */}
              <div className="profile-identity">
                <div className="profile-avatar-wrapper">
                  <IonIcon icon={personCircleOutline} />
                </div>
                <div>
                  <h2 className="profile-name">{user?.name || "Member User"}</h2>
                  <p className="profile-email">{user?.email}</p>
                </div>
              </div>

              {/* Role row */}
              <div className="profile-role-row">
                <span className="profile-role-label">Role Hak Akses</span>
                <IonBadge
                  color={user?.role === "member" ? "success" : "warning"}
                  className="profile-role-badge"
                >
                  {user?.role?.toUpperCase() || "MEMBER"}
                </IonBadge>
              </div>

              {/* Auth success */}
              <div className="profile-auth-success">
                <IonIcon icon={checkmarkCircleOutline} />
                <span>Autentikasi Member Berhasil (Task 1 Complete)</span>
              </div>
            </IonCardContent>
          </IonCard>

          {/* ── Logout Card ── */}
          <IonCard className="logout-card">
            <IonCardHeader>
              <IonCardTitle>Keluar dari Akun</IonCardTitle>
              <IonCardSubtitle>
                Sesi Anda akan diakhiri dan diarahkan ke halaman login
              </IonCardSubtitle>
            </IonCardHeader>
            <IonCardContent>
              <IonButton
                expand="block"
                className="logout-btn"
                onClick={handleLogout}
              >
                <IonIcon icon={logOutOutline} slot="start" />
                Keluar (Logout)
              </IonButton>
            </IonCardContent>
          </IonCard>

        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
