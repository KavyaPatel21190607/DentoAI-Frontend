import { useEffect, useMemo, useState, useRef } from "react";
import * as THREE from "three";
import { Activity, AlertTriangle, ArrowRight, Camera, CheckCircle, Clock, FileText, Loader2, LogOut, Search, Send, Shield, Stethoscope, Upload, UserRound, Users } from "lucide-react";
import { Toaster, toast } from "sonner";
import { api, ApiError, type AiFinding, type DoctorProfile, type Role, type Scan, type User } from "../lib/api";

type Page = "landing" | "login" | "register" | "patient-dashboard" | "new-scan" | "current-report" | "report-history" | "profile" | "doctor-dashboard" | "doctor-patients" | "scan-details";

const idOf = (value: unknown) => typeof value === "string" ? value : value && typeof value === "object" && "_id" in value ? String((value as { _id: string })._id) : value && typeof value === "object" && "id" in value ? String((value as { id: string }).id) : "";
const nameOf = (value: unknown) => value && typeof value === "object" && "name" in value ? String((value as { name?: string }).name ?? "Unknown") : "Unknown";
const fmt = (value?: string) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "Not available";

function Button({ children, onClick, type = "button", variant = "primary", disabled = false, className = "" }: { children: React.ReactNode; onClick?: () => void; type?: "button" | "submit"; variant?: "primary" | "secondary" | "ghost" | "danger"; disabled?: boolean; className?: string }) {
  const variants = { primary: "bg-primary text-primary-foreground hover:opacity-90", secondary: "bg-secondary text-secondary-foreground hover:bg-primary/10", ghost: "text-muted-foreground hover:bg-muted hover:text-foreground", danger: "bg-destructive text-destructive-foreground hover:opacity-90" };
  return <button type={type} onClick={onClick} disabled={disabled} className={`inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition whitespace-nowrap ${variants[variant]} ${disabled ? "cursor-not-allowed opacity-50" : ""} ${className}`}>{children}</button>;
}
function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) { return <section className={`rounded-2xl border border-border bg-card p-4 shadow-sm sm:p-5 ${className}`}>{children}</section>; }
function Loading() { return <div className="flex min-h-64 items-center justify-center text-muted-foreground"><Loader2 className="mr-2 animate-spin" /> Loading backend data...</div>; }
function Empty({ title, body }: { title: string; body: string }) { return <div className="rounded-2xl border border-dashed border-border bg-card p-5 text-center sm:p-8"><FileText className="mx-auto mb-3 text-muted-foreground" size={34} /><h3 className="font-display text-lg font-bold text-foreground">{title}</h3><p className="mx-auto mt-1 max-w-md text-sm text-muted-foreground">{body}</p></div>; }
function Field({ label, type = "text", value, onChange, required = false, placeholder }: { label: string; type?: string; value: string; onChange: (value: string) => void; required?: boolean; placeholder?: string }) { return <label className="block"><span className="mb-1.5 block text-sm font-semibold text-foreground">{label}</span><input type={type} value={value} required={required} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm text-foreground outline-none transition focus:ring-2 focus:ring-ring/40" /></label>; }
function Status({ status }: { status: string }) { const styles: Record<string, string> = { uploaded: "bg-sky-100 text-sky-700", processing: "bg-amber-100 text-amber-700", ai_completed: "bg-blue-100 text-blue-700", sent_to_doctor: "bg-purple-100 text-purple-700", doctor_reviewed: "bg-teal-100 text-teal-700", completed: "bg-emerald-100 text-emerald-700", failed: "bg-red-100 text-red-700" }; return <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${styles[status] ?? "bg-muted text-muted-foreground"}`}>{status.replaceAll("_", " ")}</span>; }
function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) { return <Card className="flex items-center gap-4"><div className="rounded-2xl bg-primary/10 p-3 text-primary">{icon}</div><div><p className="text-sm text-muted-foreground">{label}</p><p className="font-display text-xl font-bold sm:text-2xl text-foreground">{value}</p></div></Card>; }
function AuthPage({ mode, onAuth, goLanding }: { mode: "login" | "register"; onAuth: (user: User) => void; goLanding: () => void }) {
  const [role, setRole] = useState<Role>("patient");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [qualification, setQualification] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [registrationNumber, setRegistrationNumber] = useState("");
  const [hospital, setHospital] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (mode === "register" && !/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9]).{10,128}$/.test(password)) {
      toast.error("Password must be 10+ characters with uppercase, lowercase, and a number");
      return;
    }
    setLoading(true);
    try {
      const payload = mode === "login" ? await api.login({ email, password }) : await api.register({ role, name, email, phone: phone || undefined, password, doctor: role === "doctor" ? { qualification, specialization, registrationNumber, hospital: hospital || undefined } : undefined });
      toast.success(mode === "login" ? "Signed in" : "Account created");
      onAuth(payload.user);
    } catch (error) { toast.error(error instanceof Error ? error.message : "Authentication failed"); }
    finally { setLoading(false); }
  }

  return <main className="min-h-screen bg-background px-4 py-4 sm:px-6 sm:py-10"><div className="mx-auto grid min-h-[calc(100vh-5rem)] max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl lg:grid-cols-[0.9fr_1.1fr]"><aside className="hidden bg-gradient-to-br from-primary to-accent p-10 text-white lg:flex lg:flex-col lg:justify-between"><div className="flex items-center gap-2 text-xl font-bold"><Stethoscope /> DentoAI</div><div><h1 className="font-display text-3xl font-bold sm:text-4xl leading-tight">Secure dental screening, connected to real clinical review.</h1><p className="mt-4 text-white/80">Screen, review, and manage dental reports through a secure clinical workflow.</p></div><button onClick={goLanding} className="text-left text-sm text-white/80 hover:text-white">Back to landing</button></aside><form onSubmit={submit} className="p-5 sm:p-10"><button type="button" onClick={goLanding} className="mb-8 text-sm font-semibold text-muted-foreground hover:text-foreground lg:hidden">Back</button><h2 className="font-display text-xl font-bold sm:text-2xl text-foreground">{mode === "login" ? "Sign in" : "Create account"}</h2><p className="mt-1 text-sm text-muted-foreground">Sign in to continue to your secure DentoAI workspace.</p>{mode === "register" && <div className="mt-6 grid grid-cols-2 gap-2 rounded-xl bg-muted p-1">{(["patient", "doctor"] as Role[]).map((item) => <button key={item} type="button" onClick={() => setRole(item)} className={`rounded-lg py-2 text-sm font-bold capitalize ${role === item ? "bg-card text-foreground shadow" : "text-muted-foreground"}`}>{item}</button>)}</div>}<div className="mt-6 space-y-4">{mode === "register" && <Field label="Full name" value={name} onChange={setName} required />}<Field label="Email" type="email" value={email} onChange={setEmail} required />{mode === "register" && <Field label="Phone" value={phone} onChange={setPhone} />}<Field label="Password" type="password" value={password} onChange={setPassword} required placeholder={mode === "register" ? "Example: DentoAI123" : undefined} />{mode === "register" && <p className="-mt-2 text-xs text-muted-foreground">Use at least 10 characters with uppercase, lowercase, and a number.</p>}{mode === "register" && role === "doctor" && <div className="grid gap-4 sm:grid-cols-2"><Field label="Qualification" value={qualification} onChange={setQualification} required /><Field label="Specialization" value={specialization} onChange={setSpecialization} required /><Field label="Registration number" value={registrationNumber} onChange={setRegistrationNumber} required /><Field label="Hospital / Clinic" value={hospital} onChange={setHospital} /></div>}</div><Button type="submit" disabled={loading} className="mt-6 w-full">{loading && <Loader2 className="animate-spin" size={16} />} {mode === "login" ? "Sign in" : "Create account"}</Button></form></div></main>;
}

function Landing({ goLogin, goRegister }: { goLogin: () => void; goRegister: () => void }) {
  const features = [
    ["Guided mouth scans", "Upload clear dental photos from home with a simple step-by-step flow."],
    ["AI screening summary", "Receive an easy-to-read screening report with confidence, severity, and next-step guidance."],
    ["Licensed doctor review", "Send your scan to a dental professional for clinical diagnosis and treatment notes."],
    ["Private health records", "Your reports stay inside your account and are only visible to you and your assigned doctor."]
  ];  const steps = ["Register or login", "Patient selects doctor", "Upload mouth images", "AI report is generated", "Doctor submits review"];
  const platformStats = [["Fast", "AI screening"], ["Private", "Health records"], ["Doctor", "Reviewed"], ["Anytime", "Access"]];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <nav className="sticky top-0 z-40 flex items-center justify-between gap-3 border-b border-border bg-card/90 px-4 py-3 sm:px-7 sm:py-4 backdrop-blur-xl">
        <div className="flex items-center gap-3 font-display text-xl font-bold sm:text-2xl">
          <div className="flex h-10 w-10 sm:h-11 sm:w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-md"><Stethoscope size={22} /></div>
          DentoAI
        </div>
        <div className="hidden items-center gap-9 text-sm font-bold text-muted-foreground md:flex">
          <a href="#features" className="hover:text-foreground">Features</a>
          <a href="#workflow" className="hover:text-foreground">How It Works</a>
          <a href="#doctors" className="hover:text-foreground">Doctors</a>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="ghost" onClick={goLogin}>Login</Button>
          <Button onClick={goRegister}>Get Started</Button>
        </div>
      </nav>

      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-background to-teal-50 px-4 py-14 sm:px-6 sm:py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-sm font-bold text-primary"><Shield size={16} /> AI-powered dental screening</div>
            <h1 className="font-display text-4xl font-bold leading-tight text-foreground sm:text-5xl md:text-6xl">
              Your Dental Health,<br />
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Analyzed by AI.</span><br />
              Confirmed by Experts.
            </h1>
            <p className="mt-7 max-w-2xl text-base leading-relaxed sm:text-lg text-muted-foreground">
              Capture mouth images from home, get an AI-assisted screening summary, and share your case with a verified dental professional for review.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Button onClick={goRegister} className="px-7 py-3.5 text-base">Start Securely <ArrowRight size={18} /></Button>
              <Button variant="secondary" onClick={goLogin} className="px-7 py-3.5 text-base">I already have an account</Button>
            </div>
            <div className="mt-7 flex items-center gap-2 text-sm font-medium text-muted-foreground"><Shield size={16} className="text-emerald-500" /> Private by design - only you and your assigned doctor can access your reports.</div>
          </div>

          <div className="rounded-2xl border-4 border-sky-100 bg-card p-4 sm:rounded-[2rem] sm:border-8 sm:p-7 shadow-2xl shadow-sky-900/10">
            <div className="mb-6 flex items-center gap-2 text-sm font-mono text-muted-foreground"><span className="h-3 w-3 rounded-full bg-red-400" /><span className="h-3 w-3 rounded-full bg-yellow-400" /><span className="h-3 w-3 rounded-full bg-emerald-400" /><span className="ml-3">Secure Workflow Preview</span></div>
            <div className="space-y-4">
              {["Photo received", "Image quality checked", "Screening report prepared", "Doctor review requested"].map((item, index) => (
                <div key={item} className="rounded-2xl bg-muted/60 p-4">
                  <div className="mb-2 flex items-center justify-between text-sm font-bold"><span>{item}</span><span className="text-primary">Step {index + 1}</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-sky-100"><div className="h-full rounded-full bg-gradient-to-r from-primary to-accent" style={{ width: `${72 + index * 7}%` }} /></div>
                </div>
              ))}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm font-bold text-emerald-700"><CheckCircle className="mr-2 inline" size={18} /> Your report is ready for doctor review.</div>
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"><AlertTriangle className="mr-2 inline" size={18} /> AI screening aid only. Final diagnosis by licensed dentist.</div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gradient-to-r from-primary to-accent px-4 py-10 text-white sm:px-6 sm:py-14">
        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-8 text-center md:grid-cols-4">
          {platformStats.map(([value, label]) => <div key={value}><div className="font-display text-3xl font-bold sm:text-4xl">{value}</div><div className="mt-1 text-sm text-white/80">{label}</div></div>)}
        </div>
      </section>

      <section id="features" className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center"><h2 className="font-display text-3xl font-bold sm:text-4xl">Everything You Need</h2><p className="mt-3 text-muted-foreground">A calm, secure workflow for dental screening and professional review.</p></div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">{features.map(([title, body]) => <Card key={title} className="min-h-44"><CheckCircle className="mb-4 text-emerald-500" /><h3 className="font-display text-lg font-bold">{title}</h3><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p></Card>)}</div>
        </div>
      </section>

      <section id="workflow" className="bg-muted/30 px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center"><h2 className="font-display text-3xl font-bold sm:text-4xl">How It Works</h2><p className="mt-3 text-muted-foreground">A real flow from account to doctor report.</p></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">{steps.map((step, index) => <div key={step} className="rounded-2xl border border-border bg-card p-5 text-center shadow-sm"><div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent font-bold text-white">{index + 1}</div><p className="text-sm font-bold">{step}</p></div>)}</div>
        </div>
      </section>

      <section id="doctors" className="px-4 py-14 sm:px-6 sm:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-display text-3xl font-bold sm:text-4xl">Verified Dental Professionals</h2>
          <p className="mt-4 text-muted-foreground">Choose from available dental professionals inside your account and send your screening report for review.</p>
          <div className="mt-8 rounded-2xl border border-border bg-card p-6 text-left shadow-sm"><Users className="mb-3 text-primary" /><h3 className="font-display text-xl font-bold">Doctor-reviewed care</h3><p className="mt-2 text-sm text-muted-foreground">AI helps organize the screening report, while final diagnosis and treatment decisions remain with a licensed dentist.</p></div>
        </div>
      </section>
    </main>
  );
}

function Layout({ user, page, setPage, onLogout, children }: { user: User; page: Page; setPage: (page: Page) => void; onLogout: () => void; children: React.ReactNode }) {
  const nav = user.role === "patient"
    ? [["patient-dashboard", "Dashboard", Activity], ["new-scan", "Scan", Camera], ["current-report", "Current", FileText], ["report-history", "History", Clock], ["profile", "Profile", UserRound]] as const
    : [["doctor-dashboard", "Dashboard", Activity], ["doctor-patients", "Patients", Users], ["profile", "Profile", UserRound]] as const;

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-border bg-sidebar p-4 md:block">
        <div className="mb-8 flex items-center gap-2 font-display text-xl font-bold text-foreground"><Stethoscope className="text-primary" /> DentoAI</div>
        <nav className="space-y-1">
          {nav.map(([target, label, Icon]) => (
            <button key={target} onClick={() => setPage(target)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold ${page === target ? "bg-sidebar-accent text-sidebar-primary" : "text-sidebar-foreground hover:bg-sidebar-accent/60"}`}>
              <Icon size={17} /> {label}
            </button>
          ))}
        </nav>
        <button onClick={onLogout} className="absolute bottom-4 left-4 right-4 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-50"><LogOut size={17} /> Logout</button>
      </aside>

      <div className="md:pl-64">
        <header className="sticky top-0 z-20 flex min-h-16 items-center justify-between gap-3 border-b border-border bg-card/95 px-4 py-3 backdrop-blur md:px-5">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-foreground">{user.name}</p>
            <p className="truncate text-xs capitalize text-muted-foreground">{user.role}</p>
          </div>
          <Button variant="ghost" onClick={onLogout} className="shrink-0"><LogOut size={16} /> <span className="hidden sm:inline">Logout</span></Button>
        </header>
        <main className="min-w-0 p-4 pb-24 sm:p-5 sm:pb-24 md:p-8 md:pb-8">{children}</main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 px-2 py-2 shadow-[0_-8px_24px_rgba(12,26,46,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-md items-center justify-around gap-1">
          {nav.map(([target, label, Icon]) => (
            <button key={target} onClick={() => setPage(target)} className={`flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold ${page === target ? "bg-sidebar-accent text-sidebar-primary" : "text-muted-foreground"}`}>
              <Icon size={18} />
              <span className="max-w-full truncate">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
function ScanList({ scans, emptyTitle, emptyBody, onOpenReports }: { scans: Scan[]; emptyTitle: string; emptyBody: string; onOpenReports?: () => void }) {
  if (!scans.length) return <Empty title={emptyTitle} body={emptyBody} />;
  return (
    <Card>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display text-lg font-bold text-foreground">Recent scans</h2>
        {onOpenReports && <Button variant="ghost" onClick={onOpenReports}>View all</Button>}
      </div>

      <div className="space-y-3 md:hidden">
        {scans.map((scan) => (
          <button key={scan._id} onClick={onOpenReports} className="block w-full rounded-xl border border-border bg-muted/20 p-3 text-left">
            <div className="mb-2 flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-foreground">{fmt(scan.createdAt)}</p>
                <p className="truncate text-xs text-muted-foreground">Doctor: {nameOf(scan.doctorId)}</p>
              </div>
              <Status status={scan.status} />
            </div>
            <p className="text-xs text-muted-foreground">AI findings: {scan.aiFindings?.length ?? 0}</p>
          </button>
        ))}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="w-full min-w-[680px] text-sm">
          <thead><tr className="border-b border-border text-left text-muted-foreground"><th className="py-3">Created</th><th>Status</th><th>Patient</th><th>Doctor</th><th>Findings</th></tr></thead>
          <tbody>{scans.map((scan) => <tr key={scan._id} className="border-b border-border/50"><td className="py-3 text-foreground">{fmt(scan.createdAt)}</td><td><Status status={scan.status} /></td><td>{nameOf(scan.patientId)}</td><td>{nameOf(scan.doctorId)}</td><td>{scan.aiFindings?.length ?? 0}</td></tr>)}</tbody>
        </table>
      </div>
    </Card>
  );
}
function PatientDashboard({ openScan, openReports }: { openScan: () => void; openReports: () => void }) {
  const [data, setData] = useState<{ totalScans: number; pendingReviews: number; completedReports: number; recentScans: Scan[] } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.patientDashboard().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  const latest = data?.recentScans?.[0];
  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary to-accent p-6 text-white shadow-lg">
      <div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" />
      <p className="text-sm font-medium text-white/80">Welcome back</p>
      <h1 className="font-display text-3xl font-bold">Your DentoAI Dashboard</h1>
      <p className="mt-1 text-sm text-white/75">{latest ? `Last scan: ${fmt(latest.createdAt)} - ${latest.status.replaceAll("_", " ")}` : "No scans yet. Start your first screening when ready."}</p>
      <Button variant="secondary" className="mt-5 bg-white !text-primary hover:bg-white/90" onClick={openScan}><Camera size={16} /> New Mouth Scan</Button>
    </div>
    <div className="grid gap-4 md:grid-cols-3"><Stat icon={<Camera />} label="Total scans" value={data?.totalScans ?? 0} /><Stat icon={<Clock />} label="Pending reviews" value={data?.pendingReviews ?? 0} /><Stat icon={<CheckCircle />} label="Completed reports" value={data?.completedReports ?? 0} /></div>
    <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
      <ScanList scans={data?.recentScans ?? []} emptyTitle="No reports yet" emptyBody="Your real scan reports will appear here after upload." onOpenReports={openReports} />
      <Card><h2 className="mb-4 font-display text-lg font-bold text-foreground">Current Status</h2>{latest ? <div className="space-y-4"><div className="flex items-center justify-between border-b border-border pb-3"><span className="text-sm text-muted-foreground">AI Report</span><Status status={latest.aiFindings?.length ? "ai_completed" : latest.status} /></div><div className="flex items-center justify-between border-b border-border pb-3"><span className="text-sm text-muted-foreground">Doctor Review</span><Status status={latest.status} /></div><Button className="w-full" onClick={openReports}>View Reports <ArrowRight size={16} /></Button></div> : <Empty title="No active report" body="Upload a scan to see AI and doctor review status." />}</Card>
    </div>
  </div>;
}
function DoctorDashboard({ openPatients }: { openPatients: () => void }) {
  const [data, setData] = useState<{ totalPatients: number; pendingReviews: number; completedReports: number; recentPatients: Scan[] } | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.doctorDashboard().then(setData).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  return <div className="space-y-6">
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-accent to-primary p-6 text-white shadow-lg"><div className="absolute right-0 top-0 h-48 w-48 -translate-y-1/2 translate-x-1/2 rounded-full bg-white/10" /><p className="text-sm font-medium text-white/80">Doctor workspace</p><h1 className="font-display text-3xl font-bold">Review Patient Scans</h1><p className="mt-1 text-sm text-white/75">Assigned cases, AI screening summaries, and clinical report submission.</p><div className="mt-5 inline-flex rounded-xl bg-white/20 px-4 py-2 text-sm font-bold">{data?.pendingReviews ?? 0} pending reviews</div></div>
    <div className="grid gap-4 md:grid-cols-3"><Stat icon={<Users />} label="Total patients" value={data?.totalPatients ?? 0} /><Stat icon={<Clock />} label="Pending reviews" value={data?.pendingReviews ?? 0} /><Stat icon={<CheckCircle />} label="Completed reports" value={data?.completedReports ?? 0} /></div>
    <Card><div className="mb-4 flex items-center justify-between"><h2 className="font-display text-lg font-bold text-foreground">Recent Patients</h2><Button variant="ghost" onClick={openPatients}>View all <ArrowRight size={14} /></Button></div>{!data?.recentPatients?.length ? <Empty title="No assigned scans" body="Patient scans assigned to you will appear here." /> : <div className="space-y-3">{data.recentPatients.map((scan) => <button key={scan._id} onClick={openPatients} className="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-muted/40"><div><p className="font-bold text-foreground">{nameOf(scan.patientId)}</p><p className="text-xs text-muted-foreground">{fmt(scan.createdAt)} - {scan.aiFindings?.length ?? 0} AI findings</p></div><Status status={scan.status} /></button>)}</div>}</Card>
  </div>;
}
function NewScan({ onCreated }: { onCreated: (scanId: string) => void }) {
  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [doctorId, setDoctorId] = useState("");
  const [symptoms, setSymptoms] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [mode, setMode] = useState<"upload" | "camera">("upload");
  const [capturedImages, setCapturedImages] = useState<string[]>([]);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    api.doctors()
      .then((d) => setDoctors(d.doctors))
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, []);

  const startCamera = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      toast.error("Camera access is not supported in this browser (requires HTTPS/localhost).");
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true
      });
      setStream(mediaStream);
    } catch (err: any) {
      console.error("Camera access failed:", err);
      if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
        toast.error("Camera access blocked. Please click the site icon next to the URL to allow permissions.");
      } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
        toast.error("No webcam/camera device was found on this system.");
      } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
        toast.error("Webcam is already in use by another app (e.g. Teams, Zoom, or another tab).");
      } else {
        toast.error(`Failed to access camera: ${err.message || "Please check permissions."}`);
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, videoRef.current]);

  useEffect(() => {
    if (mode === "camera") {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [mode]);

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
      setCapturedImages((prev) => [...prev, dataUrl]);
      toast.success("Photo captured!");
    }
  };

  const removeCapturedImage = (index: number) => {
    setCapturedImages((prev) => prev.filter((_, i) => i !== index));
  };

  function dataURItoBlob(dataURI: string) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!doctorId) {
      toast.error("Please choose a dentist");
      return;
    }

    const form = new FormData();
    form.set("doctorId", doctorId);
    if (symptoms) form.set("symptoms", symptoms);

    if (mode === "upload") {
      if (!files?.length) {
        toast.error("Please select at least one mouth image file");
        return;
      }
      Array.from(files).forEach((file) => form.append("images", file));
    } else {
      if (!capturedImages.length) {
        toast.error("Please capture at least one scan photo");
        return;
      }
      capturedImages.forEach((dataUrl, index) => {
        const blob = dataURItoBlob(dataUrl);
        form.append("images", blob, `camera-scan-${index + 1}.jpg`);
      });
    }

    setSubmitting(true);
    try {
      const result = await api.createScan(form);
      toast.success("Scan uploaded and AI report generated");
      onCreated(result.scan._id);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Scan creation failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) return <Loading />;

  return (
    <form onSubmit={submit} className="space-y-6">
      <div>
        <h1 className="font-display text-xl font-bold sm:text-2xl text-foreground">New Mouth Scan</h1>
        <p className="text-sm text-muted-foreground">Capture or upload dental images securely for AI pre-screening and professional dentist review.</p>
      </div>

      {!doctors.length ? (
        <Empty title="No available doctors" body="Register a doctor account and mark the profile available before creating scans." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {doctors.map((doctor) => {
            const id = idOf(doctor.userId);
            return (
              <button
                type="button"
                key={doctor._id}
                onClick={() => setDoctorId(id)}
                className={`rounded-2xl border bg-card p-5 text-left transition hover:shadow-md ${
                  doctorId === id ? "border-primary ring-2 ring-primary/30" : "border-border"
                }`}
              >
                <h3 className="font-display font-bold text-foreground">{doctor.userId.name}</h3>
                <p className="text-sm text-primary">{doctor.specialization}</p>
                <p className="mt-2 text-xs text-muted-foreground">{doctor.qualification}</p>
                <p className="mt-1 text-xs text-muted-foreground">{doctor.hospital || "Hospital not added"}</p>
              </button>
            );
          })}
        </div>
      )}

      <Card className="space-y-4">
        {/* Toggle between Upload and Camera */}
        <div className="flex gap-2 rounded-xl bg-muted p-1 w-full sm:max-w-sm">
          <button
            type="button"
            onClick={() => setMode("upload")}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              mode === "upload" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Upload Images
          </button>
          <button
            type="button"
            onClick={() => setMode("camera")}
            className={`flex-1 rounded-lg py-2 text-sm font-bold transition ${
              mode === "camera" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Use Live Camera
          </button>
        </div>

        <label className="block">
          <span className="mb-1.5 block text-sm font-semibold text-foreground">Symptoms or concern</span>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={3}
            placeholder="Describe any tooth pain, sensitivity, or bleeding gums..."
            className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 text-foreground"
          />
        </label>

        {mode === "upload" ? (
          <label className="block">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">Mouth images</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              onChange={(e) => setFiles(e.target.files)}
              className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm text-foreground"
            />
          </label>
        ) : (
          <div className="space-y-4">
            <span className="mb-1.5 block text-sm font-semibold text-foreground">Live Video Feed</span>
            <div className="relative overflow-hidden rounded-2xl border border-border bg-black aspect-video w-full max-w-xl mx-auto flex flex-col items-center justify-center p-4">
              {stream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover scale-x-[-1]"
                  />
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-primary text-primary-foreground p-4 hover:scale-105 active:scale-95 transition shadow-lg flex items-center justify-center"
                    title="Capture Scan Frame"
                  >
                    <Camera size={24} />
                  </button>
                </>
              ) : (
                <div className="text-center text-white space-y-4 p-6">
                  <Camera className="mx-auto text-muted-foreground animate-pulse" size={40} />
                  <div>
                    <p className="text-sm font-bold text-slate-200">Camera Permission Blocked or Device Not Found</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs mx-auto">
                      Please allow camera access for this tab in your browser settings to continue.
                    </p>
                  </div>
                  <div className="text-[11px] text-left text-muted-foreground max-w-xs mx-auto space-y-1 bg-white/5 p-3 rounded-xl border border-white/5">
                    <p>1. Click the site settings icon to the left of <strong>localhost:5173</strong> in your browser's URL address bar.</p>
                    <p>2. Set <strong>Camera</strong> to <strong>Allow</strong>.</p>
                    <p>3. Ensure your physical webcam is connected and not currently used by Zoom, Teams, or another software.</p>
                  </div>
                  <button
                    type="button"
                    onClick={startCamera}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-4 py-2 text-xs font-bold transition hover:opacity-90 active:scale-95 shadow-md"
                  >
                    Retry Camera Access
                  </button>
                </div>
              )}
            </div>

            {capturedImages.length > 0 && (
              <div className="space-y-2">
                <span className="block text-sm font-semibold text-foreground">Captured Scan Photos ({capturedImages.length})</span>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {capturedImages.map((dataUrl, idx) => (
                    <div key={idx} className="relative group overflow-hidden rounded-xl border border-border aspect-square bg-card">
                      <img src={dataUrl} alt={`Capture ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeCapturedImage(idx)}
                        className="absolute top-1.5 right-1.5 h-7 w-7 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs font-bold hover:scale-105 transition"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2 items-start">
          <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={16} />
          <span>AI screening is for support only. A licensed dentist must make final clinical decisions.</span>
        </div>

        <Button type="submit" disabled={submitting || !doctors.length} className="w-full sm:w-auto">
          {submitting ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
          {submitting ? "Analyzing Scan..." : "Submit Scan and Analyze"}
        </Button>
      </Card>
    </form>
  );
}
function CurrentReport({ onOpenScan }: { onOpenScan: (scanId: string) => void }) {
  const [scan, setScan] = useState<Scan | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.reportHistory().then((data) => setScan(data.scans[0] ?? null)).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  if (!scan) return <Empty title="No current report" body="Upload a mouth scan first. Your latest report will appear here." />;
  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="font-display text-xl font-bold sm:text-2xl text-foreground">Current Report</h1><p className="text-sm text-muted-foreground">Latest scan from {fmt(scan.createdAt)}</p></div><Status status={scan.status} /></div>
    <Card><div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800"><AlertTriangle className="mr-2 inline" size={16} />AI screening aid only. Final diagnosis belongs to the doctor.</div><h2 className="mb-2 font-display text-lg font-bold text-foreground">AI Screening Summary</h2><p className="text-sm text-muted-foreground">{scan.aiSummary || "AI summary is not available yet."}</p><div className="mt-4 space-y-3">{scan.aiFindings?.map((finding) => <div key={`${finding.name}-${finding.region}`} className="rounded-xl border border-border bg-muted/30 p-4"><div className="flex items-center justify-between"><strong>{finding.name}</strong><span className="text-sm font-bold text-primary">{finding.confidence}%</span></div><p className="mt-1 text-xs text-muted-foreground">{finding.severity} - {finding.region}</p></div>)}</div><Button className="mt-5" onClick={() => onOpenScan(scan._id)}>Open full report <ArrowRight size={16} /></Button></Card>
  </div>;
}
function ReportHistory({ onOpenScan }: { onOpenScan: (scanId: string) => void }) {
  const [scans, setScans] = useState<Scan[]>([]); const [loading, setLoading] = useState(true);
  useEffect(() => { api.reportHistory().then((data) => setScans(data.scans)).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, []);
  if (loading) return <Loading />;
  if (!scans.length) return <Empty title="No report history" body="Your AI and doctor reports will appear after you submit scans." />;
  return <div className="space-y-4"><h1 className="font-display text-xl font-bold sm:text-2xl text-foreground">Report History</h1>{scans.map((scan) => <button key={scan._id} onClick={() => onOpenScan(scan._id)} className="block w-full rounded-2xl border border-border bg-card p-5 text-left hover:shadow-md"><div className="flex flex-wrap items-center justify-between gap-3"><div><p className="font-bold text-foreground">{fmt(scan.createdAt)}</p><p className="text-sm text-muted-foreground">Doctor: {nameOf(scan.doctorId)}</p></div><Status status={scan.status} /></div><p className="mt-3 text-sm text-muted-foreground">{scan.aiSummary || "AI summary not available"}</p></button>)}</div>;
}

function DoctorPatients({ onOpenScan }: { onOpenScan: (scanId: string) => void }) {
  const [scans, setScans] = useState<Scan[]>([]), [query, setQuery] = useState(""), [loading, setLoading] = useState(true);
  useEffect(() => { api.doctorPatients().then((data) => setScans(data.patients)).catch((e) => toast.error(e.message)).finally(() => setLoading(false)); }, []);
  const filtered = useMemo(() => scans.filter((scan) => nameOf(scan.patientId).toLowerCase().includes(query.toLowerCase())), [query, scans]);
  if (loading) return <Loading />;
  return <div className="space-y-5"><div className="flex flex-wrap items-center justify-between gap-3"><h1 className="font-display text-xl font-bold sm:text-2xl text-foreground">Patient Scans</h1><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} /><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search patients" className="rounded-xl border border-border bg-card py-2 pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-ring/40" /></div></div>{!filtered.length ? <Empty title="No patient scans" body="Assigned scans will appear after patients select you and upload images." /> : <div className="grid gap-4 md:grid-cols-2">{filtered.map((scan) => <button key={scan._id} onClick={() => onOpenScan(scan._id)} className="rounded-2xl border border-border bg-card p-5 text-left hover:shadow-md"><div className="flex items-center justify-between gap-3"><h3 className="font-display font-bold text-foreground">{nameOf(scan.patientId)}</h3><Status status={scan.status} /></div><p className="mt-2 text-sm text-muted-foreground">Created {fmt(scan.createdAt)}</p><p className="mt-2 text-sm text-muted-foreground">AI findings: {scan.aiFindings?.length ?? 0}</p></button>)}</div>}</div>;
}

