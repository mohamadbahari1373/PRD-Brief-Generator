import { useState } from "react";
import { PrdData } from "../types";
import { Copy, Download, Printer, Check, FileText, AlertTriangle, Edit2 } from "lucide-react";

interface PrdDocPreviewProps {
  data: PrdData;
  onChange?: (updated: PrdData) => void;
}

export function getPrdMarkdown(data: PrdData): string {
  const priorityText =
    data.priority === "critical"
      ? "بحرانی (Critical)"
      : data.priority === "high"
      ? "بالا (High)"
      : data.priority === "medium"
      ? "متوسط (Medium)"
      : "عادی (Low)";

  return `---
عنوان درخواست: ${data.title}
تیم درخواست‌دهنده: ${data.team}
تیم مخاطب سند: ${data.targetTeam || "Product"} Team
اونر درخواست: ${data.owner}
تاریخ: ${data.date}
فوریت: ${priorityText}
---

> **اطلاعیه مهم:** این Brief برای تعریف مسئله و نیاز نوشته می‌شود، نه برای تعیین راه‌حل نهایی. مسئول تبدیل Brief به PRD و تعریف راهکار محصولی، تیم Product است.

# بریف محصول: ${data.title}

## ۱. اطلاعات پایه درخواست
* **تیم درخواست‌دهنده:** ${data.team}
* **تیم مخاطب سند (مخاطب اصلی):** ${data.targetTeam || "Product"} Team
* **صاحب (Owner) درخواست:** ${data.owner}
* **تاریخ ثبت اولیه:** ${data.date}
* **سطح فوریت:** ${priorityText}

## ۲. تعریف مسئله و ریشه نیاز
### الف) دقیقاً چه چیزی الان درست کار نمی‌کند یا چه فرصتی وجود دارد؟
${data.problem.details}

### ب) این نیاز از کجا آمده؟ [داده / بازخورد کاربر / کمپین / نیاز بیزینسی / تحلیل]
${data.problem.source}

### ج) اگر حل نشود چه اثری دارد؟ (تاثیر مخرب روی کاربر و بیزینس)
${data.problem.impact}

## ۳. اهداف بریف و شاخص‌های موفقیت
### الف) این درخواست قرار است چه نتیجه‌ای ایجاد کند؟
${data.goal.outcome}

### ب) موفقیت آن با چه KPI یا Outcomeای سنجیده می‌شود?
${data.goal.kpi}

## ۴. تعریف کاربر هدف و سناریو
### الف) بخش کاربران هدف (Segment):
${data.targetUser.segment}

### ب) موقعیت و سناریوی مواجهه با نیاز:
${data.targetUser.scenario}

### ج) مهم‌ترین نقطه درد کاربر (Pain Point):
${data.targetUser.painPoint}

## ۵. جریان کاربری فعلی و مطلوب (As-Is / To-Be)
### الف) جریان فعلی کاربری (As-Is):
${data.currentStatus.flow}

### ب) اصطکاک و مشکل اصلی:
${data.currentStatus.friction}

### ج) جریان مطلوب نهایی (To-Be):
${data.desiredStatus.change}

### د) شرایط موفقیت تجربه کاربری:
${data.desiredStatus.success}

## ۶. محدودیت‌ها و وابستگی‌ها (Constraints)
* **محدودیت زمانی:** ${data.constraints.timeline}
* **محدودیت‌های فنی/عملیاتی/حقوقی:** ${data.constraints.technical}
* **وابستگی به کمپین/تاریخ/تیم:** ${data.constraints.dependencies}

## ۷. شواهد و مراجع تأییدکننده (Evidence)
* **داشبورد یا داده آماری:** ${data.evidence.data}
* **نمونه رقبا و بنچ‌مارک بازار:** ${data.evidence.competitors}
* **بازخورد و نقل‌قول‌های منتخب کاربران:** ${data.evidence.feedback}
* **لینک فایل‌ها، اسکرین‌شات‌ها و پیوست‌ها:** ${data.evidence.links}

---
### بخش امضا و تأیید سازمانی:
* **تهیه و تنظیم بریف:** ${data.owner} (تیم ${data.team})
* **تایید و دریافت بریف:** تیم مدیریت محصول (Product Team)
`;
}

