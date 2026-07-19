import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  FileText,
  AlertCircle,
  Database,
  Save,
  Check,
  RotateCw,
  Layers,
  Megaphone,
  Scale,
  Link,
  Headphones,
  Activity,
  Lightbulb,
  Users
} from "lucide-react";
import FileUploader from "./components/FileUploader";
import PrdEditor from "./components/PrdEditor";
import PrdDocPreview from "./components/PrdDocPreview";
import SavedPrdsList from "./components/SavedPrdsList";
import { PrdData, SavedPrd } from "./types";
import { ParsedSheetData } from "./utils/fileParser";
import { SampleDataset } from "./sampleData";

const TARGET_TEAMS = [
  {
    id: "Product",
    label: "Product",
    persian: "تیم محصول",
    desc: "تمرکز بر جریان کاربری (UX) و شاخص‌های کلیدی موفقیت محصولی (KPI)",
    icon: Layers,
    bgActive: "bg-sky-500/10 text-sky-400 border-sky-500/30",
  },
  {
    id: "Marketing",
    label: "Marketing",
    persian: "تیم بازاریابی",
    desc: "تمرکز بر ارزش پیشنهادی به کاربر، وفاداری مشتری و همسویی با کمپین‌ها",
    icon: Megaphone,
    bgActive: "bg-amber-500/10 text-amber-400 border-amber-500/30",
  },
  {
    id: "Legal",
    label: "Legal",
    persian: "تیم حقوقی",
    desc: "تمرکز بر قوانین انطباق هویتی، پیشگیری از کلاهبرداری و ریسک‌های نظارتی",
    icon: Scale,
    bgActive: "bg-rose-500/10 text-rose-400 border-rose-500/30",
  },
  {
    id: "Blockchain",
    label: "Blockchain",
    persian: "تیم بلاکچین",
    desc: "تمرکز بر تراکنش‌های زنجیره‌ای (On-chain)، امنیت وب۳ و اتصال RPC",
    icon: Link,
    bgActive: "bg-purple-500/10 text-purple-400 border-purple-500/30",
  },
  {
    id: "Support",
    label: "Support",
    persian: "تیم پشتیبانی",
    desc: "تمرکز بر تکرار خطاها، خودکارسازی پاسخ‌ها و کاهش نرخ تیکت‌ها",
    icon: Headphones,
    bgActive: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  },
  {
    id: "Market Making",
    label: "Market Making",
    persian: "تیم مارکت میکینگ",
    desc: "تمرکز بر اردر بوک، عمق بازار، نقدینگی و مدیریت اسپردها",
    icon: Activity,
    bgActive: "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
  },
];

