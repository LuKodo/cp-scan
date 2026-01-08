import { useIonViewWillEnter, useIonViewWillLeave } from "@ionic/react";
import QrScanner from "../components/QrScanner";
import { Redirect } from "react-router";
import { useAuth } from "../hooks/useAuth";
import { ScreenOrientation } from "@capacitor/screen-orientation";
import Layout from "../template/layout";
import PhotoCapture from "../components/PhotoCapture";

const CaptureDocument: React.FC = () => {
    return (
        <Layout>
            <PhotoCapture />
        </Layout>
    );
};

export default CaptureDocument;
