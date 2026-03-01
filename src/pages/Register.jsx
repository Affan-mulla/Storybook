import { useState } from "react";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser, loginWithGoogle } from "../firebase/auth";
import { db } from "../firebase/config";

export default function Register() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [googleSubmitting, setGoogleSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const credential = await registerUser(email, password);

      await setDoc(doc(db, "users", credential.user.uid), {
        email: credential.user.email,
        role: "user",
        createdAt: serverTimestamp(),
      });

      navigate("/");
    } catch (err) {
      toast.error(err.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    setGoogleSubmitting(true);
    try {
      const credential = await loginWithGoogle();
      
      const userRef = doc(db, "users", credential.user.uid);
      const userSnap = await getDoc(userRef);
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: credential.user.email,
          role: "user",
          createdAt: serverTimestamp(),
        });
      }

      navigate("/");
    } catch (err) {
      toast.error(err.message || "Google Registration failed");
    } finally {
      setGoogleSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 selection:bg-primary selection:text-white">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 sm:p-10 space-y-8 border border-gray-100">
        <div className="text-center">
          <Link to="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <div className="h-12 w-12 bg-primary text-primary-foreground rounded-xl flex items-center justify-center text-xl font-bold mx-auto shadow-sm">
              SB
            </div>
          </Link>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create Account</h1>
          <p className="text-gray-500 mt-2 text-sm font-medium">Join us to start reading stories</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700" htmlFor="register-email">Email</label>
            <input
              id="register-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
              placeholder="name@example.com"
              disabled={submitting || googleSubmitting}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-gray-700" htmlFor="register-password">Password</label>
            <input
              id="register-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all placeholder:text-gray-400 bg-gray-50/50"
              placeholder="Create a password"
              disabled={submitting || googleSubmitting}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting || googleSubmitting}
            className="w-full py-3 bg-primary text-primary-foreground font-bold rounded-xl shadow-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center text-[15px]"
          >
            {submitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </span>
            ) : "Create account"}
          </button>
        </form>

        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200"></div>
          <span className="flex-shrink-0 px-4 text-xs tracking-wider uppercase text-gray-500 font-semibold mb-[-2px]">Or continue with</span>
          <div className="flex-grow border-t border-gray-200"></div>
        </div>

        <button 
          onClick={handleGoogleRegister}
          type="button"
          disabled={submitting || googleSubmitting}
          className="w-full py-3 bg-white border border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 focus:ring-offset-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-[15px] shadow-sm"
        >
          {googleSubmitting ? (
              <svg className="animate-spin h-5 w-5 text-gray-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
          )}
          <span>{googleSubmitting ? "Connecting..." : "Sign up with Google"}</span>
        </button>

        <p className="text-center text-[15px] text-gray-500 font-medium pb-2">
          Already have an account?{" "}
          <Link to="/login" className="font-bold text-primary hover:text-primary/80 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