export default function PrdDocPreview({ data, onChange }: PrdDocPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const handleCopy = () => {
    const md = getPrdMarkdown(data);
    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const md = getPrdMarkdown(data);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `Product_Brief_${data.title.replace(/\s+/g, "_")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  const updateField = (section: string, field: string, value: string) => {
    if (!onChange) return;
    if (section === "root") {
      onChange({
        ...data,
        [field]: value,
      });
    } else {
      onChange({
        ...data,
        [section]: {
          ...(data[section as keyof PrdData] as any),
          [field]: value,
        },
      });
    }
  };

  const priorityColorClass =
    data.priority === "critical"
      ? "bg-rose-500/10 border-rose-500/30 text-rose-400"
      : data.priority === "high"
      ? "bg-amber-500/10 border-amber-500/30 text-amber-400"
      : data.priority === "medium"
      ? "bg-sky-500/10 border-sky-500/30 text-sky-400"
      : "bg-slate-500/10 border-slate-500/30 text-slate-400";

  const priorityLabel =
    data.priority === "critical"
      ? "بحرانی (Critical)"
      : data.priority === "high"
      ? "بالا (High)"
      : data.priority === "medium"
      ? "متوسط (Medium)"
      : "عادی (Low)";

  return (
    <div dir="rtl" className="w-full text-right">
      {/* Visual Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6 bg-slate-900/50 p-4 rounded-2xl border border-slate-800 no-print">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-sky-500/10 rounded-xl text-sky-400 border border-sky-500/10">
            <FileText className="w-5 h-5 shrink-0" />
          </div>
          <div className="text-right">
            <span className="text-xs font-black text-slate-200 font-sans block">
              پیش‌نمایش رسمی بریف محصول
            </span>
            <span className="text-[10px] text-slate-500 font-sans block mt-0.5">
              تنظیم‌شده در قالب بوم استاندارد و یکپارچه سازمانی
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {onChange && (
            <button
              onClick={() => setIsEditing(!isEditing)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold font-sans transition-all cursor-pointer ${
                isEditing
                  ? "bg-amber-500/15 border border-amber-500/40 text-amber-300"
                  : "bg-slate-950 hover:bg-sky-950/20 border border-slate-800 hover:border-sky-500/40 text-slate-300"
              }`}
            >
              {isEditing ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  مشاهده پیش‌نمایش نهایی
                </>
              ) : (
                <>
                  <Edit2 className="w-4 h-4 text-amber-400" />
                  ویرایش مستقیم و سریع سند
                </>
              )}
            </button>
          )}

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-sky-950/20 border border-slate-800 hover:border-sky-500/40 rounded-xl text-xs font-bold font-sans text-slate-300 transition-all cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                کپی شد!
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-slate-500" />
                کپی متن Markdown
              </>
            )}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-950 hover:bg-sky-950/20 border border-slate-800 hover:border-sky-500/40 rounded-xl text-xs font-bold font-sans text-slate-300 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-slate-500" />
            دانلود فایل داکیومنت (.md)
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold font-sans transition-all cursor-pointer shadow-md shadow-sky-500/15"
          >
            <Printer className="w-4 h-4" />
            چاپ بریف محصول
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mb-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-300 text-xs font-sans leading-relaxed text-right flex items-center gap-2 no-print">
          <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span>
            <strong>حالت ویرایش فعال است:</strong> تغییرات شما همزمان بر روی بریف ذخیره می‌شود. برای مشاهده فرمت نهایی، مجدداً دکمه «مشاهده پیش‌نمایش نهایی» را بزنید.
          </span>
        </div>
      )}

      {/* Visual Integrated Document container - Matches Dark Slate Premium UI and print-friendly on paper */}
      <div className="print-area bg-slate-900/40 backdrop-blur-md border border-slate-800 shadow-2xl rounded-3xl p-6 sm:p-10 font-sans text-slate-100 max-w-4xl mx-auto space-y-8 relative overflow-hidden text-right print:bg-white print:text-slate-900 print:shadow-none print:border-none print:p-0">
        
        {/* Document Border Frame Decor */}
        <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-l from-sky-500 via-sky-600 to-indigo-650 print:hidden" />

        {/* Corporate Header Block */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/80 pb-5 gap-4 print:border-slate-200">
          <div className="text-right space-y-1 w-full sm:w-auto">
            <span className="text-[10px] uppercase font-black tracking-widest text-sky-400 font-sans block print:text-sky-600">
              (PRODUCT BRIEF) سند بریف رسمی محصول
            </span>
            {isEditing ? (
              <div className="mt-1 w-full">
                <span className="text-[10px] text-slate-400 block mb-1">عنوان بهبود:</span>
                <input
                  type="text"
                  value={data.title}
                  onChange={(e) => updateField("root", "title", e.target.value)}
                  className="w-full max-w-lg bg-slate-950 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-1.5 rounded-xl text-sm font-black text-slate-100 font-sans text-right"
                  placeholder="عنوان بریف"
                />
              </div>
            ) : (
              <h1 className="text-xl sm:text-2xl font-black text-slate-100 font-sans leading-snug print:text-slate-900">
                بریف بهبود: {data.title || "بدون عنوان"}
              </h1>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <div className="bg-slate-950/60 px-3 py-1.5 border border-slate-850 rounded-xl text-right print:bg-slate-50 print:border-slate-200">
              <div className="text-[9px] text-slate-500 font-bold print:text-slate-400">تاریخ تنظیم بریف</div>
              {isEditing ? (
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => updateField("root", "date", e.target.value)}
                  className="w-24 bg-slate-950 border border-slate-800 focus:border-sky-500 px-2 py-0.5 rounded text-xs text-slate-200 text-center font-mono mt-0.5"
                />
              ) : (
                <div className="text-xs font-black font-sans text-slate-300 mt-0.5 print:text-slate-700">{data.date || "—"}</div>
              )}
            </div>
            <div className={`px-3 py-1.5 border rounded-xl text-right ${priorityColorClass} print:bg-slate-50 print:border-slate-200 print:text-slate-800`}>
              <div className="text-[9px] opacity-80 font-bold font-sans">سطح فوریت</div>
              {isEditing ? (
                <select
                  value={data.priority}
                  onChange={(e) => updateField("root", "priority", e.target.value)}
                  className="bg-slate-950 border border-slate-800 focus:border-sky-500 rounded text-[11px] text-slate-200 font-sans p-0.5 mt-0.5"
                >
                  <option value="low">عادی (Low)</option>
                  <option value="medium">متوسط (Medium)</option>
                  <option value="high">بالا (High)</option>
                  <option value="critical">بحرانی (Critical)</option>
                </select>
              ) : (
                <div className="text-xs font-black font-sans mt-0.5">{priorityLabel}</div>
              )}
            </div>
          </div>
        </div>

        {/* 1. CRITICAL DISCLAIMER CALLOUT - Perfect RTL placement */}
        <div className="bg-sky-950/20 border border-sky-500/10 rounded-2xl p-4 sm:p-5 flex items-start gap-4 text-right shadow-lg shadow-sky-950/5 print:bg-slate-50 print:border-slate-200">
          <div className="p-2.5 bg-sky-500/10 text-sky-400 rounded-xl shrink-0 mt-0.5 border border-sky-500/10 print:bg-slate-100 print:text-slate-700 print:border-slate-200">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h5 className="text-xs font-black text-sky-300 font-sans print:text-slate-900">
              بیانیه مأموریت و محدوده سند (سیاست کاری محصول)
            </h5>
            <p className="text-xs font-medium text-slate-300 mt-1.5 leading-relaxed print:text-slate-600">
              «این Brief برای تعریف مسئله و نیاز نوشته می‌شود، نه برای تعیین راه‌حل نهایی. مسئول تبدیل Brief به PRD و تعریف راهکار محصولی، تیم Product است.»
            </p>
          </div>
        </div>

        {/* ۱. اطلاعات پایه درخواست */}
        <section className="space-y-3">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۱. اطلاعات پایه درخواست
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 print:bg-slate-50 print:border-slate-200">
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">تیم درخواست‌دهنده</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.team}
                  onChange={(e) => updateField("root", "team", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 px-2 py-1 rounded-lg text-xs font-black text-slate-200 text-right mt-1"
                />
              ) : (
                <div className="text-xs font-black text-slate-200 print:text-slate-800">{data.team || "—"}</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">تیم مخاطب سند (مخاطب اصلی)</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.targetTeam || "Product"}
                  onChange={(e) => updateField("root", "targetTeam", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 px-2 py-1 rounded-lg text-xs font-black text-slate-200 text-right mt-1"
                />
              ) : (
                <div className="text-xs font-black text-sky-400 print:text-sky-700">{data.targetTeam || "Product"} Team</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">صاحب (Owner) درخواست</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.owner}
                  onChange={(e) => updateField("root", "owner", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 px-2 py-1 rounded-lg text-xs font-black text-slate-200 text-right mt-1"
                />
              ) : (
                <div className="text-xs font-black text-slate-200 print:text-slate-800">{data.owner || "—"}</div>
              )}
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-500 block mb-0.5">تاریخ ثبت اولیه</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.date}
                  onChange={(e) => updateField("root", "date", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 px-2 py-1 rounded-lg text-xs font-black text-slate-200 text-right mt-1"
                />
              ) : (
                <div className="text-xs font-black text-slate-200 font-sans print:text-slate-800">{data.date || "—"}</div>
              )}
            </div>
          </div>
        </section>

        {/* ۲. تعریف مسئله و ریشه نیاز */}
        <section className="space-y-4">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۲. تعریف مسئله و ریشه نیاز
            </h3>
          </div>
          <div className="space-y-4">
            <div className="pr-3.5 border-r border-slate-800 pl-1 print:border-slate-300">
              <h4 className="text-xs font-bold text-slate-400 mb-1.5">
                دقیقاً چه چیزی الان درست کار نمی‌کند یا چه فرصتی وجود دارد؟
              </h4>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.problem.details}
                  onChange={(e) => updateField("problem", "details", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-2 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right mt-1"
                />
              ) : (
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap print:text-slate-700">
                  {data.problem.details || "—"}
                </p>
              )}
            </div>

            <div className="pr-3.5 border-r border-slate-800 pl-1 print:border-slate-300">
              <h4 className="text-xs font-bold text-slate-400 mb-1.5">
                این نیاز از کجا آمده؟ [داده / بازخورد کاربر / کمپین / نیاز بیزینسی / تحلیل]
              </h4>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.problem.source}
                  onChange={(e) => updateField("problem", "source", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-2 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right mt-1"
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed font-sans whitespace-pre-wrap print:text-slate-600">
                  {data.problem.source || "—"}
                </p>
              )}
            </div>

            <div className="pr-3.5 border-r border-rose-500/40 pl-1 print:border-slate-300">
              <h4 className="text-xs font-bold text-rose-400 mb-1.5 print:text-rose-700">
                اگر حل نشود چه اثری دارد؟ (تاثیر مخرب روی کاربر و بیزینس)
              </h4>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.problem.impact}
                  onChange={(e) => updateField("problem", "impact", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-2 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right mt-1 animate-pulse border-dashed border-rose-500/35"
                />
              ) : (
                <p className="text-xs text-rose-300 font-medium leading-relaxed whitespace-pre-wrap print:text-rose-800">
                  {data.problem.impact || "—"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ۳. اهداف بریف و شاخص‌های موفقیت */}
        <section className="space-y-3">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۳. اهداف بریف و شاخص‌های موفقیت
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-slate-950/20 p-4 rounded-xl border border-slate-850/60 print:bg-slate-50 print:border-slate-200">
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-sky-400 print:text-slate-800">
                این درخواست قرار است چه نتیجه‌ای ایجاد کند؟
              </h4>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.goal.outcome}
                  onChange={(e) => updateField("goal", "outcome", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-2 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right mt-1"
                />
              ) : (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap print:text-slate-600">
                  {data.goal.outcome || "—"}
                </p>
              )}
            </div>
            <div className="space-y-1 border-t md:border-t-0 md:border-r border-slate-800 md:pr-4 pt-3 md:pt-0 print:border-slate-200">
              <h4 className="text-xs font-bold text-emerald-400 print:text-emerald-700">
                موفقیت آن با چه KPI یا Outcomeای سنجیده می‌شود؟
              </h4>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.goal.kpi}
                  onChange={(e) => updateField("goal", "kpi", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-2 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right mt-1"
                />
              ) : (
                <p className="text-xs text-slate-200 leading-relaxed whitespace-pre-wrap print:text-slate-700">
                  {data.goal.kpi || "—"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ۴. تعریف کاربر هدف و سناریو */}
        <section className="space-y-3">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۴. تعریف کاربر هدف و سناریو
            </h3>
          </div>
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 print:bg-slate-50 print:border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">بخش کاربران هدف (Segment)</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={data.targetUser.segment}
                    onChange={(e) => updateField("targetUser", "segment", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 px-2.5 py-1 rounded-xl text-xs text-slate-200 text-right mt-1"
                  />
                ) : (
                  <p className="text-xs font-black text-slate-200 print:text-slate-800">{data.targetUser.segment || "—"}</p>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">مهم‌ترین نقطه درد کاربر (Pain Point)</span>
                {isEditing ? (
                  <input
                    type="text"
                    value={data.targetUser.painPoint}
                    onChange={(e) => updateField("targetUser", "painPoint", e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 px-2.5 py-1 rounded-xl text-xs text-slate-200 text-right mt-1"
                  />
                ) : (
                  <p className="text-xs text-rose-400 font-black inline-block bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[11px] print:bg-rose-50 print:text-rose-700 print:border-rose-200">{data.targetUser.painPoint || "—"}</p>
                )}
              </div>
            </div>
            <div className="border-t border-slate-800/80 pt-3 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">موقعیت و سناریوی مواجهه با نیاز</span>
              {isEditing ? (
                <textarea
                  rows={3}
                  value={data.targetUser.scenario}
                  onChange={(e) => updateField("targetUser", "scenario", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-2 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right mt-1"
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-600">
                  {data.targetUser.scenario || "—"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ۵. جریان کاربری فعلی و مطلوب (As-Is / To-Be) */}
        <section className="space-y-4">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۵. جریان کاربری فعلی و مطلوب (As-Is / To-Be)
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* As-Is */}
            <div className="border border-slate-850 rounded-xl p-4 bg-slate-950/20 print:bg-slate-50 print:border-slate-200">
              <h4 className="text-xs font-black text-rose-400 border-b border-slate-800 pb-2 mb-2 print:text-rose-700 print:border-slate-200">
                جریان فعلی کاربری (As-Is)
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block mb-0.5">جریان فعلی</span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={data.currentStatus.flow}
                      onChange={(e) => updateField("currentStatus", "flow", e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-1.5 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-600">{data.currentStatus.flow || "—"}</p>
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-rose-400 block mb-0.5 print:text-rose-700">اصطکاک و مشکل اصلی</span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={data.currentStatus.friction}
                      onChange={(e) => updateField("currentStatus", "friction", e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-1.5 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right border-dashed border-rose-500/35"
                    />
                  ) : (
                    <p className="text-xs text-rose-300/90 font-bold leading-relaxed whitespace-pre-wrap print:text-rose-800">{data.currentStatus.friction || "—"}</p>
                  )}
                </div>
              </div>
            </div>

            {/* To-Be */}
            <div className="border border-slate-850 rounded-xl p-4 bg-slate-950/20 print:bg-slate-50 print:border-slate-200">
              <h4 className="text-xs font-black text-emerald-400 border-b border-slate-800 pb-2 mb-2 print:text-emerald-700 print:border-slate-200">
                جریان مطلوب نهایی (To-Be)
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-[9px] font-bold text-slate-500 block mb-0.5">تغییر مورد انتظار</span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={data.desiredStatus.change}
                      onChange={(e) => updateField("desiredStatus", "change", e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-1.5 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right"
                    />
                  ) : (
                    <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-600">{data.desiredStatus.change || "—"}</p>
                  )}
                </div>
                <div>
                  <span className="text-[9px] font-bold text-emerald-400 block mb-0.5 print:text-emerald-700">شرایط موفقیت</span>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={data.desiredStatus.success}
                      onChange={(e) => updateField("desiredStatus", "success", e.target.value)}
                      className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 focus:ring-1 focus:ring-sky-500/20 px-3 py-1.5 rounded-xl text-xs text-slate-200 font-sans leading-relaxed text-right border-dashed border-emerald-500/35"
                    />
                  ) : (
                    <p className="text-xs text-emerald-300/90 font-bold leading-relaxed whitespace-pre-wrap print:text-emerald-800">{data.desiredStatus.success || "—"}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ۶. محدودیت‌ها و وابستگی‌ها */}
        <section className="space-y-3">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۶. محدودیت‌ها و وابستگی‌ها
            </h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="border border-slate-850 p-3.5 rounded-xl bg-slate-950/20 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-slate-500 block mb-1">محدودیت زمانی</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.constraints.timeline}
                  onChange={(e) => updateField("constraints", "timeline", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right"
                />
              ) : (
                <p className="text-slate-200 font-semibold leading-relaxed whitespace-pre-wrap print:text-slate-700">{data.constraints.timeline || "—"}</p>
              )}
            </div>
            <div className="border border-slate-850 p-3.5 rounded-xl bg-slate-950/20 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-slate-500 block mb-1">محدودیت‌های فنی/عملیاتی/حقوقی</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.constraints.technical}
                  onChange={(e) => updateField("constraints", "technical", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right"
                />
              ) : (
                <p className="text-slate-200 font-semibold leading-relaxed whitespace-pre-wrap print:text-slate-700">{data.constraints.technical || "—"}</p>
              )}
            </div>
            <div className="border border-slate-850 p-3.5 rounded-xl bg-slate-950/20 print:bg-slate-50 print:border-slate-200">
              <span className="font-bold text-slate-500 block mb-1">وابستگی به کمپین/تاریخ/تیم</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.constraints.dependencies}
                  onChange={(e) => updateField("constraints", "dependencies", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right"
                />
              ) : (
                <p className="text-slate-200 font-semibold leading-relaxed whitespace-pre-wrap print:text-slate-700">{data.constraints.dependencies || "—"}</p>
              )}
            </div>
          </div>
        </section>

        {/* ۷. شواهد و مراجع تأییدکننده */}
        <section className="space-y-3">
          <div className="border-r-4 border-sky-500 pr-3">
            <h3 className="text-base font-black text-slate-100 font-sans print:text-slate-900">
              ۷. شواهد و مراجع تأییدکننده
            </h3>
          </div>
          <div className="space-y-3 bg-slate-950/40 p-4 rounded-xl border border-slate-850/80 print:bg-slate-50 print:border-slate-200">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">داشبورد یا داده آماری</span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={data.evidence.data}
                    onChange={(e) => updateField("evidence", "data", e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-600">{data.evidence.data || "—"}</p>
                )}
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-500 block mb-0.5">نمونه رقبا و بنچ‌مارک بازار</span>
                {isEditing ? (
                  <textarea
                    rows={2}
                    value={data.evidence.competitors}
                    onChange={(e) => updateField("evidence", "competitors", e.target.value)}
                    className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right"
                  />
                ) : (
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap print:text-slate-600">{data.evidence.competitors || "—"}</p>
                )}
              </div>
            </div>
            <div className="border-t border-slate-800/80 pt-3 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">بازخورد و نقل‌قول‌های منتخب کاربران</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.evidence.feedback}
                  onChange={(e) => updateField("evidence", "feedback", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right"
                />
              ) : (
                <p className="text-xs text-slate-300 leading-relaxed font-sans italic whitespace-pre-wrap bg-slate-900/50 p-3 rounded-xl border border-slate-850 print:bg-white print:border-slate-200 print:text-slate-600">
                  «{data.evidence.feedback || "—"}»
                </p>
              )}
            </div>
            <div className="border-t border-slate-800/80 pt-3 print:border-slate-200">
              <span className="text-[10px] font-bold text-slate-500 block mb-1">لینک فایل‌ها، اسکرین‌شات‌ها و پیوست‌ها</span>
              {isEditing ? (
                <textarea
                  rows={2}
                  value={data.evidence.links}
                  onChange={(e) => updateField("evidence", "links", e.target.value)}
                  className="w-full bg-slate-950/60 border border-slate-800 focus:border-sky-500 px-2.5 py-1.5 rounded-lg text-xs text-slate-200 font-sans text-right font-mono"
                />
              ) : (
                <p className="text-xs text-slate-400 font-mono whitespace-pre-wrap print:text-slate-500">{data.evidence.links || "—"}</p>
              )}
            </div>
          </div>
        </section>

        {/* Standard Corporate Sign-Off routing */}
        <div className="border-t border-slate-800 pt-5 mt-8 print:border-slate-300">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-5 text-[10px] text-slate-500">
            <div className="text-right space-y-0.5 w-full sm:w-auto">
              <div className="font-bold text-slate-400">تهیه و تنظیم بریف</div>
              <div className="text-slate-200 font-black print:text-slate-800">{data.owner || "کارشناس بهبود تجربه مشتری"} (تیم {data.team || "بهبود تجربه"})</div>
              <div className="text-slate-500">تاریخ تایید نهایی بریف: _________________</div>
            </div>
            <div className="text-right space-y-0.5 sm:text-left w-full sm:w-auto">
              <div className="font-bold text-slate-400 sm:text-left">دریافت و تأیید بریف محصول</div>
              <div className="text-slate-200 font-black text-right sm:text-left print:text-slate-800">تیم مدیریت محصول (Product Team)</div>
              <div className="text-slate-500 text-right sm:text-left">تاریخ آغاز تحلیل و نگارش PRD: _________________</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
