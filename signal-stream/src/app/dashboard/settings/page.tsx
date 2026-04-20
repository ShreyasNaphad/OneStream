"use client";

import { useState, useEffect } from "react";
import { Settings, Key, Clock, Palette, Save, Check, Eye, EyeOff } from "lucide-react";
import { useSourceStore } from "@/store/useSourceStore";

export default function SettingsPage() {
  const { theme, setTheme, cacheDuration, setCacheDuration } = useSourceStore();
  const [isMounted, setIsMounted] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);
  const [keySaved, setKeySaved] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    // Load key from localStorage on mount
    const storedKey = localStorage.getItem("ss-groq-key");
    if (storedKey) setApiKey(storedKey);
  }, []);

  const handleSaveKey = () => {
    if (apiKey.trim()) {
      localStorage.setItem("ss-groq-key", apiKey.trim());
    } else {
      localStorage.removeItem("ss-groq-key");
    }
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  if (!isMounted) return null;

  return (
    <main className="pt-24 pb-16 px-6 md:px-12 max-w-[900px] mx-auto w-full overflow-y-auto custom-scrollbar h-full">
      <div className="mb-12">
        <h2 className="font-headline text-4xl font-extrabold tracking-tight text-on-surface mb-2 flex items-center gap-4">
          <Settings className="w-8 h-8 text-primary" />
          Settings
        </h2>
        <p className="text-outline">
          Customize your OneStream experience, manage API keys, and tweak performance.
        </p>
      </div>

      <div className="space-y-8">
        {/* Section 1: AI & API Keys */}
        <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Key className="w-5 h-5 text-primary" />
            AI & Intelligence
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">
                Groq API Key (Local Override)
              </label>
              <p className="text-xs text-outline mb-3">
                Provide your own Groq API key to power the local LLM categorization engine. 
                The server has a default key configured — this field overrides it for client-side features like article summarization.
              </p>
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <input
                    type={showKey ? "text" : "password"}
                    placeholder="gsk_..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-2.5 pr-10 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none"
                  />
                  <button
                    onClick={() => setShowKey(!showKey)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-on-surface transition-colors"
                    type="button"
                  >
                    {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <button
                  onClick={handleSaveKey}
                  className={`px-5 py-2.5 rounded-lg text-sm font-bold flex items-center gap-2 transition-all active:scale-95 ${
                    keySaved
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-primary-container text-on-primary-container hover:brightness-110"
                  }`}
                >
                  {keySaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                  {keySaved ? "Saved!" : "Save"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Performance & Caching */}
        <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Performance
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-on-surface mb-1">
                Background Cache Duration
              </label>
              <p className="text-xs text-outline mb-3">
                How long should articles live in the seamless background cache before fetching fresh data?
              </p>
              <select
                value={cacheDuration}
                onChange={(e) => setCacheDuration(Number(e.target.value))}
                className="w-full md:w-1/2 bg-surface-container border border-outline-variant/20 rounded-lg px-4 py-2.5 text-sm text-on-surface focus:ring-1 focus:ring-primary focus:outline-none cursor-pointer"
              >
                <option value={1}>1 Minute</option>
                <option value={5}>5 Minutes (Default)</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
              </select>
            </div>
          </div>
        </section>

        {/* Section 3: Appearance */}
        <section className="bg-surface-container-low p-6 rounded-xl border border-outline-variant/10">
          <h3 className="font-headline text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
            <Palette className="w-5 h-5 text-primary" />
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="block text-sm font-bold text-on-surface mb-1">
                  Interface Theme
                </label>
                <p className="text-xs text-outline">
                  Switch between light and dark modes.
                </p>
              </div>
              <div className="flex bg-surface-container rounded-lg p-1">
                <button
                  onClick={() => setTheme("light")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    theme === "light"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-outline hover:text-on-surface"
                  }`}
                >
                  Light
                </button>
                <button
                  onClick={() => setTheme("dark")}
                  className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                    theme === "dark"
                      ? "bg-primary text-on-primary shadow-sm"
                      : "text-outline hover:text-on-surface"
                  }`}
                >
                  Dark
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