function Interactive3DViewer({ imageUrl }: { imageUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    
    // Clear previous contents
    container.innerHTML = "";

    const width = container.clientWidth || 600;
    const height = 400; // Let's make height fixed 400px

    // Create scene, camera, and renderer
    const scene = new THREE.Scene();
    
    // Create a dark blue-gray space-like background color
    scene.background = new THREE.Color(0x07111e);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 0, 7.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight1.position.set(5, 5, 5);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.45);
    dirLight2.position.set(-5, -5, 5);
    scene.add(dirLight2);

    // Texture Loader
    const textureLoader = new THREE.TextureLoader();
    textureLoader.crossOrigin = "anonymous";
    
    // Create curved geometry representing dental/jaw arch structure.
    const radius = 4.2;
    const geoHeight = 3.2;
    // High segments to allow smooth Z displacement details
    const geometry = new THREE.CylinderGeometry(radius, radius, geoHeight, 128, 64, true, Math.PI * 0.72, Math.PI * 0.56);
    
    let mesh: THREE.Mesh | null = null;

    textureLoader.load(
      imageUrl,
      (texture) => {
        texture.minFilter = THREE.LinearFilter;
        texture.generateMipmaps = false;

        const material = new THREE.MeshStandardMaterial({
          map: texture,
          displacementMap: texture,
          displacementScale: 1.0,
          displacementBias: -0.35,
          side: THREE.DoubleSide,
          roughness: 0.4,
          metalness: 0.1,
        });

        mesh = new THREE.Mesh(geometry, material);
        // Face the camera initially
        mesh.rotation.y = Math.PI; 
        scene.add(mesh);
        renderer.render(scene, camera);
      },
      undefined,
      (err) => {
        console.error("Failed to load 3D scan texture:", err);
      }
    );

    // Interactive mouse controls
    let isDragging = false;
    let previousMousePosition = { x: 0, y: 0 };
    
    // Smooth target rotation values
    let targetRotationX = 0;
    let targetRotationY = 0;
    let zoomScale = 1.0;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || !mesh) return;
      
      const deltaMove = {
        x: e.clientX - previousMousePosition.x,
        y: e.clientY - previousMousePosition.y
      };

      // Mouse drag rotates jaw arch mesh
      targetRotationY += deltaMove.x * 0.007;
      targetRotationX += deltaMove.y * 0.007;

      // Restrict up/down rotation to 45 degrees
      targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));

      previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    // Touch Support
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isDragging = true;
        previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || !mesh || e.touches.length !== 1) return;
      const deltaMove = {
        x: e.touches[0].clientX - previousMousePosition.x,
        y: e.touches[0].clientY - previousMousePosition.y
      };
      targetRotationY += deltaMove.x * 0.007;
      targetRotationX += deltaMove.y * 0.007;
      targetRotationX = Math.max(-Math.PI / 4, Math.min(Math.PI / 4, targetRotationX));
      previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      zoomScale += e.deltaY * -0.001;
      zoomScale = Math.max(0.6, Math.min(2.2, zoomScale));
    };

    const canvas = renderer.domElement;
    canvas.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    
    canvas.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onMouseUp);
    
    canvas.addEventListener("wheel", onWheel, { passive: false });

    // Render loop
    let frameId: number;
    const renderLoop = () => {
      frameId = requestAnimationFrame(renderLoop);
      
      if (mesh) {
        // Interpolate rotation for smooth deceleration effect
        mesh.rotation.y += (targetRotationY - mesh.rotation.y) * 0.08;
        mesh.rotation.x += (targetRotationX - mesh.rotation.x) * 0.08;
        
        // Interpolate zoom distance
        camera.position.z += (7.5 / zoomScale - camera.position.z) * 0.08;
      }
      
      renderer.render(scene, camera);
    };
    
    renderLoop();

    // Resize listener
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth || 600;
      camera.aspect = w / height;
      camera.updateProjectionMatrix();
      renderer.setSize(w, height);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onMouseUp);
      window.removeEventListener("resize", onResize);
      
      canvas.removeEventListener("mousedown", onMouseDown);
      canvas.removeEventListener("touchstart", onTouchStart);
      canvas.removeEventListener("wheel", onWheel);
      
      if (container.contains(canvas)) {
        container.removeChild(canvas);
      }
      
      geometry.dispose();
    };
  }, [imageUrl]);

  return (
    <div className="relative w-full h-[260px] sm:h-[340px] lg:h-[400px] rounded-2xl overflow-hidden border border-border bg-[#07111e] shadow-inner">
      <div ref={containerRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      
      {/* 3D HUD Indicators */}
      <div className="absolute top-4 left-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-xs font-bold text-white select-none pointer-events-none">
        <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
        Interactive 3D dental scan
      </div>

      <div className="absolute bottom-4 right-4 hidden bg-slate-900/70 sm:block backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/5 text-[11px] text-slate-300 font-medium select-none pointer-events-none">
        🖱️ Drag to rotate • ⚙️ Scroll to zoom
      </div>
    </div>
  );
}

