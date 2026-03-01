import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { logoutUser } from "../firebase/auth";
import { FaFeatherAlt, FaSearch, FaBars, FaTimes, FaUserCircle } from "react-icons/fa";

export default function Navbar() {
  const navigate = useNavigate();
  const { user, role } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logoutUser();
    navigate("/", { replace: true });
    setMobileMenuOpen(false);
  };

  const navLinks = [
    { name: "Originals", path: "/discover?filter=originals" },
    { name: "Trending", path: "/trending" },
    { name: "Discover", path: "/discover" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur-md border-b border-border">
      <nav className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-4 sm:px-6">
        
        {/* Left: Logo */}
        <Link to="/" className="flex items-center gap-2 text-primary transition-transform hover:scale-105">
          <FaFeatherAlt className="text-xl sm:text-2xl" />
          <span className="font-playfair text-2xl font-bold tracking-wide text-foreground">StoryBook</span>
        </Link>

        {/* Center: Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link key={link.name} to={link.path} className="text-sm font-semibold text-foreground hover:text-primary transition-colors">
              {link.name}
            </Link>
          ))}
          <div className="relative flex items-center cursor-not-allowed">
            <span className="text-sm font-semibold text-muted-foreground">Contest</span>
            <span className="absolute -top-3 -right-8 rounded-full bg-primary/20 px-1.5 py-0.5 text-[0.6rem] font-bold text-primary uppercase tracking-wider">
              SOON
            </span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="hidden md:flex items-center gap-5">
          <button className="text-foreground hover:text-primary transition-colors">
            <FaSearch className="text-lg" />
          </button>

          {role === "admin" && (
            <Link
              to="/admin/add"
              className="rounded-full bg-primary px-6 py-2 text-sm font-bold text-primary-foreground transition-transform hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
            >
              Publish
            </Link>
          )}

          {!user ? (
            <div>
            <Link
              to="/login"
              className="rounded-full border-2 border-foreground px-6 py-1.5 text-sm font-bold text-foreground transition-all hover:bg-foreground hover:text-background"
            >
              Log In
            </Link>
            <Link to="/register" className="ml-4 rounded-full border-2 border-primary px-6 py-1.5 text-sm font-bold text-primary transition-all hover:bg-primary hover:text-primary-foreground">
              Create Account
            </Link>
            </div>
          ) : (
            <div className="group relative flex items-center gap-2 cursor-pointer pt-1 pb-1">
              <FaUserCircle className="text-2xl text-foreground hover:text-primary transition-colors" />
              <div className="absolute right-0 top-full mt-1 hidden w-48 rounded-xl border border-border bg-card p-2 shadow-2xl group-hover:block transition-all transform origin-top-right">
                <p className="px-3 py-2 text-xs text-muted-foreground truncate border-b border-border/50 mb-1">{user.email}</p>
                {role === "admin" && (
                  <Link to="/admin" className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-foreground hover:bg-background transition-colors">
                    Dashboard
                  </Link>
                )}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="block w-full rounded-lg px-3 py-2.5 text-left text-sm font-medium text-red-400 hover:bg-background transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden text-foreground hover:text-primary transition-colors"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <FaTimes className="text-2xl" /> : <FaBars className="text-2xl" />}
        </button>
      </nav>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-card px-4 py-6 space-y-5 shadow-2xl animate-fade-in absolute w-full">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className="text-lg font-semibold text-foreground hover:text-primary transition-colors"
              >
                {link.name}
              </Link>
            ))}
            <div className="flex items-center gap-3 text-muted-foreground">
              <span className="text-lg font-semibold">Contest</span>
              <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary tracking-wider">SOON</span>
            </div>
          </div>

          <hr className="border-border/50" />

          <div className="flex flex-col space-y-4">
            {role === "admin" && (
              <Link
                to="/admin/add"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center rounded-full bg-primary px-5 py-3 text-base font-bold text-primary-foreground"
              >
                Publish a Story
              </Link>
            )}
            
            {!user ? (
               <Link
                 to="/login"
                 onClick={() => setMobileMenuOpen(false)}
                 className="w-full text-center rounded-full border-2 border-foreground px-5 py-2.5 text-base font-bold text-foreground"
               >
                 Log In
               </Link>
            ) : (
              <div className="space-y-3 bg-background/50 p-4 rounded-xl">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-border/50">
                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                </div>
                {role === "admin" && (
                  <Link to="/admin" onClick={() => setMobileMenuOpen(false)} className="block text-base font-medium text-foreground hover:text-primary">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left text-base font-medium text-red-400">
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
