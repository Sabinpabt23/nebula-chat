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
        (err as any)?.response?.data?.message ||
        "Failed to send code. Try again.";
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
    } catch (err: unknown) {
      const message =
        (err as any)?.response?.data?.message || "Invalid or expired code.";
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
        (err as any)?.response?.data?.message ||
        "Google sign-in failed. Try again.";
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
        <div className="flex items-center gap-2.5 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "var(--color-accent)" }}
          >
            <svg width="15" height="15" viewBox="0 0 14 14" fill="none">
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
            className="font-semibold tracking-tight"
            style={{ fontSize: "18px", color: "var(--color-text-primary)" }}
          >
            Nebula Chat
          </span>
        </div>
        <p className="text-sm" style={{ color: "var(--color-text-secondary)" }}>
          Sign in to continue your conversations.
        </p>
      </div>

      {/* Card */}
      <div
        className="rounded-2xl p-6"
        style={{
          backgroundColor: "var(--color-bg-surface)",
          border: "1px solid var(--color-border)",
        }}
      >
        {/* Tabs */}
        <div
          className="flex rounded-xl p-0.5 mb-5"
          style={{ backgroundColor: "var(--color-bg-elevated)" }}
        >
          {(["email", "google"] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabChange(tab)}
              className="flex-1 py-1.5 text-sm rounded-lg font-medium transition-all duration-150"
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
          <div className="flex flex-col gap-3.5">
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
                className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-150
                  placeholder:text-[var(--color-text-tertiary)]
                  text-[var(--color-text-primary)]
                  border
                  focus:border-[var(--color-accent)]
                  disabled:opacity-40 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: "var(--color-bg-elevated)",
                  borderColor: "var(--color-border)",
                }}
              />
            </div>

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
                    className="text-xs transition-colors duration-150 hover:opacity-80"
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
                  placeholder="000000"
                  value={code}
                  autoFocus
                  onChange={(e) => {
                    setCode(e.target.value);
                    clearError();
                  }}
                  onKeyDown={(e) => handleKeyDown(e, handleVerifyOtp)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm outline-none transition-all duration-150
                    tracking-[0.3em] font-mono text-center
                    placeholder:text-[var(--color-text-tertiary)] placeholder:tracking-normal placeholder:font-sans
                    text-[var(--color-text-primary)]
                    border
                    focus:border-[var(--color-accent)]"
                  style={{
                    backgroundColor: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border)",
                  }}
                />
                <p
                  className="text-xs"
                  style={{ color: "var(--color-text-tertiary)" }}
                >
                  Code sent to {email}
                </p>
              </div>
            )}

            {error && activeTab === "email" && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{
                  backgroundColor: "var(--color-danger-subtle)",
                  color: "var(--color-danger)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M6 3.5v3M6 8v.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            {otpStep === "email" ? (
              <button
                onClick={handleSendOtp}
                disabled={isSending}
                className="w-full py-2.5 rounded-xl text-sm font-medium mt-0.5
                  transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 hover:opacity-90"
                style={{
                  backgroundColor: "var(--color-accent)",
                  color: "white",
                }}
              >
                {isSending ? (
                  <>
                    <Spinner />
                    Sending…
                  </>
                ) : (
                  "Send code"
                )}
              </button>
            ) : (
              <button
                onClick={handleVerifyOtp}
                disabled={isVerifying}
                className="w-full py-2.5 rounded-xl text-sm font-medium mt-0.5
                  transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center justify-center gap-2 hover:opacity-90"
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
                  "Sign in"
                )}
              </button>
            )}
          </div>
        )}

        {/* Google flow */}
        {activeTab === "google" && (
          <div className="flex flex-col gap-3.5">
            <p
              className="text-sm text-center leading-relaxed"
              style={{ color: "var(--color-text-secondary)" }}
            >
              Sign in with Google — no password required.
            </p>

            {error && activeTab === "google" && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
                style={{
                  backgroundColor: "var(--color-danger-subtle)",
                  color: "var(--color-danger)",
                }}
              >
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle
                    cx="6"
                    cy="6"
                    r="5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M6 3.5v3M6 8v.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
                {error}
              </div>
            )}

            <button
              onClick={handleGoogleLogin}
              disabled={isGoogleLoading}
              className="w-full py-2.5 rounded-xl text-sm font-medium
                transition-all duration-150 disabled:opacity-60 disabled:cursor-not-allowed
                flex items-center justify-center gap-2.5 hover:opacity-90"
              style={{
                backgroundColor: "var(--color-bg-elevated)",
                color: "var(--color-text-primary)",
                border: "1px solid var(--color-border)",
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
                  Continue with Google
                </>
              )}
            </button>
          </div>
        )}
      </div>

      <p
        className="text-center text-xs mt-5"
        style={{ color: "var(--color-text-tertiary)" }}
      >
        By signing in you agree to our{" "}
        <span style={{ color: "var(--color-text-secondary)" }}>
          terms of service
        </span>
        .
      </p>
    </div>
  );
}

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
