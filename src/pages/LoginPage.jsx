import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const [form, setForm]         = useState({ username: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const handleSubmit = async () => {
    setError('');
    if (!form.username || !form.password) return setError('All fields required');
    setLoading(true);
    try {
      const user = await AuthService.login(form.username, form.password);
      login(user);
      navigate('/home');
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden">

      {/* ── Left panel ─────────────────────────────────────── */}
      <div className="hidden md:block flex-1 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=800"
          alt="background"
          className="w-full h-full object-cover"
        />

        <div className="absolute inset-0 flex flex-col justify-between px-12 py-14">

          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-12 h-8 rounded-lg bg-white/20 backdrop-blur-sm
                            flex items-center justify-center text-white
                            font-bold text-sm border border-white/30">
              Domo
            </div>
            <span className="text-white/90 font-semibold text-base">ChatApp</span>
          </div>

          {/* Main text */}
          <div>
            <div className="inline-flex items-center gap-2 bg-white/10
                            backdrop-blur-sm border border-white/20
                            rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-white/80 text-xs font-medium">
                Real-time messaging
              </span>
            </div>

            <h2 className="text-4xl font-bold text-white leading-tight mb-4">
              Stay connected
              <br />
              with your team
            </h2>

            <p className="text-white/60 text-base leading-relaxed max-w-sm">
              Every message delivered instantly. Every conversation in one place.
            </p>
          </div>

          {/* Social proof */}
          <div className="flex items-center gap-4">  
            <div>
              <p className="text-white text-sm font-medium">Trusted by teams</p>
              <p className="text-white/50 text-xs">Join the conversation today</p>
            </div>
          </div>

        </div>
      </div>

      {/* ── Right panel — white ─────────────────────────────── */}
      <div className="w-full md:w-[480px] flex flex-col justify-center
                      px-8 md:px-14 bg-white">

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-lg bg-purple-600 flex items-center
                          justify-center text-white font-bold text-sm">
            C
          </div>
          <span className="font-semibold text-gray-800 text-base">ChatApp</span>
        </div>

        {/* Heading */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            Welcome back
          </h1>
          <p className="text-gray-400 text-sm">
            Sign in to continue to ChatApp
          </p>
        </div>

        <div className="space-y-5">

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Username
            </label>
            <input
              className="w-full px-4 py-3 rounded-xl border border-gray-200
                         text-sm text-gray-800 placeholder-gray-300
                         focus:outline-none focus:ring-2 focus:ring-purple-500/30
                         focus:border-purple-400 transition-all bg-gray-50
                         hover:bg-white"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm({ ...form, username: e.target.value })}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-600 mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                className="w-full px-4 py-3 rounded-xl border border-gray-200
                           text-sm text-gray-800 placeholder-gray-300
                           focus:outline-none focus:ring-2 focus:ring-purple-500/30
                           focus:border-purple-400 transition-all bg-gray-50
                           hover:bg-white pr-12"
                placeholder="Enter your password"
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })}
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2
                           text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPass ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="px-4 py-3 rounded-xl text-red-600 text-xs
                            bg-red-50 border border-red-100">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-xl font-semibold text-sm
                       text-white transition-all duration-200
                       disabled:opacity-50 disabled:cursor-not-allowed
                       hover:opacity-90 active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #a855f7)' }}
          >
            {loading ? 'Signing in...' : 'Log In'}
          </button>

        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* Sign up link */}
        <p className="text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-purple-600 font-semibold hover:text-purple-700 transition-colors">
            Create an Account
          </Link>
        </p>

      </div>
    </div>
  );
}