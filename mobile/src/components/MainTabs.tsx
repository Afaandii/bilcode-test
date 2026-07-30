import React from 'react';
import {
  IonTabs,
  IonTabBar,
  IonTabButton,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
} from '@ionic/react';
import { Redirect, Route, Switch } from 'react-router-dom';
import { checkboxOutline, checkmarkDoneCircleOutline, personOutline } from 'ionicons/icons';
import TaskList from '../screens/TaskList';
import TaskDetail from '../screens/TaskDetail';
import CompletedTasks from '../screens/CompletedTasks';
import Notifications from '../screens/Notifications';
import Home from '../pages/Home';
import { ProtectedRoute } from './ProtectedRoute';
import './MainTabs.css';

export const MainTabs: React.FC = () => {
  return (
    <IonTabs>
      <IonRouterOutlet>
        <Switch>
          <ProtectedRoute exact path="/tasks" component={TaskList} />
          <ProtectedRoute exact path="/tasks/detail/:id" component={TaskDetail} />
          <ProtectedRoute exact path="/completed-tasks" component={CompletedTasks} />
          <ProtectedRoute exact path="/notifications" component={Notifications} />
          <ProtectedRoute exact path="/home" component={Home} />
          <Route exact path="/" render={() => <Redirect to="/tasks" />} />
        </Switch>
      </IonRouterOutlet>

      <IonTabBar slot="bottom" className="main-tab-bar">
        <IonTabButton tab="tasks" href="/tasks" className="tab-btn">
          <IonIcon icon={checkboxOutline} />
          <IonLabel>Task Saya</IonLabel>
        </IonTabButton>

        <IonTabButton tab="completed" href="/completed-tasks" className="tab-btn">
          <IonIcon icon={checkmarkDoneCircleOutline} />
          <IonLabel>Task Selesai</IonLabel>
        </IonTabButton>

        <IonTabButton tab="profile" href="/home" className="tab-btn">
          <IonIcon icon={personOutline} />
          <IonLabel>Profil</IonLabel>
        </IonTabButton>
      </IonTabBar>
    </IonTabs>
  );
};

export default MainTabs;
