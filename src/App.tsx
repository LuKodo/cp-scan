import { Redirect, Route } from "react-router-dom";
import { IonApp, IonRouterOutlet, setupIonicReact } from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { AuthProvider } from "./auth/auth.context";

/* Core CSS required for Ionic components to work properly */
import "@ionic/react/css/core.css";

/* Basic CSS for apps built with Ionic */
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";

/* Optional CSS utils that can be commented out */
import "@ionic/react/css/padding.css";
import "@ionic/react/css/float-elements.css";
import "@ionic/react/css/text-alignment.css";
import "@ionic/react/css/text-transformation.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";

import Login from "./pages/Login";
import CaptureSignature from "./pages/CaptureSignature";
import CaptureQR from "./pages/CaptureQR";
import CaptureDocument from "./pages/CaptureDocument";
import CaptureSignaturePicture from "./pages/CaptureSignaturePicture";

setupIonicReact();

const App: React.FC = () => {
  return (
    <IonApp>
      <AuthProvider>
        <IonReactRouter>
          <IonRouterOutlet>
            <Route exact path="/login">
              <Login />
            </Route>
            <Route exact path="/step-1">
              <CaptureQR />
            </Route>
            <Route exact path="/step-2">
              <CaptureDocument />
            </Route>
            <Route exact path="/step-3-signature">
              <CaptureSignature />
            </Route>
            <Route exact path="/step-3-picture">
              <CaptureSignaturePicture />
            </Route>
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        </IonReactRouter>
      </AuthProvider>
    </IonApp>
  );
};

export default App;