export default function App() {
  const [rawText, setRawText] = useState<string>("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [activeSampleId, setActiveSampleId] = useState<string | null>(null);

  // Manual parameters override
  const [titleOverride, setTitleOverride] = useState("");
  const [teamOverride, setTeamOverride] = useState("تیم بهبود تجربه مشتری (CX)");
  const [ownerOverride, setOwnerOverride] = useState("کارشناس بهبود تجربه مشتری");
  const [priorityOverride, setPriorityOverride] = useState<"low" | "medium" | "high" | "critical">("high");
  const [targetTeam, setTargetTeam] = useState<string>("Product");
  const [userIdea, setUserIdea] = useState<string>("");

  const [generatedPrd, setGeneratedPrd] = useState<PrdData | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Saved PRDs History
  const [savedPrds, setSavedPrds] = useState<SavedPrd[]>([]);

  // Realistic product analysis steps to show on the generator loading screen
  const loadingSteps = [
    "در حال تجزیه و تحلیل رکوردهای بارگذاری شده...",
    "در حال خوشه‌بندی شکایات و دسته‌بندی مسائل تکرارشونده...",
    "استخراج عمیق نقاط درد اصلی کاربران (Pain Points)...",
    "بررسی جریان کاربری فعلی (As-Is) و ترسیم جریان بهینه (To-Be)...",
    "تدوین اهداف کیفی و پیشنهاد شاخص‌های کلیدی عملکرد (KPIs)...",
    "یکپارچه‌سازی شواهد و مراجع تأییدکننده بر اساس اطلاعات چت...",
    "نهایی‌سازی سند رسمی بریف محصول در قالب استاندارد..."
  ];

  // Rotate loading steps for better user experience
  useEffect(() => {
    let interval: any;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % loadingSteps.length);
      }, 3000);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  // Load history from localStorage on mount
  useEffect(() => {
    try {
      const historyStr = localStorage.getItem("prd_brief_generator_history");
      if (historyStr) {
        setSavedPrds(JSON.parse(historyStr));
      }
    } catch (err) {
      console.error("Failed to load local history", err);
    }
  }, []);

  const handleDataParsed = (data: ParsedSheetData & { fileName: string }) => {
    setRawText(data.rawText);
    setFileName(data.fileName);
    setActiveSampleId(null);
    setError(null);
    
    // Automatically pre-fill some details
    if (!titleOverride) {
      setTitleOverride(`بریف محصول مستخرج از فایل ${data.fileName.split(".")[0]}`);
    }
  };

  const handleSelectSample = (dataset: SampleDataset, csvText: string) => {
    setRawText(csvText);
    setFileName(`${dataset.name}.csv`);
    setActiveSampleId(dataset.id);
    setTitleOverride(dataset.titleSuggestion);
    setTeamOverride(dataset.team);
    setOwnerOverride(dataset.owner);
    setPriorityOverride(dataset.priority);
    setTargetTeam(dataset.targetTeam || "Product");
    setUserIdea(dataset.userIdea || "");
    setError(null);
  };

  const handleClearData = () => {
    setRawText("");
    setFileName(null);
    setActiveSampleId(null);
    setTitleOverride("");
    setTargetTeam("Product");
    setUserIdea("");
    setError(null);
  };

  const handleGeneratePrd = async () => {
    if (!rawText.trim()) {
      setError("لطفاً ابتدا فایلی را بارگذاری کنید یا یکی از سناریوهای آماده را انتخاب نمایید.");
      return;
    }

    setLoading(true);
    setError(null);
    setGeneratedPrd(null);

    try {
      const response = await fetch("/api/generate-prd", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chatSummaries: rawText,
          meta: {
            title: titleOverride,
            team: teamOverride,
            owner: ownerOverride,
            priority: priorityOverride,
            targetTeam,
            userIdea,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "خطای نامشخص در تولید بریف محصول.");
      }

      setGeneratedPrd(data);
      setActiveTab("preview");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "برقراری ارتباط با سرور یا مدل با مشکل مواجه شد. لطفاً دوباره تلاش کنید.");
    } finally {
      setLoading(false);
    }
  };

  const handleSavePrd = () => {
    if (!generatedPrd) return;

    try {
      const newSaved: SavedPrd = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        data: generatedPrd,
      };

      const updated = [newSaved, ...savedPrds];
      setSavedPrds(updated);
      localStorage.setItem("prd_brief_generator_history", JSON.stringify(updated));
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    } catch (err) {
      console.error("Failed to save PRD locally", err);
    }
  };

  const handleLoadSavedPrd = (item: SavedPrd) => {
    setGeneratedPrd(item.data);
    setTitleOverride(item.data.title);
    setTeamOverride(item.data.team);
    setOwnerOverride(item.data.owner);
    setPriorityOverride(item.data.priority);
    setTargetTeam(item.data.targetTeam || "Product");
    setUserIdea(item.data.userIdea || "");
    setActiveTab("preview");

    // Scroll smoothly to output workspace
    const element = document.getElementById("prd-output-workspace");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleDeleteSavedPrd = (id: string) => {
    const updated = savedPrds.filter((item) => item.id !== id);
    setSavedPrds(updated);
    localStorage.setItem("prd_brief_generator_history", JSON.stringify(updated));
  };

  return (
    <div dir="rtl" className="min-h-screen bg-[#0F172A] text-slate-100 flex flex-col pb-16 font-sans">
      
      {/* 1. APP HERO HEADER */}
      <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 sticky top-0 z-40 shadow-lg no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-right">
            <div className="p-2.5 bg-gradient-to-tr from-sky-500 to-sky-600 text-white rounded-2xl shadow-md shadow-sky-500/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black text-white font-sans tracking-tight">
                  Smart Product Brief Generator
                </h1>
                <span className="text-[10px] font-sans font-semibold bg-sky-500/10 text-sky-400 px-2 py-0.5 rounded-full border border-sky-500/20">
                  نسخه ۲.۵
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-sans">
                میزکار تخصصی کارشناس بهبود تجربه مشتری (CX) • ویژه ساخت بریف‌های محصولی
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-stretch sm:self-auto justify-end border-t sm:border-t-0 border-slate-800 pt-3 sm:pt-0">
            <div className="text-left sm:text-right">
              <div className="text-xs font-bold text-slate-300 font-sans">کاربر فعال:</div>
              <div className="text-[10px] text-slate-400 font-mono">m.bahari@wallex.net</div>
            </div>
            <div className="h-9 w-9 bg-sky-950/40 text-sky-400 rounded-full flex items-center justify-center font-bold text-sm border border-sky-850 font-sans shadow-md">
              م‌ب
            </div>
          </div>
        </div>
      </header>

      {/* 2. MAIN LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 w-full flex-grow space-y-8">
        


        {/* STEP 1: PREPARE AND UPLOAD WORKSPACE */}
        <section className="grid grid-cols-1 lg:grid-cols-4 gap-8 no-print">
          
          {/* COLUMN 1: TARGET AUDIENCE TEAM SIDEBAR */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-5 shadow-md space-y-4 text-right">
              
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full shadow-lg shadow-sky-500/50" />
                <h3 className="text-xs font-black text-slate-100 font-sans uppercase tracking-tight">
                  مخاطب اصلی سند (Target Team)
                </h3>
              </div>

              <p className="text-[10px] text-slate-400 leading-relaxed font-sans">
                صنف مخاطب را انتخاب کنید تا لحن، اصطلاحات فنی و تمرکز بریف با واژگان تخصصی همان تیم همسلو و بازنویسی شود:
              </p>

              <div className="space-y-2">
                {TARGET_TEAMS.map((team) => {
                  const IconComponent = team.icon;
                  const isSelected = targetTeam === team.id;
                  return (
                    <button
                      key={team.id}
                      onClick={() => setTargetTeam(team.id)}
                      className={`w-full p-3 rounded-xl border text-right transition-all flex items-start gap-3 cursor-pointer group ${
                        isSelected
                          ? `${team.bgActive} border-transparent shadow-md shadow-sky-500/5`
                          : "bg-slate-950/40 border-slate-850 hover:bg-slate-900/50 hover:border-slate-800"
                      }`}
                    >
                      <div className={`p-2 rounded-lg shrink-0 ${
                        isSelected ? "bg-sky-500/10 text-sky-400" : "bg-slate-900 text-slate-500 group-hover:text-slate-400"
                      }`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs font-bold font-mono tracking-tight ${isSelected ? "text-white" : "text-slate-300"}`}>
                            {team.label}
                          </span>
                          <span className="text-[10px] text-slate-500 font-sans">
                            ({team.persian})
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-normal font-sans">
                          {team.desc}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

            </div>
          </div>

          {/* COLUMN 2 & 3: Uploader & Main Data Inputs */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-md space-y-6">
              
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full shadow-lg shadow-sky-500/50" />
                <h3 className="text-sm font-black text-slate-100 font-sans">
                  گام ۱: تعیین ورودی (فایل اکسل/CSV یا چت خام)
                </h3>
              </div>

              {/* File Uploader area */}
              <FileUploader
                onDataParsed={handleDataParsed}
                onClear={handleClearData}
                currentFileName={fileName}
              />

              {/* Text Area for raw summary data review */}
              <div className="text-right">
                <label className="block text-xs font-semibold text-slate-400 mb-2 font-sans">
                  محتوای متنی خام چت‌ها (تولید بریف بر اساس این متن انجام می‌شود)
                </label>
                <textarea
                  rows={4}
                  value={rawText}
                  onChange={(e) => {
                    setRawText(e.target.value);
                    setActiveSampleId(null);
                  }}
                  dir="rtl"
                  className="w-full p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all text-right placeholder:text-slate-500/80 caret-sky-500"
                  placeholder="پس از بارگذاری فایل، خلاصه رکوردهای فرآوری شده در این کادر نمایش داده می‌شود. همچنین می‌توانید متن خلاصه چت‌ها را به صورت دستی اینجا بنویسید یا کپی کنید..."
                />
              </div>

              {/* USER IDEA / PROPOSED SOLUTION BLOCK */}
              <div className="text-right space-y-2 pt-4 border-t border-slate-800/80">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <Lightbulb className="w-4 h-4 text-sky-400" />
                    <label className="block text-xs font-black text-slate-200 font-sans">
                      ایده، راهکار یا سناریوی پیشنهادی شما (اختیاری)
                    </label>
                  </div>
                  <span className="text-[9px] text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-full border border-sky-500/15 font-mono">
                    PROPOSED IDEA
                  </span>
                </div>
                <textarea
                  rows={4}
                  value={userIdea}
                  onChange={(e) => setUserIdea(e.target.value)}
                  dir="rtl"
                  className="w-full p-4 bg-slate-950/60 border border-slate-850 rounded-2xl text-xs text-slate-200 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all text-right placeholder:text-slate-500/80 caret-sky-500 border-dashed"
                  placeholder="اگر ایده یا راهکار مشخصی در ذهن دارید، اینجا وارد کنید. هوش مصنوعی آن را با کلمات تخصصی محصول ادغام کرده و به عنوان محور اصلی بخش To-Be و وضعیت مطلوب در بریف نهایی قرار می‌دهد..."
                />
                <p className="text-[10px] text-slate-500 font-sans">
                  ایده خام شما با ظرافت و ادبیات تخصصی تیم انتخابی بازنویسی شده و به شکل اصولی در بریف گنجانده می‌شود.
                </p>
              </div>

            </div>
          </div>

          {/* RIGHT COLUMN: MANUAL CONFIGURATION OVERRIDES */}
          <div className="space-y-6">
            <div className="bg-slate-900/40 border border-slate-850 rounded-2xl p-6 shadow-md space-y-6 text-right">
              
              <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
                <div className="w-2.5 h-2.5 bg-sky-500 rounded-full shadow-lg shadow-sky-500/50" />
                <h3 className="text-sm font-black text-slate-100 font-sans">
                  گام ۲: تنظیمات و پارامترهای کمکی بریف
                </h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans">
                    عنوان پیشنهادی بریف
                  </label>
                  <input
                    type="text"
                    value={titleOverride}
                    onChange={(e) => setTitleOverride(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
                    placeholder="مثال: رفع خطای اعمال کوپن تخفیف"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans">
                    تیم درخواست‌دهنده
                  </label>
                  <input
                    type="text"
                    value={teamOverride}
                    onChange={(e) => setTeamOverride(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans">
                    اونر و مسئول درخواست
                  </label>
                  <input
                    type="text"
                    value={ownerOverride}
                    onChange={(e) => setOwnerOverride(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 mb-1.5 font-sans">
                    میزان فوریت بریف محصول
                  </label>
                  <select
                    value={priorityOverride}
                    onChange={(e) => setPriorityOverride(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-950/60 border border-slate-850 rounded-xl text-xs text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
                  >
                    <option value="low">عادی (Low)</option>
                    <option value="medium">متوسط (Medium)</option>
                    <option value="high">بالا (High)</option>
                    <option value="critical">بحرانی و آنی (Critical)</option>
                  </select>
                </div>
              </div>

              {/* ACTION GENERATION BUTTON */}
              <div className="pt-4 border-t border-slate-800">
                <button
                  onClick={handleGeneratePrd}
                  disabled={loading || !rawText.trim()}
                  className={`w-full py-3.5 px-4 rounded-2xl font-black text-xs font-sans flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer ${
                    !rawText.trim()
                      ? "bg-slate-800 text-slate-500 cursor-not-allowed shadow-none border border-slate-850"
                      : "bg-gradient-to-l from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white shadow-sky-500/20 scale-100 hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {loading ? (
                    <>
                      <RotateCw className="w-4 h-4 animate-spin" />
                      در حال پردازش و استخراج با Gemini...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4.5 h-4.5" />
                      ساخت و تحلیل بریف محصول (PRD)
                    </>
                  )}
                </button>

                {error && (
                  <div className="mt-4 p-3 bg-rose-950/20 border border-rose-900/30 rounded-xl text-xs text-rose-400 flex items-start gap-2">
                    <AlertCircle className="w-4.5 h-4.5 shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}
              </div>

            </div>

            {/* SAVED HISTORY SECTION */}
            <SavedPrdsList
              items={savedPrds}
              onLoad={handleLoadSavedPrd}
              onDelete={handleDeleteSavedPrd}
            />

          </div>
        </section>

        {/* STEP 2: OUTPUT PRD WORKSPACE */}
        <section id="prd-output-workspace" className="space-y-6">
          <AnimatePresence mode="wait">
            
            {/* A. LOADING WORKSPACE */}
            {loading && (
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -15 }}
                className="bg-slate-900/40 border border-slate-850 rounded-2xl p-10 shadow-lg flex flex-col items-center justify-center text-center min-h-[350px] no-print"
              >
                <div className="relative flex items-center justify-center mb-6">
                  {/* Outer glowing wave */}
                  <span className="absolute inline-flex h-16 w-16 rounded-full bg-sky-400 opacity-25 animate-ping" />
                  <div className="p-5 bg-sky-500 text-white rounded-full shadow-lg shadow-sky-500/30">
                    <Sparkles className="w-8 h-8 animate-spin" style={{ animationDuration: "3s" }} />
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-100 font-sans">
                  هوش مصنوعی در حال تدوین بریف محصول...
                </h3>
                
                {/* Dynamically rotating analysis step messages */}
                <p className="text-xs text-sky-400 font-sans font-semibold mt-3 bg-sky-500/5 px-4 py-1.5 rounded-full border border-sky-500/10 transition-all duration-500">
                  {loadingSteps[loadingStep]}
                </p>

                <p className="text-[11px] text-slate-400 mt-6 max-w-sm font-sans leading-relaxed">
                  ما خلاصه چت‌های کاربران را بر اساس تکنیک‌های حرفه‌ای تحلیل نیاز (UX/CX) ارزیابی می‌کنیم تا دقیق‌ترین سند مسئله و اهداف را بسازیم.
                </p>
              </motion.div>
            )}

            {/* B. BLANK/PLACEHOLDER WORKSPACE */}
            {!loading && !generatedPrd && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-slate-900/40 border border-slate-850 rounded-2xl p-10 shadow-lg flex flex-col items-center justify-center text-center min-h-[300px] no-print"
              >
                <div className="p-4 bg-slate-950/60 text-slate-500 rounded-2xl mb-4 border border-slate-850">
                  <Database className="w-8 h-8" />
                </div>
                <h4 className="text-sm font-extrabold text-slate-400 font-sans">
                  بریف محصولی هنوز تولید نشده است
                </h4>
                <p className="text-xs text-slate-500 mt-2 max-w-md font-sans leading-relaxed">
                  لطفاً در پنل بالا فایل اکسل/CSV خود را بارگذاری کنید یا یکی از سناریوهای بهبود تجربه مشتری را کلیک کرده و سپس دکمه &ldquo;ساخت بریف محصول&rdquo; را بزنید.
                </p>
              </motion.div>
            )}

            {/* C. PRD RESULTS DETAILED VIEW */}
            {!loading && generatedPrd && (
              <motion.div
                initial={{ opacity: 0, scale: 0.99 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                {/* Fallback Notice Banner */}
                {generatedPrd.isFallback && (
                  <div className="bg-amber-950/25 border border-amber-500/20 rounded-2xl p-5 text-amber-300 text-xs leading-relaxed text-right flex items-start gap-4 shadow-lg shadow-amber-950/10 no-print">
                    <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400 shrink-0 mt-0.5">
                      <AlertCircle className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-black text-sm text-amber-200 mb-1">
                        تولید بریف با موتور بومی پایداری (Heuristic Engine)
                      </h4>
                      <p className="text-slate-300">
                        به دلیل محدودیت موقت سهمیه مدل‌های آنلاین هوش مصنوعی (Rate Limit / Quota Exceeded)، سیستم از تحلیلگر بومی و موتور واژگانی برای استخراج و طبقه‌بندی ساختار استاندارد بریف محصول استفاده کرد. 
                        شما همچنان می‌توانید از بخش <strong>«ویرایش تعاملی»</strong> سند را ویرایش کرده، بندهای مد نظر خود را اصلاح نموده یا آن را دانلود و در تاریخچه خود ذخیره نمایید. حدود ۱ دقیقه دیگر می‌توانید دکمه <strong>«بازتولید با هوش مصنوعی»</strong> را بزنید تا مجدداً با مدل آنلاین تلاش شود.
                      </p>
                    </div>
                  </div>
                )}

                {/* Tabs selection header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-2 no-print">
                  <div className="flex bg-slate-950 p-1 rounded-2xl self-start border border-slate-850">
                    <button
                      onClick={() => setActiveTab("preview")}
                      className={`px-4 py-2 text-xs font-black font-sans rounded-xl transition-all cursor-pointer ${
                        activeTab === "preview"
                          ? "bg-slate-900 text-sky-400 border border-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      📄 پیش‌نمایش سند رسمی بریف (A4)
                    </button>
                    <button
                      onClick={() => setActiveTab("edit")}
                      className={`px-4 py-2 text-xs font-black font-sans rounded-xl transition-all cursor-pointer ${
                        activeTab === "edit"
                          ? "bg-slate-900 text-sky-400 border border-slate-800 shadow-sm"
                          : "text-slate-400 hover:text-slate-200"
                      }`}
                    >
                      ✏️ ویرایش تعاملی و ثبت جزییات بریف
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSavePrd}
                      className="flex items-center gap-1.5 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl text-xs font-bold font-sans transition-all shadow-md shadow-emerald-500/10 cursor-pointer scale-100 active:scale-95 border border-emerald-400/20"
                    >
                      {saveSuccess ? (
                        <>
                          <Check className="w-4 h-4 animate-bounce" />
                          ذخیره شد!
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          ذخیره در تاریخچه مرورگر
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleGeneratePrd}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-800 hover:border-sky-500/50 text-slate-300 rounded-2xl text-xs font-semibold font-sans transition-all cursor-pointer"
                    >
                      <RotateCw className="w-4 h-4 text-slate-500" />
                      بازتولید با هوش مصنوعی
                    </button>
                  </div>
                </div>

                {/* Tab content view */}
                <div className="transition-all duration-300">
                  {activeTab === "preview" ? (
                    <PrdDocPreview data={generatedPrd} onChange={setGeneratedPrd} />
                  ) : (
                    <PrdEditor data={generatedPrd} onChange={setGeneratedPrd} />
                  )}
                </div>

              </motion.div>
            )}

          </AnimatePresence>
        </section>

      </main>

      {/* Decorative footer line */}
      <footer className="mt-auto border-t border-slate-900 py-6 text-center text-[10px] text-slate-500 no-print">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 font-sans font-medium">
          <span>سامانه بریف‌ساز هوشمند محصول • ویژه تیم‌های بهبود تجربه مشتری (CX) و فرآیند محور</span>
          <span>بر پایه مدل پیشرفته هوش مصنوعی Google Gemini-2.5</span>
        </div>
      </footer>

    </div>
  );
}
