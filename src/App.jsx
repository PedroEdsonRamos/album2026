import { useState, useCallback, useEffect, useRef, lazy, Suspense } from "react";
import { supabase } from "@/lib/supabase";
import { useOnlineStatus } from "@/hooks/useOnlineStatus.js";
import { SkeletonGrid } from "@/components/atoms/SkeletonCard.jsx";
import { C } from "@/styles/tokens.js";
import { useAuth } from "@/hooks/useAuth.js";
import { useStickers } from "@/hooks/useStickers.js";
import { TEAMS } from "@/data/teams.js";
import { Toast } from "@/components/atoms/Toast.jsx";
import { CompletionModal } from "@/components/organisms/CompletionModal.jsx";
import { Header } from "@/components/organisms/Header.jsx";
import { BottomNav } from "@/components/organisms/BottomNav.jsx";
import { Footer } from "@/components/organisms/Footer.jsx";
import { QuickSearch } from "@/components/organisms/QuickSearch.jsx";
const Dashboard = lazy(() => import("@/components/pages/Dashboard.jsx").then(m => ({ default: m.Dashboard })));
const Teams     = lazy(() => import("@/components/pages/Teams.jsx").then(m => ({ default: m.Teams })));
const Stickers  = lazy(() => import("@/components/pages/Stickers.jsx").then(m => ({ default: m.Stickers })));
const AddPage   = lazy(() => import("@/components/pages/AddPage.jsx").then(m => ({ default: m.AddPage })));
const Trades    = lazy(() => import("@/components/pages/Trades.jsx").then(m => ({ default: m.Trades })));
const Status    = lazy(() => import("@/components/pages/Status.jsx").then(m => ({ default: m.Status })));
const Help      = lazy(() => import("@/components/pages/Help.jsx").then(m => ({ default: m.Help })));
const Profile   = lazy(() => import("@/components/pages/Profile.jsx").then(m => ({ default: m.Profile })));
import { PWAInstallBanner } from "@/components/PWAInstallBanner.jsx";
import { LoginScreen } from "@/components/auth/LoginScreen.jsx";
import { SignupScreen } from "@/components/auth/SignupScreen.jsx";
import { ResetPasswordScreen } from "@/components/auth/ResetPasswordScreen.jsx";
import { ResetPasswordConfirmScreen } from "@/components/auth/ResetPasswordConfirmScreen.jsx";
import { VerifyEmailScreen } from "@/components/auth/VerifyEmailScreen.jsx";
import { PendingApprovalScreen } from "@/components/auth/PendingApprovalScreen.jsx";
import { AuthCallbackScreen } from "@/components/auth/AuthCallbackScreen.jsx";

function PageTransition({ children, pageKey }) {
  return (
    <div key={pageKey} style={{ animation: "pageEnter 0.18s ease-out" }}>
      {children}
    </div>
  );
}

function PageSuspense({ children }) {
  return (
    <Suspense fallback={
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 200 }}>
        <div style={{
          width: 28, height: 28,
          border: "2px solid rgba(245,158,11,0.2)",
          borderTopColor: "#f59e0b",
          borderRadius: "50%",
          animation: "spin 0.7s linear infinite",
        }} />
      </div>
    }>
      {children}
    </Suspense>
  );
}

function LoadingScreen() {
  const [showTip, setShowTip] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShowTip(true), 4000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0c0c1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: 20,
      fontFamily: "'Sora', sans-serif",
      padding: "24px",
    }}>
      <img
        src="/trophy_title.png"
        alt="Troféu"
        style={{ height: 72, opacity: 0.5, objectFit: "contain" }}
        onError={e => { e.target.style.display = "none"; }}
      />
      <div style={{
        width: 32, height: 32,
        border: "3px solid rgba(245,158,11,0.15)",
        borderTopColor: "#f59e0b",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }} />
      <div style={{ fontSize: 12, color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>
        Conectando...
      </div>
      {showTip && (
        <div style={{
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.15)",
          borderRadius: 12,
          padding: "12px 16px",
          fontSize: 12,
          color: "rgba(245,158,11,0.6)",
          textAlign: "center",
          maxWidth: 280,
          lineHeight: 1.6,
          animation: "fadeIn .5s ease",
        }}>
          Isso está demorando mais que o esperado.
          <br />
          Verifique sua conexão com a internet.
        </div>
      )}
    </div>
  );
}

function OfflineBanner() {
  return (
    <div style={{
      position: "fixed",
      top: 0, left: "50%",
      transform: "translateX(-50%)",
      width: "100%", maxWidth: 480,
      zIndex: 9999,
      background: "rgba(248,113,113,0.95)",
      backdropFilter: "blur(8px)",
      padding: "10px 16px",
      textAlign: "center",
      fontSize: 12,
      fontWeight: 600,
      color: "#fff",
      fontFamily: "'Sora', sans-serif",
    }}>
      📡 Sem conexão — suas alterações serão salvas quando voltar online
    </div>
  );
}

