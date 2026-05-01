'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Lock, Mail, LogIn } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const { error: signInError } = await supabaseBrowser.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError('Credenciales incorrectas. Intenta de nuevo.');
      setIsLoading(false);
      return;
    }

    const redirectTo = searchParams.get('redirect') || '/dashboard';
    router.push(redirectTo);
    router.refresh();
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
      <Card className="w-full max-w-md shadow-2xl border border-slate-200">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 flex items-center justify-center">
          <div className="text-center">
            <LogIn className="h-12 w-12 text-white mx-auto mb-2" />
            <h1 className="text-2xl font-bold text-white">Sistema POS</h1>
          </div>
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Iniciar sesión</h2>
            <p className="text-slate-600 text-sm">Accede a tu cuenta para continuar</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  Correo electrónico
                </span>
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="ejemplo@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-slate-700">
                <span className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-blue-600" />
                  Contraseña
                </span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Tu contraseña"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                <div className="h-5 w-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-700 mt-0.5">
                  !
                </div>
                <div>{error}</div>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded-lg transition-colors"
            >
              {isLoading ? 'Ingresando...' : 'Iniciar sesión'}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-500">o</span>
            </div>
          </div>

          {/* Sign Up Link */}
          <p className="text-center text-sm text-slate-600">
            ¿No tienes cuenta?{' '}
            <a className="text-blue-600 font-semibold hover:underline transition-colors" href="/register">
              Crear cuenta
            </a>
          </p>

          {/* Footer */}
          <p className="text-center text-xs text-slate-500 mt-6 border-t border-slate-200 pt-4">
            © 2026 Sistema POS. Todos los derechos reservados.
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4">
          <Card className="w-full max-w-md shadow-2xl">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-32 flex items-center justify-center">
              <div className="animate-pulse text-white">
                <LogIn className="h-12 w-12 mx-auto" />
              </div>
            </div>
            <div className="p-8 text-center">
              <p className="text-slate-600 text-sm animate-pulse">Cargando...</p>
            </div>
          </Card>
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
