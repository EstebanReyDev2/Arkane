'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Check, Lock, Mail, ShieldCheck, CornerDownLeft } from 'lucide-react';
import { signInWithEmail, createAccount, signInWithGoogle, useAuthState } from '@/src/lib/firebase/auth';

// --- Validation Schemas ---
const loginSchema = z.object({
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

const registerSchema = z.object({
  firstName: z.string().min(2, 'El nombre es requerido'),
  lastName: z.string().min(2, 'El apellido es requerido'),
  email: z.string().email('Ingresá un email válido'),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
  newsletter: z.boolean().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type LoginFormValues = z.infer<typeof loginSchema>;
type RegisterFormValues = z.infer<typeof registerSchema>;

// --- Helper for Password Strength ---
const calculateStrength = (pass: string) => {
  let score = 0;
  if (!pass) return 0;
  if (pass.length >= 8) score += 1;
  if (/[A-Z]/.test(pass)) score += 1;
  if (/[0-9]/.test(pass)) score += 1;
  if (/[^A-Za-z0-9]/.test(pass)) score += 1;
  return score;
};

export default function LoginPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const router = useRouter();
  const resolvedSearchParams = React.use(searchParams);
  const redirectUrl = (resolvedSearchParams.redirect as string) || '/cuenta';

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { user, loading: authLoading } = useAuthState();

  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectUrl);
    }
  }, [user, authLoading, router, redirectUrl]);

  // --- Forms ---
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { firstName: '', lastName: '', email: '', password: '', confirmPassword: '', newsletter: false },
  });

  const passwordValue = registerForm.watch('password');
  const strength = calculateStrength(passwordValue);

  // --- Handlers ---
  const onLoginSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithEmail(data.email, data.password);
      const token = await result.user.getIdToken();
      document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Login error:', error?.message || 'Unknown error');
      setAuthError('Credenciales incorrectas o usuario no encontrado.');
    } finally {
      setIsLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await createAccount(data.email, data.password, data.firstName, data.lastName);
      if (result) {
        const token = await result.user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
      }
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Register error:', error?.message || 'Unknown error');
      if (error?.code === 'auth/email-already-in-use') {
        setAuthError('El email ya está registrado.');
      } else {
        setAuthError('Ocurrió un error al crear la cuenta.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const result = await signInWithGoogle();
      if (result) {
        const token = await result.user.getIdToken();
        document.cookie = `firebase-token=${token}; path=/; max-age=3600; SameSite=Lax; Secure`;
      }
      router.push(redirectUrl);
    } catch (error: any) {
      console.error('Google login error:', error?.message || 'Unknown error');
      setAuthError('Error al iniciar sesión con Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    // Fixed inset-0 to cover any layout headers/footers for a focused flow
    <div className="fixed inset-0 z-50 flex bg-[#FAFAFA] overflow-y-auto">
      
      {/* LEFT SIDE: Editorial */}
      <div className="hidden lg:flex w-1/2 relative bg-[#0D0D0D] flex-col justify-end p-16">
        <Image 
          src="https://picsum.photos/seed/login/800/1000" 
          alt="Arkade Editorial" 
          fill 
          className="object-cover"
          referrerPolicy="no-referrer"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 max-w-md">
          <p className="text-[12px] uppercase tracking-widest text-[#8C8680] mb-4 font-semibold">
            Miembros Arkade
          </p>
          <h2 className="text-4xl font-serif text-white mb-8 leading-tight">
            Accedé a drops exclusivos y beneficios curados.
          </h2>
          
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 text-white text-sm border border-white/20 rounded-full px-4 py-2 w-fit backdrop-blur-sm">
              <Check className="w-4 h-4" /> Envíos prioritarios
            </div>
            <div className="flex items-center gap-3 text-white text-sm border border-white/20 rounded-full px-4 py-2 w-fit backdrop-blur-sm">
              <Check className="w-4 h-4" /> Preventa exclusiva
            </div>
            <div className="flex items-center gap-3 text-white text-sm border border-white/20 rounded-full px-4 py-2 w-fit backdrop-blur-sm">
              <Check className="w-4 h-4" /> Devoluciones extendidas
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12 min-h-full">
        <div className="w-full max-w-[400px] flex flex-col">
          
          {/* TABS */}
          <div className="flex border-b border-gray-200 mb-10">
            <button
              onClick={() => { setActiveTab('login'); setAuthError(null); }}
              className={`flex-1 pb-3 text-sm tracking-wide transition-all ${
                activeTab === 'login' 
                  ? 'border-b-2 border-[#0D0D0D] font-semibold text-[#0D0D0D]' 
                  : 'text-[#8C8680] hover:text-[#0D0D0D]'
              }`}
            >
              INICIAR SESIÓN
            </button>
            <button
              onClick={() => { setActiveTab('register'); setAuthError(null); }}
              className={`flex-1 pb-3 text-sm tracking-wide transition-all ${
                activeTab === 'register' 
                  ? 'border-b-2 border-[#0D0D0D] font-semibold text-[#0D0D0D]' 
                  : 'text-[#8C8680] hover:text-[#0D0D0D]'
              }`}
            >
              CREAR CUENTA
            </button>
          </div>

          {/* FORMS CONTAINER */}
          <div className="relative min-h-[400px]">
            <AnimatePresence mode="wait">
              
              {/* LOGIN TAB */}
              {activeTab === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <h1 className="text-[32px] font-serif text-[#0D0D0D] mb-2 leading-none">
                    Bienvenido de nuevo
                  </h1>
                  <p className="text-sm text-[#8C8680] mb-8">
                    Ingresá con tu cuenta ARKADE
                  </p>

                  <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="flex flex-col gap-6">
                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="email"
                        placeholder="Email"
                        {...loginForm.register('email')}
                        className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors"
                      />
                      {loginForm.formState.errors.email && (
                        <span className="text-xs text-red-500 mt-1">{loginForm.formState.errors.email.message}</span>
                      )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Contraseña"
                          {...loginForm.register('password')}
                          className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D0D0D] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {loginForm.formState.errors.password && (
                        <span className="text-xs text-red-500 mt-1">{loginForm.formState.errors.password.message}</span>
                      )}
                    </div>

                    <div className="flex justify-end">
                      <button type="button" className="text-xs text-[#8C8680] hover:text-[#0D0D0D] underline underline-offset-2">
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>

                    {authError && (
                      <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                        {authError}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0D0D0D] text-white py-3.5 text-sm font-medium tracking-wide hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center"
                    >
                      {isLoading ? 'CARGANDO...' : 'INICIAR SESIÓN'}
                    </button>
                  </form>

                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-[#8C8680] uppercase tracking-wider">o continuá con</span>
                    <div className="flex-1 h-px bg-gray-200" />
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      type="button"
                      onClick={handleGoogleLogin}
                      disabled={isLoading}
                      className="w-full border border-gray-300 bg-white text-[#0D0D0D] py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-70"
                    >
                      <svg viewBox="0 0 24 24" className="w-4 h-4" aria-hidden="true">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                      </svg>
                      Continuar con Google
                    </button>
                    <button
                      type="button"
                      disabled={isLoading}
                      className="w-full border border-gray-300 bg-white text-[#0D0D0D] py-3 text-sm font-medium flex items-center justify-center gap-3 hover:bg-gray-50 transition-colors disabled:opacity-70"
                    >
                      <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor" aria-hidden="true">
                        <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.09 2.31-.86 3.59-.8 1.51.05 2.78.72 3.5 1.89-3.04 1.76-2.55 5.72.56 6.94-.74 1.83-1.61 3.35-2.73 4.14zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                      </svg>
                      Continuar con Apple
                    </button>
                  </div>

                  <div className="mt-8 text-center">
                    <button 
                      onClick={() => { setActiveTab('register'); setAuthError(null); }}
                      className="text-sm text-[#8C8680] hover:text-[#0D0D0D] transition-colors"
                    >
                      ¿No tenés cuenta? <span className="underline underline-offset-2">Crear una cuenta</span> &rarr;
                    </button>
                  </div>
                </motion.div>
              )}

              {/* REGISTER TAB */}
              {activeTab === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col"
                >
                  <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)} className="flex flex-col gap-5">
                    
                    {/* Name & Last Name */}
                    <div className="flex gap-4">
                      <div className="flex flex-col gap-1 flex-1">
                        <input
                          type="text"
                          placeholder="Nombre"
                          {...registerForm.register('firstName')}
                          className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors"
                        />
                        {registerForm.formState.errors.firstName && (
                          <span className="text-xs text-red-500 mt-1">{registerForm.formState.errors.firstName.message}</span>
                        )}
                      </div>
                      <div className="flex flex-col gap-1 flex-1">
                        <input
                          type="text"
                          placeholder="Apellido"
                          {...registerForm.register('lastName')}
                          className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors"
                        />
                        {registerForm.formState.errors.lastName && (
                          <span className="text-xs text-red-500 mt-1">{registerForm.formState.errors.lastName.message}</span>
                        )}
                      </div>
                    </div>

                    {/* Email */}
                    <div className="flex flex-col gap-1">
                      <input
                        type="email"
                        placeholder="Email"
                        {...registerForm.register('email')}
                        className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors"
                      />
                      {registerForm.formState.errors.email && (
                        <span className="text-xs text-red-500 mt-1">{registerForm.formState.errors.email.message}</span>
                      )}
                    </div>

                    {/* Password */}
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          placeholder="Contraseña"
                          {...registerForm.register('password')}
                          className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D0D0D] transition-colors"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.password && (
                        <span className="text-xs text-red-500 mt-1">{registerForm.formState.errors.password.message}</span>
                      )}
                      
                      {/* Password Strength Indicator */}
                      <div className="flex gap-1 mt-2">
                        {[1, 2, 3, 4].map((level) => (
                          <div 
                            key={level} 
                            className={`h-1 flex-1 rounded-full transition-colors ${
                              strength >= level 
                                ? strength <= 2 ? 'bg-orange-400' : strength === 3 ? 'bg-yellow-400' : 'bg-emerald-500'
                                : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Confirm Password */}
                    <div className="flex flex-col gap-1">
                      <div className="relative">
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          placeholder="Confirmar contraseña"
                          {...registerForm.register('confirmPassword')}
                          className="w-full border-b border-gray-300 bg-transparent py-2 text-sm text-[#0D0D0D] placeholder:text-gray-400 focus:border-[#0D0D0D] outline-none transition-colors pr-10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#0D0D0D] transition-colors"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {registerForm.formState.errors.confirmPassword && (
                        <span className="text-xs text-red-500 mt-1">{registerForm.formState.errors.confirmPassword.message}</span>
                      )}
                    </div>

                    {/* Newsletter Checkbox */}
                    <div className="flex items-start gap-3 mt-2">
                      <input 
                        type="checkbox" 
                        id="newsletter" 
                        {...registerForm.register('newsletter')}
                        className="mt-1 w-4 h-4 border-gray-300 rounded text-[#0D0D0D] focus:ring-[#0D0D0D]"
                      />
                      <label htmlFor="newsletter" className="text-xs text-[#8C8680] leading-relaxed">
                        Quiero recibir correos sobre nuevos drops, colecciones exclusivas y beneficios de ARKADE.
                      </label>
                    </div>

                    {authError && (
                      <div className="text-xs text-red-500 bg-red-50 p-2 rounded border border-red-100">
                        {authError}
                      </div>
                    )}

                    <div className="text-[11px] text-[#8C8680] leading-relaxed mt-2">
                      Al crear una cuenta, aceptás nuestros <a href="#" className="underline">Términos y Condiciones</a> y <a href="#" className="underline">Política de Privacidad</a>.
                    </div>

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-[#0D0D0D] text-white py-3.5 text-sm font-medium tracking-wide hover:bg-black transition-colors disabled:opacity-70 flex justify-center items-center mt-2"
                    >
                      {isLoading ? 'CREANDO CUENTA...' : 'CREAR CUENTA'}
                    </button>
                  </form>
                </motion.div>
              )}

            </AnimatePresence>
          </div>

          {/* Bottom Trust Row */}
          <div className="mt-12 pt-6 border-t border-gray-200 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-[#8C8680] font-medium uppercase tracking-wider">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> Datos protegidos</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-3 h-3" /> Sin spam</span>
            <span>·</span>
            <span className="flex items-center gap-1.5"><CornerDownLeft className="w-3 h-3" /> Cancelá cuando quieras</span>
          </div>

        </div>
      </div>
    </div>
  );
}
