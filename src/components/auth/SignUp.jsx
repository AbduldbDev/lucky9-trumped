import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import AuthLayout from "../common/AuthLayout.jsx";

const EMPTY_ERRORS = {
  username: "",
  password: "",
  confirmPassword: "",
  form: "",
};

const labelClass =
  "mb-1.5 block text-[9px] font-semibold uppercase tracking-[0.25em] text-white/35 sm:text-[10px] sm:tracking-[0.3em]";

const inputClass = (hasError) =>
  `w-full rounded-2xl border bg-black/40 px-4 py-3 text-sm text-ivory-DEFAULT outline-none transition placeholder:text-white/20 disabled:opacity-50 sm:py-3.5 ${
    hasError
      ? "border-red-500/50 focus:border-red-500/70 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.08)]"
      : "border-white/10 focus:border-gold-DEFAULT/50 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.04)]"
  }`;

function FieldError({ id, message }) {
  if (!message) return null;
  return (
    <p
      id={id}
      role="alert"
      className="mt-1.5 flex items-start gap-1.5 px-1 text-[11px] leading-snug text-red-400/90 sm:text-xs"
    >
      <i className="fa-solid fa-circle-exclamation mt-[2px] text-[10px]" />
      <span>{message}</span>
    </p>
  );
}

export default function SignUp({ onSwitchToLogin }) {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [loading, setLoading] = useState(false);

  const clearError = (field) =>
    setErrors((prev) =>
      prev[field] || prev.form ? { ...prev, [field]: "", form: "" } : prev,
    );

  const validate = () => {
    const next = { ...EMPTY_ERRORS };

    if (!username.trim()) next.username = "Please enter a username";
    else if (username.length < 3)
      next.username = "Username must be at least 3 characters";
    else if (username.length > 20)
      next.username = "Username must be 20 characters or less";
    else if (!/^[a-zA-Z0-9_]+$/.test(username))
      next.username = "Only letters, numbers, and underscores allowed";

    if (!password) next.password = "Please enter a password";
    else if (password.length < 6)
      next.password = "Password must be at least 6 characters";

    if (!confirmPassword) next.confirmPassword = "Please confirm your password";
    else if (password && password !== confirmPassword)
      next.confirmPassword = "Passwords do not match";

    setErrors(next);
    return !Object.values(next).some(Boolean);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const { error } = await signUp(username, password);
    setLoading(false);

    if (error) {
      const msg = error.message || "";
      if (msg.includes("already registered")) {
        setErrors({ ...EMPTY_ERRORS, username: "Username already taken" });
      } else {
        setErrors({ ...EMPTY_ERRORS, form: msg || "Failed to create account" });
      }
    } else {
      navigate("/lobby");
    }
  };

  return (
    <AuthLayout>
      <section className="overflow-hidden rounded-3xl border border-gold/35 bg-gradient-to-b from-white/[0.05] to-black/50 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.9)] backdrop-blur-md">
        <div className="px-4 pt-5 text-center sm:px-6 sm:pt-6">
          <h2 className="font-serif text-lg font-bold tracking-wide text-gold-light sm:text-xl">
            Create Account
          </h2>
          <p className="mt-1 text-xs leading-relaxed text-white/40 sm:text-sm">
            Claim your seat at the private table.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="space-y-4 px-4 pb-5 pt-4 sm:space-y-5 sm:px-6 sm:pb-6 sm:pt-5"
        >
          {/* Username */}
          <div>
            <label htmlFor="username" className={labelClass}>
              Username
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError("username");
              }}
              className={inputClass(!!errors.username)}
              placeholder="Choose a username"
              autoComplete="username"
              disabled={loading}
              maxLength={20}
              aria-invalid={!!errors.username}
              aria-describedby={
                errors.username ? "username-error" : "username-hint"
              }
            />
            {errors.username ? (
              <FieldError id="username-error" message={errors.username} />
            ) : (
              <p
                id="username-hint"
                className="mt-1.5 px-1 text-[11px] text-white/25 sm:text-xs"
              >
                3–20 characters · letters, numbers, underscores
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className={labelClass}>
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  clearError("password");
                }}
                className={`${inputClass(!!errors.password)} pr-12`}
                placeholder="Create a password"
                autoComplete="new-password"
                disabled={loading}
                aria-invalid={!!errors.password}
                aria-describedby={
                  errors.password ? "password-error" : "password-hint"
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                disabled={loading}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-white/30 transition hover:text-gold-light"
              >
                <i
                  className={`fa-solid ${showPassword ? "fa-eye-slash" : "fa-eye"} text-sm`}
                />
              </button>
            </div>
            {errors.password ? (
              <FieldError id="password-error" message={errors.password} />
            ) : (
              <p
                id="password-hint"
                className="mt-1.5 px-1 text-[11px] text-white/25 sm:text-xs"
              >
                Minimum 6 characters
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className={labelClass}>
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
                clearError("confirmPassword");
              }}
              className={inputClass(!!errors.confirmPassword)}
              placeholder="Confirm your password"
              autoComplete="new-password"
              disabled={loading}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby={
                errors.confirmPassword ? "confirm-error" : undefined
              }
            />
            <FieldError id="confirm-error" message={errors.confirmPassword} />
          </div>

          {/* Submit */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full overflow-hidden rounded-2xl border border-gold/50 bg-gradient-to-b from-gold-faint/70 to-gold-faint/30 py-3 text-sm font-bold tracking-wide text-gold-light shadow-[0_6px_16px_-10px_rgba(212,175,55,0.2)] transition-all hover:border-gold/80 hover:shadow-[0_8px_20px_-10px_rgba(212,175,55,0.3)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none sm:py-4 sm:text-base"
            >
              <span className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              {loading ? (
                <>
                  <i className="fa-solid fa-circle-notch fa-spin mr-2 sm:mr-2.5" />
                  Creating account...
                </>
              ) : (
                <>
                  <i className="fa-solid fa-user-plus mr-2 sm:mr-2.5" />
                  Create Account
                </>
              )}
            </button>

            {/* General (non-field) error */}
            {errors.form && (
              <p
                role="alert"
                className="mt-3 rounded-xl border border-red-700/20 bg-red-950/30 px-3 py-2 text-center text-[11px] text-red-400/90 sm:text-xs"
              >
                <i className="fa-solid fa-circle-exclamation mr-1.5" />
                {errors.form}
              </p>
            )}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-white/5" />
            <span className="text-[9px] uppercase tracking-[0.25em] text-white/20 sm:text-[10px] sm:tracking-[0.3em]">
              Or
            </span>
            <div className="h-px flex-1 bg-white/5" />
          </div>

          {/* Switch to Login */}
          <button
            type="button"
            onClick={onSwitchToLogin}
            disabled={loading}
            className="group flex w-full items-center justify-between rounded-2xl border border-gold/25 bg-black/30 px-3.5 py-2.5 text-left transition-all hover:border-gold/40 hover:bg-black/50 active:scale-[0.98] disabled:opacity-50 sm:px-4 sm:py-3.5"
          >
            <span className="flex items-center gap-2.5 sm:gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-full border border-gold/25 bg-gold-faint/20 text-xs text-gold sm:h-9 sm:w-9 sm:text-sm">
                <i className="fa-solid fa-right-to-bracket" />
              </span>
              <span>
                <span className="block text-xs font-semibold text-ivory sm:text-sm">
                  Already have an account?
                </span>
                <span className="block text-[11px] text-white/35 sm:text-xs">
                  Sign in to your table
                </span>
              </span>
            </span>
            <i className="fa-solid fa-chevron-right text-[10px] text-white/25 transition-transform group-hover:translate-x-1 group-hover:text-gold-DEFAULT sm:text-xs" />
          </button>
        </form>
      </section>
    </AuthLayout>
  );
}
