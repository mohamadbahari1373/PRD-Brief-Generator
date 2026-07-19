import { SavedPrd } from "../types";
import { History, Calendar, Eye, Trash2 } from "lucide-react";

interface SavedPrdsListProps {
  items: SavedPrd[];
  onLoad: (item: SavedPrd) => void;
  onDelete: (id: string) => void;
}

export default function SavedPrdsList({ items, onLoad, onDelete }: SavedPrdsListProps) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div dir="rtl" className="w-full text-right bg-slate-900/60 backdrop-blur-md border border-slate-800 rounded-2xl p-5 shadow-lg">
      <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <div className="p-1.5 bg-sky-500/10 text-sky-400 rounded-lg">
          <History className="w-4 h-4" />
        </div>
        <h4 className="text-sm font-bold text-slate-100 font-sans">
          تاریخچه بریف‌های محصول ذخیره شده شما ({items.length} سند)
        </h4>
      </div>

      <div className="space-y-3 max-h-[250px] overflow-y-auto pr-1">
        {items.map((item) => {
          const formattedDate = new Date(item.timestamp).toLocaleDateString("fa-IR", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          });

          return (
            <div
              key={item.id}
              className="group flex flex-col sm:flex-row sm:items-center sm:justify-between p-3.5 bg-slate-950/40 border border-slate-800/80 rounded-xl hover:border-sky-500/40 transition-all gap-3"
            >
              <div className="flex items-start gap-3 text-right">
                <div className="mt-1 shrink-0">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full font-sans ${
                    item.data.priority === "critical"
                      ? "bg-rose-950/50 text-rose-400 border border-rose-900/50"
                      : item.data.priority === "high"
                      ? "bg-orange-950/50 text-orange-400 border border-orange-900/50"
                      : "bg-blue-950/50 text-blue-400 border border-blue-900/50"
                  }`}>
                    {item.data.priority === "critical" ? "بحرانی" : item.data.priority === "high" ? "فوری" : "عادی"}
                  </span>
                </div>
                <div className="space-y-1">
                  <h5 className="text-xs font-bold text-slate-100 font-sans group-hover:text-sky-400 transition-colors">
                    {item.data.title || "بریف بدون عنوان"}
                  </h5>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 font-sans">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formattedDate}
                    </span>
                    <span>توسط: {item.data.owner || "کاربر"}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                <button
                  onClick={() => onLoad(item)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 hover:bg-sky-950/40 border border-slate-800 hover:border-sky-500/50 text-slate-300 rounded-lg text-xs font-semibold font-sans transition-all cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-sky-400" />
                  بارگذاری
                </button>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1.5 text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 border border-transparent hover:border-rose-900/30 rounded-lg transition-all cursor-pointer"
                  title="حذف سند"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
