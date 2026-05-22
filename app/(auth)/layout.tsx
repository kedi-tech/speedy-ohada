export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-bg flex items-center justify-center p-4">
      <div className="w-full max-w-[420px]">
        {/* Logo */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="w-9 h-9 rounded-[9px] bg-gradient-to-br from-rust to-rust-2 grid place-items-center text-white font-bold text-lg font-serif shadow-[0_2px_8px_rgb(194_65_12/0.3)]">
            S
          </div>
          <div className="flex flex-col leading-[1.1]">
            <span className="text-[16px] font-bold text-ink font-serif">
              Speedy <span className="text-rust">OHADA</span>
            </span>
            <span className="text-[11px] text-muted tracking-[.1em] uppercase">Web · v0.9</span>
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
