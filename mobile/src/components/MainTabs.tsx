import React from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { Redirect, Route } from 'react-router-dom';
import { checkboxOutline, personOutline } from 'ionicons/icons';
import TaskList from '../screens/TaskList';
import TaskDetail from '../screens/TaskDetail';
import Home from '../pages/Home';
import { ProtectedRoute } from './ProtectedRoute';

export const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <ProtectedRoute exact path="/tasks" component={TaskList} />
        <ProtectedRoute exact path="/tasks/:id" component={TaskDetail} />
        <ProtectedRoute exact path="/home" component={Home} />
        <Route exact path="/" render={() => <Redirect to="/tasks" />} />
      </IonRouterOutlet>

      <IonTabBar slot="bottom" color="dark">
        <IonTabButton tab="tasks" href="/tasks">
          <IonIcon icon={checkboxOutline} />
          <IonLabel>Task Saya</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/home">
          <IonIcon icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
