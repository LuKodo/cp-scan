import { IonContent, IonPage } from "@ionic/react";
import { useAuth } from "../hooks/useAuth";
import { Redirect } from "react-router";
import { LogOut, User } from "lucide-react";
import { useState } from "react";

import '../global.css';

type Props = {
    children: React.ReactNode;
}

const Layout: React.FC<Props> = ({ children }) => {
    const { session, logout } = useAuth();
    const [showUserMenu, setShowUserMenu] = useState(false);

    if (!session) {
        return <Redirect to="/login" />;
    }

    const handleLogout = async () => {
        logout();
    };

    const username = session?.token?.name || 'Usuario';

    return (
        <IonPage>
            <IonContent fullscreen className="bg-neutral-bg">
                <div className="fixed top-8 right-6 z-50">
                    <div className="relative">
                        <span
                            onClick={() => setShowUserMenu(!showUserMenu)}
                            className="bg-purple-500 text-white w-14 h-14 rounded-full shadow-xl flex items-center justify-center"
                        >
                            <User size={28} />
                        </span>

                        {/* Dropdown Menu */}
                        {showUserMenu && (
                            <div className="absolute top-16 right-0 bg-white rounded-2xl shadow-2xl overflow-hidden animate-pop min-w-[240px] border border-purple-500/50 p-1">
                                {/* User Info */}
                                <div className="px-3 py-4 bg-primary-surface rounded-2xl mb-2">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-purple-500/50 p-2 rounded-xl">
                                            <User size={20} className="text-white" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-neutral-text font-extrabold text-sm truncate">{username}</p>
                                            <p className="text-primary font-bold text-[10px] uppercase tracking-wider">{session?.token?.sede || 'Sede Central'}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-3 py-4 bg-primary-surface rounded-2xl cursor-pointer" onClick={handleLogout}>
                                    <div className="flex items-center gap-3">
                                        <div className="bg-red-500/50 p-2 rounded-xl">
                                            <LogOut size={20} className="text-white" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="text-neutral-text font-extrabold text-sm truncate">Finalizar sesión</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="relative flex flex-col items-center justify-center min-h-screen p-6 z-10">
                    <div className="w-full flex flex-col items-center">
                        {children}
                    </div>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Layout;