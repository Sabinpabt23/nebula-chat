/**
 * LoginForm.tsx
 *
 * Login UI component for Nebula Chat.
 * Handles two authentication flows:
 *   1. Email/OTP — collect email, send OTP, then verify the code
 *   2. Google OAuth — popup-based sign-in via Google credential
 *
 * All API calls are delegated to the useAuth hook. This component
 * only owns UI state (which tab is active, input values, loading flags,
 * error messages). It never touches the store or api directly.
 */

import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

type Tab = "email" | "google";
type OtpStep = "email" | "code";

export function LoginForm() {
  const { sendOtp, verifyOtp, triggerGoogleLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("email");
  const [otpStep, setOtpStep] = useState<OtpStep>("email");

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [error, setError] = useState("");

  function clearError() {
    if (error) setError("");
  }

  function handleTabChange(tab: Tab) {
    setActiveTab(tab);
    setOtpStep("email");
    setEmail("");
    setCode("");
    setError("");
  }

  async function handleSendOtp() {
    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }
    setIsSending(true);
    setError("");
    try {
      await sendOtp(email.trim().toLowerCase());
      setOtpStep("code");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Failed to send code. Try again.";
      setError(message);
    } finally {
      setIsSending(false);
    }
  }

  async function handleVerifyOtp() {
    if (!code.trim()) {
      setError("Please enter the verification code.");
      return;
    }
    setIsVerifying(true);
    setError("");
    try {
      await verifyOtp(email.trim().toLowerCase(), code.trim());
      // Navigation is handled by the parent route / auth guard
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid or expired code.";
      setError(message);
    } finally {
      setIsVerifying(false);
    }
  }

  async function handleGoogleLogin() {
    setIsGoogleLoading(true);
    setError("");
    try {
      await triggerGoogleLogin();
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Google sign-in failed. Try again.";
      setError(message);
    } finally {
      setIsGoogleLoading(false);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent, action: () => void) {
    if (e.key === "Enter") action();
  }

  return (
    <div className="w-full max-w-sm">
      {/* Wordmark */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-accent)] flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="4" cy="7" r="2" fill="white" />
              <circle cx="10" cy="4" r="1.5" fill="white" opacity="0.7" />
              <circle cx="10" cy="10" r="1.5" fill="white" opacity="0.7" />
              <line
                x1="6"
                y1="7"
                x2="9"
                y2="4.5"
                stroke="white"
                strokeWidth="1"
                opacity="0.5"
              />
              <line
                x1="6"
                y1="7"
                x2="9"
                y2="9.5"
                stroke="white"
                strokeWidth="1"
                opacity="0.5"
              />
            </svg>
          </div>
          <span
            className="text-[var(--color-text-primary)] font-semibold tracking-tight"
            style={{ fontSize: "17px" }}
          >
            Nebula Chat
          </span>
        </div>
        <p className="text-[var(--color-text-secondary)] text-sm mt-3">
          Sign in to your account to continue.
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-xl border border-[var(--color-border)] p-6"
        style={{ backgroundColor: "var(--color-bg-surface)" }}
      >
        {/* Tabs */}
        <div
          className="flex rounded-lg p-0.5 mb-6"
          style={{ backgroundColor: "var(--color-bg-elevated)" }}
        >
          {(["email", "google"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="flex-1 py-1.5 text-sm rounded-md font-medium transition-all duration-150"
              style={{
                backgroundColor:
                  activeTab === tab ? "var(--color-bg-surface)" : "transparent",
                color:
                  activeTab === tab
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                border:
                  activeTab === tab
                    ? "1px solid var(--color-border)"
                    : "1px solid transparent",
              }}
            >
              {tab === "email" ? "Email" : "Google"}
            </button>
          ))}
        </div>

        {/* Email/OTP flow */}
        {activeTab === "email" && (
          <div className="flex flex-col gap-3">
            {/* Email input — always visible */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium"
                style={{ color: "var(--color-text-secondary)" }}
              >
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                disabled={otpStep === "code"}
                onChange={(e) => {
                  setEmail(e.target.value);
                  clearError();
                }}
                onKeyDown={(e) =>
                  otpStep === "email" && handleKeyDown(e, handleSendOtp)
                }
                className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150
                  placeholder:text-[var(--color-text-tertiary)]
                  text-[var(--color-text-primary)]
                  border border-[var(--color-border)]
                  focus:border-[var(--color-accent)]
                  disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: "var(--color-bg-elevated)" }}
              />
            </div>

            {/* OTP input — appears after code is sent */}
            {otpStep === "code" && (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="code"
                    className="text-xs font-medium"
                    style={{ color: "var(--color-text-secondary)" }}
                  >
                    Verification code
                  </label>
                  <button
                    onClick={() => {
                      setOtpStep("email");
                      setCode("");
                      setError("");
                    }}
                    className="text-xs transition-colors duration-150"
                    style={{ color: "var(--color-accent)" }}
                  >
                    Change email
                  </button>
                </div>
                <input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="Enter 6-digit code"
                  value={code}
                  autoFocus
                  onChange={(e) => {
                    setCode(e.target.value);
                    clearError();
                  }}
                  onKeyDown={(e) => handleKeyDown(e, handleVerifyOtp)}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150
                    tracking-[0.2em] font-mono
                    placeholder:text-[var(--color-text-tertiary)] placeholder:tracking-normal placeholder:font-sans
                    text-[var(--color-text-primary)]
                    border border-[var(--color-border)]
                    focus:border-[var(--color-accent)]"
                  style={{ backgroundColor: "var(--color-bg-elevated)" }}
                />
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Code sent to {email}
                </p>
              </div>
            )}

            {/* Error message */}
            {error && activeTab === "email" && (
              <p className="text-xs" style={{ color: "var(--color-danger)" }}>
                {error}
              </p>
            )}

            {/* Primary action button */}
            {otpStep === "email" ? (
              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full py-2 rounded-lg text-sm font-medium mt-1
                  transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {isSending ? (
                  <>
                    <Spinner />
                    Sending code…
                  </>
                ) : (
                  "Send code"
                )}
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full py-2 rounded-lg text-sm font-medium mt-1
                  transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {isVerifying ? (
                  <>
                    <Spinner />
                    Verifying…
                  </>
                ) : (
                  "Verify & sign in"
                )}
              </button>
            )}
          </div>
        )}

        {/* Google flow */}
        {activeTab === "google" && (
          <div className="flex flex-col gap-3">
            <p
              className="text-sm text-center"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign in with your Google account. No password needed.
            </p>

            {error && activeTab === "google" && (
              <p
                className="text-xs text-center"
                style={{ color: "var(--color-danger)" }}
              >
                {error}
              </p>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2 rounded-lg text-sm font-medium mt-1
                transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2.5
                border border-[var(--color-border)]"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
              }}
            >
              {isGoogleLoading ? (
                <>
                  <Spinner />
                  Opening Google…
                </>
              ) : (
                <>
                  <GoogleIcon />
                  Sign in with Google
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <p
        className="text-center text-xs mt-5"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        By signing in you agree to our terms of service.
      </p>
    </div>
  );
}

/** Inline spinner — 14px, inherits current color */
function Spinner() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      className="animate-spin"
      aria-hidden="true"
    >
      <circle
        cx="7"
        cy="7"
        r="5.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeOpacity="0.25"
      />
      <path
        d="M7 1.5A5.5 5.5 0 0 1 12.5 7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Google 'G' logo — minimal SVG, no external dependency */
function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M15.68 8.18c0-.57-.05-1.11-.14-1.64H8v3.1h4.3a3.67 3.67 0 0 1-1.59 2.41v2h2.57c1.5-1.38 2.4-3.42 2.4-5.87Z"
        fill="#4285F4"
      />
      <path
        d="M8 16c2.16 0 3.97-.72 5.29-1.94l-2.57-2a4.8 4.8 0 0 1-7.15-2.52H.96v2.07A8 8 0 0 0 8 16Z"
        fill="#34A853"
      />
      <path
        d="M3.57 9.54A4.8 4.8 0 0 1 3.32 8c0-.54.09-1.06.25-1.54V4.39H.96A8 8 0 0 0 0 8c0 1.29.31 2.51.96 3.61l2.61-2.07Z"
        fill="#FBBC05"
      />
      <path
        d="M8 3.18c1.22 0 2.3.42 3.16 1.24l2.37-2.37A8 8 0 0 0 8 0 8 8 0 0 0 .96 4.39L3.57 6.46A4.77 4.77 0 0 1 8 3.18Z"
        fill="#EA4335"
      />
    </svg>
  );
}
