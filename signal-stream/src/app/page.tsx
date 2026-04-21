"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Rss,
  Layers,
  Zap,
  Activity,
  ArrowRight,
} from "lucide-react";

/* ───────────────────────── Canvas: Swirling Network ───────────────────────── */

interface DataPoint {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  hue: number;
  alpha: number;
  speed: number;
  angle: number;
  orbitRadius: number;
  converging: boolean;
}

function useNetworkCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  hoverIntensity: number
) {
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let points: DataPoint[] = [];
    let gridStars: { x: number; y: number; alpha: number; twinkleSpeed: number }[] = [];

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialize data points
    const NUM_POINTS = 80;
    const centerX = () => canvas.width / 2;
    const centerY = () => canvas.height * 0.38;

    for (let i = 0; i < NUM_POINTS; i++) {
      const angle = Math.random() * Math.PI * 2;
      const orbitRadius = 100 + Math.random() * Math.max(canvas.width, canvas.height) * 0.45;
      points.push({
        x: centerX() + Math.cos(angle) * orbitRadius,
        y: centerY() + Math.sin(angle) * orbitRadius,
        vx: 0,
        vy: 0,
        radius: 1.5 + Math.random() * 2.5,
        hue: Math.random() > 0.5 ? 230 + Math.random() * 30 : 270 + Math.random() * 30,
        alpha: 0.3 + Math.random() * 0.7,
        speed: 0.0005 + Math.random() * 0.002,
        angle,
        orbitRadius,
        converging: Math.random() > 0.4,
      });
    }

    // Background stars
    for (let i = 0; i < 120; i++) {
      gridStars.push({
        x: Math.random() * 3000,
        y: Math.random() * 3000,
        alpha: 0.1 + Math.random() * 0.4,
        twinkleSpeed: 0.005 + Math.random() * 0.02,
      });
    }

    let time = 0;
    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const cx = centerX();
      const cy = centerY();
      const baseIntensity = 1 + hoverIntensity * 0.6;

      // Background grid lines
      ctx.strokeStyle = `rgba(46, 91, 255, ${0.03 * baseIntensity})`;
      ctx.lineWidth = 0.5;
      const gridSize = 60;
      for (let gx = 0; gx < canvas.width; gx += gridSize) {
        const offset = Math.sin(time * 0.3 + gx * 0.01) * 2;
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx + offset, canvas.height);
        ctx.stroke();
      }
      for (let gy = 0; gy < canvas.height; gy += gridSize) {
        const offset = Math.cos(time * 0.25 + gy * 0.01) * 2;
        ctx.beginPath();
        ctx.moveTo(0, gy + offset);
        ctx.lineTo(canvas.width, gy + offset);
        ctx.stroke();
      }

      // Background stars
      gridStars.forEach((star) => {
        const sx = star.x % canvas.width;
        const sy = star.y % canvas.height;
        const twinkle = Math.sin(time * star.twinkleSpeed * 10) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(184, 195, 255, ${star.alpha * twinkle * 0.4})`;
        ctx.beginPath();
        ctx.arc(sx, sy, 0.8, 0, Math.PI * 2);
        ctx.fill();
      });

      // Central Intel Node glow
      const pulseRadius = 18 + Math.sin(time * 2) * 4 * baseIntensity;
      const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 8);
      gradient.addColorStop(0, `rgba(46, 91, 255, ${0.15 * baseIntensity})`);
      gradient.addColorStop(0.4, `rgba(87, 27, 193, ${0.06 * baseIntensity})`);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius * 8, 0, Math.PI * 2);
      ctx.fill();

      // Central node
      const nodeGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius);
      nodeGrad.addColorStop(0, `rgba(184, 195, 255, ${0.9 * baseIntensity})`);
      nodeGrad.addColorStop(0.5, `rgba(46, 91, 255, ${0.6 * baseIntensity})`);
      nodeGrad.addColorStop(1, "rgba(46, 91, 255, 0)");
      ctx.fillStyle = nodeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Outer ring
      ctx.strokeStyle = `rgba(184, 195, 255, ${0.15 + Math.sin(time) * 0.05})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, pulseRadius * 2.5, 0, Math.PI * 2);
      ctx.stroke();

      // Data Points – orbit & converge
      points.forEach((p) => {
        p.angle += p.speed * baseIntensity;

        if (p.converging) {
          p.orbitRadius = Math.max(30, p.orbitRadius - 0.15 * baseIntensity);
          if (p.orbitRadius <= 30) {
            p.orbitRadius = 100 + Math.random() * Math.max(canvas.width, canvas.height) * 0.45;
            p.angle = Math.random() * Math.PI * 2;
          }
        }

        p.x = cx + Math.cos(p.angle) * p.orbitRadius;
        p.y = cy + Math.sin(p.angle) * p.orbitRadius * 0.6;

        // Trail to center
        const dist = Math.sqrt((p.x - cx) ** 2 + (p.y - cy) ** 2);
        const trailAlpha = Math.max(0, 0.08 - dist / 5000) * baseIntensity;
        if (trailAlpha > 0.005) {
          ctx.strokeStyle = `hsla(${p.hue}, 80%, 70%, ${trailAlpha})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }

        // Point
        ctx.fillStyle = `hsla(${p.hue}, 80%, 70%, ${p.alpha * 0.8})`;
        ctx.shadowColor = `hsla(${p.hue}, 80%, 70%, 0.6)`;
        ctx.shadowBlur = 8 * baseIntensity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Connection lines between nearby points
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const dx = points[i].x - points[j].x;
          const dy = points[i].y - points[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(184, 195, 255, ${(1 - dist / 120) * 0.08})`;
            ctx.lineWidth = 0.5;
            ctx.beginPath();
            ctx.moveTo(points[i].x, points[i].y);
            ctx.lineTo(points[j].x, points[j].y);
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [canvasRef, hoverIntensity]);
}

/* ───────────────────────── Tile Component ───────────────────────── */

interface PortalTileProps {
  title: string;
  subtitle: string;
  href: string;
  buttonText: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  accentColor: string;
  onHover: (hovering: boolean) => void;
}

function PortalTile({
  title,
  subtitle,
  href,
  buttonText,
  icon,
  children,
  accentColor,
  onHover,
}: PortalTileProps) {
  return (
    <Link
      href={href}
      className="group relative block rounded-2xl border border-[#303348]/60 bg-gradient-to-br from-[#14151f]/80 to-[#0a0b14]/90 backdrop-blur-3xl overflow-hidden transition-all duration-500 hover:border-[#4a5aff]/60 hover:shadow-[0_0_50px_rgba(46,91,255,0.18)] hover:-translate-y-2"
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      {/* Glow border */}
      <div
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
        style={{
          background: `linear-gradient(135deg, ${accentColor}10, transparent 60%)`,
        }}
      />

      {/* Pulsing corner accent */}
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-10 group-hover:opacity-25 transition-opacity duration-500 pointer-events-none"
        style={{
          background: `radial-gradient(circle at top right, ${accentColor}60, transparent 70%)`,
        }}
      />

      <div className="relative p-6 flex flex-col h-full min-h-[260px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3"
              style={{ backgroundColor: `${accentColor}18` }}
            >
              {icon}
            </div>
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[#e5e2e1]" style={{ fontFamily: "var(--font-space)" }}>
                {title}
              </h3>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest" style={{ fontFamily: "var(--font-space)" }}>
                {subtitle}
              </p>
            </div>
          </div>
          <Zap
            className="w-4 h-4 opacity-0 group-hover:opacity-60 transition-all duration-300 text-slate-400 group-hover:translate-x-0 -translate-x-2"
          />
        </div>

        {/* Content */}
        <div className="flex-1 mb-5 overflow-hidden">{children}</div>

        {/* Button */}
        <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
          <span
            className="text-xs font-bold uppercase tracking-widest"
            style={{ color: accentColor, fontFamily: "var(--font-space)" }}
          >
            {buttonText}
          </span>
          <ArrowRight
            className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1"
            style={{ color: accentColor }}
          />
        </div>
      </div>
    </Link>
  );
}

/* ───────────────────────── Mini Components for Tiles ───────────────────────── */

function MiniGraph() {
  const bars = [40, 65, 35, 80, 55, 70, 45, 90, 60, 42, 75, 50];
  return (
    <div className="flex items-end gap-[3px] h-20">
      {bars.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm transition-all duration-300"
          style={{
            height: `${h}%`,
            background: `linear-gradient(to top, #2e5bff${(60 + i * 3).toString(16)}, #b8c3ff${(30 + i * 5).toString(16)})`,
            animationDelay: `${i * 0.1}s`,
          }}
        />
      ))}
    </div>
  );
}

function MiniMetricsTicker() {
  const metrics = [
    { label: "ACTIVE", value: "12", trend: "+3" },
    { label: "ARTICLES", value: "847", trend: "+24" },
    { label: "TOPICS", value: "36", trend: "+5" },
  ];
  return (
    <div className="flex gap-4 mt-3">
      {metrics.map((m) => (
        <div key={m.label}>
          <p className="text-[9px] text-slate-500 tracking-widest">{m.label}</p>
          <p className="text-lg font-headline font-black text-[#e5e2e1] leading-tight">
            {m.value}
            <span className="text-[10px] text-emerald-400 ml-1">{m.trend}</span>
          </p>
        </div>
      ))}
    </div>
  );
}

function MiniHoloCards() {
  const headlines = [
    "Show HN: TRELLIS v2.0 – Image-to-3D Generation",
    "OpenAI Announces GPT-5 Preview Access",
    "SpaceX Starship Flight Test 7 Success",
    "GitHub Copilot Workspace Goes GA",
  ];
  return (
    <div className="space-y-2 relative">
      {headlines.map((h, i) => (
        <div
          key={i}
          className="bg-[#1a1b2e]/80 rounded-lg px-3 py-2 border border-[#2a2d40]/40 transition-all duration-300 group-hover:border-[#4a5aff]/20"
          style={{
            opacity: 1 - i * 0.15,
            transform: `translateX(${i * 2}px)`,
          }}
        >
          <p className="text-[11px] text-slate-300 truncate leading-tight">{h}</p>
          <p className="text-[8px] text-slate-600 mt-0.5">
            {["2m", "8m", "14m", "21m"][i]} ago
          </p>
        </div>
      ))}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-[#14151f] to-transparent pointer-events-none" />
    </div>
  );
}

function MiniSourceNetwork() {
  const sources = [
    { name: "HN", color: "#ff6600" },
    { name: "TC", color: "#0a9e01" },
    { name: "GH", color: "#c9d1d9" },
    { name: "AI", color: "#10a37f" },
    { name: "AP", color: "#e2231a" },
    { name: "VX", color: "#ffd000" },
  ];
  return (
    <div className="flex flex-wrap gap-2 items-center">
      {sources.map((s) => (
        <div
          key={s.name}
          className="w-9 h-9 rounded-full flex items-center justify-center text-[9px] font-black border transition-all duration-300 group-hover:scale-110"
          style={{
            borderColor: `${s.color}40`,
            backgroundColor: `${s.color}15`,
            color: s.color,
          }}
        >
          {s.name}
        </div>
      ))}
      <div className="text-[10px] text-slate-500 ml-2">
        <span className="text-[#b8c3ff] font-bold text-sm">6</span> connected
      </div>
    </div>
  );
}


/* ───────────────────────── Homepage ───────────────────────── */

export default function HomePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoverIntensity, setHoverIntensity] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useNetworkCanvas(canvasRef, hoverIntensity);

  const handleTileHover = (hovering: boolean) => {
    setHoverIntensity(hovering ? 1 : 0);
  };

  if (!mounted) return null;

  return (
    <div className="relative h-screen bg-[#0a0b14] overflow-hidden flex flex-col text-[#e5e2e1]">
      {/* Canvas background */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 w-full h-full pointer-events-none z-0"
      />

      {/* Ambient gradients */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-15%] w-[60%] h-[60%] bg-[#2e5bff]/[0.04] blur-[120px] rounded-full" />
        <div className="absolute bottom-[-20%] right-[-15%] w-[50%] h-[50%] bg-[#571bc1]/[0.04] blur-[100px] rounded-full" />
      </div>

      {/* ── Nav ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 md:px-10 h-16 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg outline outline-1 outline-[#2e5bff]/30 bg-gradient-to-br from-[#2e5bff] to-[#571bc1] flex items-center justify-center shadow-[0_0_20px_rgba(46,91,255,0.4)]">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight bg-gradient-to-r from-[#e5e2e1] to-[#b8c3ff] bg-clip-text text-transparent leading-none" style={{ fontFamily: "var(--font-space)" }}>
              OneStream
            </h1>
            <p className="text-[9px] tracking-[0.3em] font-medium uppercase text-slate-500 leading-none mt-1" style={{ fontFamily: "var(--font-space)" }}>
              Intelligence
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/feed"
            className="hidden sm:flex items-center gap-2 text-xs text-slate-400 hover:text-[#b8c3ff] transition-colors font-headline uppercase tracking-wider"
          >
            Enter Platform
            <ArrowRight className="w-3 h-3" />
          </Link>
          <Link
            href="/dashboard/feed"
            className="px-5 py-2 bg-gradient-to-r from-[#2e5bff] to-[#4a5aff] text-white text-xs font-headline font-bold rounded-lg hover:shadow-[0_0_20px_rgba(46,91,255,0.4)] transition-all active:scale-95 duration-200 uppercase tracking-wider"
          >
            Launch
          </Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative z-10 text-center pt-8 md:pt-16 pb-6 px-6 shrink-0">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight mb-5 max-w-4xl mx-auto leading-[1.1]" style={{ fontFamily: 'var(--font-space)' }}>
          Your{" "}
          <span className="bg-gradient-to-r from-[#2e5bff] via-[#7c8dff] to-[#d0bcff] bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(46,91,255,0.4)]">
            Intelligence
          </span>{" "}
          Centre
        </h2>
        <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed mb-2 font-medium" style={{ fontFamily: 'var(--font-space)' }}>
          Every signal. Every source. One unified view.
          <br className="hidden sm:block" />
          Select a module below to begin.
        </p>
      </section>

      {/* ── Portal Tiles Grid ── */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 md:px-8 pb-10 flex-1 flex flex-col justify-center w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {/* Tile 1 – Dashboard */}
          <PortalTile
            title="Dashboard"
            subtitle="Overview"
            href="/dashboard"
            buttonText="Open Dashboard"
            icon={<LayoutDashboard className="w-5 h-5 text-[#2e5bff]" />}
            accentColor="#2e5bff"
            onHover={handleTileHover}
          >
            <MiniGraph />
            <MiniMetricsTicker />
          </PortalTile>

          {/* Tile 2 – Feed */}
          <PortalTile
            title="Feed"
            subtitle="Stream"
            href="/dashboard/feed"
            buttonText="Explore Feed"
            icon={<Rss className="w-5 h-5 text-[#7c8dff]" />}
            accentColor="#7c8dff"
            onHover={handleTileHover}
          >
            <MiniHoloCards />
          </PortalTile>

          {/* Tile 3 – Sources */}
          <PortalTile
            title="Source"
            subtitle="Manager"
            href="/dashboard/sources"
            buttonText="Manage Sources"
            icon={<Layers className="w-5 h-5 text-[#a78bfa]" />}
            accentColor="#a78bfa"
            onHover={handleTileHover}
          >
            <MiniSourceNetwork />
          </PortalTile>


        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-[#1a1b2e]/60 bg-[#0a0b14]/80 backdrop-blur-sm shrink-0">
        <div className="max-w-6xl mx-auto px-6 md:px-10 py-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-gradient-to-br from-[#2e5bff] to-[#571bc1] flex items-center justify-center">
              <Activity className="w-3 h-3 text-white" />
            </div>
            <span className="text-xs font-headline font-bold text-slate-600">
              OneStream Intelligence
            </span>
          </div>
          <p className="text-[10px] text-slate-700">
            © {new Date().getFullYear()} OneStream Intelligence. All rights reserved.
          </p>
          <div className="flex gap-5">
            <a className="text-[10px] text-slate-600 hover:text-[#b8c3ff] transition-colors" href="#">Privacy</a>
            <a className="text-[10px] text-slate-600 hover:text-[#b8c3ff] transition-colors" href="#">Terms</a>
            <a className="text-[10px] text-slate-600 hover:text-[#b8c3ff] transition-colors" href="#">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
