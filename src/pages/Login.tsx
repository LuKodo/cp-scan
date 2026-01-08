import { IonImg, IonPage } from '@ionic/react';
import { useEffect, useState } from 'react';
import Logo from '../resources/splash.png';
import { loginservice } from '../services/login';
import { useAuth } from '../hooks/useAuth';
import { Redirect } from 'react-router';
import { toast } from '../services/alert';
import { LogIn, User, Lock } from 'lucide-react';

const Login: React.FC = () => {
  const { login, session } = useAuth();

  if (session) {
    return <Redirect to="/step-1" />;
  }

  const [username, setUsername] = useState('zambrano');
  const [password, setPassword] = useState('admin');
  const [formError, setFormError] = useState({
    username: '',
    password: '',
  });

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
      const response = await loginservice(username, password);
      if (response instanceof Error) {
        toast(response.message);
        return;
      }
      login(response);
    } catch (error) {
      console.log(error);
      toast('Ocurrió un error al iniciar sesión');
    }
  };

  return (
    <IonPage>
      <div className="min-h-screen w-screen bg-gradient-purple-pink animate-gradient flex items-center justify-center p-4">
        <div className="w-full max-w-md animate-fadeIn">
          {/* Logo Container */}
          <div className="flex justify-center mb-8 animate-slideUp">
            <div className="w-48 h-48 bg-white rounded-full p-6 shadow-2xl">
              <IonImg
                src={Logo}
                alt="CP Scan Logo"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Login Card */}
          <div className="glass-dark rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
            <div className="text-center mb-8">
              <h1 className="text-xl font-bold text-white mb-2">Bienvenido</h1>
              <p className="text-purple-200 text-sm">Inicia sesión para continuar</p>
            </div>

            <div className="space-y-5">
              {/* Username Input */}
              <div className="space-y-2">
                <label className="text-white text-sm font-medium flex items-center gap-2">
                  <User size={16} />
                  Usuario
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ingresa tu usuario"
                    className="input-modern w-full px-4 py-2 rounded-xl bg-white/90 border-2 border-white/20 text-gray-800 placeholder-gray-400 focus:bg-white"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                {formError.username !== '' && (
                  <p className="text-red-300 text-sm font-medium animate-slideUp">
                    {formError.username}
                  </p>
                )}
              </div>

              {/* Password Input */}
              <div className="space-y-2 mt-4">
                <label className="text-white text-sm font-medium flex items-center gap-2">
                  <Lock size={16} />
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Ingresa tu contraseña"
                    className="input-modern w-full px-4 py-2 rounded-xl bg-white/90 border-2 border-white/20 text-gray-800 placeholder-gray-400 focus:bg-white"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                {formError.password !== '' && (
                  <p className="text-red-300 text-sm font-medium animate-slideUp">
                    {formError.password}
                  </p>
                )}
              </div>

              {/* Login Button */}
              <span
                className="bg-gradient-purple w-full p-1 rounded-xl font-bold text-lg shadow-xl hover:shadow-2xl flex items-center justify-center gap-2 mt-6 hover:bg-gradient-purple-blue text-white cursor-pointer"
                onClick={handleLogin}
              >
                <LogIn size={20} />
                Iniciar sesión
              </span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-6">
            <p className="text-white/80 text-sm">CP Scan © 2026</p>
          </div>
        </div>
      </div>
    </IonPage>
  );
};

export default Login;
