import React, { useState, useRef } from "react";
import { motion } from "motion/react";
import { Upload, FileSpreadsheet, Trash2, Check, AlertCircle, Table } from "lucide-react";
import { parseUploadedFile, ParsedSheetData } from "../utils/fileParser";

interface FileUploaderProps {
  onDataParsed: (data: ParsedSheetData & { fileName: string }) => void;
  onClear: () => void;
  currentFileName: string | null;
}

export default function FileUploader({ onDataParsed, onClear, currentFileName }: FileUploaderProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [previewData, setPreviewData] = useState<ParsedSheetData | null>(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = async (file: File) => {
    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension || "")) {
      setError("فرمت فایل نامعتبر است. لطفاً فقط فایل‌های Excel (.xlsx, .xls) یا CSV بارگذاری کنید.");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const parsed = await parseUploadedFile(file);
      if (parsed.rows.length === 0) {
        throw new Error("فایل بارگذاری شده فاقد رکوردهای معتبر یا داده است.");
      }
      setPreviewData(parsed);
      onDataParsed({ ...parsed, fileName: file.name });
    } catch (err: any) {
      setError(err.message || "خطا در پردازش فایل. لطفاً از سالم بودن فرمت فایل مطمئن شوید.");
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      await processFile(e.target.files[0]);
    }
  };

  const handleClearFile = () => {
    setPreviewData(null);
    setError(null);
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div dir="rtl" className="w-full text-right">
      {!currentFileName ? (
        <motion.div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 min-h-[180px] text-center ${
            isDragActive
              ? "border-sky-500 bg-sky-500/10 shadow-inner scale-[0.99]"
              : "border-slate-800 hover:border-sky-500/50 hover:bg-slate-900/10"
          }`}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx, .xls, .csv"
            className="hidden"
            onChange={handleFileChange}
            disabled={loading}
          />
          
          <div className="p-4 bg-sky-500/10 text-sky-400 rounded-full mb-3">
            {loading ? (
              <svg className="animate-spin h-8 w-8 text-sky-400" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <Upload className="w-8 h-8" />
            )}
          </div>

          <h3 className="text-base font-semibold text-slate-100 font-sans">
            بارگذاری فایل بازخوردها و خلاصه چت‌ها
          </h3>
          <p className="text-xs text-slate-400 mt-2 max-w-md leading-relaxed">
            فایل اکسل <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-sky-400 border border-slate-850">.xlsx</code> یا <code className="font-mono bg-slate-950 px-1.5 py-0.5 rounded text-sky-400 border border-slate-850">.csv</code> خلاصه چت‌های پشتیبانی را بکشید و اینجا رها کنید، یا برای انتخاب از سیستم کلیک کنید.
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 text-rose-400 text-xs bg-rose-950/30 border border-rose-900/40 px-3 py-2 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-sans font-medium">{error}</span>
            </div>
          )}
        </motion.div>
      ) : (
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-900/30">
                <FileSpreadsheet className="w-6 h-6" />
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-100 font-sans break-all line-clamp-1">
                    {currentFileName}
                  </span>
                  <span className="text-[10px] bg-emerald-950/40 text-emerald-400 font-medium px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-900/30">
                    <Check className="w-3 h-3" /> بارگذاری موفق
                  </span>
                </div>
                {previewData && (
                  <p className="text-xs text-slate-400 mt-1 font-mono">
                    تعداد سطرها: <span className="font-semibold text-slate-200">{previewData.rows.length}</span> | ستون‌های شناسایی شده: <span className="font-semibold text-slate-200">{previewData.headers.length}</span>
                  </p>
                )}
              </div>
            </div>

            <button
              onClick={handleClearFile}
              className="flex items-center justify-center gap-2 px-3 py-2 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 rounded-xl text-xs font-semibold font-sans transition-colors border border-transparent hover:border-rose-900/30 self-end sm:self-center shrink-0 cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
              حذف فایل و بارگذاری مجدد
            </button>
          </div>

          {/* Table Preview of Uploaded Data */}
          {previewData && previewData.rows.length > 0 && (
            <div className="mt-5 border border-slate-800 rounded-xl overflow-hidden bg-slate-950/40">
              <div className="bg-slate-900/60 px-4 py-2.5 border-b border-slate-800 flex items-center gap-2">
                <Table className="w-4 h-4 text-slate-400" />
                <span className="text-xs font-bold text-slate-300 font-sans">
                  نمونه پیش‌نمایش جدول بارگذاری شده (۳ سطر اول)
                </span>
              </div>
              <div className="overflow-x-auto max-w-full">
                <table className="w-full text-right text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-900/40 text-slate-400 border-b border-slate-800">
                      {previewData.headers.slice(0, 4).map((header, idx) => (
                        <th key={idx} className="p-3 font-semibold font-sans">
                          {header}
                        </th>
                      ))}
                      {previewData.headers.length > 4 && (
                        <th className="p-3 font-semibold font-sans text-slate-500">...</th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {previewData.rows.slice(0, 3).map((row, rowIdx) => (
                      <tr
                        key={rowIdx}
                        className="border-b border-slate-800/40 text-slate-300 hover:bg-slate-900/30"
                      >
                        {previewData.headers.slice(0, 4).map((header, colIdx) => (
                          <td key={colIdx} className="p-3 font-sans truncate max-w-[200px]" title={row[header]}>
                            {row[header] || "—"}
                          </td>
                        ))}
                        {previewData.headers.length > 4 && (
                          <td className="p-3 text-slate-500 text-center">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
