import PhotoCapture from '../components/PhotoCapture';
import { useIonViewWillEnter, useIonViewWillLeave } from '@ionic/react';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import Layout from '../template/layout';

const CapturePicture: React.FC = () => {
    useIonViewWillEnter(() => {
        ScreenOrientation.lock({ orientation: 'portrait' });
    });

    useIonViewWillLeave(() => {
        ScreenOrientation.unlock();
    });

    return (
        <Layout title="Cámara">
            <PhotoCapture />
        </Layout>
    );
}

export default CapturePicture;