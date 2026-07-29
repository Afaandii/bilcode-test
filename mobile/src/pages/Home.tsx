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
  IonItem,
  IonLabel,
  IonText,
  useIonRouter,
} from '@ionic/react';
import { logOutOutline, personCircleOutline, keyOutline, checkmarkCircleOutline } from 'ionicons/icons';
import { useAuth } from '../context/AuthContext';
import './Home.css';

const Home: React.FC = () => {
  const { user, token, logout } = useAuth();
  const router = useIonRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/login', 'back', 'replace');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>ProjectPulse - Member Home</IonTitle>
          <IonButton slot="end" fill="clear" color="light" onClick={handleLogout}>
            <IonIcon icon={logOutOutline} slot="icon-only" />
          </IonButton>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <IonIcon icon={personCircleOutline} style={{ fontSize: '40px', color: '#3b82f6' }} />
              <div>
                <IonCardTitle>{user?.name || 'Member User'}</IonCardTitle>
                <IonCardSubtitle>{user?.email}</IonCardSubtitle>
              </div>
            </div>
          </IonCardHeader>

          <IonCardContent>
            <IonItem lines="none" style={{ '--background': 'transparent' }}>
              <IonLabel>Role Hak Akses:</IonLabel>
              <IonBadge color={user?.role === 'member' ? 'success' : 'warning'}>
                {user?.role?.toUpperCase() || 'MEMBER'}
              </IonBadge>
            </IonItem>

            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                <IonIcon icon={keyOutline} color="secondary" />
                <strong>Laravel Sanctum Bearer Token:</strong>
              </div>
              <IonText color="medium">
                <code style={{ fontSize: '0.75rem', wordBreak: 'break-all' }}>
                  {token ? `${token.substring(0, 30)}...` : 'No active token'}
                </code>
              </IonText>
            </div>

            <div style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
              <IonIcon icon={checkmarkCircleOutline} />
              <span>Autentikasi Member Berhasil (Task 1 Complete)</span>
            </div>

            <IonButton expand="block" color="danger" style={{ marginTop: '24px' }} onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="start" />
              Keluar (Logout)
            </IonButton>
          </IonCardContent>
        </IonCard>
      </IonContent>
    </IonPage>
  );
};

export default Home;
