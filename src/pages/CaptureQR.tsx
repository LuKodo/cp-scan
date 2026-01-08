import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";
import QrScanner from "../components/QrScanner";
import { Redirect } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import Layout from "../template/layout";

const CaptureQR: React.FC = () => {
    const { session } = useAuth();

    useIonViewWillEnter(() => {
        ScreenOrientation.lock({ orientation: 'portrait' });
    });

    useIonViewWillLeave(() => {
        ScreenOrientation.unlock();
    });

    if (!session) {
        return <Redirect to="/login" />;
    }

    return (
        <Layout>
            <QrScanner />
        </Layout>
    );
};

export default CaptureQR;
