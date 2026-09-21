import { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Eye,
  EyeOff,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Radio,
  Sparkles,
  Zap,
} from 'lucide-react';
import { useAuth } from '../lib/AuthContext';
import './Login.css';

export default function Login() {
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = isSignUp ? await signUp(email, password) : await signIn(email, password);
    setLoading(false);
    if (result.error) setError(result.error);
  };

  const handleModeSwitch = (mode: 'login' | 'signup') => {
    setIsSignUp(mode === 'signup');
    setError(null);
  };

  return (
    <div className="login-terminal-root">
      {/* Ambient background crimson blooms */}
      <div className="term-ambient-glow-top" aria-hidden="true" />
      <div className="term-ambient-glow-bottom" aria-hidden="true" />

      {/* Top System Header */}
      <header className="term-header">
        <div className="term-brand-badge">
          <span className="term-pulse-dot" aria-hidden="true" />
          <span className="term-brand-text">HABBITS RPG // SYSTEM ACCESS</span>
        </div>
        <div className="term-header-status">
          <span className="term-pulse-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
          <span>HABBITS RPG // SYSTEM ONLINE</span>
          <Lock size={13} className="status-icon" aria-hidden="true" />
        </div>
      </header>

      {/* Main Container */}
      <main className="term-main">
        <div className="term-grid">
          {/* LEFT PORTAL: Cinematic Hunter Atmosphere & Codex Telemetry (Desktop Only) */}
          <section className="term-portal" aria-label="System Protocol & Telemetry">
            {/* Background silhouette backdrop */}
            <div
              className="term-portal-bg"
              style={{
                backgroundImage: `url('https://lh3.googleusercontent.com/aida-public/AB6AXuB9RB7vjDpjDLEbp6ANeTbaHEID0yeX1r9ZaMsrJ3U8UkHFYp7L7j0NY2DIzgSopwEV-b9pcn1Ve7p1qZlYvpBbRm964zHExtBNp88Nm49cdesdjUyCDkWDdtmvEI0RK4ywnQvlhejrrUJdFNS4gyxLoU_R-W72DiFq5ZrDKAECoAgopBWBYeVEcso1yuL-OS6-CNnLfvHZgeN_4KWHeEg1CzMHDmnIPgoMDYVAWe__CGenDkPFoMjPSg')`,
              }}
              aria-hidden="true"
            />
            <div className="term-portal-scrim" aria-hidden="true" />

            {/* Top Status Badges */}
            <div className="term-portal-top">
              <div className="term-pill-tag">
                <span className="term-pulse-dot" style={{ width: 6, height: 6 }} aria-hidden="true" />
                <span>HABBITS RPG // SYSTEM PROTOCOL</span>
              </div>
              <div className="term-pill-tertiary">
                <Radio size={12} aria-hidden="true" />
                <span>SYSTEM // SYNCHRONIZED</span>
              </div>
            </div>

            {/* Center Brand Typography & Telemetry */}
            <div className="term-portal-center">
              <div className="term-portal-clearance">
                <span className="term-clearance-bar" aria-hidden="true" />
                <span className="term-clearance-text">HABBITS RPG // SYSTEM ACCESS</span>
              </div>
              <h1 className="term-portal-title">
                ENTER THE<br />
                <span className="title-accent">SYSTEM</span>
              </h1>
              <p className="term-portal-desc">
                System synchronization active. Authenticate your hunter credentials to access real-time daily directives, boss arena battles, and hunter rank progression.
              </p>

              {/* Telemetry Strip Counters */}
              <div className="term-telemetry-strip" aria-label="Live Telemetry">
                <div className="term-telemetry-cell">
                  <span className="cell-label">SYSTEM STATUS</span>
                  <span className="cell-val crimson">ONLINE</span>
                </div>
                <div className="term-telemetry-cell">
                  <span className="cell-label">HUNTERS ACTIVE</span>
                  <span className="cell-val">14,812</span>
                </div>
                <div className="term-telemetry-cell">
                  <span className="cell-label">ENCRYPTION</span>
                  <span className="cell-val tertiary">SHA-256</span>
                </div>
              </div>
            </div>

            {/* System Notification Preview Card */}
            <div className="term-notice-card">
              <div className="term-notice-icon-box" aria-hidden="true">
                <Sparkles size={18} />
              </div>
              <div className="term-notice-content">
                <div className="term-notice-header">
                  <span className="term-notice-title">[ NOTICE // ACTIVE SEASON CAMPAIGN ]</span>
                  <span className="term-notice-timer">SEASON IN PROGRESS</span>
                </div>
                <p className="term-notice-body">
                  Complete daily quests and maintain your streak to level up stats, earn coins, and unlock hunter rank milestones.
                </p>
              </div>
            </div>
          </section>

          {/* RIGHT TERMINAL: Authentication Terminal Interface */}
          <section className="term-interface-wrapper" aria-label="Authentication Terminal">
            {/* Mobile-Only Neural Hunter Core Artifact */}
            <div className="term-mobile-hero">
              <div className="term-mobile-crest">
                <svg className="ring-outer" viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                    cx="50"
                    cy="50"
                    r="46"
                    fill="none"
                    stroke="rgba(220,38,38,0.5)"
                    strokeWidth="1.5"
                    strokeDasharray="8 6 2 6"
                  />
                </svg>
                <svg className="ring-inner" viewBox="0 0 100 100" aria-hidden="true">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,183,125,0.4)"
                    strokeWidth="1.2"
                    strokeDasharray="14 8 4 8"
                  />
                </svg>
                <div className="term-mobile-avatar-frame">
                  <img
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYcVGMadtHdN5kC88Y1t3kyfOYuQZJn2vUdkQNa61lLAxSOo2i6nFNcVRmpN688RjreCPnDRPOAUv8bg3clTd4E3wXZmABb10ESrL9LmxXS8EA814X340zi9eJ1s9rx_O6mF4Ar_0YP-NBdjJrJFfH_pfYB72LIE4LweLSXUwGi8L-b7J7WK-6rv1X405Z2vpk3uxvYyD3nWHz2qb4gstayhL9ZsgWzxfFzmxGB87FfHfbIhGlp1y5rA"
                    alt="Hunter Crest"
                  />
                </div>
              </div>
              <h1 className="term-mobile-title">HABBITS RPG</h1>
              <div className="term-mobile-subtitle-pill">
                <Zap size={11} aria-hidden="true" />
                <span>SYSTEM ACCESS // AUTHENTICATION</span>
              </div>
              <p className="term-mobile-desc">
                Enter your verified credentials to access daily directives, boss arena battles, and hunter rank progression.
              </p>
            </div>

            {/* Terminal Card Enclosure */}
            <div className="term-card">
              {/* Corner tactical brackets */}
              <span className="term-bracket term-bracket-tl" aria-hidden="true">┌</span>
              <span className="term-bracket term-bracket-tr" aria-hidden="true">┐</span>
              <span className="term-bracket term-bracket-bl" aria-hidden="true">└</span>
              <span className="term-bracket term-bracket-br" aria-hidden="true">┘</span>

              {/* Mode Selector Tabs */}
              <div className="term-mode-selector" role="tablist" aria-label="Authentication Mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isSignUp}
                  className={`term-mode-tab ${!isSignUp ? 'active' : ''}`}
                  onClick={() => handleModeSwitch('login')}
                >
                  <KeyRound size={14} aria-hidden="true" />
                  <span>[ 01 // LOGIN ]</span>
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSignUp}
                  className={`term-mode-tab ${isSignUp ? 'active' : ''}`}
                  onClick={() => handleModeSwitch('signup')}
                >
                  <Zap size={14} aria-hidden="true" />
                  <span>[ 02 // CREATE PROFILE ]</span>
                </button>
              </div>

              {/* Panel Header */}
              <div className="term-panel-header">
                <span className="term-prehead">
                  {isSignUp ? 'HUNTER REGISTRATION PROTOCOL' : 'HUNTER AUTHENTICATION'}
                </span>
                <h2 className="term-headline">
                  {isSignUp ? 'CREATE PROFILE' : 'WELCOME BACK'}
                </h2>
                <p className="term-subtext">
                  {isSignUp
                    ? 'Register your hunter credentials to begin your quest progression.'
                    : 'Enter the System and continue your daily hunter progression.'}
                </p>
              </div>

              {/* Live Error Alert Feedback Box */}
              {error && (
                <div className="term-alert-box" role="alert">
                  <AlertTriangle size={18} className="term-alert-icon" aria-hidden="true" />
                  <div className="term-alert-content">
                    <span className="term-alert-title">SYSTEM NOTICE // AUTHENTICATION ERROR</span>
                    <p className="term-alert-msg">{error}</p>
                  </div>
                </div>
              )}

              {/* Auth Form */}
              <form className="term-form" onSubmit={handleSubmit}>
                {/* Hunter ID / Email Field */}
                <div className="term-field">
                  <div className="term-label-row">
                    <label className="term-label" htmlFor="hunter-email">
                      [ HUNTER ID // EMAIL ]
                    </label>
                    <span className="term-label-badge">
                      <span className="badge-dot" aria-hidden="true" />
                      SECURE LINK
                    </span>
                  </div>
                  <div className="term-input-wrapper">
                    <span className="term-input-icon">
                      <Fingerprint size={16} aria-hidden="true" />
                    </span>
                    <input
                      id="hunter-email"
                      type="email"
                      className="term-input"
                      placeholder="hunter.sam@habbits.system"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      autoComplete="email"
                    />
                  </div>
                </div>

                {/* Passkey Cipher / Password Field */}
                <div className="term-field">
                  <div className="term-label-row">
                    <label className="term-label" htmlFor="hunter-password">
                      [ PASSKEY CIPHER // PASSWORD ]
                    </label>
                    <span className="term-label-badge" style={{ color: 'var(--term-outline)' }}>
                      SHA-256
                    </span>
                  </div>
                  <div className="term-input-wrapper">
                    <span className="term-input-icon">
                      <Lock size={16} aria-hidden="true" />
                    </span>
                    <input
                      id="hunter-password"
                      type={showPassword ? 'text' : 'password'}
                      className="term-input"
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      autoComplete={isSignUp ? 'new-password' : 'current-password'}
                    />
                    <button
                      type="button"
                      className="term-pw-toggle"
                      onClick={() => setShowPassword(!showPassword)}
                      aria-label={showPassword ? 'Hide passkey' : 'Show passkey'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                {/* Auxiliary Options Row */}
                <div className="term-aux-row">
                  <label className="term-checkbox-label">
                    <input
                      type="checkbox"
                      defaultChecked
                      className="term-checkbox"
                    />
                    <span>PRESERVE TERMINAL LINK</span>
                  </label>
                  <button
                    type="button"
                    className="term-recover-btn"
                    onClick={() => {
                      if (!email) {
                        setError('Enter your registered Hunter ID / Email first to request password reset.');
                      } else {
                        setError(null);
                        alert(`Password reset instructions sent to: ${email}`);
                      }
                    }}
                  >
                    RESET PASSWORD?
                  </button>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  className="term-submit-btn"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 size={18} className="term-spinner" aria-hidden="true" />
                      <span>SYNCHRONIZING...</span>
                    </>
                  ) : isSignUp ? (
                    <>
                      <span>CREATE HUNTER PROFILE</span>
                      <Zap size={18} aria-hidden="true" />
                    </>
                  ) : (
                    <>
                      <span>ENTER THE SYSTEM</span>
                      <ArrowRight size={18} aria-hidden="true" />
                    </>
                  )}
                </button>
              </form>

              {/* Secondary Mode Switcher Link */}
              <div className="term-switch-wrapper">
                <p className="term-switch-text">
                  {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                  <button
                    type="button"
                    className="term-switch-btn"
                    onClick={() => handleModeSwitch(isSignUp ? 'login' : 'signup')}
                  >
                    {isSignUp ? '[ LOG IN ]' : '[ CREATE ACCOUNT ]'}
                  </button>
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Footer Bar */}
      <footer className="term-footer">
        <span>© 2026 HABBITS RPG // SYSTEM PROTOCOL</span>
        <span className="terminal-id">HABBITS RPG // AUTHENTICATION TERMINAL</span>
      </footer>
    </div>
  );
}