export default function App({ initialRecovery = false }) {
  const [recoveryMode, setRecoveryMode] = useState(initialRecovery);

  // Estabelece sessão a partir do token no hash (implicit flow)
  // PKCE flow: Supabase já troca o token via detectSessionInUrl — nada a fazer
  useEffect(() => {
    if (!initialRecovery) return;
    const setupRecovery = async () => {
      const hash = window.location.hash.replace(/^#/, "");
      const params = new URLSearchParams(hash);
      const accessToken = params.get("access_token");
      const refreshToken = params.get("refresh_token");
      if (accessToken && refreshToken) {
        await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
      }
      window.history.replaceState(null, "", window.location.pathname);
    };
    setupRecovery();
  }, [initialRecovery]);

  if (recoveryMode) {
    const exitRecovery = () => {
      setRecoveryMode(false);
      window.location.href = window.location.pathname;
    };
    return (
      <ResetPasswordConfirmScreen
        onSuccess={exitRecovery}
        onCancel={exitRecovery}
      />
    );
  }

  return <NormalApp />;
}

function NormalApp() {
  const auth = useAuth();
  const [authScreen, setAuthScreen] = useState("login");
  const [pendingEmail, setPendingEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  // Detecta tipo de callback (hash = implicit flow, search = PKCE flow)
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.replace("#", "?"));
  const searchParams = new URLSearchParams(window.location.search);
  const callbackType = hashParams.get("type") || searchParams.get("type");
  const hasAccessToken = hash.includes("access_token");
  const hasTokenHash = searchParams.has("token_hash");

  // Callback de confirmação de email → apenas signup, nunca recovery
  const isEmailConfirm = (hasAccessToken && callbackType === "signup") ||
                         (hasTokenHash && callbackType === "signup");

  if (isEmailConfirm && auth.loading) {
    return <AuthCallbackScreen />;
  }

  if (auth.loading || (auth.user && auth.approved === null)) {
    return <LoadingScreen />;
  }

  if (!auth.user) {
    if (authScreen === "signup") {
      return (
        <SignupScreen
          auth={auth}
          onGoToLogin={() => setAuthScreen("login")}
          onSignupSuccess={(email) => {
            setPendingEmail(email);
            setAuthScreen("verify-email");
          }}
        />
      );
    }
    if (authScreen === "reset") {
      return (
        <ResetPasswordScreen
          auth={auth}
          onGoToLogin={() => setAuthScreen("login")}
          initialEmail={resetEmail}
        />
      );
    }
    if (authScreen === "verify-email") {
      return (
        <VerifyEmailScreen
          email={pendingEmail}
          onGoToLogin={() => setAuthScreen("login")}
        />
      );
    }
    return (
      <LoginScreen
        auth={auth}
        onGoToSignup={() => setAuthScreen("signup")}
        onGoToReset={(email) => { setResetEmail(email); setAuthScreen("reset"); }}
      />
    );
  }

  if (auth.user && auth.approved === false) {
    return <PendingApprovalScreen auth={auth} />;
  }

  return <AppContent auth={auth} />;
}

function AppContent({ auth }) {
  const online = useOnlineStatus();
  const [page, setPage] = useState("dashboard");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [albumInitialFilter, setAlbumInitialFilter] = useState({});
  const [teamsFilter, setTeamsFilter] = useState({ _ts: 0 });
  const [completion, setCompletion] = useState(null);
  const prevStickersRef = useRef(null);
  const mountedRef = useRef(false);

  const addToast = useCallback((msg, type = "success", duration) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, msg, type, duration }]);
  }, []);

  const { stickers, setStickers, loading, syncStatus, resetCollection } =
    useStickers(auth.user.id, addToast);

  const handleLogout = async () => {
    if (!confirm("Deseja sair da sua conta?")) return;
    await auth.signOut();
    sessionStorage.clear();
  };

  const goToTeams = useCallback((section = "Todos", sub = null) => {
    setTeamsFilter({ section, sub, _ts: Date.now() });
    setSelectedTeam(null);
    setPage("teams");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goToAlbum = (filter = {}) => {
    setSelectedTeam(null);
    setAlbumInitialFilter({
      search: "",
      status: "Todos",
      finish: "Todos",
      position: "Todos",
      ...filter,
      _ts: Date.now(),
    });
    setPage("stickers");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (loading) return;
    if (!mountedRef.current) {
      mountedRef.current = true;
      prevStickersRef.current = stickers;
      return;
    }
    const prev = prevStickersRef.current;
    if (!prev) { prevStickersRef.current = stickers; return; }

    TEAMS.forEach((team) => {
      const prevOwned = prev.filter((s) => s.team === team.id && s.status === "Tenho").length;
      const nowOwned = stickers.filter((s) => s.team === team.id && s.status === "Tenho").length;
      if (prevOwned < 20 && nowOwned === 20) {
        addToast(`${team.flag} ${team.name} completo! Todos os 20 cromos!`, "success", 4000);
      }
    });

    const groups = [...new Set(TEAMS.map((t) => t.grp))];
    groups.forEach((grp) => {
      const grpTeams = TEAMS.filter((t) => t.grp === grp);
      const allComplete = grpTeams.every(
        (team) => stickers.filter((s) => s.team === team.id && s.status === "Tenho").length === 20
      );
      const wasComplete = grpTeams.every(
        (team) => prev.filter((s) => s.team === team.id && s.status === "Tenho").length === 20
      );
      if (!wasComplete && allComplete) {
        setCompletion({ type: "group", grp, teams: grpTeams });
      }
    });

    const prevTotal = prev.filter((s) => s.status === "Tenho").length;
    const nowTotal = stickers.filter((s) => s.status === "Tenho").length;
    if (prevTotal < 980 && nowTotal === 980) {
      setCompletion({ type: "album" });
    }

    prevStickersRef.current = stickers;
  }, [stickers, loading]);

  const removeToast = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const handleNav = (id) => {
    if (id !== "stickers") setSelectedTeam(null);
    setAlbumInitialFilter({ _ts: 0 });
    setPage(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh", background: "#0c0c1a",
        padding: "80px 16px 24px",
      }}>
        <SkeletonGrid count={12} />
      </div>
    );
  }

  return (
    <>
      {!online && <OfflineBanner />}
    <div
      style={{
        minHeight: "100vh",
        background: C.bg,
        fontFamily: "'Sora','DM Sans',system-ui,sans-serif",
        color: "#fff",
        maxWidth: 480,
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 0,
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at 20% 0%, rgba(245,158,11,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(168,85,247,0.08) 0%, transparent 60%)",
        }}
      />
      {toasts.map((t) => (
        <Toast key={t.id} msg={t.msg} type={t.type} duration={t.duration} onDone={() => removeToast(t.id)} />
      ))}
      <CompletionModal completion={completion} onClose={() => setCompletion(null)} />
      {searchOpen && (
        <QuickSearch
          stickers={stickers}
          onClose={() => setSearchOpen(false)}
          onGoTo={(s) => goToAlbum({ search: s.code })}
        />
      )}
      <Header
        page={page}
        selectedTeam={selectedTeam}
        onBack={() => {
          setSelectedTeam(null);
          setPage("teams");
        }}
        onSearchOpen={() => setSearchOpen(true)}
        auth={auth}
        onLogout={handleLogout}
        onProfile={() => setPage("profile")}
        syncStatus={syncStatus}
      />
      <div style={{ paddingBottom: "calc(64px + env(safe-area-inset-bottom))" }}>
        <div style={{ padding: "20px 16px 24px", position: "relative", zIndex: 1 }}>
          <PageTransition pageKey={page}>
            {page === "dashboard" && (
              <PageSuspense>
                <Dashboard stickers={stickers} setPage={setPage} setTeamFilter={setSelectedTeam} goToAlbum={goToAlbum} goToTeams={goToTeams} />
              </PageSuspense>
            )}
            {page === "teams" && (
              <PageSuspense>
                <Teams stickers={stickers} setPage={setPage} setTeamFilter={setSelectedTeam} goToAlbum={goToAlbum} initialSection={teamsFilter} />
              </PageSuspense>
            )}
            {page === "stickers" && (
              <PageSuspense>
                <Stickers stickers={stickers} selectedTeam={selectedTeam} setStickers={setStickers} addToast={addToast} initialFilter={albumInitialFilter} />
              </PageSuspense>
            )}
            {page === "add" && (
              <PageSuspense>
                <AddPage stickers={stickers} setStickers={setStickers} addToast={addToast} />
              </PageSuspense>
            )}
            {page === "trocas" && (
              <PageSuspense>
                <Trades stickers={stickers} addToast={addToast} goToAlbum={goToAlbum} setPage={handleNav} setTeamFilter={setSelectedTeam} />
              </PageSuspense>
            )}
            {page === "status" && (
              <PageSuspense>
                <Status stickers={stickers} setStickers={setStickers} addToast={addToast} setPage={setPage} onReset={resetCollection} />
              </PageSuspense>
            )}
            {page === "ajuda" && <PageSuspense><Help setPage={setPage} /></PageSuspense>}
            {page === "profile" && <PageSuspense><Profile auth={auth} stickers={stickers} setPage={setPage} addToast={addToast} /></PageSuspense>}
          </PageTransition>
        </div>
        <Footer />
      </div>
      <BottomNav page={page} onNav={handleNav} />
    </div>
    <PWAInstallBanner />
    </>
  );
}
