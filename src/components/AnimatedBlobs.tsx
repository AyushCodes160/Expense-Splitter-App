/**
 * AnimatedBlobs — Floating, morphing gradient orbs that drift behind content.
 * Inspired by the OneText SaaS Dribbble shot.
 */
export function AnimatedBlobs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {/* Large primary blob — top-center */}
      <div
        className="absolute -top-[20%] left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full opacity-30"
        style={{
          background: 'radial-gradient(circle, oklch(0.65 0.18 250 / 0.6) 0%, transparent 70%)',
          animation: 'blob-drift 12s ease-in-out infinite alternate',
          filter: 'blur(80px)',
        }}
      />
      {/* Cyan blob — bottom-left */}
      <div
        className="absolute bottom-[10%] -left-[5%] h-[400px] w-[400px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, oklch(0.75 0.15 220 / 0.7) 0%, transparent 70%)',
          animation: 'blob-drift 15s ease-in-out 2s infinite alternate-reverse',
          filter: 'blur(100px)',
        }}
      />
      {/* Purple blob — right */}
      <div
        className="absolute top-[40%] -right-[8%] h-[350px] w-[350px] rounded-full opacity-15"
        style={{
          background: 'radial-gradient(circle, oklch(0.55 0.20 290 / 0.6) 0%, transparent 70%)',
          animation: 'blob-drift 18s ease-in-out 4s infinite alternate',
          filter: 'blur(90px)',
        }}
      />
      {/* Small accent orb — mid-left */}
      <div
        className="absolute top-[25%] left-[15%] h-[200px] w-[200px] rounded-full opacity-20"
        style={{
          background: 'radial-gradient(circle, oklch(0.70 0.18 250 / 0.5) 0%, transparent 70%)',
          animation: 'blob-drift 10s ease-in-out 1s infinite alternate-reverse',
          filter: 'blur(60px)',
        }}
      />
    </div>
  );
}
