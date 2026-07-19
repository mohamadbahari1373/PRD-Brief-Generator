import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

// Setup body parsing
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// Initialize Google GenAI securely on the server
const apiKey = process.env.GEMINI_API_KEY;

// Serve Gemini API requests
app.post("/api/generate-prd", async (req, res) => {
  const { chatSummaries, meta } = req.body;

  if (!chatSummaries) {
    return res.status(400).json({ error: "خلاصه چت‌ها یا فایل بارگذاری شده یافت نشد." });
  }

  // Define fallback helper inside route or as utility
  const generateHeuristicFallbackPrd = (input: string, userMeta: any, originalError: any) => {
    const text = input || "";
    const title = userMeta?.title || "";
    const team = userMeta?.team || "تیم بهبود تجربه مشتری (CX)";
    const owner = userMeta?.owner || "کارشناس بهبود تجربه مشتری";
    const priority = userMeta?.priority || "high";

    // Try to find some real user quotes from the text
    const lines = text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 10 && !line.startsWith("تراکنش") && !line.startsWith("شناسه"));
    
    const extractedQuote = lines.length > 0 ? lines[0] : "سیستم در فرآیند فعلی توضیحات واضحی به کاربر ارائه نمی‌دهد.";
    const quotesList = lines.slice(0, 3).join(" | ") || "کاربر با خطای نامشخص روبرو شده و از ادامه فرآیند منصرف گردید.";

    // Detect domain
    let domain = "GENERAL";
    if (
      text.includes("احراز") ||
      text.includes("سلفی") ||
      text.includes("شناسایی") ||
      text.includes("کارت ملی") ||
      text.includes("دوربین") ||
      title.includes("احراز") ||
      title.includes("سلفی")
    ) {
      domain = "KYC";
    } else if (
      text.includes("شبا") ||
      text.includes("بانک") ||
      text.includes("کیف") ||
      text.includes("پول") ||
      text.includes("ریال") ||
      text.includes("تراکنش") ||
      title.includes("شبا") ||
      title.includes("بانک") ||
      title.includes("کیف")
    ) {
      domain = "WALLET";
    } else if (
      text.includes("تخفیف") ||
      text.includes("کوپن") ||
      text.includes("درگاه") ||
      text.includes("پرداخت") ||
      text.includes("سبد") ||
      text.includes("سفارش") ||
      title.includes("تخفیف") ||
      title.includes("کوپن") ||
      title.includes("پرداخت")
    ) {
      domain = "DISCOUNT";
    }

    const today = new Date().toLocaleDateString("fa-IR", { year: "numeric", month: "2-digit", day: "2-digit" });

    let prd: any = {
      title: title || "بهبود فرآیندها و ارتقای تجربه کاربر",
      team,
      owner,
      date: today,
      priority,
      isFallback: true, // Mark as fallback so frontend can show the warning banner
      problem: { details: "", source: "", impact: "" },
      goal: { outcome: "", kpi: "" },
      targetUser: { segment: "", scenario: "", painPoint: "" },
      currentStatus: { flow: "", friction: "" },
      desiredStatus: { change: "", success: "" },
      constraints: { timeline: "", technical: "", dependencies: "" },
      evidence: { data: "", feedback: "", competitors: "", links: "" }
    };

    if (domain === "KYC") {
      prd.title = title || "بهبود تجربه کاربر در فرآیند احراز هویت و آپلود عکس سلفی";
      prd.problem = {
        details: "بررسی چت‌های کاربران نشان می‌دهد که فرآیند احراز هویت با بیشترین میزان اصطکاک مواجه است. درصد بالایی از رد شدن عکس‌های سلفی به صورت خودکار به دلیل کیفیت پایین تصویر، عدم همخوانی زاویه صورت، یا شلوغی پس‌زمینه رخ می‌دهد. سیستم فاقد راهنمای زنده و پویا برای کاربران است.",
        source: `گزارش‌های پشتیبانی مشتریان و لاگ‌های ثبت شده در سیستم احراز هویت خودکار. شواهد مستقیم از پیام کاربران: "${extractedQuote}"`,
        impact: "افزایش بارهای کاری تیم پشتیبانی و احراز هویت دستی، افزایش ریزش کاربران (Churn Rate) در گام نهایی فعال‌سازی حساب کاربری، و کاهش اعتماد اولیه مشتریان به پلتفرم."
      };
      prd.goal = {
        outcome: "ساده‌سازی فرآیند آپلود سلفی با ارائه ابزارهای راهنمای تعاملی درون‌برنامه‌ای (Overlay Guides) و مطلع‌سازی دقیق کاربر از دلیل رد تصویر قبل از ارسال به سرور.",
        kpi: "کاهش ۳۵ درصدی درخواست‌های رد شده به دلیل خطاهای تکراری، افزایش ۱۵ درصدی نرخ تکمیل فرآیند احراز هویت در اولین تلاش (First-Time Match Rate)."
      };
      prd.targetUser = {
        segment: "کاربران جدید پلتفرم که مایل به انجام اولین تراکنش خود هستند.",
        scenario: "کاربر با گوشی هوشمند خود در محیطی با نور معمولی اقدام به احراز هویت می‌کند، اما به دلیل عدم کادربندی صحیح یا بازتاب نور، با خطاهای مکرر مواجه می‌شود.",
        painPoint: "عدم ارائه علت دقیق خطا در لحظه و خاکستری ماندن فرآیند بدون داشتن راه حل شفاف."
      };
      prd.currentStatus = {
        flow: "کاربر عکس سلفی را آپلود می‌کند -> عکس به صورت نامتقارن ارسال می‌شود -> سیستم با تاخیر خطای کلی 'عدم تایید عکس' می‌دهد -> کاربر دوباره همان عکس را آپلود می‌کند.",
        friction: "نبود راهنمای کادربندی زنده روی دوربین و مبهم بودن خطاهای سیستمی صادر شده."
      };
      prd.desiredStatus = {
        change: "اضافه شدن یک قاب راهنمای بیضی شکل روی دوربین گوشی به همراه بازخورد متنی زنده (مثلاً: 'لطفاً به دوربین نزدیک‌تر شوید' یا 'نور محیط را بیشتر کنید').",
        success: "تکمیل موفقیت‌آمیز احراز هویت بیش از ۹۰ درصد کاربران در تلاش اول یا دوم بدون نیاز به تایید دستی پشتیبان."
      };
      prd.constraints = {
        timeline: "به دلیل کمپین‌های مارکتینگ پیش‌رو، اجرای فاز اول بهبود تجربه کاربری ظرف ۳ هفته آینده ضروری است.",
        technical: "پایداری کتابخانه‌های پردازش تصویر در نسخه‌های قدیمی‌تر اندروید و دسترسی دوربین در مرورگرهای وب موبایل (محدودیت فریم‌های آی‌فریم).",
        dependencies: "وابستگی مستقیم به تیم امنیت و احراز هویت (Security/KYC Team) و درگاه‌های پردازش هوش مصنوعی تشخیص چهره."
      };
      prd.evidence = {
        data: "افزایش ۲۰ درصدی تیکت‌های ورودی با برچسب 'پشتیبانی احراز هویت' طی دو هفته اخیر بر اساس داشبورد تجربه مشتری.",
        feedback: quotesList,
        competitors: "بررسی بنچ‌مارک‌های برتر بازار نشان می‌دهد که پلتفرم‌های تراز اول از ماسک‌های انیمیشنی زنده روی دوربین و اعتبارسنجی اولیه کلاینت‌ساید (Client-Side Blur/Brightness Detection) استفاده می‌کنند.",
        links: "مشاهده مستندات راهنمای طراحی UX احراز هویت و اسکرین‌شات‌های نمونه‌های موفق در فایل ضمیمه."
      };
    } else if (domain === "WALLET") {
      prd.title = title || "تسهیل فرآیند ثبت و تایید شماره شبای بانکی در کیف پول ریالی";
      prd.problem = {
        details: "بر اساس گزارش‌ها، کاربران در گام اضافه کردن شماره شبا یا کارت بانکی برای فعال‌سازی کیف پول با بن‌بست مواجه می‌شوند. به علت وجود کاراکترهای اضافه (مانند خط فاصله یا فضاهای خالی) هنگام کپی کردن شبا از اپلیکیشن‌های بانکی دیگر، فرآیند ثبت با خطا مواجه شده و دکمه تایید خاکستری باقی می‌ماند.",
        source: `بازخوردهای ثبت شده در چت‌های پشتیبانی و افزایش ریزش کاربران در صفحه مدیریت حساب‌های بانکی. شواهد مستقیم: "${extractedQuote}"`,
        impact: "عدم توانایی کاربران در واریز یا برداشت ریالی، معطل شدن منابع مالی در پلتفرم، و سلب اعتماد کاربران به دلیل عدم شفافیت خطای رخ داده."
      };
      prd.goal = {
        outcome: "بهینه‌سازی فیلدهای ورودی کارت و شبا با پیاده‌سازی خودکار تریمر کاراکترهای زاید و قالب‌بندی خودکار شماره کارت/شبا همزمان با تایپ کاربر.",
        kpi: "کاهش ۴۰ درصدی خطاهای اعتبارسنجی فرم شبا، افزایش نرخ فعال‌سازی موفقیت‌آمیز کیف پول‌های ریالی به میزان ۲۵ درصد."
      };
      prd.targetUser = {
        segment: "کاربران مایل به تراکنش‌های ریالی بالا و فعالان بازار سرمایه.",
        scenario: "کاربر شماره شبای خود را از همراه بانک کپی کرده و پیست می‌کند، اما فاصله یا حروف پنهان مانع پردازش سیستم می‌شود.",
        painPoint: "دکمه ثبت بدون دادن خطای واضح خاکستری باقی می‌ماند و کاربر دلیلی برای آن نمی‌یابد."
      };
      prd.currentStatus = {
        flow: "کاربر شماره شبا را پیست می‌کند -> فرم خطا نشان نمی‌دهد اما دکمه غیرفعال است -> کاربر ناامید شده و فرآیند را ترک می‌کند.",
        friction: "عدم وجود پردازش پیش‌فرض روی داده‌های ورودی کپی شده (کاراکترهای زاید و فضاهای خالی)."
      };
      prd.desiredStatus = {
        change: "حذف خودکار کاراکترهای غیرعددی و پیشوند IR، قالب‌بندی چهار رقمی شماره کارت‌ها، و نمایش خطای لحظه‌ای با پیام صریح (مثلا: 'کد ملی صاحب کارت باید با هویت ثبت نامی شما مطابقت داشته باشد').",
        success: "کاربران بدون نیاز به راهنمایی پشتیبان بتوانند شماره شبای خود را در کمتر از ۳۰ ثانیه ثبت و تایید کنند."
      };
      prd.constraints = {
        timeline: "انجام طرح پیش از اتمام ماه جاری جهت مطابقت با حسابرسی مالی جدید پلتفرم.",
        technical: "اتصال به سرویس‌های استعلام بانکی (مانند سرویس‌های معتبر بانکی) و مدیریت زمان پاسخ‌دهی (Timeout) آن‌ها.",
        dependencies: "وابستگی به سرویس‌های استعلام هویت شاهکار و سامانه پایا/ساتنا بانکی."
      };
      prd.evidence = {
        data: "داشبورد تراکنش‌های مالی نشان می‌دهد که حدود ۱۵٪ از کاربران جدید پس از اولین تلاش ناموفق برای افزودن شبا، دیگر به بخش کیف پول مراجعه نمی‌کنند.",
        feedback: quotesList,
        competitors: "رقبای تراز اول بازار به محض تایپ یا پیست کردن شبا، لوگوی بانک صادرکننده را نمایش داده و فضاهای خالی را به صورت نامحسوس حذف می‌کنند.",
        links: "رجوع به الگوهای طراحی فیلدهای مالی در مستندات تجربه کاربری پیوست شده."
      };
    } else if (domain === "DISCOUNT") {
      prd.title = title || "بهبود سیستم اعمال کدهای تخفیف و پایداری سبد خرید";
      prd.problem = {
        details: "بررسی چت‌ها نشان می‌دهد اعمال کدهای تخفیف در پرداخت با دو مشکل عمده روبرو است: اول، ناهماهنگی در سهمیه‌بندی و سگمنت‌بندی کدهای ارسال شده به کاربران؛ دوم، بروز خطای سیستمی در لحظه اتصال به درگاه پرداخت که باعث خالی شدن کامل سبد خرید کاربر و عصبانیت شدید او می‌شود.",
        source: `بررسی پیام‌های ورودی به چت آنلاین پشتیبانی پس از کمپین‌های تبلیغاتی اخیر. شواهد مستقیم: "${extractedQuote}"`,
        impact: "کاهش انگیزه کاربران برای خرید، افزایش نرخ رها کردن سبد خرید (Cart Abandonment)، و هدر رفتن بودجه مارکتینگ به دلیل تجربه منفی کاربران."
      };
      prd.goal = {
        outcome: "حفظ موجودی سبد خرید در صورت بروز هرگونه خطای اعمال تخفیف یا درگاه بانکی، و ارائه بازخوردهای صریح و دلایل شفاف در صورت عدم امکان استفاده از کد.",
        kpi: "کاهش ۵۰ درصدی نرخ رها شدن سبد خرید پس از خطای پرداخت، کاهش تیکت‌های پشتیبانی مربوط به کدهای تخفیف تا ۶۰ درصد."
      };
      prd.targetUser = {
        segment: "کاربران حساس به قیمت و خریدارانی که با کدهای تخفیف ترغیب به خرید شده‌اند.",
        scenario: "کاربر با ذوق فراوان کالاها را انتخاب کرده و تخفیف می‌گیرد، اما به دلیل یک خطای همزمانی ساده، کل سبد خرید خود را از دست رفته می‌بیند.",
        painPoint: "خالی شدن ناگهانی سبد خرید و ایجاد حس بی‌اعتمادی یا سوءاستفاده از طرف پلتفرم."
      };
      prd.currentStatus = {
        flow: "کاربر کالاها را به سبد خرید اضافه می‌کند -> کد تخفیف را ثبت می‌کند -> در درگاه پرداخت با خطا مواجه می‌شود -> سبد خرید ریست می‌شود.",
        friction: "پاک شدن سبد خرید در صورت عدم موفقیت تراکنش بانکی یا خطای اتصال به سرور تخفیف."
      };
      prd.desiredStatus = {
        change: "ذخیره موقت سبد خرید کاربر به مدت حداقل ۳۰ دقیقه در دیتابیس کلاینت یا سرور تا در صورت بروز خطا، کاربر بتواند بدون انتخاب مجدد کالاها، تراکنش را تکرار کند.",
        success: "حذف کامل فرآیند انتخاب مجدد کالاها برای پرداخت‌های ناموفق و بازیابی آسان سبد خرید."
      };
      prd.constraints = {
        timeline: "باید قبل از شروع جشنواره تخفیفی انتهای ماه پیاده‌سازی و تست شود.",
        technical: "مدیریت وضعیت رزرو انبار در فریمورک خرید و هماهنگی سرور مارکتینگ با هسته اصلی پرداخت.",
        dependencies: "تیم توسعه فرانت‌اند و مارکتینگ و ارائه‌دهندگان درگاه‌های پرداخت بانکی."
      };
      prd.evidence = {
        data: "گزارش سیستم مارکتینگ نشان می‌دهد ۲۲ درصد از سبدهای خریدی که کدهای تخفیف در آن‌ها ناموفق بوده، هرگز بازیابی نشده‌اند.",
        feedback: quotesList,
        competitors: "پلتفرم‌های بزرگ دنیا در صورت شکست پرداخت، کدهای اعمال شده را معلق نگه داشته و لینک بازگشت مستقیم به سبد خرید را به کاربر نمایش می‌دهند.",
        links: "مشاهده جریان بهینه بازیابی تراکنش‌ها در مستندات محصول در بخش پیوست."
      };
    } else {
      prd.title = title || "بهبود و ارتقای کلی تجربه کاربری در فرآیندهای پر اصطکاک";
      prd.problem = {
        details: "بررسی و دسته‌بندی بازخوردهای مشتریان نشان‌دهنده نقاط کور در چندین بخش از پلتفرم است. کاربران در هنگام برخورد با خطاهای غیرمنتظره سیستمی، توضیحات واضحی دریافت نکرده و مجبور به تماس مکرر با تیم پشتیبانی می‌شوند. فرآیندها فاقد انعطاف‌پذیری لازم در شرایط خاص هستند.",
        source: `تحلیل داده‌های آماری چت‌های پشتیبانی آنلاین و فرم‌های نظرسنجی کاربران. شواهد مستقیم: "${extractedQuote}"`,
        impact: "افزایش هزینه‌های پشتیبانی و پاسخ‌گویی به سوالات تکراری، فرسایش تیم‌های فنی، و کاهش نمره رضایت مشتریان (CSAT)."
      };
      prd.goal = {
        outcome: "بهینه‌سازی متون خطاها و شفاف‌سازی گام‌های بعدی کاربر با زبانی ساده، صمیمی و راهگشا همراه با دکمه‌های اقدام مستقیم.",
        kpi: "کاهش تیکت‌های پشتیبانی عمومی تا ۲۰ درصد، بهبود نمره CSAT مربوط به فرآیندهای بهبود یافته تا ۱۵ درصد."
      };
      prd.targetUser = {
        segment: "کاربران عمومی پلتفرم که با جریان‌های مختلف تعامل دارند.",
        scenario: "کاربر در حال انجام یک فعالیت معمولی در اپلیکیشن است که ناگهان با یک خطای مبهم سیستمی روبرو می‌شود و برای حل آن سردرگم می‌ماند.",
        painPoint: "مبهم بودن پیام‌های سیستم و مسدود شدن کامل مسیر پیش روی کاربر."
      };
      prd.currentStatus = {
        flow: "بروز خطا -> نمایش پیام کلی سیستم -> سردرگمی کاربر -> تماس با بخش پشتیبانی.",
        friction: "نامفهوم بودن خطاهای فنی سیستم برای کاربران عادی."
      };
      prd.desiredStatus = {
        change: "ترجمه خطاهای سیستمی به پیام‌های کاربرپسند همراه با پیشنهاد راه‌حل جایگزین و هدایت خودکار کاربر.",
        success: "کاهش نرخ لغو فرآیندها توسط کاربر بعد از مواجهه با پیغام خطا."
      };
      prd.constraints = {
        timeline: "برنامه‌ریزی برای فازبندی پروژه‌ها طی اسپرینت‌های فصل جاری.",
        technical: "یکپارچه‌سازی مکانیزم مدیریت خطا در تمام بخش‌های کلاینت.",
        dependencies: "وابستگی به تیم‌های توسعه فرانت‌اند و کپی‌رایتینگ محصول."
      };
      prd.evidence = {
        data: "بیش از ۳۰٪ از تماس‌های پشتیبانی به دلیل عدم اطلاع کاربران از چگونگی حل مسائل فنی ساده رخ می‌دهد.",
        feedback: quotesList,
        competitors: "پلتفرم‌های مدرن همواره یک اکشن راهنما (مثلاً: دکمه تلاش مجدد یا ارجاع به پرسش‌های متداول) در کنار پیام‌های خطا قرار می‌دهند.",
        links: "راهنمای نگارش متون خطای محصول در فایل ضمیمه."
      };
    }

    prd.targetTeam = userMeta?.targetTeam || "Product";
    prd.userIdea = userMeta?.userIdea || "";

    if (userMeta?.userIdea) {
      prd.desiredStatus.change = `${prd.desiredStatus.change || ""}\n\n[ایده و راهکار پیشنهادی کاربر برای تیم ${userMeta.targetTeam || "Product"}]:\n${userMeta.userIdea}`;
      prd.goal.outcome = `${prd.goal.outcome || ""}\n(با تمرکز ویژه بر ایده پیشنهادی کاربر)`;
    }

    return prd;
  };

  try {
    if (!apiKey) {
      // If API key is missing, trigger fallback immediately for a smoother local developer workflow
      console.warn("Gemini API Key is missing. Using heuristic engine as a fallback...");
      const fallbackPrd = generateHeuristicFallbackPrd(chatSummaries, meta, new Error("API Key missing"));
      return res.json(fallbackPrd);
    }

    // Proactively truncate input to stay safely below Gemini free-tier input token quotas (250,000 max, ~12000 chars is ~3000 tokens)
    let truncatedChatSummaries = chatSummaries;
    if (chatSummaries.length > 12000) {
      truncatedChatSummaries = chatSummaries.slice(0, 12000) + "\n\n... [متن به دلیل طولانی بودن جهت بهینه‌سازی سهمیه کوتاه شده است] ...";
    }

    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });

    const userMetaPrompt = meta
      ? `
اطلاعات اولیه دستی وارد شده توسط کاربر:
- عنوان پیشنهادی درخواست: ${meta.title || "مشخص نشده"}
- تیم درخواست‌دهنده: ${meta.team || "تیم بهبود تجربه مشتری"}
- اونر درخواست: ${meta.owner || "کارشناس بهبود تجربه مشتری"}
- فوریت: ${meta.priority || "متوسط"}
- تیم مخاطب اصلی سند (targetTeam): ${meta.targetTeam || "Product"}
- ایده و راهکار پیشنهادی کاربر (userIdea): ${meta.userIdea || "مشخص نشده"}
`
      : "";

    const prompt = `
شما یک مهندس محصول و متخصص ارشد تجربه کاربری (UX) و بهبود تجربه مشتری (CX) هستید.
وظیفه شما این است که خلاصه چت‌ها، بازخوردها یا لاگ‌های گفتگوی مشتریان را تحلیل کنید و یک سند بریف محصول (Product Brief / PRD) بسیار حرفه‌ای، دقیق و عمیق به زبان فارسی طبق ساختار زیر بسازید.

مخاطب اصلی این سند: تیم "${meta?.targetTeam || "Product"}" است.
بسیار مهم: کل ادبیات، زبان، اصطلاحات فنی، نحوه تشریح مشکل و ساختار سند باید متناسب با دغدغه‌ها، مسئولیت‌ها و واژگان تخصصی تیم "${meta?.targetTeam || "Product"}" تنظیم گردد تا این تیم به بهترین شکل اهمیت و ریشه مشکل را درک کند. به عنوان مثال:
- اگر مخاطب Product است: تمرکز روی جریان کاربری (UX)، بن‌بست‌های تعاملی، ناهماهنگی در قیف تبدیل و ابزارهای اندازه‌گیری و KPI باشد.
- اگر مخاطب Marketing است: تمرکز روی تاثیر روی رضایت و جذب مشتری، وفاداری، از دست رفتن کاربران مستعد خرید، ارزش برند و همسویی با کمپین‌ها باشد.
- اگر مخاطب Legal است: تمرکز روی انطباق قوانین، ریسک‌های حقوقی و نظارتی، امنیت داده‌های هویتی، شفافیت شرایط و قوانین و جلوگیری از کلاهبرداری باشد.
- اگر مخاطب Blockchain است: تمرکز روی امنیت تراکنش‌های زنجیره‌ای (On-chain)، تعامل با کیف پول‌های وب۳، پایداری اتصالات RPC، کارمزد تراکنش‌ها (Gas)، رویدادهای قرارداد هوشمند و امضاهای دیجیتال باشد.
- اگر مخاطب Support است: تمرکز روی تکرار خطاهای رایج، نیاز به ابزارهای پاسخگویی سریع، کاهش نرخ تیکت‌ها، خودکارسازی پاسخ‌های مرسوم و بهبود جریان مستندات راهنما (FAQ) باشد.
- اگر مخاطب Market Making است: تمرکز روی عمق بازار، اسپرد، نقدینگی، سرعت پاسخ‌دهی لیمیت اردرها، کارایی موتور مچینگ در شلوغی بازار و تاثیر خطاها بر ثبات اردر بوک و حجم معاملات بازار باشد.

درباره ایده و راهکار پیشنهادی کاربر:
کاربر ایده اولیه زیر را برای حل این مشکل پیشنهاد داده است:
"${meta?.userIdea || "ایده خاصی وارد نشده است"}"
شما باید این ایده اولیه کاربر را با دقت بخوانید، آن را به عنوان مبنای بخش "جریان مطلوب نهایی (To-Be)" و "اهداف/راه‌حل پیشنهادی" قرار دهید و آن را به زبانی فوق‌العاده تخصصی، منسجم و استاندارد در حوزه مدیریت محصول بازنویسی و غنی‌سازی کنید و در فیلدهای مناسب (به خصوص در بخش های desiredStatus.change و goal.outcome) جای دهید.

توضیحات مهم درباره فلسفه این سند:
"این Brief برای تعریف مسئله و نیاز نوشته می‌شود، نه برای تعیین راه‌حل نهایی. مسئول تبدیل Brief به PRD و تعریف راهکار محصولی، تیم Product است."

اطلاعات ورودی:
---
${truncatedChatSummaries}
---
${userMetaPrompt}

دستورالعمل‌ها:
1. تحلیل عمیق: خلاصه چت‌ها را تحلیل کنید تا دردها، مشکلات اصلی، الگوهای تکرارشونده و رفتارهای کاربران را استخراج کنید.
2. تکمیل تمام بخش‌ها: تمام فیلدهای ساختار خروجی باید به زبان فارسی دقیق، روان، حرفه‌ای و کتابی (اداری و تخصصی محصولی) پر شوند. از جملات کوتاه و مبهم پرهیز کنید و تحلیل‌های غنی بنویسید.
3. پرهیز از تعیین راه‌حل فنی یا نهایی: روی تعریف "مسئله"، "چرا"، "چه کسی" و "وضعیت مطلوب از دیدگاه مشتری" تمرکز کنید. راه‌حل فنی ننویسید.
4. تخمین فیلدها: اگر برخی اطلاعات در چت‌ها به طور مستقیم وجود نداشت، بر اساس محتوای چت‌ها و تجربه حرفه‌ای خود، بهترین تخمین منطقی و واقع‌گرایانه محصولی را برای آنها بنویسید (مثلاً تعیین KPI منطقی، یا سناریوی مواجهه کاربر).

ساختار دقیق خروجی طبق فایل JSON Schema زیر است. لطفاً آن را دقیقاً به زبان فارسی پر کنید.
`;

    // Define strict response schema for PRD/Brief structured JSON output
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        title: {
          type: Type.STRING,
          description: "عنوان خلاقانه و دقیق برای این درخواست محصولی به فارسی",
        },
        team: {
          type: Type.STRING,
          description: "تیم درخواست‌دهنده (مثلاً بهبود تجربه مشتری یا بازاریابی یا پشتیبانی)",
        },
        owner: {
          type: Type.STRING,
          description: "نام اونر یا هماهنگ‌کننده درخواست",
        },
        date: {
          type: Type.STRING,
          description: "تاریخ امروز به شمسی یا میلادی (فرمت خوانا)",
        },
        priority: {
          type: Type.STRING,
          description: "درجه فوریت: low یا medium یا high یا critical",
        },
        problem: {
          type: Type.OBJECT,
          properties: {
            details: {
              type: Type.STRING,
              description: "دقیقاً چه چیزی الان درست کار نمی‌کند یا چه فرصتی وجود دارد؟ (توضیح کامل مسئله براساس بازخورد چت‌ها)",
            },
            source: {
              type: Type.STRING,
              description: "این نیاز از کجا آمده؟ [داده / بازخورد کاربر / کمپین / نیاز بیزینسی / تحلیل] با جزئیات شواهد از چت‌ها",
            },
            impact: {
              type: Type.STRING,
              description: "اگر حل نشود چه اثری دارد؟ (اثرات منفی روی بیزینس و کاربر مانند ریزش، نارضایتی و غیره)",
            },
          },
          required: ["details", "source", "impact"],
        },
        goal: {
          type: Type.OBJECT,
          properties: {
            outcome: {
              type: Type.STRING,
              description: "این درخواست قرار است چه نتیجه‌ای ایجاد کند؟ (توصیف خروجی کیفی مطلوب برای کاربر)",
            },
            kpi: {
              type: Type.STRING,
              description: "موفقیت آن با چه KPI یا Outcomeای سنجیده می‌شود؟ (مثلاً افزایش نرخ تکمیل خرید، کاهش ۵ درصدی تماس‌های پشتیبانی مربوط به این موضوع و غیره)",
            },
          },
          required: ["outcome", "kpi"],
        },
        targetUser: {
          type: Type.OBJECT,
          properties: {
            segment: {
              type: Type.STRING,
              description: "این درخواست برای چه کاربر یا چه سگمنتی است؟ (مثلاً کاربران تازه‌وارد، مشتریان فعال، خریداران عمده)",
            },
            scenario: {
              type: Type.STRING,
              description: "این کاربر در چه موقعیتی با این نیاز مواجه می‌شود؟ (سناریوی واقعی و ملموس مواجهه با مشکل)",
            },
            painPoint: {
              type: Type.STRING,
              description: "مهم‌ترین Pain Point یا نقطه درد اصلی او چیست؟",
            },
          },
          required: ["segment", "scenario", "painPoint"],
        },
        currentStatus: {
          type: Type.OBJECT,
          properties: {
            flow: {
              type: Type.STRING,
              description: "الان جریان فعلی چگونه است؟ (گام‌های کاربر در وضعیت As-Is)",
            },
            friction: {
              type: Type.STRING,
              description: "مشکل یا اصطکاک اصلی کجاست؟ (نقطه شکست فرآیند فعلی)",
            },
          },
          required: ["flow", "friction"],
        },
        desiredStatus: {
          type: Type.OBJECT,
          properties: {
            change: {
              type: Type.STRING,
              description: "بعد از حل مسئله چه تغییری باید ایجاد شود؟ (توصیف وضعیت To-Be از دید کاربر)",
            },
            success: {
              type: Type.STRING,
              description: "از نگاه شما چه زمانی این درخواست موفق محسوب می‌شود؟ (معیارهای پذیرش تجربه کاربری)",
            },
          },
          required: ["change", "success"],
        },
        constraints: {
          type: Type.OBJECT,
          properties: {
            timeline: {
              type: Type.STRING,
              description: "محدودیت زمانی (مثلاً قبل از کمپین پاییزه، یا با فوریت بالا ظرف ۲ هفته)",
            },
            technical: {
              type: Type.STRING,
              description: "محدودیت فنی / عملیاتی / حقوقی حدودی وارد شده یا تخمین زده شده",
            },
            dependencies: {
              type: Type.STRING,
              description: "وابستگی به تیم، کمپین، سرویس یا تاریخ مشخص",
            },
          },
          required: ["timeline", "technical", "dependencies"],
        },
        evidence: {
          type: Type.OBJECT,
          properties: {
            data: {
              type: Type.STRING,
              description: "داشبورد یا داده مرتبط (تخمین یا ارجاع به داده‌های آماری مستخرج از خلاصه چت‌ها)",
            },
            feedback: {
              type: Type.STRING,
              description: "نمونه‌هایی از نقل‌قول‌ها یا بازخوردهای مستقیم کاربران در چت‌ها که این مشکل را تایید می‌کند",
            },
            competitors: {
              type: Type.STRING,
              description: "نمونه رقبا (چگونه رقبای ایرانی یا خارجی این مشکل را حل کرده‌اند یا الگوهای بهینه بازار)",
            },
            links: {
              type: Type.STRING,
              description: "لینک فایل‌ها، اسکرین‌شات‌ها یا مستندات مرتبط (لینک‌های نمونه فرضی یا راهنما)",
            },
          },
          required: ["data", "feedback", "competitors", "links"],
        },
      },
      required: [
        "title",
        "team",
        "owner",
        "date",
        "priority",
        "problem",
        "goal",
        "targetUser",
        "currentStatus",
        "desiredStatus",
        "constraints",
        "evidence",
      ],
    };

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error("پاسخی از مدل دریافت نشد.");
    }

    const prdData = JSON.parse(text.trim());
    prdData.targetTeam = meta?.targetTeam || "Product";
    prdData.userIdea = meta?.userIdea || "";
    res.json(prdData);
  } catch (error: any) {
    console.error("Gemini Generation Error, fallback triggered:", error);
    
    // Check if rate limited / quota exceeded / resource exhausted, or other error
    // We fall back seamlessly with a beautiful response
    try {
      const fallbackPrd = generateHeuristicFallbackPrd(chatSummaries, meta, error);
      res.json(fallbackPrd);
    } catch (fallbackError) {
      console.error("Critical: Fallback generation failed:", fallbackError);
      res.status(500).json({
        error: "خطایی در پردازش اطلاعات رخ داده است.",
        details: error.message || error,
      });
    }
  }
});

// Setup Vite or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
