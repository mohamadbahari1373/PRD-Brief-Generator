import { SAMPLE_DATASETS, SampleDataset, convertToCSV } from "../sampleData";
import { Sparkles, Check, Flame } from "lucide-react";

interface SampleDataButtonProps {
  onSelectDataset: (dataset: SampleDataset, csvText: string) => void;
  activeId: string | null;
}

export default function SampleDataButton({ onSelectDataset, activeId }: SampleDataButtonProps) {
  return (
    <div className="w-full text-right rtl">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-sky-400 shrink-0 animate-pulse" />
        <h4 className="text-sm font-bold text-slate-100 font-sans">
          یا انتخاب از بین سناریوهای پُرکاربرد آماده (بهبود تجربه مشتری):
        </h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {SAMPLE_DATASETS.map((dataset) => {
          const isActive = activeId === dataset.id;
          const csvText = convertToCSV(dataset);
          
          return (
            <button
              key={dataset.id}
              onClick={() => onSelectDataset(dataset, csvText)}
              className={`group relative text-right p-4 rounded-2xl border text-slate-300 transition-all duration-300 flex flex-col justify-between h-full cursor-pointer hover:shadow-lg ${
                isActive
                  ? "bg-sky-950/30 border-sky-400 ring-2 ring-sky-400/20"
                  : "bg-slate-900/40 border-slate-800/80 hover:border-sky-500/40"
              }`}
            >
              {/* Active check indicator */}
              {isActive && (
                <span className="absolute top-3 left-3 bg-sky-500 text-white rounded-full p-0.5 shadow-sm">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </span>
              )}

              <div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-sans uppercase tracking-wider ${
                    dataset.priority === "critical"
                      ? "bg-rose-950/50 text-rose-400 border border-rose-900/30"
                      : dataset.priority === "high"
                      ? "bg-orange-950/50 text-orange-400 border border-orange-900/30"
                      : "bg-blue-950/50 text-blue-400 border border-blue-900/30"
                  }`}>
                    {dataset.priority === "critical" && "فوری و بحرانی"}
                    {dataset.priority === "high" && "اولویت بالا"}
                    {dataset.priority === "medium" && "اولویت متوسط"}
                  </span>
                  
                  {dataset.priority === "critical" && (
                    <Flame className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                  )}
                </div>

                <h5 className="text-sm font-bold text-slate-100 font-sans group-hover:text-sky-400 transition-colors">
                  {dataset.name.replace(/_/g, " ")}
                </h5>
                <p className="text-xs text-slate-400 mt-2 font-sans leading-relaxed line-clamp-2">
                  {dataset.description}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[10px] text-slate-500 font-sans font-medium w-full">
                <span>تیم: {dataset.team.split(" ")[0]}</span>
                <span>تعداد چت‌ها: {dataset.chats.length} رکورد</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
