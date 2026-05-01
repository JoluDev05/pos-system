'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ShieldCheck, User2, Phone, Mail, CheckCircle2, Lock, Eye, EyeOff } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { supabaseBrowser } from '@/lib/supabaseBrowser';

export default function SettingsPage() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ name?: string; email?: string; phone?: string; password?: string }>({});
  const [loadingProfile, setLoadingProfile] = useState(true);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      const { data, error } = await supabaseBrowser.auth.getUser();

      if (!mounted) return;

      if (error || !data.user) {
        setLoadingProfile(false);
        router.push('/?redirect=/settings');
        return;
      }

      const metadata = data.user.user_metadata ?? {};
      setDisplayName(metadata.display_name ?? '');
      setPhone(metadata.phone ?? '');
      setEmail(data.user.email ?? '');
      setLoadingProfile(false);
    };

    loadProfile();

    return () => {
      mounted = false;
    };
  }, []);

  const validate = () => {
    const nextErrors: { name?: string; email?: string; phone?: string; password?: string } = {};
    const trimmedName = displayName.trim();
    const trimmedEmail = email.trim();
    const trimmedPhone = phone.trim();

    if (!trimmedName) {
      nextErrors.name = 'El nombre es obligatorio.';
    }

    if (!trimmedEmail) {
      nextErrors.email = 'El correo es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      nextErrors.email = 'El correo no es valido.';
    }

    if (trimmedPhone && !/^[+\d][\d\s-]{6,}$/.test(trimmedPhone)) {
      nextErrors.phone = 'El telefono no es valido.';
    }

    // Validar contraseña si se intenta cambiar
    if (newPassword || confirmPassword) {
      if (!currentPassword) {
        nextErrors.password = 'Debes ingresar tu contraseña actual.';
      } else if (!newPassword) {
        nextErrors.password = 'La nueva contraseña es obligatoria.';
      } else if (newPassword.length < 6) {
        nextErrors.password = 'La nueva contraseña debe tener al menos 6 caracteres.';
      } else if (newPassword !== confirmPassword) {
        nextErrors.password = 'Las contraseñas no coinciden.';
      }
    }

    setFieldErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSaving(true);
    setSaved(false);

    if (!validate()) {
      setSaving(false);
      return;
    }

    // Actualizar perfil
    const { error: updateError } = await supabaseBrowser.auth.updateUser({
      email: email.trim(),
      data: {
        display_name: displayName.trim(),
        phone: phone.trim(),
      },
    });

    if (updateError) {
      setFormError('No se pudieron guardar los cambios. Intenta de nuevo.');
      setSaving(false);
      return;
    }

    // Cambiar contraseña si se proporciona
    if (newPassword) {
      const { error: passwordError } = await supabaseBrowser.auth.updateUser({
        password: newPassword.trim(),
      });

      if (passwordError) {
        setFormError('No se pudo cambiar la contraseña. Intenta de nuevo.');
        setSaving(false);
        return;
      }

      // Limpiar campos de contraseña
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }

    setSaving(false);
    setSaved(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header Navbar */}
      <div className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 shadow-lg">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className="text-slate-200 hover:text-white -ml-2"
            onClick={() => router.back()}
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Regresar
          </Button>
          
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Configuracion</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
              Administra tu perfil y preferencias
            </p>
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-green-500/20 px-3 py-1 border border-green-400/30">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-400" />
            <span className="text-xs font-medium text-green-300">Verificado</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Section */}
          <Card className="overflow-hidden shadow-sm border border-slate-200">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 h-24" />
            <div className="px-6 pb-6">
              <div className="-mt-12 flex items-end justify-between mb-6">
                <Avatar className="h-24 w-24 border-4 border-white bg-gradient-to-br from-blue-400 to-blue-600">
                  <AvatarFallback className="text-xl font-bold text-white">JA</AvatarFallback>
                </Avatar>
                <div className="text-right text-xs text-slate-600">
                  <div>Cuenta activa</div>
                  <div className="font-medium text-slate-900">Desde 2026</div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Tu Perfil</h2>
              <p className="text-sm text-slate-600 mb-6">
                Actualiza tu informacion personal
              </p>

              <form onSubmit={handleSave} className="space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="displayName" className="text-sm font-medium text-slate-700">
                      <span className="flex items-center gap-2">
                        <User2 className="h-4 w-4 text-blue-600" />
                        Nombre completo
                      </span>
                    </Label>
                    <Input
                      id="displayName"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Ej: Juan Alvarez"
                      disabled={loadingProfile || saving}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {fieldErrors.name && (
                      <p className="text-xs text-red-600 font-medium">{fieldErrors.name}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium text-slate-700">
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-blue-600" />
                        Correo electronico
                      </span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@empresa.com"
                      disabled={loadingProfile || saving}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {fieldErrors.email && (
                      <p className="text-xs text-red-600 font-medium">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium text-slate-700">
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-blue-600" />
                        Telefono
                      </span>
                    </Label>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+52 (55) 1234-5678"
                      disabled={loadingProfile || saving}
                      className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                    {fieldErrors.phone && (
                      <p className="text-xs text-red-600 font-medium">{fieldErrors.phone}</p>
                    )}
                  </div>
                </div>

                {/* Separator */}
                <div className="border-t border-slate-200 pt-6">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4">Cambiar contraseña</h3>
                  <p className="text-sm text-slate-600 mb-4">
                    Actualiza tu contraseña para mejorar la seguridad de tu cuenta.
                  </p>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="sm:col-span-2 space-y-2">
                      <Label htmlFor="currentPassword" className="text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-600" />
                          Contraseña actual
                        </span>
                      </Label>
                      <Input
                        id="currentPassword"
                        type="password"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Tu contraseña actual"
                        disabled={loadingProfile || saving}
                        className="border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="newPassword" className="text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-600" />
                          Nueva contraseña
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showNewPassword ? 'text' : 'password'}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Minimo 6 caracteres"
                          disabled={loadingProfile || saving}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          disabled={loadingProfile || saving}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                        >
                          {showNewPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
                        <span className="flex items-center gap-2">
                          <Lock className="h-4 w-4 text-blue-600" />
                          Confirmar contraseña
                        </span>
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Repite la nueva contraseña"
                          disabled={loadingProfile || saving}
                          className="border-slate-300 focus:border-blue-500 focus:ring-blue-500 pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          disabled={loadingProfile || saving}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 disabled:opacity-50"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {fieldErrors.password && (
                    <p className="text-xs text-red-600 font-medium mt-2">{fieldErrors.password}</p>
                  )}
                </div>

                {formError && (
                  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-red-200 flex items-center justify-center flex-shrink-0 text-xs font-bold text-red-700">
                      !
                    </div>
                    <div>{formError}</div>
                  </div>
                )}

                {saved && (
                  <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700 flex items-start gap-3">
                    <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>Cambios guardados exitosamente</div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-500">
                    Los cambios se sincronizaran en todas tus sesiones.
                  </p>
                  <Button
                    type="submit"
                    disabled={saving || loadingProfile}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    {saving ? 'Guardando...' : loadingProfile ? 'Cargando...' : 'Guardar cambios'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>

          {/* Security Info */}
          <Card className="bg-blue-50 border border-blue-200 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="font-medium text-blue-900">Seguridad activada</p>
                <p className="text-blue-700 text-xs mt-1">
                  Tu cuenta esta protegida. Ultima actualizacion: hoy
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
