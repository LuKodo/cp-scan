import { IonContent, IonPage } from '@ionic/react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useEffect, useState } from 'react';
import { versionService } from '../services/version.service';

const NewVersion: React.FC = () => {
    const [version, setVersion] = useState('');

    useEffect(() => {
        const checkVersion = async () => {
            try {
                const response = await versionService.get();
                setVersion(response.version);
            } catch (error) {
                console.log(error);
            }
        };
        checkVersion();
    }, []);

    const { session, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [username, setUsername] = useState('');

    useEffect(() => {
        if (session) {
            setUsername(session.token.name);
        }
    }, [session]);

    const handleLogout = async () => {
        logout();
    };

    return (
        <IonPage>
            <IonContent fullscreen className="bg-gradient-purple-pink animate-gradient">
                {/* FAB - Floating Action Button */}
                <div className="fixed top-12 right-4 z-50">
                    <div className="relative">
                        {/* User Button */}
                        <span
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="bg-gradient-purple w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all duration-300 animate-pulse-glow"
                        >
                            <User size={28} className="text-white" />
                        </span>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute top-16 right-0 glass-dark rounded-2xl shadow-2xl overflow-hidden animate-slideUp min-w-[200px]">
                                {/* User Info */}
                                <div className="px-4 py-3 border-b border-gray-800">
                                    <div className="flex items-center gap-2">
                                        <User size={35} className="text-purple-600 bg-white rounded-full p-1" />
                                        <div>
                                            <p className="text-white font-bold text-sm">{username}</p>
                                            <p className="text-purple-200 text-xs">{session?.token?.sede || 'Sede'}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Logout Button */}
                                <span
                                    onClick={handleLogout}
                                    className="w-full px-4 py-3 flex items-center gap-2 hover:bg-white/10 transition-all duration-200"
                                >
                                    <LogOut size={35} className="text-purple-800 bg-white rounded-full p-1" />
                                    <span className="text-white text-xs font-medium">Cerrar sesión</span>
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex flex-col items-center justify-center min-h-full p-6 text-center">
                    <h1 className="text-2xl font-bold">Nueva version {version} disponible</h1>
                    <p className="text-lg">Por favor, actualiza la aplicacion para continuar</p>

                    <span className="bg-gradient-purple w-full p-1 rounded-xl font-bold text-lg shadow-xl flex items-center justify-center gap-2 mt-6 text-white cursor-pointer">
                        <span className="text-white font-medium">Actualizar</span>
                    </span>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default NewVersion;
