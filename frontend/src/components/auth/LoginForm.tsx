import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { loginSchema, type LoginFormData } from '@/lib/validation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Container from '@/components/ui/Container';

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      await login(data.email, data.password);
      navigate('/');
    } catch (error: unknown) {
      // L'erreur est déjà affichée dans le contexte
      console.error('Login error:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 px-4">
      <Container className="w-full max-w-md">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center">
                <LogIn className="w-6 h-6 text-white" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Connexion
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Connectez-vous à votre compte Cardify
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                {...register('email')}
                error={errors.email?.message}
                disabled={isLoading}
              />
            </div>

            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                {...register('password')}
                error={errors.password?.message}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
              isLoading={isLoading}
            >
              Se connecter
            </Button>
          </form>

          {/* Demo accounts */}
          <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">
              Comptes de démonstration :
            </h3>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Admin:</span>
                <span className="font-mono">admin@cardify.com / Admin123!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Business:</span>
                <span className="font-mono">business@cardify.com / Business123!</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">User:</span>
                <span className="font-mono">user@cardify.com / User123!</span>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Pas encore de compte ?{' '}
              <Link
                to="/register"
                className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300"
              >
                S'inscrire
              </Link>
            </p>
          </div>
        </div>
      </Container>
    </div>
  );
}
