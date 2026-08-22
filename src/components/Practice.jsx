import React, { useRef, useState, useEffect } from 'react';
import {
  DEAF_MUTE_ROADMAP,
  AUTISM_INTROVERT_ROADMAP,
  getRoadmapByCategory
} from '../utils/roadmapData';
import CameraView from './CameraView';
import HandTracker from './HandTracker';
import {
  Trophy, ArrowRight, ArrowLeft, CheckCircle2, Sparkles, BookOpen,
  Camera, Check, Play, RotateCcw, Award, Layers, HelpCircle, ChevronRight, Flame
} from 'lucide-react';
import SignIllustration from './SignIllustration';
import { saveUserProgressApi, getUserProgressApi } from '../services/api';

export default function Practice({ initialCategory = 'deaf_mute', user }) {
  // Mode: 'deaf_mute' (PDF 1) vs 'autism_introvert' (PDF 2)
  const [category, setCategory] = useState(
    initialCategory === 'autism_support' || initialCategory === 'introvert_coach'
      ? 'autism_introvert'
      : 'deaf_mute'
  );

  const [currentLevelIdx, setCurrentLevelIdx] = useState(0); // 0 .. 19 (Levels 1 to 20)
  const [currentModuleIdx, setCurrentModuleIdx] = useState(0); // 0 .. 4 (Modules 1 to 5)
  const [isPracticing, setIsPracticing] = useState(true);
  const [viewMode, setViewMode] = useState('studio'); // 'studio' | 'roadmap' | 'dictionary'
  const [completedModules, setCompletedModules] = useState(new Set());
  const [xp, setXp] = useState(120);

  const cameraRef = useRef(null);

  const roadmap = getRoadmapByCategory(category);
  const currentLevel = roadmap[currentLevelIdx] || roadmap[0];
  const currentModule = currentLevel.modules[currentModuleIdx] || currentLevel.modules[0];

  const isDeafTheme = category === 'deaf_mute';

  // Theme tokens matching the attached PDF references
  const theme = {
    headerBg: isDeafTheme
      ? 'linear-gradient(135deg, #1E3A8A 0%, #172554 100%)'
      : 'linear-gradient(135deg, #9A3412 0%, #7C2D12 100%)',
    headerTitle: isDeafTheme
      ? 'Sign Language & Hand Gestures Guide'
      : 'Expressions & Actions Symbols Guide',
    headerSubtitle: isDeafTheme
      ? 'A Visual Reference for Manual Alphabet & Finger Postures • 20-Level Progression'
      : 'A Universal Visual Dictionary of Emotional States & Human Actions • 20-Level Progression',
    primaryAccent: isDeafTheme ? '#2563EB' : '#EA580C',
    lightAccent: isDeafTheme ? '#60A5FA' : '#FB923C',
    glowColor: isDeafTheme ? 'rgba(37,99,235,0.3)' : 'rgba(234,88,12,0.3)',
    cardBg: isDeafTheme ? '#0D1527' : '#1C120C',
    border: isDeafTheme ? '1px solid rgba(59,130,246,0.3)' : '1px solid rgba(249,115,22,0.3)',
    pillActive: isDeafTheme ? '#3B82F6' : '#F97316',
  };

  // Load user progress
  useEffect(() => {
    (async () => {
      const saved = await getUserProgressApi(user?.id || 'demo_user');
      if (saved?.completed) {
        setCompletedModules(new Set(saved.completed));
        if (saved.xp) setXp(saved.xp);
      }
    })();
  }, [user]);

  // Handle successful hand gesture match (triggered after 5s or instant advance)
  const handleMatchSuccess = async (moduleData) => {
    const modId = moduleData.id;
    const newCompleted = new Set(completedModules);
    newCompleted.add(modId);
    setCompletedModules(newCompleted);
    setXp(prev => prev + 50);

    // Persist to backend & storage
    await saveUserProgressApi({
      userId: user?.id || 'demo_user',
      category,
      completedModuleId: modId,
      level: currentLevel.level,
      xp: xp + 50
    });

    // Advance to next module in 20-level roadmap
    if (currentModuleIdx < currentLevel.modules.length - 1) {
      setCurrentModuleIdx(prev => prev + 1);
    } else if (currentLevelIdx < roadmap.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setCurrentModuleIdx(0);
    } else {
      // Reached Level 20 Module 5 completion!
      alert('🏆 Congratulations! You have mastered all 20 Levels of this Curriculum!');
    }
  };

  const handlePrev = () => {
    if (currentModuleIdx > 0) {
      setCurrentModuleIdx(prev => prev - 1);
    } else if (currentLevelIdx > 0) {
      setCurrentLevelIdx(prev => prev - 1);
      setCurrentModuleIdx(4);
    }
  };

  const handleNext = () => {
    if (currentModuleIdx < currentLevel.modules.length - 1) {
      setCurrentModuleIdx(prev => prev + 1);
    } else if (currentLevelIdx < roadmap.length - 1) {
      setCurrentLevelIdx(prev => prev + 1);
      setCurrentModuleIdx(0);
    }
  };

  return (
    <div className="space-y-6 max-w-[1500px] mx-auto pb-12">

      {/* ── TOP BANNER: Styled exactly after PDF 1 & PDF 2 Guide Headers ── */}
      <div
        className="rounded-3xl p-6 md:p-8 text-white shadow-2xl relative overflow-hidden transition-all duration-500"
        style={{
          background: theme.headerBg,
          border: theme.border,
          boxShadow: `0 16px 40px ${theme.glowColor}`,
        }}
      >
        {/* Decorative corner glow */}
        <div
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: theme.lightAccent }}
        />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-white/20 text-white backdrop-blur-md">
                Educational Guide & AI Practice
              </span>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 flex items-center gap-1">
                <Flame className="w-3 h-3 text-amber-400" />
                {xp} XP Earned
              </span>
              <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-green-400/20 text-green-300 border border-green-400/30 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-green-400" />
                {completedModules.size} / 100 Modules Mastered
              </span>
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight drop-shadow-md">
              {theme.headerTitle}
            </h1>
            <p className="text-xs md:text-sm font-medium text-white/80 max-w-3xl">
              {theme.headerSubtitle}
            </p>
          </div>

          {/* Guide Category Switcher (PDF 1 vs PDF 2) */}
          <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-black/50 border border-white/15 backdrop-blur-xl">
            <button
              onClick={() => {
                setCategory('deaf_mute');
                setCurrentLevelIdx(0);
                setCurrentModuleIdx(0);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              style={{
                background: isDeafTheme ? 'linear-gradient(135deg,#00e5ff,#2563eb)' : 'transparent',
                color: '#fff',
                boxShadow: isDeafTheme ? '0 0 24px rgba(0,229,255,0.45)' : 'none',
              }}
            >
              <span>🤟</span>
              <span>Deaf / ASL Guide (PDF 1)</span>
            </button>

            <button
              onClick={() => {
                setCategory('autism_introvert');
                setCurrentLevelIdx(0);
                setCurrentModuleIdx(0);
              }}
              className="px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
              style={{
                background: !isDeafTheme ? 'linear-gradient(135deg,#f59e0b,#ea580c)' : 'transparent',
                color: '#fff',
                boxShadow: !isDeafTheme ? '0 0 24px rgba(234,88,12,0.45)' : 'none',
              }}
            >
              <span>🧩</span>
              <span>Autism & Introvert (PDF 2)</span>
            </button>
          </div>
        </div>

        {/* View Mode Navigation Bar */}
        <div className="flex items-center gap-2 pt-5 mt-5 border-t border-white/15 text-xs font-bold">
          <button
            onClick={() => setViewMode('studio')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'studio'
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25 font-black'
                : 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Interactive Camera Studio</span>
          </button>

          <button
            onClick={() => setViewMode('roadmap')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'roadmap'
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25 font-black'
                : 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>20-Level Roadmap Tree</span>
          </button>

          <button
            onClick={() => setViewMode('dictionary')}
            className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ${
              viewMode === 'dictionary'
                ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white shadow-lg shadow-cyan-500/25 font-black'
                : 'text-white/80 hover:text-white bg-white/5 hover:bg-white/10'
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Visual Symbols Dictionary</span>
          </button>
        </div>
      </div>

      {/* ── 20-LEVEL SELECTOR PILLS BAR ── */}
      <div
        className="p-3.5 rounded-2xl overflow-x-auto no-scrollbar flex items-center gap-2.5 transition-all"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
      >
        <span className="text-[11px] font-black uppercase tracking-wider text-slate-400 whitespace-nowrap pl-2">
          Levels (1-20):
        </span>
        {roadmap.map((lvl, lIdx) => {
          const isActive = currentLevelIdx === lIdx;
          const levelCompletedCount = lvl.modules.filter(m => completedModules.has(m.id)).length;
          const isAllDone = levelCompletedCount === 5;

          return (
            <button
              key={lvl.level}
              onClick={() => {
                setCurrentLevelIdx(lIdx);
                setCurrentModuleIdx(0);
              }}
              className="px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer flex-shrink-0"
              style={{
                background: isActive
                  ? theme.primaryAccent
                  : isAllDone
                  ? 'rgba(34,197,94,0.12)'
                  : 'rgba(255,255,255,0.05)',
                color: isActive ? '#fff' : isAllDone ? '#4ADE80' : '#94A3B8',
                border: isActive
                  ? `1px solid ${theme.lightAccent}`
                  : isAllDone
                  ? '1px solid rgba(34,197,94,0.3)'
                  : '1px solid rgba(255,255,255,0.08)',
                boxShadow: isActive ? `0 0 16px ${theme.glowColor}` : 'none',
              }}
            >
              {isAllDone && <Check className="w-3 h-3 text-green-400" />}
              <span>L{lvl.level}: {lvl.title.split(' ')[0]}</span>
              <span className="text-[10px] opacity-75">({levelCompletedCount}/5)</span>
            </button>
          );
        })}
      </div>

      {/* ── 5-MODULES IN CURRENT LEVEL TABS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {currentLevel.modules.map((mod, mIdx) => {
          const isSelected = currentModuleIdx === mIdx;
          const isDone = completedModules.has(mod.id);

          return (
            <button
              key={mod.id}
              onClick={() => setCurrentModuleIdx(mIdx)}
              className="p-3 rounded-2xl text-left transition-all relative overflow-hidden cursor-pointer"
              style={{
                background: isSelected
                  ? (isDeafTheme ? 'rgba(37,99,235,0.18)' : 'rgba(234,88,12,0.18)')
                  : isDone
                  ? 'rgba(34,197,94,0.08)'
                  : 'rgba(255,255,255,0.03)',
                border: isSelected
                  ? `2px solid ${theme.primaryAccent}`
                  : isDone
                  ? '1px solid rgba(34,197,94,0.3)'
                  : '1px solid rgba(255,255,255,0.07)',
                boxShadow: isSelected ? `0 0 20px ${theme.glowColor}` : 'none',
              }}
            >
              {isDone && (
                <div className="absolute top-2 right-2 w-4 h-4 rounded-full bg-green-500 text-slate-900 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
              )}
              <div className="flex items-center gap-2">
                <span className="text-xl">{mod.emoji}</span>
                <div className="min-w-0">
                  <div className="text-[10px] font-bold text-slate-400">Module {mIdx + 1}/5</div>
                  <div className="text-xs font-black text-white truncate">{mod.title}</div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* ── VIEW 1: INTERACTIVE CAMERA STUDIO ── */}
      {viewMode === 'studio' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

          {/* Left / Top: Detailed Module Lesson Card (PDF Reference Styling) */}
          <div
            className="lg:col-span-5 p-6 rounded-3xl space-y-5 transition-all shadow-xl"
            style={{
              background: theme.cardBg,
              border: theme.border,
              boxShadow: `0 12px 32px ${theme.glowColor}`,
            }}
          >
            {/* Header / Badges */}
            <div className="flex items-center justify-between">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white"
                style={{ background: theme.primaryAccent }}
              >
                Level {currentLevel.level} • Module {currentModuleIdx + 1}
              </span>
              <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-400" />
                <span>{currentLevel.badge}</span>
              </div>
            </div>

            {/* Gesture Focus Box */}
            <div
              className="text-center p-6 rounded-2xl space-y-3 relative overflow-hidden"
              style={{ background: 'rgba(0,0,0,0.45)', border: '1px solid rgba(255,255,255,0.08)' }}
            >
              <div className="flex items-center justify-center gap-4">
                <div
                  className="w-24 h-24 rounded-2xl p-2 flex items-center justify-center shadow-lg"
                  style={{
                    background: isDeafTheme ? 'rgba(37,99,235,0.15)' : 'rgba(234,88,12,0.15)',
                    border: `1px solid ${isDeafTheme ? 'rgba(96,165,250,0.4)' : 'rgba(251,146,60,0.4)'}`,
                  }}
                >
                  <SignIllustration
                    sign={currentModule.targetSign || 'OPEN_HAND'}
                    emoji={currentModule.emoji}
                    size={76}
                  />
                </div>
                <div className="text-5xl animate-bounce">{currentModule.emoji}</div>
              </div>

              <h2 className="text-2xl font-black text-white">{currentModule.title}</h2>
              <div className="text-xs font-semibold" style={{ color: theme.lightAccent }}>
                {currentModule.subtitle}
              </div>
              <p className="text-xs leading-relaxed text-slate-300">
                {currentModule.description}
              </p>
            </div>

            {/* Posture & Finger Instruction Box (From PDF) */}
            <div
              className="p-4 rounded-2xl space-y-2 text-xs"
              style={{
                background: isDeafTheme ? 'rgba(37,99,235,0.1)' : 'rgba(234,88,12,0.1)',
                border: `1px solid ${isDeafTheme ? 'rgba(59,130,246,0.3)' : 'rgba(249,115,22,0.3)'}`,
              }}
            >
              <div className="font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Finger Configuration & Posture Guide:</span>
              </div>
              <div className="text-slate-200 leading-relaxed pl-5">
                • {currentModule.instruction}
              </div>
              <div className="text-slate-400 text-[11px] pl-5 italic">
                💡 Hint: {currentModule.hint}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={handlePrev}
                disabled={currentLevelIdx === 0 && currentModuleIdx === 0}
                className="px-5 py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-white disabled:opacity-30 cursor-pointer"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  backdropFilter: 'blur(12px)',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; }}
              >
                <ArrowLeft className="w-4 h-4" /> Previous
              </button>

              <button
                onClick={() => handleMatchSuccess(currentModule)}
                className="flex-1 py-3.5 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg,#00e5ff,#9d50bb)',
                  border: 'none',
                  boxShadow: '0 0 30px rgba(0,229,255,0.35)',
                }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 44px rgba(0,229,255,0.55)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 0 30px rgba(0,229,255,0.35)'; e.currentTarget.style.transform = 'none'; }}
              >
                <span>Advance to Next Module</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Right: Camera View with Dotted Line Hand Overlay & Real-Time AI Matcher */}
          <div className="lg:col-span-7 space-y-3">
            <div
              className="relative rounded-3xl overflow-hidden shadow-2xl"
              style={{
                height: 520,
                background: '#000',
                border: theme.border,
                boxShadow: `0 16px 40px ${theme.glowColor}`,
              }}
            >
              <CameraView ref={cameraRef} />
              <HandTracker
                videoElement={cameraRef.current?.getVideoElement()}
                isCameraActive={cameraRef.current?.isCameraActive()}
                targetModule={currentModule}
                onMatchSuccess={handleMatchSuccess}
                themeMode={category}
              />
            </div>

            {/* Bottom Camera Hint */}
            <div className="flex items-center justify-between text-xs text-slate-400 px-2 font-medium">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-ping" />
                <span>MediaPipe Vision Active • Dotted Line Alignment Guide Active</span>
              </div>
              <span className="font-mono">5s Auto-Transition Enabled</span>
            </div>
          </div>

        </div>
      )}

      {/* ── VIEW 2: 20-LEVEL ROADMAP PROGRESSION TREE ── */}
      {viewMode === 'roadmap' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {roadmap.map((lvl, lIdx) => {
              const completedInLvl = lvl.modules.filter(m => completedModules.has(m.id)).length;
              const isLevelDone = completedInLvl === 5;
              const isCurrent = currentLevelIdx === lIdx;

              return (
                <div
                  key={lvl.level}
                  onClick={() => {
                    setCurrentLevelIdx(lIdx);
                    setCurrentModuleIdx(0);
                    setViewMode('studio');
                  }}
                  className="p-5 rounded-3xl space-y-4 cursor-pointer transition-all duration-200 hover:scale-[1.02]"
                  style={{
                    background: isCurrent
                      ? (isDeafTheme ? '#1E3A8A25' : '#9A341225')
                      : 'rgba(255,255,255,0.03)',
                    border: isCurrent
                      ? `2px solid ${theme.primaryAccent}`
                      : isLevelDone
                      ? '1px solid rgba(34,197,94,0.4)'
                      : '1px solid rgba(255,255,255,0.08)',
                    boxShadow: isCurrent ? `0 0 24px ${theme.glowColor}` : 'none',
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full text-white"
                      style={{ background: isCurrent ? theme.primaryAccent : 'rgba(255,255,255,0.1)' }}
                    >
                      Level {lvl.level}
                    </span>
                    <span className="text-xs font-bold text-amber-400">{lvl.badge}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-black text-white">{lvl.title}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{lvl.description}</p>
                  </div>

                  {/* 5 module icon nodes */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/10">
                    {lvl.modules.map(m => (
                      <div
                        key={m.id}
                        className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm ${
                          completedModules.has(m.id)
                            ? 'bg-green-500/20 text-green-400 border border-green-500/40'
                            : 'bg-white/5 text-slate-400'
                        }`}
                        title={m.title}
                      >
                        {m.emoji}
                      </div>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-[11px] font-bold text-slate-400">
                    <span>Progress: {completedInLvl}/5 Modules</span>
                    <span style={{ color: theme.lightAccent }}>Start Level →</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── VIEW 3: VISUAL SYMBOLS DICTIONARY (EXACT PDF TABLE LAYOUT) ── */}
      {viewMode === 'dictionary' && (
        <div
          className="rounded-3xl overflow-hidden shadow-2xl transition-all"
          style={{ background: theme.cardBg, border: theme.border }}
        >
          {/* Table Header replicating PDF 1 & PDF 2 */}
          <div
            className="p-5 text-white flex items-center justify-between"
            style={{ background: theme.headerBg, borderBottom: '1px solid rgba(255,255,255,0.15)' }}
          >
            <div>
              <h2 className="text-xl font-black">{theme.headerTitle} Table Reference</h2>
              <p className="text-xs text-white/80">Complete 100-Module Visual Dictionary & Finger Posture Descriptions</p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-white/20">
              100 Signs & Expressions
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr
                  className="text-white uppercase font-black tracking-wider text-[11px]"
                  style={{ background: theme.primaryAccent }}
                >
                  <th className="p-4 w-20">Level</th>
                  <th className="p-4 w-24">{isDeafTheme ? 'Letter / Concept' : 'Symbol'}</th>
                  <th className="p-4 w-24">Gesture</th>
                  <th className="p-4">{isDeafTheme ? 'Finger Configuration & Description' : 'Description & Context Meaning'}</th>
                  <th className="p-4 w-28 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-200">
                {roadmap.flatMap((lvl, lIdx) =>
                  lvl.modules.map((m, mIdx) => (
                    <tr
                      key={m.id}
                      className="hover:bg-white/5 transition-colors"
                      style={{
                        background: mIdx % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'rgba(0,0,0,0.15)'
                      }}
                    >
                      <td className="p-4 font-bold text-slate-400">L{lvl.level}.{m.module}</td>
                      <td className="p-4 font-black text-white">{m.title}</td>
                      <td className="p-4 text-3xl">{m.emoji}</td>
                      <td className="p-4 space-y-1">
                        <div className="font-semibold text-slate-100">{m.description}</div>
                        <div className="text-[11px] text-amber-300">👉 {m.instruction}</div>
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            setCurrentLevelIdx(lIdx);
                            setCurrentModuleIdx(mIdx);
                            setViewMode('studio');
                          }}
                          className="px-3 py-1.5 rounded-lg text-xs font-bold text-white transition-all cursor-pointer"
                          style={{ background: theme.primaryAccent }}
                        >
                          Practice
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