function ScanDetails({ scanId, user }: { scanId: string; user: User }) {
  const [data, setData] = useState<{ scan: Scan; doctorReport: DoctorReport | null } | null>(null);
  const [diagnosis, setDiagnosis] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [prescription, setPrescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [viewTab, setViewTab] = useState<"original" | "enhanced" | "angles">("original");
  const [active3dImage, setActive3dImage] = useState("");

  useEffect(() => {
    api.scan(scanId)
      .then((d) => {
        setData(d as { scan: Scan; doctorReport: DoctorReport | null });
        const firstImg = d.scan.originalImages?.[0]?.secureUrl || "";
        setActive3dImage(firstImg);
      })
      .catch((e) => toast.error(e.message));
  }, [scanId]);

  if (!data) return <Loading />;
  const { scan, doctorReport } = data;

  async function submitReport(event: React.FormEvent) {
    event.preventDefault();
    setSubmitting(true);
    try {
      await api.submitDoctorReport(scan._id, { diagnosis, treatmentPlan, prescription });
      toast.success("Doctor report submitted");
      const updated = await api.scan(scan._id);
      setData(updated as { scan: Scan; doctorReport: DoctorReport | null });
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Report submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  const hasEnhanced = !!scan.enhancedImages?.length;
  const hasAngles = !!scan.aiGeneratedViews?.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-xl font-bold sm:text-2xl text-foreground">Scan Details</h1>
          <p className="text-sm text-muted-foreground">Created {fmt(scan.createdAt)}</p>
        </div>
        <Status status={scan.status} />
      </div>

      {/* Image Gallery with perspective tabs */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <h2 className="font-display text-lg font-bold text-foreground">Dental Scan Visuals</h2>
          <div className="flex max-w-full gap-1.5 overflow-x-auto rounded-lg bg-muted p-1 text-xs font-bold">
            <button
              type="button"
              onClick={() => setViewTab("original")}
              className={`rounded-md px-3 py-1.5 transition whitespace-nowrap ${
                viewTab === "original" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Original Uploads
            </button>
            {hasEnhanced && (
              <button
                type="button"
                onClick={() => setViewTab("enhanced")}
                className={`rounded-md px-3 py-1.5 transition whitespace-nowrap ${
                  viewTab === "enhanced" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Enhanced Clarity
              </button>
            )}
            {hasAngles && (
              <button
                type="button"
                onClick={() => setViewTab("angles")}
                className={`rounded-md px-3 py-1.5 transition whitespace-nowrap ${
                  viewTab === "angles" ? "bg-card text-foreground shadow" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Auto Angle Views
              </button>
            )}
          </div>
        </div>

        {viewTab === "original" && (
          <div>
            {!scan.originalImages?.length ? (
              <Empty title="No images" body="No original scan images available." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scan.originalImages.map((image) => (
                  <a
                    key={image.secureUrl}
                    href={image.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-border bg-card group hover:shadow-md transition"
                  >
                    <img src={image.secureUrl} alt={image.label} className="h-56 w-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="p-3 text-xs font-bold text-foreground border-t border-border bg-muted/20">{image.label}</div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {viewTab === "enhanced" && (
          <div>
            {!scan.enhancedImages?.length ? (
              <Empty title="No enhanced images" body="No auto-enhanced views available." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scan.enhancedImages.map((image) => (
                  <a
                    key={image.secureUrl}
                    href={image.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-border bg-card group hover:shadow-md transition"
                  >
                    <img src={image.secureUrl} alt={image.label} className="h-56 w-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="p-3 text-xs font-bold text-teal-600 border-t border-border bg-teal-50 flex items-center justify-between">
                      <span>{image.label}</span>
                      <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">Contrast sharped</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}

        {viewTab === "angles" && (
          <div>
            {!scan.aiGeneratedViews?.length ? (
              <Empty title="No simulated angle views" body="Simulated camera perspectives are not generated." />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {scan.aiGeneratedViews.map((image) => (
                  <a
                    key={image.secureUrl}
                    href={image.secureUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="overflow-hidden rounded-xl border border-border bg-card group hover:shadow-md transition"
                  >
                    <img src={image.secureUrl} alt={image.label} className="h-56 w-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="p-3 text-xs font-bold text-primary border-t border-border bg-primary/5 flex items-center justify-between">
                      <span>{image.label}</span>
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-extrabold uppercase">Auto generated</span>
                    </div>
                  </a>
                ))}
              </div>
            )}
          </div>
        )}
      </Card>

      {/* Interactive 3D Scanner Panel */}
      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-3">
          <div>
            <h2 className="font-display text-lg font-bold text-foreground">Interactive 3D Scan Inspector</h2>
            <p className="text-xs text-muted-foreground">Inspect scan mapped onto 3D dental arch curvature</p>
          </div>
          
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground">Select View:</span>
            <select
              value={active3dImage}
              onChange={(e) => setActive3dImage(e.target.value)}
              className="w-full max-w-full rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground outline-none focus:ring-2 focus:ring-ring/40 sm:w-auto"
            >
              {scan.originalImages?.map((img) => (
                <option key={img.secureUrl} value={img.secureUrl}>
                  Original - {img.label}
                </option>
              ))}
              {scan.enhancedImages?.map((img) => (
                <option key={img.secureUrl} value={img.secureUrl}>
                  Enhanced - {img.label}
                </option>
              ))}
              {scan.aiGeneratedViews?.map((img) => (
                <option key={img.secureUrl} value={img.secureUrl}>
                  Perspective - {img.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {active3dImage && <Interactive3DViewer imageUrl={active3dImage} />}
      </Card>

      {/* AI Screening Report Card */}
      <Card className="space-y-4">
        <h2 className="font-display text-lg font-bold text-foreground">AI Dental Screening Report</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800 flex gap-2 items-start">
          <AlertTriangle className="shrink-0 text-amber-600 mt-0.5" size={16} />
          <span>{scan.aiDisclaimer || "AI screening aid only. Final diagnosis belongs to the doctor."}</span>
        </div>
        
        <p className="text-sm leading-relaxed text-muted-foreground bg-muted/20 p-4 rounded-xl border border-border/60">{scan.aiSummary || "No AI summary returned."}</p>

        {!scan.aiFindings?.length ? (
          <Empty title="No AI findings" body="No dental abnormalities were flagged by AI screening." />
        ) : (
          <div className="space-y-3">
            {scan.aiFindings.map((finding: AiFinding) => (
              <div key={`${finding.name}-${finding.region}`} className="rounded-xl border border-border bg-card p-4 hover:shadow-sm transition">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-bold text-foreground text-base">{finding.name}</h3>
                  <span className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                    Confidence: {finding.confidence}%
                  </span>
                </div>
                <p className="mt-1 text-xs font-semibold text-muted-foreground capitalize">
                  Severity: {finding.severity} • Region: {finding.region}
                </p>
                <p className="mt-2.5 text-sm text-muted-foreground leading-relaxed">{finding.description}</p>
                <div className="mt-3.5 rounded-lg bg-muted/40 p-2.5 border-l-4 border-accent text-xs text-foreground font-medium">
                  <strong>Recommendation:</strong> {finding.recommendation}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Beautiful Styled Doctor Report Card */}
      <Card className="space-y-4">
        <div className="flex items-center gap-3 border-b border-border pb-3">
          <div className="rounded-lg bg-primary/10 p-2 text-primary">
            <Stethoscope size={20} />
          </div>
          <h2 className="font-display text-lg font-bold text-foreground">Clinical Diagnostic Report</h2>
        </div>

        {doctorReport ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-muted/10 p-4">
                <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Diagnosis</span>
                <p className="mt-1.5 text-sm font-semibold text-foreground leading-relaxed">{doctorReport.diagnosis}</p>
              </div>

              {doctorReport.treatmentPlan && (
                <div className="rounded-xl border border-border bg-muted/10 p-4">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Treatment Plan</span>
                  <p className="mt-1.5 text-sm text-muted-foreground leading-relaxed">{doctorReport.treatmentPlan}</p>
                </div>
              )}
            </div>

            {doctorReport.prescription && (
              <div className="rounded-xl border border-border bg-primary/5 p-4">
                <span className="text-xs font-bold text-primary uppercase tracking-wider">Prescription & Medications</span>
                <p className="mt-1.5 text-sm font-medium text-foreground whitespace-pre-line leading-relaxed">{doctorReport.prescription}</p>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border/50 bg-muted/30 p-4 text-xs font-semibold text-muted-foreground">
              <span>Status: <span className="text-emerald-600 font-extrabold uppercase">Submitted</span></span>
              <span>Submitted On: {doctorReport.submittedAt ? fmt(doctorReport.submittedAt) : fmt(scan.doctorReviewedAt)}</span>
            </div>
          </div>
        ) : user.role === "doctor" ? (
          <form onSubmit={submitReport} className="space-y-4">
            <Field label="Diagnosis / Clinical Impression" value={diagnosis} onChange={setDiagnosis} required />
            
            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-foreground">Treatment plan</span>
              <textarea
                value={treatmentPlan}
                onChange={(e) => setTreatmentPlan(e.target.value)}
                rows={3}
                placeholder="Recommended dental treatments, cleaning, or hygiene care..."
                className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 text-foreground"
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-sm font-semibold text-foreground">Prescription & Advice</span>
              <textarea
                value={prescription}
                onChange={(e) => setPrescription(e.target.value)}
                rows={3}
                placeholder="List medications, dosage details, or specific home advice..."
                className="w-full rounded-xl border border-border bg-input-background px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-ring/40 text-foreground"
              />
            </label>

            <Button type="submit" disabled={submitting}>
              {submitting ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Submit professional report
            </Button>
          </form>
        ) : (
          <Empty title="Doctor review pending" body="Your assigned dentist has not submitted their clinical report yet. Please check back soon." />
        )}
      </Card>
    </div>
  );
}

function Profile({ user, onUser }: { user: User; onUser: (user: User) => void }) {
  const [name, setName] = useState(user.name), [phone, setPhone] = useState(user.phone ?? ""), [loading, setLoading] = useState(false);
  async function save(event: React.FormEvent) { event.preventDefault(); setLoading(true); try { const result = user.role === "patient" ? await api.updatePatientProfile({ name, phone }) : await api.updateDoctorProfile({ name, phone }); onUser(result.user); toast.success("Profile updated"); } catch (error) { toast.error(error instanceof Error ? error.message : "Profile update failed"); } finally { setLoading(false); } }
  return <form onSubmit={save} className="max-w-2xl space-y-5"><div><h1 className="font-display text-xl font-bold sm:text-2xl text-foreground">Profile</h1><p className="text-sm text-muted-foreground">Profile fields are saved through the backend.</p></div><Card className="space-y-4"><Field label="Name" value={name} onChange={setName} required /><Field label="Email" type="email" value={user.email} onChange={() => undefined} /><Field label="Phone" value={phone} onChange={setPhone} /><Button type="submit" disabled={loading}>{loading && <Loader2 className="animate-spin" size={16} />} Save profile</Button></Card></form>;
}
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [page, setPage] = useState<Page>("landing");
  const [selectedScanId, setSelectedScanId] = useState("");
  const [booting, setBooting] = useState(true);

  useEffect(() => {
    api.me().then(({ user }) => { setUser(user); setPage(user.role === "patient" ? "patient-dashboard" : "doctor-dashboard"); }).catch((error) => { if (!(error instanceof ApiError && error.status === 401)) console.warn(error); }).finally(() => setBooting(false));
  }, []);

  function enter(nextUser: User) { setUser(nextUser); setPage(nextUser.role === "patient" ? "patient-dashboard" : "doctor-dashboard"); }
  async function logout() { await api.logout().catch(() => undefined); setUser(null); setSelectedScanId(""); setPage("landing"); }

  if (booting) return <Loading />;
  if (!user) {
    if (page === "login") return <><Toaster richColors position="top-right" /><AuthPage mode="login" onAuth={enter} goLanding={() => setPage("landing")} /></>;
    if (page === "register") return <><Toaster richColors position="top-right" /><AuthPage mode="register" onAuth={enter} goLanding={() => setPage("landing")} /></>;
    return <><Toaster richColors position="top-right" /><Landing goLogin={() => setPage("login")} goRegister={() => setPage("register")} /></>;
  }

  const content = page === "patient-dashboard" ? <PatientDashboard openScan={() => setPage("new-scan")} openReports={() => setPage("report-history")} />
    : page === "new-scan" ? <NewScan onCreated={(id) => { setSelectedScanId(id); setPage("scan-details"); }} />
    : page === "current-report" ? <CurrentReport onOpenScan={(id) => { setSelectedScanId(id); setPage("scan-details"); }} />
    : page === "report-history" ? <ReportHistory onOpenScan={(id) => { setSelectedScanId(id); setPage("scan-details"); }} />
    : page === "doctor-dashboard" ? <DoctorDashboard openPatients={() => setPage("doctor-patients")} />
    : page === "doctor-patients" ? <DoctorPatients onOpenScan={(id) => { setSelectedScanId(id); setPage("scan-details"); }} />
    : page === "scan-details" && selectedScanId ? <ScanDetails scanId={selectedScanId} user={user} />
    : page === "profile" ? <Profile user={user} onUser={setUser} />
    : <Empty title="Page unavailable" body="Choose a page from the navigation." />;

  return <><Toaster richColors position="top-right" /><Layout user={user} page={page} setPage={setPage} onLogout={logout}>{content}</Layout></>;
}
















