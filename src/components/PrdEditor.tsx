import { PrdData } from "../types";
import { Info, Users, Target, ShieldAlert, ArrowLeftRight, Settings, ExternalLink } from "lucide-react";

interface PrdEditorProps {
  data: PrdData;
  onChange: (updated: PrdData) => void;
}

export default function PrdEditor({ data, onChange }: PrdEditorProps) {
  const updateField = (section: string, field: string, value: string) => {
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

  const formSectionHeader = (title: string, IconComponent: any) => (
    <div className="flex items-center gap-2 border-b border-slate-800 pb-3 mb-4">
      <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
        <IconComponent className="w-4 h-4" />
      </div>
      <h4 className="text-sm font-bold text-slate-100 font-sans">
        {title}
      </h4>
    </div>
  );

  return (
    <div dir="rtl" className="space-y-6 text-right">
      {/* 1. اطلاعات پایه */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("اطلاعات پایه بریف", Info)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              عنوان درخواست
            </label>
            <input
              type="text"
              value={data.title}
              onChange={(e) => updateField("root", "title", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              placeholder="مثال: بهبود خطاهای احراز هویت"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              تیم درخواست‌دهنده
            </label>
            <input
              type="text"
              value={data.team}
              onChange={(e) => updateField("root", "team", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              placeholder="مثال: بهبود تجربه مشتری"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              اونر درخواست
            </label>
            <input
              type="text"
              value={data.owner}
              onChange={(e) => updateField("root", "owner", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              placeholder="مثال: مریم بهاری"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              فوریت درخواست
            </label>
            <select
              value={data.priority}
              onChange={(e) => updateField("root", "priority", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            >
              <option value="low">عادی (Low)</option>
              <option value="medium">متوسط (Medium)</option>
              <option value="high">فوری و مهم (High)</option>
              <option value="critical">بحرانی (Critical)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              تیم مخاطب سند (Audience Team)
            </label>
            <input
              type="text"
              value={data.targetTeam || "Product"}
              onChange={(e) => updateField("root", "targetTeam", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              placeholder="مثال: Product"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              ایده و راهکار پیشنهادی شما
            </label>
            <input
              type="text"
              value={data.userIdea || ""}
              onChange={(e) => updateField("root", "userIdea", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              placeholder="ایده خود را شرح دهید..."
            />
          </div>
        </div>
      </div>

      {/* 2. مسئله */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("مسئله و ریشه نیاز", ShieldAlert)}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              دقیقاً چه چیزی الان درست کار نمی‌کند یا چه فرصتی وجود دارد؟
            </label>
            <textarea
              rows={3}
              value={data.problem.details}
              onChange={(e) => updateField("problem", "details", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              این نیاز از کجا آمده؟ [داده / بازخورد کاربر / کمپین / نیاز بیزینسی / تحلیل]
            </label>
            <textarea
              rows={2}
              value={data.problem.source}
              onChange={(e) => updateField("problem", "source", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              اگر حل نشود چه اثری دارد؟
            </label>
            <textarea
              rows={2}
              value={data.problem.impact}
              onChange={(e) => updateField("problem", "impact", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 3. هدف */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("هدف و معیارهای سنجش موفقیت", Target)}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              این درخواست قرار است چه نتیجه‌ای ایجاد کند؟
            </label>
            <textarea
              rows={2}
              value={data.goal.outcome}
              onChange={(e) => updateField("goal", "outcome", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              موفقیت آن با چه KPI یا Outcomeای سنجیده می‌شود؟
            </label>
            <textarea
              rows={2}
              value={data.goal.kpi}
              onChange={(e) => updateField("goal", "kpi", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 4. کاربر هدف */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("کاربر هدف و نقاط درد", Users)}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              این درخواست برای چه کاربر یا چه سگمنتی است؟
            </label>
            <textarea
              rows={2}
              value={data.targetUser.segment}
              onChange={(e) => updateField("targetUser", "segment", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              این کاربر در چه موقعیتی با این نیاز مواجه می‌شود؟
            </label>
            <textarea
              rows={2}
              value={data.targetUser.scenario}
              onChange={(e) => updateField("targetUser", "scenario", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              مهم‌ترین Pain Point او چیست؟
            </label>
            <textarea
              rows={2}
              value={data.targetUser.painPoint}
              onChange={(e) => updateField("targetUser", "painPoint", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 5. وضعیت فعلی و وضعیت مطلوب */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("جریان کاربری و اصطکاک‌ها (As-Is / To-Be)", ArrowLeftRight)}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h5 className="text-xs font-bold text-sky-400 font-sans border-b border-slate-800 pb-2">
              وضعیت فعلی (As-Is)
            </h5>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 font-sans">
                الان جریان فعلی چگونه است؟
              </label>
              <textarea
                rows={3}
                value={data.currentStatus.flow}
                onChange={(e) => updateField("currentStatus", "flow", e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 font-sans">
                مشکل یا اصطکاک اصلی کجاست؟
              </label>
              <textarea
                rows={3}
                value={data.currentStatus.friction}
                onChange={(e) => updateField("currentStatus", "friction", e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h5 className="text-xs font-bold text-emerald-400 font-sans border-b border-slate-800 pb-2">
              وضعیت مطلوب (To-Be)
            </h5>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 font-sans">
                بعد از حل مسئله چه تغییری باید ایجاد شود؟
              </label>
              <textarea
                rows={3}
                value={data.desiredStatus.change}
                onChange={(e) => updateField("desiredStatus", "change", e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1 font-sans">
                از نگاه شما چه زمانی این درخواست موفق محسوب می‌شود؟
              </label>
              <textarea
                rows={3}
                value={data.desiredStatus.success}
                onChange={(e) => updateField("desiredStatus", "success", e.target.value)}
                className="w-full px-3 py-2 bg-slate-950/60 border border-slate-800 rounded-xl text-xs text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* 6. محدودیت‌ها و وابستگی‌ها */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("محدودیت‌ها و وابستگی‌ها", Settings)}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              محدودیت زمانی
            </label>
            <textarea
              rows={2}
              value={data.constraints.timeline}
              onChange={(e) => updateField("constraints", "timeline", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              محدودیت فنی / عملیاتی / حقوقی
            </label>
            <textarea
              rows={2}
              value={data.constraints.technical}
              onChange={(e) => updateField("constraints", "technical", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              وابستگی به تیم، کمپین، سرویس یا تاریخ مشخص
            </label>
            <textarea
              rows={2}
              value={data.constraints.dependencies}
              onChange={(e) => updateField("constraints", "dependencies", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 7. شواهد و رفرنس‌ها */}
      <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-md">
        {formSectionHeader("شواهد، رفرنس‌ها و مستندات", ExternalLink)}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              داشبورد یا داده مرتبط
            </label>
            <textarea
              rows={2}
              value={data.evidence.data}
              onChange={(e) => updateField("evidence", "data", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              بازخورد مستقیم کاربران (نقل‌قول‌های چت‌ها)
            </label>
            <textarea
              rows={3}
              value={data.evidence.feedback}
              onChange={(e) => updateField("evidence", "feedback", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              نمونه رقبا و بنچ‌مارک بازار
            </label>
            <textarea
              rows={2}
              value={data.evidence.competitors}
              onChange={(e) => updateField("evidence", "competitors", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-400 mb-1.5 font-sans">
              لینک فایل‌ها، اسکرین‌شات‌ها یا مستندات مرتبط
            </label>
            <textarea
              rows={2}
              value={data.evidence.links}
              onChange={(e) => updateField("evidence", "links", e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950/60 border border-slate-800 rounded-xl text-sm text-slate-100 font-sans leading-relaxed focus:outline-none focus:ring-2 focus:ring-sky-500/15 focus:border-sky-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
