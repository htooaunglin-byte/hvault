import React, { useState } from 'react';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signInWithPopup,
  updateProfile
} from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase';
import { HVaultLogo } from './HVaultLogo';
import { Shield, KeyRound, Mail, Lock, User, ArrowRight, CheckCircle, ShieldAlert } from 'lucide-react';

interface AuthScreenProps {
  onSuccess: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        if (displayName) {
          await updateProfile(userCredential.user, { displayName });
        }
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      let msg = err.message || "Failed to authenticate";
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = "Invalid email or password. Please try again or sign up.";
      } else if (err.code === 'auth/email-already-in-use') {
        msg = "An account with this email already exists. Try logging in.";
      } else if (err.code === 'auth/weak-password') {
        msg = "Password should be at least 6 characters long.";
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      onSuccess();
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setError(err.message || "Google Sign-In failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setEmail('demo@hvault.io');
    setPassword('DemoPass123!');
    setError('');
    setLoading(true);
    try {
      try {
        await signInWithEmailAndPassword(auth, 'demo@hvault.io', 'DemoPass123!');
      } catch {
        await createUserWithEmailAndPassword(auth, 'demo@hvault.io', 'DemoPass123!');
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Demo login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0F1D] flex flex-col justify-center items-center px-4 py-12 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-md space-y-8 z-10">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <HVaultLogo size="lg" className="mb-2" />
          </div>
          <div>
            <h1 className="text-4xl font-black text-sky-400 tracking-tighter uppercase">hVAULT</h1>
            <p className="text-xs font-black uppercase tracking-widest text-white/50 mt-1">
              Zero-Knowledge Client-Side Encrypted Vault
            </p>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0D1425] border border-white/10 rounded-2xl p-8 shadow-2xl space-y-6">
          <div className="flex border-b border-white/10 pb-3">
            <button
              onClick={() => { setIsSignUp(false); setError(''); }}
              className={`flex-1 pb-2 text-xs font-black uppercase tracking-widest transition-colors relative cursor-pointer ${
                !isSignUp ? 'text-sky-400' : 'text-white/40 hover:text-white'
              }`}
            >
              Sign In
              {!isSignUp && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
            </button>
            <button
              onClick={() => { setIsSignUp(true); setError(''); }}
              className={`flex-1 pb-2 text-xs font-black uppercase tracking-widest transition-colors relative cursor-pointer ${
                isSignUp ? 'text-sky-400' : 'text-white/40 hover:text-white'
              }`}
            >
              Sign Up
              {isSignUp && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-sky-400 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]" />}
            </button>
          </div>

          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-xs font-bold flex items-start gap-2.5">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="John Doe"
                    className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50 transition-all"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="user@gmail.com"
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-white/60 mb-1">
                Account Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-white/30 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-[#0A0F1D] border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs font-bold text-white placeholder:text-white/20 focus:outline-none focus:border-sky-400/50 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-sky-600 hover:bg-sky-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-sky-900/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In to hVault'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-widest font-black">
              <span className="bg-[#0D1425] px-3 text-white/30">Or Connect With</span>
            </div>
          </div>

          <div className="space-y-2.5">
            <button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0A0F1D] hover:bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Sign in with Google</span>
            </button>

            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={loading}
              className="w-full py-2.5 px-4 text-xs font-bold text-sky-400/80 hover:text-sky-400 hover:bg-sky-500/10 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Quick Demo Sign In (1-Click Test)</span>
            </button>
          </div>
        </div>

        {/* Security badge */}
        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400">
          <CheckCircle className="w-3 h-3" />
          <span>Client-side End-to-End Encryption</span>
        </div>
      </div>
    </div>
  );
};
