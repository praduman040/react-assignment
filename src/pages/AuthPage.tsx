import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Mail, Lock } from "lucide-react";

export function AuthPage() {
  const { signUp, signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-page__container">
        <div className="auth-page__card">
          <h1 className="auth-page__title">Workflow Builder</h1>
          <p className="auth-page__subtitle">
            {isSignUp ? "Create an account to get started" : "Sign in to your account"}
          </p>

          <form className="auth-page__form" onSubmit={handleSubmit}>
            <div className="auth-page__field">
              <label className="auth-page__label">Email</label>
              <div className="auth-page__input-wrapper">
                <Mail size={18} className="auth-page__input-icon" />
                <input
                  type="email"
                  className="auth-page__input"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="auth-page__field">
              <label className="auth-page__label">Password</label>
              <div className="auth-page__input-wrapper">
                <Lock size={18} className="auth-page__input-icon" />
                <input
                  type="password"
                  className="auth-page__input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && <div className="auth-page__error">{error}</div>}

            <button type="submit" className="auth-page__submit" disabled={loading}>
              {loading ? "Loading..." : isSignUp ? "Sign Up" : "Sign In"}
            </button>
          </form>

          <div className="auth-page__footer">
            <p className="auth-page__footer-text">
              {isSignUp ? "Already have an account?" : "Don't have an account?"}
            </p>
            <button
              type="button"
              className="auth-page__toggle"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "Sign In" : "Sign Up"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
