import { IonImg, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import Logo from '../../resources/icon.png';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'react-router';
import { toast } from '../utils/alert.utils';
import { LogIn, User, Lock } from 'lucide-react';
import { authService } from '../services/auth.service';
import Loader from '../components/Loader';

const Login: React.FC = () => {
  const { login, session } = useAuth();

  if (session) {
    return <Redirect to="/step-1" />;
  }

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState({
    username: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    if (username === '') {
      setFormError({
        ...formError,
        username: username === '' ? 'El usuario es requerido' : '',
      });
    }
    if (password === '') {
      setFormError({
        ...formError,
        password: password === '' ? 'La contraseña es requerida' : '',
      });
    }
    setFormError({
      username: '',
      password: '',
    });
  }, [username, password]);

  const handleLogin = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (username === '' || password === '') {
      setFormError({
        username: username === '' ? 'El usuario es requerido' : '',
        password: password === '' ? 'La contraseña es requerida' : '',
      });
      return;
    }

    try {
      setLoading(true);
      const response = await authService.login(username, password);
      setIsNavigating(true);
      login(response);
    } catch (error: any) {
      console.error(error);
      toast(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage>
      {(loading || isNavigating) && <Loader fullScreen message={isNavigating ? "Cargando sesión..." : "Verificando credenciales..."} />}
      <div className="min-h-screen w-screen bg-neutral-bg flex flex-col items-center justify-start sm:justify-center p-0 sm:p-4">
        <IonImg src={Logo} alt="CP Scan Logo" className='w-[140px] h-[140px] mt-5' />
        <div className="w-full max-w-md -mt-0 sm:mt-0 px-6">
          {/* Login Card */}
          <div className="card-fancy p-6 sm:p-8">
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-neutral-text tracking-widest mb-2">
                CP SCAN</h2>
              <p className="text-primary font-bold mt-2 uppercase tracking-widest text-xs">Captura de Documentos</p>
            </div>

            <div className="space-y-8">
              {/* Username Input */}
              <div className="space-y-3">
                <label className="text-neutral-muted text-xs font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <User size={14} className="text-primary" />
                  Nombre de usuario
                </label>
                <input
                  type="text"
                  placeholder="ej. JuanPerez"
                  className="input-fancy w-full"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                {formError.username !== '' && (
                  <p className="text-red-500 text-xs font-extrabold ml-1 animate-fadeIn">
                    {formError.username}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-3">
                <label className="text-neutral-muted text-xs font-black uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <Lock size={14} className="text-primary" />
                  Contraseña
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="input-fancy w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                {formError.password !== '' && (
                  <p className="text-red-500 text-xs font-extrabold ml-1 animate-fadeIn">
                    {formError.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <button
                className="btn-solid w-full py-6 text-xl mt-6 active:scale-95"
                onClick={handleLogin}
              >
                <LogIn size={26} strokeWidth={3} />
                <span>Acceder</span>
              </button>
            </div>
          </div>

          {/* Footer Branding */}
          <div className="text-center mt-16 pb-8 opacity-40">
            <p className="text-neutral-text text-[11px] font-black uppercase tracking-[0.3em]">Distribuciones Pharmaser LTDA • 2026</p>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Login;
