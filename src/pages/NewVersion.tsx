import { IonContent, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import { versionService } from '../services/version.service';
import { toast } from '../utils/alert.utils';
import { updateApp } from '../services/update.service';

const NewVersion: React.FC = () => {
    const [version, setVersion] = useState('');
    const [url, setUrl] = useState('');

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const response = await versionService.get();
                toast(`Nueva version ${response.version} disponible`);
                setVersion(response.version);
                setUrl(response.url);
            } catch (error) {
                console.log(error);
            }
        };
        checkVersion();
    }, []);

    const download = async () => {
        try {
            await updateApp(url);
        } catch (e) {
            alert('Error: ' + e);
        }
    };

    return (
        <IonPage>
            <IonContent fullscreen className="bg-gradient-purple-pink animate-gradient">
                {/* Main Content */}
                <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
                    <h1 className="text-2xl font-bold">Nueva version {version} disponible</h1>
                    <p className="text-lg">Por favor, actualiza la aplicacion para continuar</p>

                    <span className="bg-gradient-purple w-full p-1 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mt-6 text-white cursor-pointer" onClick={download}>
                        <span className="text-white font-medium">Actualizar</span>
                    </span>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default NewVersion;
