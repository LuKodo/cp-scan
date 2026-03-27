import { memo, useEffect, useState } from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact, IonLoading } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route, Redirect } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider, workflowService } from './features';
import { ROUTES, THEME } from './core';

// Pages
import { LoginPage } from './pages';
import { QRScannerPage } from './pages';
import { DocumentCapturePage } from './pages';
import { SignaturePage } from './pages';

// Ionic CSS
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

setupIonicReact();

const AppContent = memo(() => {
  const [isDbReady, setIsDbReady] = useState(false);

  useEffect(() => {
    const initDb = async () => {
      await workflowService.init();
      setIsDbReady(true);
    };

    initDb();
  }, []);

  if (!isDbReady) {
    return (
      <IonLoading
        isOpen={true}
        message="Inicializando aplicación..."
        spinner="crescent"
      />
    );
  }

  return (
    <IonReactRouter>
      <IonRouterOutlet>
        <Route exact path={ROUTES.LOGIN} component={LoginPage} />
        <Route exact path={ROUTES.STEP_1_QR} component={QRScannerPage} />
        <Route exact path={ROUTES.STEP_2_DOCUMENT} component={DocumentCapturePage} />
        <Route exact path={ROUTES.STEP_3_SIGNATURE} component={SignaturePage} />
        <Route exact path={ROUTES.STEP_3_PICTURE}>
          <DocumentCapturePage mode="signature" />
        </Route>
        <Route exact path="/">
          <Redirect to={ROUTES.LOGIN} />
        </Route>
      </IonRouterOutlet>
    </IonReactRouter>
  );
});

AppContent.displayName = 'AppContent';

const App = memo(() => {
  return (
    <IonApp>
      <AuthProvider>
        <AppContent />        
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              background: THEME.colors.primary,
              color: THEME.colors.white,
              border: 'none',
              borderRadius: '16px',
              padding: '16px 20px',
              fontSize: '14px',
              fontWeight: 500,
            },
          }}
        />
      </AuthProvider>
    </IonApp>
  );
});

App.displayName = 'App';

export default App;
