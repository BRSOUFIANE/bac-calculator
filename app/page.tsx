"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Calculator,
  TrendingUp,
  Target,
  BookOpen,
  Award,
  AlertCircle,
  CheckCircle,
  Info,
  Sparkles,
  Trophy,
  Star,
  GraduationCap,
  Users,
  Brain,
  Clock,
  Download,
  FileText,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

// NEW – PDF helper
import jsPDF from "jspdf"

interface Subject {
  name: string
  coefficient: number
  grade: number | null
}

interface GradeStatus {
  status: string
  badgeColor: "red" | "green" | "blue" | "yellow" | "purple" | "orange"
  textColor: string
}

interface PredictiveScenario {
  name: string
  gradeNeeded: number
}

interface UniversityRequirement {
  university: string
  major: string
  neededGrade: number
}

// ---------- Study-plan helper (dynamic) ----------
function getStudyPlan(avg: number) {
  if (avg >= 16) {
    return {
      level: "متقدم",
      daily: [
        { slot: "الصباح (9-11)", text: "مراجعة خفيفة + تمارين متقدمة" },
        { slot: "بعد الظهر (2-4)", text: "حل نماذج امتحانات سابقة" },
        { slot: "المساء (8-9)", text: "قراءة / حفظ خفيف" },
      ],
      weekly: ["مراجعة عامة", "تدريبات تطبيقية", "راحة"],
    }
  }
  if (avg >= 14) {
    return {
      level: "جيد جداً",
      daily: [
        { slot: "الصباح (8-11)", text: "مواد معاملات عالية" },
        { slot: "بعد الظهر (3-5)", text: "تلخيص الدروس + خرائط ذهنية" },
        { slot: "المساء (7-9)", text: "مراجعة سريعة" },
      ],
      weekly: ["مراجعة", "تطبيق", "راحة"],
    }
  }
  if (avg >= 12) {
    return {
      level: "جيد",
      daily: [
        { slot: "الصباح (8-12)", text: "المواد الضعيفة" },
        { slot: "بعد الظهر (2-5)", text: "تمارين + فيديوهات شرح" },
        { slot: "المساء (7-9)", text: "تلخيص + بطاقات مراجعة" },
      ],
      weekly: ["مراجعة مكثفة", "اختبارات مصغّرة", "راحة"],
    }
  }
  return {
    level: "بحاجة لتحسين كبير",
    daily: [
      { slot: "الصباح (8-12)", text: "مواد معاملات عالية (تركيز كامل)" },
      { slot: "بعد الظهر (2-6)", text: "تمارين وحلول مفصلة" },
      { slot: "المساء (7-10)", text: "حفظ / تكرار متباعد" },
    ],
    weekly: ["مراجعة مكثفة", "اختبار شامل", "راحة نصف-يوم"],
  }
}

interface BacType {
  type: string
  branch: string
  track: string
}

interface UniversityRequirement {
  name: string
  minGrade: number
  category: string
  branch: string
}

// استبدال قائمة الجامعات بالعتبات الحقيقية للجامعات المغربية
const universityRequirements: UniversityRequirement[] = [
  // الطب وطب الأسنان والصيدلة
  { name: "كلية الطب والصيدلة - الرباط", minGrade: 18.5, category: "طبية", branch: "علمية" },
  { name: "كلية الطب والصيدلة - الدار البيضاء", minGrade: 18.3, category: "طبية", branch: "علمية" },
  { name: "كلية الطب والصيدلة - فاس", minGrade: 18.0, category: "طبية", branch: "علمية" },
  { name: "كلية طب الأسنان - الرباط", minGrade: 17.8, category: "طبية", branch: "علمية" },
  { name: "كلية طب الأسنان - الدار البيضاء", minGrade: 17.5, category: "طبية", branch: "علمية" },
  { name: "كلية الصيدلة - الرباط", minGrade: 16.8, category: "طبية", branch: "علمية" },

  // المدارس العليا للهندسة
  { name: "المدرسة المحمدية للمهندسين", minGrade: 17.5, category: "هندسية", branch: "علمية" },
  { name: "المدرسة الوطنية العليا للمعلوميات وتحليل النظم", minGrade: 17.2, category: "هندسية", branch: "علمية" },
  { name: "المدرسة الوطنية العليا للكهرباء والميكانيك", minGrade: 16.8, category: "هندسية", branch: "علمية" },
  { name: "المدرسة الوطنية للعلوم التطبيقية - الرباط", minGrade: 16.5, category: "هندسية", branch: "علمية" },
  { name: "المدرسة الوطنية للعلوم التطبيقية - فاس", minGrade: 16.2, category: "هندسية", branch: "علمية" },
  { name: "المدرسة الوطنية للعلوم التطبيقية - مراكش", minGrade: 16.0, category: "هندسية", branch: "علمية" },

  // العلوم الاقتصادية والتجارية
  {
    name: "المدرسة الوطنية للتجارة والتسيير - الدار البيضاء",
    minGrade: 16.5,
    category: "اقتصادية",
    branch: "اقتصادية",
  },
  { name: "المدرسة العليا للتكنولوجيا - الدار البيضاء", minGrade: 15.8, category: "تقنية", branch: "علمية" },
  {
    name: "كلية العلوم الاقتصادية والقانونية والاجتماعية - الرباط",
    minGrade: 14.5,
    category: "اقتصادية",
    branch: "اقتصادية",
  },
  {
    name: "كلية العلوم الاقتصادية والقانونية والاجتماعية - الدار البيضاء",
    minGrade: 14.2,
    category: "اقتصادية",
    branch: "اقتصادية",
  },

  // العلوم الأساسية
  { name: "كلية العلوم - الرباط", minGrade: 15.5, category: "علمية", branch: "علمية" },
  { name: "كلية العلوم - الدار البيضاء", minGrade: 15.2, category: "علمية", branch: "علمية" },
  { name: "كلية العلوم - فاس", minGrade: 14.8, category: "علمية", branch: "علمية" },
  { name: "كلية العلوم والتقنيات - الرباط", minGrade: 14.5, category: "علمية", branch: "علمية" },

  // الآداب والعلوم الإنسانية
  { name: "كلية الآداب والعلوم الإنسانية - الرباط", minGrade: 13.5, category: "أدبية", branch: "أدبية" },
  { name: "كلية الآداب والعلوم الإنسانية - الدار البيضاء", minGrade: 13.2, category: "أدبية", branch: "أدبية" },
  { name: "كلية الآداب والعلوم الإنسانية - فاس", minGrade: 12.8, category: "أدبية", branch: "أدبية" },

  // الحقوق
  { name: "كلية الحقوق - الرباط", minGrade: 13.8, category: "قانونية", branch: "أدبية" },
  { name: "كلية الحقوق - الدار البيضاء", minGrade: 13.5, category: "قانونية", branch: "أدبية" },
  { name: "كلية الحقوق - فاس", minGrade: 13.0, category: "قانونية", branch: "أدبية" },

  // التعليم الأصيل
  { name: "دار الحديث الحسنية", minGrade: 15.0, category: "شرعية", branch: "أصيل" },
  { name: "كلية أصول الدين - تطوان", minGrade: 14.5, category: "شرعية", branch: "أصيل" },
  { name: "كلية الشريعة - فاس", minGrade: 14.0, category: "شرعية", branch: "أصيل" },
  { name: "كلية اللغة العربية - مراكش", minGrade: 13.5, category: "لغوية", branch: "أصيل" },

  // الفنون التطبيقية
  { name: "المعهد العالي للفنون الجميلة - الدار البيضاء", minGrade: 14.0, category: "فنية", branch: "فنية" },
  { name: "المعهد العالي للفنون الجميلة - تطوان", minGrade: 13.5, category: "فنية", branch: "فنية" },

  // المدارس العليا للتكنولوجيا
  { name: "المدرسة العليا للتكنولوجيا - الرباط", minGrade: 15.0, category: "تقنية", branch: "تقنية" },
  { name: "المدرسة العليا للتكنولوجيا - الدار البيضاء", minGrade: 14.8, category: "تقنية", branch: "تقنية" },
  { name: "المدرسة العليا للتكنولوجيا - فاس", minGrade: 14.5, category: "تقنية", branch: "تقنية" },
]

// دالة لإنشاء جدول الدراسة النسبي
const getAdaptiveStudyPlan = (finalGrade: number) => {
  if (finalGrade >= 16) {
    return {
      level: "ممتاز - خطة المحافظة على التفوق",
      color: "from-green-500/20 to-emerald-500/20",
      borderColor: "border-green-400/30",
      daily: [
        { time: "الصباح (9:00-11:00)", activity: "مراجعة سريعة للمواد الأساسية", priority: "متوسط" },
        { time: "بعد الظهر (14:00-16:00)", activity: "حل نماذج امتحانات متقدمة", priority: "عالي" },
        { time: "المساء (19:00-20:00)", activity: "قراءة إضافية وتوسيع المعرفة", priority: "منخفض" },
      ],
      weekly: [
        { day: "الأحد", focus: "مراجعة شاملة", hours: "3 ساعات" },
        { day: "الاثنين", focus: "تمارين تطبيقية", hours: "4 ساعات" },
        { day: "الثلاثاء", focus: "نماذج امتحانات", hours: "4 ساعات" },
        { day: "الأربعاء", focus: "مراجعة نقاط الضعف", hours: "3 ساعات" },
        { day: "الخميس", focus: "تطوير المهارات", hours: "3 ساعات" },
        { day: "الجمعة", focus: "راحة ومراجعة خفيفة", hours: "2 ساعة" },
        { day: "السبت", focus: "راحة كاملة", hours: "راحة" },
      ],
      tips: [
        "حافظ على مستواك الحالي",
        "ركز على التمارين المتقدمة",
        "اهتم بالتفاصيل الدقيقة",
        "طور مهارات حل المسائل المعقدة",
      ],
    }
  } else if (finalGrade >= 14) {
    return {
      level: "جيد جداً - خطة الوصول للتميز",
      color: "from-blue-500/20 to-cyan-500/20",
      borderColor: "border-blue-400/30",
      daily: [
        { time: "الصباح (8:00-11:00)", activity: "دراسة المواد ذات المعاملات العالية", priority: "عالي" },
        { time: "بعد الظهر (14:00-17:00)", activity: "حل التمارين والتطبيقات", priority: "عالي" },
        { time: "المساء (19:00-21:00)", activity: "مراجعة ما تم دراسته", priority: "متوسط" },
      ],
      weekly: [
        { day: "الأحد", focus: "الرياضيات والفيزياء", hours: "5 ساعات" },
        { day: "الاثنين", focus: "العلوم الطبيعية", hours: "4 ساعات" },
        { day: "الثلاثاء", focus: "اللغات", hours: "4 ساعات" },
        { day: "الأربعاء", focus: "المواد الأدبية", hours: "4 ساعات" },
        { day: "الخميس", focus: "مراجعة شاملة", hours: "5 ساعات" },
        { day: "الجمعة", focus: "نماذج امتحانات", hours: "3 ساعات" },
        { day: "السبت", focus: "راحة ومراجعة خفيفة", hours: "2 ساعة" },
      ],
      tips: [
        "ركز على المواد ذات المعاملات العالية",
        "حل المزيد من التمارين",
        "اطلب المساعدة في النقاط الصعبة",
        "نظم وقتك بدقة",
      ],
    }
  } else if (finalGrade >= 12) {
    return {
      level: "جيد - خطة التحسين المستمر",
      color: "from-yellow-500/20 to-orange-500/20",
      borderColor: "border-yellow-400/30",
      daily: [
        { time: "الصباح (7:30-11:30)", activity: "دراسة مكثفة للمواد الضعيفة", priority: "عالي جداً" },
        { time: "بعد الظهر (14:00-18:00)", activity: "حل تمارين وتطبيقات", priority: "عالي" },
        { time: "المساء (19:00-21:30)", activity: "مراجعة ومذاكرة", priority: "عالي" },
      ],
      weekly: [
        { day: "الأحد", focus: "المواد العلمية الأساسية", hours: "6 ساعات" },
        { day: "الاثنين", focus: "الرياضيات المكثفة", hours: "6 ساعات" },
        { day: "الثلاثاء", focus: "الفيزياء والكيمياء", hours: "6 ساعات" },
        { day: "الأربعاء", focus: "اللغات والأدب", hours: "5 ساعات" },
        { day: "الخميس", focus: "العلوم الاجتماعية", hours: "5 ساعات" },
        { day: "الجمعة", focus: "مراجعة شاملة", hours: "4 ساعات" },
        { day: "السبت", focus: "اختبارات تجريبية", hours: "3 ساعات" },
      ],
      tips: ["ركز على نقاط الضعف", "اطلب مساعدة إضافية", "زد ساعات الدراسة", "استخدم مصادر متنوعة"],
    }
  } else {
    return {
      level: "يحتاج تحسين - خطة الإنقاذ المكثفة",
      color: "from-red-500/20 to-pink-500/20",
      borderColor: "border-red-400/30",
      daily: [
        { time: "الصباح (7:00-12:00)", activity: "دراسة مكثفة جداً للأساسيات", priority: "حرج" },
        { time: "بعد الظهر (13:00-18:00)", activity: "تمارين وحلول مفصلة", priority: "حرج" },
        { time: "المساء (19:00-22:00)", activity: "مراجعة وحفظ", priority: "عالي جداً" },
      ],
      weekly: [
        { day: "الأحد", focus: "الرياضيات الأساسية", hours: "8 ساعات" },
        { day: "الاثنين", focus: "الفيزياء الأساسية", hours: "8 ساعات" },
        { day: "الثلاثاء", focus: "الكيمياء والعلوم", hours: "7 ساعات" },
        { day: "الأربعاء", focus: "اللغة العربية", hours: "6 ساعات" },
        { day: "الخميس", focus: "اللغات الأجنبية", hours: "6 ساعات" },
        { day: "الجمعة", focus: "مراجعة مكثفة", hours: "7 ساعات" },
        { day: "السبت", focus: "اختبارات وتقييم", hours: "5 ساعات" },
      ],
      tips: ["ابدأ من الأساسيات", "اطلب مساعدة فورية", "ادرس بجدية قصوى", "لا تيأس واستمر"],
    }
  }
}

// دالة تحميل PDF
const downloadPDF = (finalGrade: number, subjects: Subject[], analysis: any) => {
  // إنشاء محتوى HTML للطباعة
  const printContent = `
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
  <meta charset="UTF-8">
  <title>نتيجة الباكالوريا</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; background: #f5f5f5; }
    .header { text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 15px; margin-bottom: 30px; }
    .result-card { background: white; padding: 25px; border-radius: 15px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); margin-bottom: 20px; }
    .grade-display { font-size: 48px; font-weight: bold; text-align: center; color: #667eea; margin: 20px 0; }
    .subjects-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    .subjects-table th, .subjects-table td { border: 1px solid #ddd; padding: 12px; text-align: center; }
    .subjects-table th { background: #667eea; color: white; }
    .status-badge { padding: 8px 16px; border-radius: 20px; font-weight: bold; display: inline-block; }
    .excellent { background: #10b981; color: white; }
    .very-good { background: #3b82f6; color: white; }
    .good { background: #8b5cf6; color: white; }
    .acceptable { background: #f59e0b; color: white; }
    .weak { background: #ef4444; color: white; }
    .footer { text-align: center; margin-top: 30px; color: #666; }
  </style>
</head>
<body>
  <div class="header">
    <h1>🎓 نتيجة الباكالوريا المتقدمة</h1>
    <p>تقرير شامل ومفصل</p>
  </div>
  
  <div class="result-card">
    <h2>📊 النتيجة النهائية</h2>
    <div class="grade-display">${finalGrade.toFixed(2)}</div>
    <div style="text-align: center;">
      <span class="status-badge ${finalGrade >= 16 ? "excellent" : finalGrade >= 14 ? "very-good" : finalGrade >= 12 ? "good" : finalGrade >= 10 ? "acceptable" : "weak"}">
        ${finalGrade >= 16 ? "ممتاز" : finalGrade >= 14 ? "جيد جداً" : finalGrade >= 12 ? "جيد" : finalGrade >= 10 ? "مقبول" : "ضعيف"}
      </span>
    </div>
  </div>

  <div class="result-card">
    <h2>📚 تفاصيل المواد</h2>
    <table class="subjects-table">
      <thead>
        <tr>
          <th>المادة</th>
          <th>الدرجة</th>
          <th>المعامل</th>
          <th>النقاط المحصلة</th>
        </tr>
      </thead>
      <tbody>
        ${subjects
          .map(
            (subject) => `
          <tr>
            <td>${subject.name}</td>
            <td>${subject.grade}</td>
            <td>${subject.coefficient}</td>
            <td>${(subject.grade * subject.coefficient).toFixed(2)}</td>
          </tr>
        `,
          )
          .join("")}
      </tbody>
    </table>
  </div>

  <div class="result-card">
    <h2>🎯 التوصيات</h2>
    <ul>
      ${
        analysis?.weakSubjects?.length > 0
          ? `<li><strong>المواد التي تحتاج تحسين:</strong> ${analysis.weakSubjects.map((s: Subject) => s.name).join(", ")}</li>`
          : "<li>جميع المواد في مستوى جيد</li>"
      }
      ${
        analysis?.strongSubjects?.length > 0
          ? `<li><strong>المواد المتميزة:</strong> ${analysis.strongSubjects.map((s: Subject) => s.name).join(", ")}</li>`
          : ""
      }
      <li><strong>المعدل العام للمواد:</strong> ${analysis?.averageGrade?.toFixed(2) || "غير محسوب"}</li>
    </ul>
  </div>

  <div class="footer">
    <p>تم إنشاء هذا التقرير بواسطة حاسبة معدل الباكالوريا المتقدمة</p>
    <p>تاريخ الإنشاء: ${new Date().toLocaleDateString("ar-SA")}</p>
  </div>
</body>
</html>
`

  // فتح نافذة جديدة للطباعة
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 250)
  }
}

export default function BacCalculator() {
  const [subjects, setSubjects] = useState<Subject[]>([
    { name: "الرياضيات", coefficient: 4, grade: null },
    { name: "الفيزياء", coefficient: 4, grade: null },
    { name: "العلوم الطبيعية", coefficient: 2, grade: null },
    { name: "اللغة العربية", coefficient: 3, grade: null },
    { name: "اللغة الفرنسية", coefficient: 2, grade: null },
    { name: "اللغة الإنجليزية", coefficient: 2, grade: null },
    { name: "الفلسفة", coefficient: 2, grade: null },
    { name: "التاريخ والجغرافيا", coefficient: 2, grade: null },
    { name: "التربية الإسلامية", coefficient: 1, grade: null },
    { name: "الرياضة", coefficient: 1, grade: null },
  ])
  const [finalGrade, setFinalGrade] = useState<number | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [predictiveScenarios, setPredictiveScenarios] = useState<PredictiveScenario[]>([])

  const studyPlan = React.useMemo(() => (finalGrade !== null ? getStudyPlan(finalGrade) : null), [finalGrade])

  const { toast } = useToast()

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "تم النسخ!",
      description: "تم نسخ النص إلى الحافظة.",
    })
  }

  const downloadPDFold = () => {
    if (finalGrade === null) return
    const doc = new jsPDF()
    doc.setFont("Helvetica", "bold")
    doc.text("نتيجة الباكالوريا", 105, 20, { align: "center" })
    doc.setFontSize(12)
    doc.text(`المعدل النهائي: ${finalGrade.toFixed(2)}`, 20, 40)
    doc.text(`التقدير: ${getGradeStatus(finalGrade).status}`, 20, 50)
    doc.text("تفاصيل المواد:", 20, 65)
    subjects.forEach((s, i) => doc.text(`${i + 1}. ${s.name} – ${s.grade}`, 25, 75 + i * 8))
    doc.save("bac-result.pdf")
  }

  const [bacType, setBacType] = useState<BacType>({ type: "", branch: "", track: "" })
  const [analysis, setAnalysis] = useState<any>(null)
  const [showResult, setShowResult] = useState(false)
  const [includePE, setIncludePE] = useState(true)
  const [simulatedGradeWeakImprovement, setSimulatedGradeWeakImprovement] = useState<number | null>(null)
  const [simulatedGradeWeakImprovement3, setSimulatedGradeWeakImprovement3] = useState<number | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<string>("realistic")
  const resultsRef = useRef<HTMLDivElement>(null)

  const subjectsData = {
    // باك حر - جميع المسالك
    literature: {
      subjects: [
        "اللغة الأجنبية الأولى",
        "الرياضيات",
        "التربية الإسلامية",
        "آداب اللغة العربية",
        "اللغة الأجنبية الثانية",
        "التاريخ والجغرافيا",
        "الفلسفة",
        "التربية البدنية",
      ],
      coefficients: [4, 1, 2, 4, 4, 3, 3, 1],
    },
    humanities: {
      subjects: [
        "اللغة الأجنبية الأولى",
        "الرياضيات",
        "التربية الإسلامية",
        "آداب اللغة العربية",
        "اللغة الأجنبية الثانية",
        "التاريخ والجغرافيا",
        "الفلسفة",
        "التربية البدنية",
      ],
      coefficients: [4, 1, 2, 3, 3, 4, 4, 1],
    },
    agricultural_sciences: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "الترجمة",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "العلوم النباتية والحيوانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 2, 2, 7, 5, 5, 2, 2, 5, 1],
    },
    physical_sciences: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "الترجمة",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 2, 2, 7, 7, 5, 2, 2, 1],
    },
    life_earth_sciences: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "الترجمة",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 2, 2, 7, 5, 7, 2, 2, 1],
    },
    mathematics_stream_a: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "الترجمة",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 2, 2, 9, 7, 3, 2, 2, 1],
    },
    mathematics_stream_b: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "الترجمة",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم المهندس",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 2, 2, 9, 7, 3, 2, 2, 1],
    },
    management_accounting: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "القانون",
        "معلوميات التدبير",
        "الرياضيات",
        "المحاسبة والرياضيات المالية",
        "الاقتصاد العام والإحصاء",
        "الاقتصاد والتنظيم الإداري للمقاولات",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 3, 2, 2, 1, 1, 4, 6, 3, 6, 2, 2, 1],
    },
    economics: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "التاريخ والجغرافيا",
        "القانون",
        "معلوميات التدبير",
        "الرياضيات",
        "المحاسبة والرياضيات المالية",
        "الاقتصاد العام والإحصاء",
        "الاقتصاد والتنظيم الإداري للمقاولات",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 3, 2, 3, 1, 1, 4, 4, 6, 3, 2, 2, 1],
    },
    mechanical_technologies: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم المهندس",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 7, 5, 8, 2, 2, 1],
    },
    electrical_technologies: {
      subjects: [
        "اللغة العربية",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم المهندس",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 7, 5, 8, 2, 2, 1],
    },
    religious_sciences: {
      subjects: [
        "اللغة الأجنبية الأولى",
        "الاجتماعيات",
        "علوم اللغة العربية",
        "الفرائض والتوقيت",
        "الرياضيات",
        "التوثيق",
        "الأدب",
        "التفسير والحديث",
        "الفقه والأصول",
        "اللغة الأجنبية الثانية",
        "الفلسفة",
        "التربية البدنية",
      ],
      coefficients: [3, 2, 2, 2, 1, 1, 4, 5, 5, 2, 2, 1],
    },
    arabic_language: {
      subjects: [
        "الرياضيات",
        "اللغة الأجنبية الأولى",
        "الاجتماعيات",
        "التوثيق",
        "علوم اللغة",
        "الأدب",
        "التفسير والحديث",
        "اللغة الأجنبية الثانية",
        "الفلسفة",
        "التربية البدنية",
      ],
      coefficients: [1, 3, 3, 1, 4, 5, 4, 2, 2, 1],
    },
    applied_arts: {
      subjects: [
        "الرياضيات",
        "اللغة الأجنبية الأولى",
        "التربية الإسلامية",
        "اللغة العربية",
        "المعلوميات والانفوغرافيا",
        "الثقافة التشكيلية وتاريخ الفن",
        "اللغة الأجنبية الثانية",
        "الفلسفة",
        "فن تصميم التواصل والوسائط المتعددة",
        "فن تصميم المنتوج",
        "التربية البدنية",
      ],
      coefficients: [2, 4, 2, 2, 2, 2, 2, 2, 8, 5, 1],
    },
    // باك متمدرس - جميع المسالك
    literature_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "آداب اللغة العربية",
        "اللغة الأجنبية الثانية",
        "التاريخ والجغرافيا",
        "الفلسفة",
      ],
      coefficients: [0, 0, 0, 4, 4, 3, 3],
    },
    humanities_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "آداب اللغة العربية",
        "اللغة الأجنبية الثانية",
        "التاريخ والجغرافيا",
        "الفلسفة",
      ],
      coefficients: [0, 0, 0, 3, 3, 4, 4],
    },
    agricultural_sciences_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
        "العلوم النباتية والحيوانية",
      ],
      coefficients: [0, 0, 0, 7, 5, 5, 2, 2, 5],
    },
    physical_sciences_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 7, 7, 5, 2, 2],
    },
    life_earth_sciences_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 7, 5, 7, 2, 2],
    },
    mathematics_stream_a_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم الحياة والأرض",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 9, 7, 3, 2, 2],
    },
    mathematics_stream_b_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم المهندس",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 9, 7, 3, 2, 2],
    },
    management_accounting_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "المحاسبة والرياضيات المالية",
        "الاقتصاد العام والإحصاء",
        "الاقتصاد والتنظيم الإداري للمقاولات",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 4, 6, 3, 6, 2, 2],
    },
    economics_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "المحاسبة والرياضيات المالية",
        "الاقتصاد العام والإحصاء",
        "الاقتصاد والتنظيم الإداري للمقاولات",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 4, 4, 6, 3, 2, 2],
    },
    mechanical_technologies_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم المهندس",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 7, 5, 8, 2, 2],
    },
    electrical_technologies_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الرياضيات",
        "الفيزياء والكيمياء",
        "علوم المهندس",
        "الفلسفة",
        "اللغة الأجنبية الثانية",
      ],
      coefficients: [0, 0, 0, 7, 5, 8, 2, 2],
    },
    religious_sciences_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "الأدب",
        "التفسير والحديث",
        "الفقه والأصول",
        "اللغة الأجنبية الثانية",
        "الفلسفة",
      ],
      coefficients: [0, 0, 0, 4, 5, 5, 2, 2],
    },
    arabic_language_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "علوم اللغة",
        "الأدب",
        "التفسير والحديث",
        "اللغة الأجنبية الثانية",
        "الفلسفة",
      ],
      coefficients: [0, 0, 0, 4, 5, 4, 2, 2],
    },
    applied_arts_motamadris: {
      subjects: [
        "معدل الدورة الأولى",
        "معدل الدورة الثانية",
        "إمتحان الجهوي",
        "اللغة الأجنبية الثانية",
        "الفلسفة",
        "فن تصميم التواصل والوسائط المتعددة",
        "فن تصميم المنتوج",
      ],
      coefficients: [0, 0, 0, 2, 2, 8, 5],
    },
  }

  const branches = {
    motamadris: [
      { value: "artsAndHumanities_motamadris", label: "شعبة الآداب والعلوم الإنسانية" },
      { value: "experimentalSciences_motamadris", label: "شعبة العلوم التجريبية" },
      { value: "mathematicalSciences_motamadris", label: "شعبة العلوم الرياضية" },
      { value: "genuineEducation_motamadris", label: "شعبة التعليم الأصيل" },
      { value: "economicAndManagementSciences_motamadris", label: "شعبة العلوم الاقتصادية والتدبير" },
      { value: "scienceAndTechnologies_motamadris", label: "شعبة العلوم والتكنولوجيات" },
      { value: "appliedArts_motamadris", label: "شعبة الفنون التطبيقية" },
    ],
    literary: [
      { value: "artsAndHumanities", label: "شعبة الآداب والعلوم الإنسانية" },
      { value: "experimentalSciences", label: "شعبة العلوم التجريبية" },
      { value: "mathematicalSciences", label: "شعبة العلوم الرياضية" },
      { value: "genuineEducation", label: "شعبة التعليم الأصيل" },
      { value: "economicAndManagementSciences", label: "شعبة العلوم الاقتصادية والتدبير" },
      { value: "scienceAndTechnologies", label: "شعبة العلوم والتكنولوجيات" },
      { value: "appliedArts", label: "شعبة الفنون التطبيقية" },
    ],
  }

  const tracks = {
    artsAndHumanities: [
      { value: "literature", label: "مسلك الآداب" },
      { value: "humanities", label: "مسلك العلوم الإنسانية" },
    ],
    experimentalSciences: [
      { value: "life_earth_sciences", label: "مسلك علوم الحياة والأرض" },
      { value: "physical_sciences", label: "مسلك العلوم الفيزيائية" },
      { value: "agricultural_sciences", label: "مسلك العلوم الزراعية" },
    ],
    mathematicalSciences: [
      { value: "mathematics_stream_a", label: 'مسلك العلوم الرياضية "أ"' },
      { value: "mathematics_stream_b", label: 'مسلك العلوم الرياضية "ب"' },
    ],
    genuineEducation: [
      { value: "religious_sciences", label: "مسلك العلوم الشرعية" },
      { value: "arabic_language", label: "مسلك اللغة العربية" },
    ],
    economicAndManagementSciences: [
      { value: "economics", label: "مسلك العلوم الاقتصادية" },
      { value: "management_accounting", label: "مسلك علوم التدبير المحاسباتي" },
    ],
    scienceAndTechnologies: [
      { value: "mechanical_technologies", label: "مسلك علوم التكنولوجيات الميكانيكية" },
      { value: "electrical_technologies", label: "مسلك علوم التكنولوجيات الكهربائية" },
    ],
    appliedArts: [{ value: "applied_arts", label: "مسلك الفنون التطبيقية" }],
    // باك متمدرس
    artsAndHumanities_motamadris: [
      { value: "literature_motamadris", label: "مسلك الآداب" },
      { value: "humanities_motamadris", label: "مسلك العلوم الإنسانية" },
    ],
    experimentalSciences_motamadris: [
      { value: "life_earth_sciences_motamadris", label: "مسلك علوم الحياة والأرض" },
      { value: "physical_sciences_motamadris", label: "مسلك العلوم الفيزيائية" },
      { value: "agricultural_sciences_motamadris", label: "مسلك العلوم الزراعية" },
    ],
    mathematicalSciences_motamadris: [
      { value: "mathematics_stream_a_motamadris", label: 'مسلك العلوم الرياضية "أ"' },
      { value: "mathematics_stream_b_motamadris", label: 'مسلك العلوم الرياضية "ب"' },
    ],
    genuineEducation_motamadris: [
      { value: "religious_sciences_motamadris", label: "مسلك العلوم الشرعية" },
      { value: "arabic_language_motamadris", label: "مسلك اللغة العربية" },
    ],
    economicAndManagementSciences_motamadris: [
      { value: "economics_motamadris", label: "مسلك العلوم الاقتصادية" },
      { value: "management_accounting_motamadris", label: "مسلك علوم التدبير المحاسباتي" },
    ],
    scienceAndTechnologies_motamadris: [
      { value: "mechanical_technologies_motamadris", label: "مسلك علوم التكنولوجيات الميكانيكية" },
      { value: "electrical_technologies_motamadris", label: "مسلك علوم التكنولوجيات الكهربائية" },
    ],
    appliedArts_motamadris: [{ value: "applied_arts_motamadris", label: "مسلك الفنون التطبيقية" }],
  }

  useEffect(() => {
    if (bacType.track && subjectsData[bacType.track as keyof typeof subjectsData]) {
      const trackData = subjectsData[bacType.track as keyof typeof subjectsData]
      const newSubjects = trackData.subjects.map((subject, index) => ({
        name: subject,
        grade: 0,
        coefficient: trackData.coefficients[index],
      }))
      setSubjects(newSubjects)
      setFinalGrade(null)
      setShowResult(false)
      setAnalysis(null)
    }
  }, [bacType.track])

  const getGradeStatus = (grade: number) => {
    if (grade < 10) return { status: "راسب", color: "text-red-600", bgColor: "bg-red-100", icon: AlertCircle }
    if (grade >= 10 && grade < 12)
      return { status: "مقبول", color: "text-yellow-600", bgColor: "bg-yellow-100", icon: CheckCircle }
    if (grade >= 12 && grade < 14) return { status: "حسن", color: "text-blue-600", bgColor: "bg-blue-100", icon: Star }
    if (grade >= 14 && grade < 16)
      return { status: "حسن جداً", color: "text-green-600", bgColor: "bg-green-100", icon: Award }
    return { status: "ممتاز", color: "text-purple-600", bgColor: "bg-purple-100", icon: Trophy }
  }

  const calculateGrade = async () => {
    if (subjects.length === 0) return

    setIsCalculating(true)
    setShowResult(false)

    // تأثير التحميل
    await new Promise((resolve) => setTimeout(resolve, 2000))

    let final = 0

    if (bacType.track.includes("motamadris")) {
      // حساب باك متمدرس
      const continuousGrade1 = subjects[0]?.grade || 0
      const continuousGrade2 = subjects[1]?.grade || 0
      const regionalExam = subjects[2]?.grade || 0

      let nationalExamTotal = 0
      let totalCredits = 0

      for (let i = 3; i < subjects.length; i++) {
        const subject = subjects[i]
        if (subject.coefficient > 0) {
          nationalExamTotal += subject.grade * subject.coefficient
          totalCredits += subject.coefficient
        }
      }

      const nationalExamAverage = totalCredits > 0 ? nationalExamTotal / totalCredits : 0
      final = nationalExamAverage * 0.5 + regionalExam * 0.25 + ((continuousGrade1 + continuousGrade2) / 2) * 0.25
    } else {
      // حساب باك حر
      let totalPoints = 0
      let totalCredits = 0

      subjects.forEach((subject) => {
        // إذا كانت التربية البدنية ولم يجتزها المستخدم، تجاهلها
        if (subject.name === "التربية البدنية" && !includePE) {
          return
        }

        if (subject.coefficient > 0) {
          totalPoints += subject.grade * subject.coefficient
          totalCredits += subject.coefficient
        }
      })

      final = totalCredits > 0 ? totalPoints / totalCredits : 0
    }

    setFinalGrade(final)
    setIsCalculating(false)

    // تأثير إظهار النتيجة
    setTimeout(() => {
      setShowResult(true)
      generateAnalysis(final)

      // التمرير التلقائي إلى النتائج مع تعديل الموضع
      setTimeout(() => {
        if (resultsRef.current) {
          const elementTop = resultsRef.current.offsetTop
          const elementHeight = resultsRef.current.offsetHeight
          const windowHeight = window.innerHeight

          // حساب الموضع لجعل النتيجة في الوسط
          const scrollToPosition = elementTop - windowHeight / 2 + elementHeight / 4

          window.scrollTo({
            top: Math.max(0, scrollToPosition),
            behavior: "smooth",
          })
        }
      }, 100)
    }, 500)
  }

  const generatePredictiveScenarios = (
    currentSubjects: Subject[],
    currentBacType: BacType,
    currentIncludePE: boolean,
    currentGrade: number,
  ) => {
    const validSubjects = currentSubjects.filter(
      (s) => s.coefficient > 0 && (s.name !== "التربية البدنية" || currentIncludePE),
    )
    const weakSubjects = validSubjects.filter((s) => s.grade < 12)
    const averageSubjects = validSubjects.filter((s) => s.grade >= 12 && s.grade < 16)
    const strongSubjects = validSubjects.filter((s) => s.grade >= 16)

    // سيناريو متحفظ: تحسين طفيف
    const conservativeScenario = simulateScenario(
      currentSubjects,
      {
        weakImprovement: 1.5,
        averageImprovement: 0.5,
        strongImprovement: 0.2,
      },
      currentBacType,
      currentIncludePE,
    )

    // سيناريو واقعي: تحسين متوسط
    const realisticScenario = simulateScenario(
      currentSubjects,
      {
        weakImprovement: 2.5,
        averageImprovement: 1.0,
        strongImprovement: 0.5,
      },
      currentBacType,
      currentIncludePE,
    )

    // سيناريو متفائل: تحسين كبير
    const optimisticScenario = simulateScenario(
      currentSubjects,
      {
        weakImprovement: 4.0,
        averageImprovement: 2.0,
        strongImprovement: 1.0,
      },
      currentBacType,
      currentIncludePE,
    )

    // سيناريو مثالي: أقصى تحسين ممكن
    const idealScenario = simulateScenario(
      currentSubjects,
      {
        weakImprovement: 6.0,
        averageImprovement: 3.0,
        strongImprovement: 1.5,
      },
      currentBacType,
      currentIncludePE,
    )

    // تحليل تأثير المواد الفردية
    const subjectImpactAnalysis = validSubjects
      .map((subject) => {
        const impactFor1Point = calculateSubjectImpact(currentSubjects, subject, 1, currentBacType, currentIncludePE)
        const impactFor2Points = calculateSubjectImpact(currentSubjects, subject, 2, currentBacType, currentIncludePE)
        const impactFor3Points = calculateSubjectImpact(currentSubjects, subject, 3, currentBacType, currentIncludePE)

        return {
          subject: subject.name,
          coefficient: subject.coefficient,
          currentGrade: subject.grade,
          impactPer1Point: impactFor1Point - currentGrade,
          impactPer2Points: impactFor2Points - currentGrade,
          impactPer3Points: impactFor3Points - currentGrade,
          efficiency: (impactFor1Point - currentGrade) * subject.coefficient,
          priority: (subject.coefficient * (20 - subject.grade)) / 20,
        }
      })
      .sort((a, b) => b.efficiency - a.efficiency)

    // تحليل الوقت المطلوب للوصول لأهداف محددة
    const timeAnalysis = {
      toReach14: calculateTimeToReach(currentGrade, 14, validSubjects),
      toReach16: calculateTimeToReach(currentGrade, 16, validSubjects),
      toReach18: calculateTimeToReach(currentGrade, 18, validSubjects),
    }

    return {
      conservative: {
        grade: conservativeScenario,
        improvement: conservativeScenario - currentGrade,
        probability: 85,
        timeframe: "شهر واحد",
        effort: "منخفض",
        description: "تحسين تدريجي مع جهد معتدل",
      },
      realistic: {
        grade: realisticScenario,
        improvement: realisticScenario - currentGrade,
        probability: 70,
        timeframe: "شهرين",
        effort: "متوسط",
        description: "تحسين ملحوظ مع جهد منتظم",
      },
      optimistic: {
        grade: optimisticScenario,
        improvement: optimisticScenario - currentGrade,
        probability: 45,
        timeframe: "3 أشهر",
        effort: "عالي",
        description: "تحسين كبير مع جهد مكثف",
      },
      ideal: {
        grade: idealScenario,
        improvement: idealScenario - currentGrade,
        probability: 20,
        timeframe: "4-6 أشهر",
        effort: "مكثف جداً",
        description: "أقصى تحسين ممكن مع جهد استثنائي",
      },
      subjectImpact: subjectImpactAnalysis,
      timeAnalysis: timeAnalysis,
      currentStats: {
        weakSubjects: weakSubjects.length,
        averageSubjects: averageSubjects.length,
        strongSubjects: strongSubjects.length,
        totalSubjects: validSubjects.length,
      },
    }
  }

  const simulateScenario = (subjects: Subject[], improvements: any, bacType: BacType, includePE: boolean) => {
    const simulatedSubjects = subjects.map((s) => {
      let improvement = 0
      if (s.grade < 12) improvement = improvements.weakImprovement
      else if (s.grade < 16) improvement = improvements.averageImprovement
      else improvement = improvements.strongImprovement

      return { ...s, grade: Math.min(s.grade + improvement, 20) }
    })

    return calculateFinalGrade(simulatedSubjects, bacType, includePE)
  }

  const calculateSubjectImpact = (
    subjects: Subject[],
    targetSubject: Subject,
    improvement: number,
    bacType: BacType,
    includePE: boolean,
  ) => {
    const simulatedSubjects = subjects.map((s) =>
      s.name === targetSubject.name ? { ...s, grade: Math.min(s.grade + improvement, 20) } : s,
    )

    return calculateFinalGrade(simulatedSubjects, bacType, includePE)
  }

  const calculateFinalGrade = (subjects: Subject[], bacType: BacType, includePE: boolean) => {
    let final = 0

    if (bacType.track.includes("motamadris")) {
      const continuousGrade1 = subjects[0]?.grade || 0
      const continuousGrade2 = subjects[1]?.grade || 0
      const regionalExam = subjects[2]?.grade || 0

      let nationalExamTotal = 0
      let totalCredits = 0

      for (let i = 3; i < subjects.length; i++) {
        const subject = subjects[i]
        if (subject.coefficient > 0) {
          nationalExamTotal += subject.grade * subject.coefficient
          totalCredits += subject.coefficient
        }
      }

      const nationalExamAverage = totalCredits > 0 ? nationalExamTotal / totalCredits : 0
      final = nationalExamAverage * 0.5 + regionalExam * 0.25 + ((continuousGrade1 + continuousGrade2) / 2) * 0.25
    } else {
      let totalPoints = 0
      let totalCredits = 0

      subjects.forEach((subject) => {
        if (subject.name === "التربية البدنية" && !includePE) {
          return
        }

        if (subject.coefficient > 0) {
          totalPoints += subject.grade * subject.coefficient
          totalCredits += subject.coefficient
        }
      })

      final = totalCredits > 0 ? totalPoints / totalCredits : 0
    }

    return final
  }

  const calculateTimeToReach = (currentGrade: number, targetGrade: number, subjects: Subject[]) => {
    if (currentGrade >= targetGrade) return "تم تحقيقه بالفعل"

    const improvementNeeded = targetGrade - currentGrade
    const averageImprovementRate = 0.5 // نقطة واحدة كل شهرين في المتوسط
    const estimatedMonths = Math.ceil(improvementNeeded / averageImprovementRate)

    if (estimatedMonths <= 2) return "شهر إلى شهرين"
    if (estimatedMonths <= 4) return "2-4 أشهر"
    if (estimatedMonths <= 6) return "4-6 أشهر"
    return "أكثر من 6 أشهر"
  }

  // تحديث دالة generateAnalysis لتشمل تصفية الجامعات والشعبة
  const generateAnalysis = (grade: number) => {
    const validSubjects = subjects.filter((s) => s.coefficient > 0 && (s.name !== "التربية البدنية" || includePE))
    const weakSubjects = validSubjects.filter((s) => s.grade < 10)
    const strongSubjects = validSubjects.filter((s) => s.grade >= 16)
    const averageGrade = validSubjects.reduce((sum, s) => sum + s.grade, 0) / validSubjects.length

    // تحديد نوع الشعبة للتصفية
    let branchType = "علمية"
    if (bacType.branch?.includes("artsAndHumanities")) branchType = "أدبية"
    else if (bacType.branch?.includes("economicAndManagement")) branchType = "اقتصادية"
    else if (bacType.branch?.includes("genuineEducation")) branchType = "أصيل"
    else if (bacType.branch?.includes("appliedArts")) branchType = "فنية"
    else if (bacType.branch?.includes("scienceAndTechnologies")) branchType = "تقنية"

    const eligibleUniversities = universityRequirements.filter(
      (u) => grade >= u.minGrade && (u.branch === branchType || u.branch === "عامة"),
    )
    const potentialUniversities = universityRequirements.filter(
      (u) => grade >= u.minGrade - 2 && grade < u.minGrade && (u.branch === branchType || u.branch === "عامة"),
    )

    // Calculate simulated grades for prediction
    const simulateGradeImprovement = (
      subjectsToImprove: Subject[],
      pointsToAdd: number,
      allSubjects: Subject[],
      bacType: BacType,
      includePE: boolean,
    ) => {
      const updatedSubjects = allSubjects.map((subject) => {
        if (subjectsToImprove.some((s) => s.name === subject.name)) {
          return { ...subject, grade: Math.min(20, subject.grade + pointsToAdd) }
        }
        return subject
      })
      return calculateFinalGrade(updatedSubjects, bacType, includePE)
    }

    // Calculate simulated grades for prediction
    const simulated2Points = simulateGradeImprovement(weakSubjects, 2, subjects, bacType, includePE)
    const simulated3Points = simulateGradeImprovement(weakSubjects, 3, subjects, bacType, includePE)
    setSimulatedGradeWeakImprovement(simulated2Points)
    setSimulatedGradeWeakImprovement3(simulated3Points)

    // Generate predictive scenarios
    const scenarios = generatePredictiveScenarios(subjects, bacType, includePE, grade)
    setPredictiveScenarios(scenarios)

    setAnalysis({
      weakSubjects,
      strongSubjects,
      averageGrade,
      eligibleUniversities,
      potentialUniversities,
      improvementNeeded: 16 - grade,
    })
  }

  const updateSubjectGrade = (index: number, grade: number) => {
    const newSubjects = [...subjects]
    newSubjects[index].grade = grade
    setSubjects(newSubjects)
  }

  // تحسين تصفية البيانات للرسوم البيانية (لم تعد مستخدمة ولكن تم الاحتفاظ بها لسلامة الكود)
  const chartData = subjects
    .filter((s, index) => {
      if (bacType.track.includes("motamadris") && index < 3) {
        return false
      }
      if (s.name === "التربية البدنية" && !includePE) {
        return false
      }
      return s.coefficient > 0
    })
    .map((subject) => ({
      name: subject.name.length > 15 ? subject.name.substring(0, 15) + "..." : subject.name,
      grade: subject.grade,
      coefficient: subject.coefficient,
      weightedGrade: subject.grade * subject.coefficient,
    }))

  const pieChartData = [
    {
      name: "ممتاز (16-20)",
      value: subjects.filter(
        (s, index) =>
          !(bacType.track.includes("motamadris") && index < 3) &&
          s.grade >= 16 &&
          s.grade < 20 &&
          s.coefficient > 0 &&
          (s.name !== "التربية البدنية" || includePE),
      ).length,
    },
    {
      name: "حسن جداً (14-16)",
      value: subjects.filter(
        (s, index) =>
          !(bacType.track.includes("motamadris") && index < 3) &&
          s.grade >= 14 &&
          s.grade < 16 &&
          s.coefficient > 0 &&
          (s.name !== "التربية البدنية" || includePE),
      ).length,
    },
    {
      name: "حسن (12-14)",
      value: subjects.filter(
        (s, index) =>
          !(bacType.track.includes("motamadris") && index < 3) &&
          s.grade >= 12 &&
          s.grade < 14 &&
          s.coefficient > 0 &&
          (s.name !== "التربية البدنية" || includePE),
      ).length,
    },
    {
      name: "مقبول (10-12)",
      value: subjects.filter(
        (s, index) =>
          !(bacType.track.includes("motamadris") && index < 3) &&
          s.grade >= 10 &&
          s.grade < 12 &&
          s.coefficient > 0 &&
          (s.name !== "التربية البدنية" || includePE),
      ).length,
    },
    {
      name: "راسب (أقل من 10)",
      value: subjects.filter(
        (s, index) =>
          !(bacType.track.includes("motamadris") && index < 3) &&
          s.grade < 10 &&
          s.coefficient > 0 &&
          (s.name !== "التربية البدنية" || includePE),
      ).length,
    },
  ].filter((item) => item.value > 0)

  const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16", "#F97316"]

  return (
    <div className="subtle-aurora-bg p-4 relative overflow-hidden" dir="rtl">
      {/* Subtle grid pattern */}
      <div className="grid-pattern-overlay"></div>

      {/* Floating particles */}
      <div className="floating-particles">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8 relative z-10">
        {/* Header محسن */}
        <div className="text-center space-y-6 mb-12 relative z-20">
          <div className="relative">
            <div className="absolute inset-0 flex items-center justify-center -z-10">
              <div className="w-40 h-40 bg-blue-500/20 rounded-full blur-3xl animate-enhanced-pulse"></div>
            </div>
            <div className="relative flex flex-col lg:flex-row items-center justify-center gap-6 z-10">
              <div className="p-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-2xl shadow-blue-500/30 animate-bounce hover-lift">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradient-x text-center lg:text-left px-4 py-2 bg-slate-900/50 rounded-2xl backdrop-blur-sm border border-white/10">
                حاسبة معدل الباكالوريا المتقدمة
              </h1>
              <div className="p-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full shadow-2xl shadow-purple-500/30 animate-bounce animation-delay-200 hover-lift">
                <Sparkles className="h-12 w-12 text-white" />
              </div>
            </div>
          </div>
          <p className="text-gray-300 text-xl font-medium relative z-10 bg-slate-900/30 rounded-lg px-6 py-3 backdrop-blur-sm border border-white/10 inline-block">
            احسب معدلك مع التحليل والتنبؤات الذكية
          </p>
          <div className="flex justify-center gap-3 relative z-10">
            <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce shadow-lg shadow-blue-400/50 glow-blue"></div>
            <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce animation-delay-200 shadow-lg shadow-purple-400/50 glow-purple"></div>
            <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce animation-delay-400 shadow-lg shadow-pink-400/50 glow-pink"></div>
          </div>
        </div>

        {/* Selection Cards محسن */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 group hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white group-hover:text-blue-300 transition-colors duration-300">
                <div className="p-2 bg-blue-500/20 rounded-lg group-hover:bg-blue-500/30 transition-colors duration-300">
                  <BookOpen className="h-6 w-6 text-blue-400" />
                </div>
                نوع الباكالوريا
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={bacType.type}
                onValueChange={(value) => setBacType({ ...bacType, type: value, branch: "", track: "" })}
              >
                <SelectTrigger className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300 focus:ring-2 focus:ring-blue-400/50">
                  <SelectValue placeholder="اختر نوع الباكالوريا" />
                </SelectTrigger>
                <SelectContent className="z-50 bg-white/95 backdrop-blur-lg border-white/20 shadow-2xl select-content">
                  <SelectItem value="motamadris" className="hover:bg-blue-500/20 transition-colors">
                    باك متمدرس
                  </SelectItem>
                  <SelectItem value="literary" className="hover:bg-blue-500/20 transition-colors">
                    باك حر
                  </SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {bacType.type && (
            <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/20 group hover-lift animate-fade-in-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white group-hover:text-purple-300 transition-colors duration-300">
                  <div className="p-2 bg-purple-500/20 rounded-lg group-hover:bg-purple-500/30 transition-colors duration-300">
                    <Users className="h-6 w-6 text-purple-400" />
                  </div>
                  الشعبة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select
                  value={bacType.branch}
                  onValueChange={(value) => setBacType({ ...bacType, branch: value, track: "" })}
                >
                  <SelectTrigger className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300 focus:ring-2 focus:ring-purple-400/50">
                    <SelectValue placeholder="اختر الشعبة" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white/95 backdrop-blur-lg border-white/20 shadow-2xl select-content">
                    {branches[bacType.type as keyof typeof branches]?.map((branch) => (
                      <SelectItem
                        key={branch.value}
                        value={branch.value}
                        className="hover:bg-blue-500/20 transition-colors"
                      >
                        {branch.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}

          {bacType.branch && (
            <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover:from-white/20 hover:to-white/10 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/20 group hover-lift animate-fade-in-scale">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white group-hover:text-pink-300 transition-colors duration-300">
                  <div className="p-2 bg-pink-500/20 rounded-lg group-hover:bg-pink-500/30 transition-colors duration-300">
                    <Brain className="h-6 w-6 text-pink-400" />
                  </div>
                  المسلك
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={bacType.track} onValueChange={(value) => setBacType({ ...bacType, track: value })}>
                  <SelectTrigger className="bg-white/20 border-white/30 text-white hover:bg-white/30 transition-all duration-300 focus:ring-2 focus:ring-pink-400/50">
                    <SelectValue placeholder="اختر المسلك" />
                  </SelectTrigger>
                  <SelectContent className="z-50 bg-white/95 backdrop-blur-lg border-white/20 shadow-2xl select-content">
                    {tracks[bacType.branch as keyof typeof tracks]?.map((track) => (
                      <SelectItem
                        key={track.value}
                        value={track.value}
                        className="hover:bg-blue-500/20 transition-colors"
                      >
                        {track.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Subjects Input محسن */}
        {subjects.length > 0 && bacType.track && (
          <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Target className="h-7 w-7 text-green-400" />
                </div>
                إدخال الدرجات
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject, index) => (
                  <div key={index} className="space-y-3">
                    <Label className="text-white font-medium text-lg">{subject.name}</Label>
                    <div className="flex items-center gap-3">
                      <Input
                        type="number"
                        min="0"
                        max="20"
                        value={subject.grade || ""}
                        onChange={(e) => updateSubjectGrade(index, Number.parseFloat(e.target.value) || 0)}
                        disabled={
                          subject.name === "التربية البدنية" && !bacType.track.includes("motamadris") && !includePE
                        }
                        className={`flex-1 bg-white/20 border-white/30 text-white placeholder:text-gray-300 text-lg transition-all duration-300 ${
                          subject.name === "التربية البدنية" && !bacType.track.includes("motamadris") && !includePE
                            ? "opacity-50 cursor-not-allowed bg-gray-500/20"
                            : "hover:bg-white/30 focus:bg-white/30"
                        }`}
                        placeholder={
                          subject.name === "التربية البدنية" && !bacType.track.includes("motamadris") && !includePE
                            ? "معطل"
                            : "0.00"
                        }
                      />
                      {subject.coefficient > 0 && (
                        <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-400/30">
                          معامل {subject.coefficient}
                        </Badge>
                      )}
                    </div>

                    {/* خيار التربية البدنية للباك الحر محسن */}
                    {subject.name === "التربية البدنية" && !bacType.track.includes("motamadris") && (
                      <div className="mt-3 p-4 bg-white/5 rounded-lg border border-white/20 hover:bg-white/10 transition-all duration-300">
                        <div className="flex items-center justify-between mb-3">
                          <Label className="text-white font-medium">هل اجتزت التربية البدنية؟</Label>
                          <div className="flex items-center gap-3">
                            <button
                              type="button"
                              onClick={() => setIncludePE(true)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                includePE
                                  ? "bg-green-500 text-white shadow-lg shadow-green-500/30 scale-105"
                                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                              }`}
                            >
                              نعم
                            </button>
                            <button
                              type="button"
                              onClick={() => setIncludePE(false)}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                                !includePE
                                  ? "bg-red-500 text-white shadow-lg shadow-red-500/30 scale-105"
                                  : "bg-white/10 text-gray-300 hover:bg-white/20"
                              }`}
                            >
                              لا
                            </button>
                          </div>
                        </div>
                        {!includePE && (
                          <div className="text-yellow-300 text-sm flex items-center gap-2 animate-fade-in-up">
                            <AlertCircle className="h-4 w-4" />
                            سيتم استبعاد التربية البدنية من الحساب
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <Button
                onClick={calculateGrade}
                disabled={isCalculating}
                className="w-full mt-8 h-16 text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 disabled:opacity-50 shadow-2xl hover:shadow-blue-500/30"
              >
                {isCalculating ? (
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري الحساب...
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <Calculator className="h-6 w-6" />
                    احسب المعدل والتحليل
                    <Sparkles className="h-6 w-6" />
                  </div>
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Results محسن */}
        {showResult && finalGrade !== null && (
          <div className="animate-fade-in-up" ref={resultsRef}>
            <Tabs defaultValue="result" className="space-y-6">
              {/* تحديث TabsList لتشمل 6 تبويبات */}
              <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-lg border-0 p-1 rounded-xl">
                <TabsTrigger
                  value="result"
                  className="data-[state=active]:bg-white/20 text-white rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  النتيجة
                </TabsTrigger>
                <TabsTrigger
                  value="analysis"
                  className="data-[state=active]:bg-white/20 text-white rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  التحليل
                </TabsTrigger>
                <TabsTrigger
                  value="prediction"
                  className="data-[state=active]:bg-white/20 text-white rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  التنبؤ
                </TabsTrigger>
                <TabsTrigger
                  value="universities"
                  className="data-[state=active]:bg-white/20 text-white rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  الجامعات
                </TabsTrigger>
                <TabsTrigger
                  value="strategy"
                  className="data-[state=active]:bg-white/20 text-white rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  استراتيجية الدراسة
                </TabsTrigger>
                <TabsTrigger
                  value="pdf"
                  className="data-[state=active]:bg-white/20 text-white rounded-lg transition-all duration-300 hover:bg-white/10"
                >
                  📄 PDF
                </TabsTrigger>
              </TabsList>

              <TabsContent value="result">
                <div className="space-y-8">
                  {/* النتيجة الرئيسية المحسنة */}
                  <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift overflow-hidden relative">
                    {/* تأثيرات الخلفية */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-gradient-x"></div>
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/20 rounded-full blur-2xl animate-pulse animation-delay-2000"></div>

                    <CardHeader className="relative z-10">
                      <CardTitle className="flex items-center gap-3 text-white text-3xl justify-center">
                        <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl shadow-2xl">
                          <Trophy className="h-8 w-8 text-white" />
                        </div>
                        🎉 نتيجة المعدل النهائي 🎉
                      </CardTitle>
                    </CardHeader>

                    <CardContent className="text-center space-y-10 relative z-10">
                      {/* عرض المعدل الرئيسي */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-3xl blur-xl"></div>
                        <div className="relative bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-lg rounded-3xl p-8 border border-white/20 shadow-2xl">
                          <div className="text-9xl font-black bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-enhanced-pulse drop-shadow-2xl">
                            {finalGrade.toFixed(2)}
                          </div>
                          <div className="text-2xl text-white/80 font-medium mt-2">من 20</div>

                          {/* الزخارف المتحركة */}
                          <div className="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg"></div>
                          <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full animate-bounce animation-delay-200 shadow-lg"></div>
                          <div className="absolute top-1/2 -left-6 w-4 h-4 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full animate-bounce animation-delay-400 shadow-lg"></div>
                          <div className="absolute top-1/4 -right-6 w-5 h-5 bg-gradient-to-r from-green-400 to-teal-400 rounded-full animate-bounce animation-delay-400 shadow-lg"></div>
                        </div>
                      </div>

                      {/* عرض التقدير المحسن */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-2xl blur-lg"></div>
                        <div
                          className={`relative inline-flex items-center gap-6 px-12 py-6 rounded-2xl ${getGradeStatus(finalGrade).bgColor} border-2 border-white/30 shadow-2xl hover:scale-105 transition-all duration-500 backdrop-blur-lg`}
                        >
                          {(() => {
                            const StatusIcon = getGradeStatus(finalGrade).icon
                            return (
                              <StatusIcon className={`h-12 w-12 ${getGradeStatus(finalGrade).color} drop-shadow-lg`} />
                            )
                          })()}
                          <div className="text-center">
                            <div className={`text-4xl font-black ${getGradeStatus(finalGrade).color} drop-shadow-lg`}>
                              {getGradeStatus(finalGrade).status}
                            </div>
                            <div className="text-lg text-white/80 font-medium mt-1">التقدير النهائي</div>
                          </div>
                          {(() => {
                            const StatusIcon = getGradeStatus(finalGrade).icon
                            return (
                              <StatusIcon className={`h-12 w-12 ${getGradeStatus(finalGrade).color} drop-shadow-lg`} />
                            )
                          })()}
                        </div>
                      </div>

                      {/* شريط التقدم المحسن */}
                      <div className="space-y-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-sm"></div>
                          <div className="relative bg-white/20 rounded-full h-8 overflow-hidden border border-white/30 shadow-inner">
                            <div
                              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-2000 ease-out rounded-full relative overflow-hidden"
                              style={{ width: `${(finalGrade / 20) * 100}%` }}
                            >
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-6 text-center">
                          <div className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-400/30">
                            <div className="text-3xl font-bold text-blue-300">
                              {((finalGrade / 20) * 100).toFixed(1)}%
                            </div>
                            <div className="text-blue-200 text-sm font-medium">النسبة المئوية</div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30">
                            <div className="text-3xl font-bold text-purple-300">{(20 - finalGrade).toFixed(2)}</div>
                            <div className="text-purple-200 text-sm font-medium">نقاط للعلامة الكاملة</div>
                          </div>
                          <div className="p-4 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-400/30">
                            <div className="text-3xl font-bold text-green-300">
                              {finalGrade >= 10 ? "ناجح" : "راسب"}
                            </div>
                            <div className="text-green-200 text-sm font-medium">الحالة</div>
                          </div>
                        </div>
                      </div>

                      {/* رسالة تحفيزية */}
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 rounded-xl blur-sm"></div>
                        <div className="relative p-6 bg-gradient-to-r from-slate-800/80 to-slate-900/80 backdrop-blur-lg rounded-xl border border-yellow-400/30 shadow-xl">
                          <div className="text-2xl font-bold text-yellow-300 mb-2">
                            {finalGrade >= 16
                              ? "🌟 أداء ممتاز! استمر في التفوق!"
                              : finalGrade >= 14
                                ? "🎯 أداء جيد جداً! قريب من التميز!"
                                : finalGrade >= 12
                                  ? "📈 أداء جيد! يمكنك تحسينه أكثر!"
                                  : finalGrade >= 10
                                    ? "💪 نجحت! ركز على التحسين!"
                                    : "🔥 لا تيأس! كل بداية صعبة!"}
                          </div>
                          <div className="text-white/80 text-lg">
                            {finalGrade >= 16
                              ? "معدلك ممتاز ويفتح لك أبواب أفضل الجامعات!"
                              : finalGrade >= 14
                                ? "معدل جيد جداً، بتحسين بسيط ستصل للتميز!"
                                : finalGrade >= 12
                                  ? "معدل جيد، ركز على المواد الضعيفة لتحسين أكبر!"
                                  : finalGrade >= 10
                                    ? "تهانينا على النجاح! الآن ركز على رفع المعدل!"
                                    : "لا تستسلم! راجع خطة الدراسة وابدأ من جديد!"}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="analysis">
                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-red-400">
                        <AlertCircle className="h-6 w-6" />
                        المواد التي تحتاج تحسين
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis?.weakSubjects.length > 0 ? (
                        <div className="space-y-3">
                          {analysis.weakSubjects.map((subject: Subject, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-4 bg-red-500/20 rounded-lg border border-red-400/30 hover:bg-red-500/30 transition-all duration-300"
                            >
                              <span className="text-white font-medium">{subject.name}</span>
                              <Badge className="bg-green-500 text-white shadow-lg">{subject.grade}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-xl">لا توجد مواد تحتاج إلى تحسين حالياً</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-green-400">
                        <Trophy className="h-6 w-6" />
                        المواد المتميزة
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {analysis?.strongSubjects.length > 0 ? (
                        <div className="space-y-3">
                          {analysis.strongSubjects.map((subject: Subject, index: number) => (
                            <div
                              key={index}
                              className="flex justify-between items-center p-4 bg-green-500/20 rounded-lg border border-green-400/30 hover:bg-green-500/30 transition-all duration-300"
                            >
                              <span className="text-white font-medium">{subject.name}</span>
                              <Badge className="bg-green-500 text-white shadow-lg">{subject.grade}</Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-gray-400 py-8">
                          <Star className="h-16 w-16 mx-auto mb-4 opacity-50" />
                          <p className="text-xl">لا توجد مواد متميزة حالياً</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="md:col-span-2 border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3 text-white">
                        <div className="p-2 bg-blue-500/20 rounded-lg">
                          <TrendingUp className="h-6 w-6 text-blue-400" />
                        </div>
                        توصيات للتحسين
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {analysis?.improvementNeeded > 0 && (
                          <Alert className="bg-blue-500/20 border-blue-400/30 rounded-xl">
                            <Info className="h-5 w-5 text-blue-400" />
                            <AlertDescription className="text-white text-lg">
                              تحتاج إلى تحسين معدلك بـ {analysis.improvementNeeded.toFixed(2)} نقطة للوصول إلى معدل
                              ممتاز (16)
                            </AlertDescription>
                          </Alert>
                        )}

                        <div className="grid md:grid-cols-2 gap-6">
                          <div className="p-6 bg-blue-500/20 rounded-xl border border-blue-400/30 hover:bg-blue-500/30 transition-all duration-300">
                            <h4 className="font-bold mb-4 text-blue-300 text-lg flex items-center gap-2">
                              <Target className="h-5 w-5" />
                              نصائح عامة:
                            </h4>
                            <ul className="text-white/80 space-y-3 text-base">
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                ركز على المواد ذات المعاملات العالية
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                راجع المواد الضعيفة بانتظام
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                استخدم تقنيات الدراسة الفعالة
                              </li>
                            </ul>
                          </div>

                          <div className="p-6 bg-purple-500/20 rounded-xl border border-purple-400/30 hover:bg-purple-500/30 transition-all duration-300">
                            <h4 className="font-bold mb-4 text-purple-300 text-lg flex items-center gap-2">
                              <Brain className="h-5 w-5" />
                              استراتيجية التحسين:
                            </h4>
                            <ul className="text-white/80 space-y-3 text-base">
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                حدد أهدافاً واقعية لكل مادة
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                اطلب المساعدة من المعلمين
                              </li>
                              <li className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                شارك في مجموعات الدراسة
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="prediction">
                <div className="space-y-6">
                  {/* اختيار السيناريو */}
                  {predictiveScenarios && (
                    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white text-2xl">
                          <div className="p-2 bg-blue-500/20 rounded-lg">
                            <Target className="h-7 w-7 text-blue-400" />
                          </div>
                          اختر سيناريو التنبؤ
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-4 gap-4 mb-6">
                          {Object.entries(predictiveScenarios)
                            .filter(
                              ([key]) => key !== "subjectImpact" && key !== "timeAnalysis" && key !== "currentStats",
                            )
                            .map(([key, scenario]: [string, any]) => (
                              <button
                                key={key}
                                onClick={() => setSelectedScenario(key)}
                                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                                  selectedScenario === key
                                    ? "border-blue-400 bg-blue-500/20 scale-105"
                                    : "border-white/20 bg-white/5 hover:bg-white/10"
                                }`}
                              >
                                <div className="text-center space-y-2">
                                  <div className="text-2xl">
                                    {key === "conservative" && "🐌"}
                                    {key === "realistic" && "🎯"}
                                    {key === "optimistic" && "🚀"}
                                    {key === "ideal" && "⭐"}
                                  </div>
                                  <h3 className="font-bold text-white">
                                    {key === "conservative" && "متحفظ"}
                                    {key === "realistic" && "واقعي"}
                                    {key === "optimistic" && "متفائل"}
                                    {key === "ideal" && "مثالي"}
                                  </h3>
                                  <div className="text-sm text-gray-300">
                                    <div>المعدل: {scenario.grade.toFixed(2)}</div>
                                    <div>الاحتمالية: {scenario.probability}%</div>
                                  </div>
                                </div>
                              </button>
                            ))}
                        </div>

                        {/* عرض تفاصيل السيناريو المختار */}
                        {predictiveScenarios[selectedScenario] && (
                          <div className="p-6 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30">
                            <div className="grid md:grid-cols-2 gap-6">
                              <div className="space-y-4">
                                <h4 className="text-xl font-bold text-blue-300">تفاصيل السيناريو</h4>
                                <div className="space-y-3">
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/80">المعدل المتوقع:</span>
                                    <span className="font-bold text-blue-300 text-xl">
                                      {predictiveScenarios[selectedScenario].grade.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/80">التحسن المتوقع:</span>
                                    <span className="font-bold text-green-300">
                                      +{predictiveScenarios[selectedScenario].improvement.toFixed(2)}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/80">احتمالية النجاح:</span>
                                    <span className="font-bold text-yellow-300">
                                      {predictiveScenarios[selectedScenario].probability}%
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/80">الإطار الزمني:</span>
                                    <span className="font-bold text-purple-300">
                                      {predictiveScenarios[selectedScenario].timeframe}
                                    </span>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span className="text-white/80">مستوى الجهد:</span>
                                    <span className="font-bold text-orange-300">
                                      {predictiveScenarios[selectedScenario].effort}
                                    </span>
                                  </div>
                                </div>
                              </div>
                              <div className="space-y-4">
                                <h4 className="text-xl font-bold text-purple-300">الوصف</h4>
                                <p className="text-white/80 text-lg leading-relaxed">
                                  {predictiveScenarios[selectedScenario].description}
                                </p>
                                <div className="mt-4">
                                  <Progress
                                    value={predictiveScenarios[selectedScenario].probability}
                                    className="h-3 bg-white/20"
                                  />
                                  <div className="text-center text-sm text-white/60 mt-2">
                                    احتمالية تحقيق هذا السيناريو
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}

                  {/* تحليل تأثير المواد */}
                  {predictiveScenarios?.subjectImpact && (
                    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white text-2xl">
                          <div className="p-2 bg-green-500/20 rounded-lg">
                            <TrendingUp className="h-7 w-7 text-green-400" />
                          </div>
                          تحليل تأثير المواد
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-white/80 mb-4">
                            المواد مرتبة حسب تأثيرها على المعدل العام (الأكثر تأثيراً أولاً):
                          </div>
                          <div className="grid gap-3">
                            {predictiveScenarios.subjectImpact.slice(0, 8).map((subject: any, index: number) => (
                              <div
                                key={index}
                                className="p-4 bg-gradient-to-r from-green-500/20 to-blue-500/20 rounded-lg border border-green-400/30"
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                                      {index + 1}
                                    </div>
                                    <span className="font-medium text-white">{subject.subject}</span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Badge className="bg-blue-500 text-white">معامل {subject.coefficient}</Badge>
                                    <Badge className="bg-yellow-500 text-white">حالياً: {subject.currentGrade}</Badge>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-4 text-sm">
                                  <div className="text-center p-2 bg-white/10 rounded">
                                    <div className="text-white/60">تأثير +1 نقطة</div>
                                    <div className="font-bold text-green-300">
                                      +{subject.impactPer1Point.toFixed(3)}
                                    </div>
                                  </div>
                                  <div className="text-center p-2 bg-white/10 rounded">
                                    <div className="text-white/60">تأثير +2 نقطة</div>
                                    <div className="font-bold text-blue-300">
                                      +{subject.impactPer2Points.toFixed(3)}
                                    </div>
                                  </div>
                                  <div className="text-center p-2 bg-white/10 rounded">
                                    <div className="text-white/60">تأثير +3 نقاط</div>
                                    <div className="font-bold text-purple-300">
                                      +{subject.impactPer3Points.toFixed(3)}
                                    </div>
                                  </div>
                                </div>
                                <div className="mt-2 text-xs text-white/60">
                                  مؤشر الكفاءة: {subject.efficiency.toFixed(2)} | الأولوية:{" "}
                                  {subject.priority.toFixed(2)}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* التحليل الزمني */}
                  {predictiveScenarios?.timeAnalysis && (
                    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white text-2xl">
                          <div className="p-2 bg-orange-500/20 rounded-lg">
                            <Clock className="h-7 w-7 text-orange-400" />
                          </div>
                          التحليل الزمني للأهداف
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-3 gap-6">
                          <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 text-center">
                            <div className="text-4xl mb-4">🎯</div>
                            <h4 className="text-xl font-bold text-yellow-300 mb-2">معدل حسن (14)</h4>
                            <div className="text-2xl font-bold text-white mb-2">
                              {predictiveScenarios.timeAnalysis.toReach14}
                            </div>
                            <div className="text-sm text-yellow-200">الوقت المتوقع للوصول</div>
                          </div>
                          <div className="p-6 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl border border-green-400/30 text-center">
                            <div className="text-4xl mb-4">🏆</div>
                            <h4 className="text-xl font-bold text-green-300 mb-2">معدل ممتاز (16)</h4>
                            <div className="text-2xl font-bold text-white mb-2">
                              {predictiveScenarios.timeAnalysis.toReach16}
                            </div>
                            <div className="text-sm text-green-200">الوقت المتوقع للوصول</div>
                          </div>
                          <div className="p-6 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-400/30 text-center">
                            <div className="text-4xl mb-4">⭐</div>
                            <h4 className="text-xl font-bold text-purple-300 mb-2">معدل استثنائي (18)</h4>
                            <div className="text-2xl font-bold text-white mb-2">
                              {predictiveScenarios.timeAnalysis.toReach18}
                            </div>
                            <div className="text-sm text-purple-200">الوقت المتوقع للوصول</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {/* إحصائيات الأداء الحالي */}
                  {predictiveScenarios?.currentStats && (
                    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-white text-2xl">
                          <div className="p-2 bg-cyan-500/20 rounded-lg">
                            <Award className="h-7 w-7 text-cyan-400" />
                          </div>
                          إحصائيات الأداء الحالي
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-4 gap-6">
                          <div className="p-6 bg-gradient-to-br from-red-500/20 to-pink-500/20 rounded-xl border border-red-400/30 text-center">
                            <div className="text-4xl mb-4">📚</div>
                            <h4 className="text-xl font-bold text-red-300 mb-2">مواد ضعيفة</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                              {predictiveScenarios.currentStats.weakSubjects}
                            </div>
                            <div className="text-sm text-red-200">تحتاج تحسين</div>
                          </div>
                          <div className="p-6 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-xl border border-yellow-400/30 text-center">
                            <div className="text-4xl mb-4">📖</div>
                            <h4 className="text-xl font-bold text-yellow-300 mb-2">مواد متوسطة</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                              {predictiveScenarios.currentStats.averageSubjects}
                            </div>
                            <div className="text-sm text-yellow-200">مستوى جيد</div>
                          </div>
                          <div className="p-6 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-xl border border-green-400/30 text-center">
                            <div className="text-4xl mb-4">🏆</div>
                            <h4 className="text-xl font-bold text-green-300 mb-2">مواد قوية</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                              {predictiveScenarios.currentStats.strongSubjects}
                            </div>
                            <div className="text-sm text-green-200">مستوى ممتاز</div>
                          </div>
                          <div className="p-6 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-400/30 text-center">
                            <div className="text-4xl mb-4">📊</div>
                            <h4 className="text-xl font-bold text-blue-300 mb-2">إجمالي المواد</h4>
                            <div className="text-3xl font-bold text-white mb-2">
                              {predictiveScenarios.currentStats.totalSubjects}
                            </div>
                            <div className="text-sm text-blue-200">مادة دراسية</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="universities">
                <div className="space-y-6">
                  {analysis?.eligibleUniversities && analysis.eligibleUniversities.length > 0 && (
                    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-green-400">
                          <CheckCircle className="h-6 w-6" />
                          الجامعات المتاحة لك
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {analysis.eligibleUniversities.map((university: UniversityRequirement, index: number) => (
                            <div
                              key={index}
                              className="p-4 bg-green-500/20 rounded-lg border border-green-400/30 hover:bg-green-500/30 transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-lg">{university.name}</h4>
                                <Badge className="bg-green-500 text-white">متاح</Badge>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/80">العتبة المطلوبة:</span>
                                  <span className="text-green-300 font-bold">{university.minGrade}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/80">معدلك:</span>
                                  <span className="text-blue-300 font-bold">{finalGrade?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/80">الفئة:</span>
                                  <span className="text-purple-300">{university.category}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {analysis?.potentialUniversities && analysis.potentialUniversities.length > 0 && (
                    <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                      <CardHeader>
                        <CardTitle className="flex items-center gap-3 text-yellow-400">
                          <Target className="h-6 w-6" />
                          جامعات يمكن الوصول إليها بتحسين بسيط
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {analysis.potentialUniversities.map((university: UniversityRequirement, index: number) => (
                            <div
                              key={index}
                              className="p-4 bg-yellow-500/20 rounded-lg border border-yellow-400/30 hover:bg-yellow-500/30 transition-all duration-300"
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-white text-lg">{university.name}</h4>
                                <Badge className="bg-yellow-500 text-white">قريب</Badge>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-white/80">العتبة المطلوبة:</span>
                                  <span className="text-yellow-300 font-bold">{university.minGrade}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/80">معدلك:</span>
                                  <span className="text-blue-300 font-bold">{finalGrade?.toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/80">النقاط المطلوبة:</span>
                                  <span className="text-red-300 font-bold">
                                    +{(university.minGrade - (finalGrade || 0)).toFixed(2)}
                                  </span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-white/80">الفئة:</span>
                                  <span className="text-purple-300">{university.category}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {(!analysis?.eligibleUniversities || analysis.eligibleUniversities.length === 0) &&
                    (!analysis?.potentialUniversities || analysis.potentialUniversities.length === 0) && (
                      <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl">
                        <CardContent className="text-center py-12">
                          <GraduationCap className="h-16 w-16 mx-auto mb-4 text-gray-400 opacity-50" />
                          <h3 className="text-xl font-bold text-white mb-2">لا توجد جامعات متاحة حالياً</h3>
                          <p className="text-gray-400">قم بتحسين معدلك للوصول إلى الجامعات المرغوبة</p>
                        </CardContent>
                      </Card>
                    )}
                </div>
              </TabsContent>

              <TabsContent value="strategy">
                <div className="space-y-6">
                  {/* جدول الدراسة النسبي المحسن */}
                  {finalGrade !== null && (
                    <>
                      {(() => {
                        const studyPlan = getAdaptiveStudyPlan(finalGrade)
                        return (
                          <Card
                            className={`border-0 bg-gradient-to-br ${studyPlan.color} backdrop-blur-xl hover-lift border ${studyPlan.borderColor}`}
                          >
                            <CardHeader>
                              <CardTitle className="flex items-center gap-3 text-white text-2xl">
                                <div className="p-2 bg-indigo-500/20 rounded-lg">
                                  <Brain className="h-7 w-7 text-indigo-400" />
                                </div>
                                {studyPlan.level}
                              </CardTitle>
                            </CardHeader>
                            <CardContent>
                              <div className="grid md:grid-cols-2 gap-6">
                                {/* الخطة اليومية */}
                                <div className="p-6 bg-white/10 rounded-xl border border-white/20">
                                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Clock className="h-5 w-5" />
                                    الخطة اليومية
                                  </h3>
                                  <div className="space-y-3">
                                    {studyPlan.daily.map((item, index) => (
                                      <div key={index} className="flex items-start gap-3 p-3 bg-white/10 rounded-lg">
                                        <div
                                          className={`w-3 h-3 rounded-full mt-1 ${
                                            item.priority === "عالي"
                                              ? "bg-red-400"
                                              : item.priority === "متوسط"
                                                ? "bg-yellow-400"
                                                : item.priority === "منخفض"
                                                  ? "bg-green-400"
                                                  : item.priority === "عالي جداً"
                                                    ? "bg-purple-400"
                                                    : item.priority === "حرج"
                                                      ? "bg-pink-400"
                                                      : "bg-blue-400"
                                          }`}
                                        ></div>
                                        <div className="flex-1">
                                          <div className="text-white font-medium">{item.time}</div>
                                          <div className="text-white/80 text-sm">{item.activity}</div>
                                          <Badge
                                            className={`mt-1 text-xs ${
                                              item.priority === "عالي"
                                                ? "bg-red-500"
                                                : item.priority === "متوسط"
                                                  ? "bg-yellow-500"
                                                  : item.priority === "منخفض"
                                                    ? "bg-green-500"
                                                    : item.priority === "عالي جداً"
                                                      ? "bg-purple-500"
                                                      : item.priority === "حرج"
                                                        ? "bg-pink-500"
                                                        : "bg-blue-500"
                                            } text-white`}
                                          >
                                            {item.priority}
                                          </Badge>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* النصائح المخصصة */}
                                <div className="p-6 bg-white/10 rounded-xl border border-white/20">
                                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                    <Target className="h-5 w-5" />
                                    نصائح مخصصة
                                  </h3>
                                  <ul className="text-white/80 space-y-3 text-base">
                                    {studyPlan.tips.map((tip, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                                        {tip}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })()}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="pdf">
                <Card className="border-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3 text-white text-2xl">
                      <div className="p-2 bg-teal-500/20 rounded-lg">
                        <FileText className="h-7 w-7 text-teal-400" />
                      </div>
                      تحميل النتيجة PDF
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-white/80 mb-6">
                      يمكنك حفظ النتيجة والتحليل في ملف PDF احترافي للرجوع إليه لاحقاً.
                    </p>
                    <Button
                      onClick={() => downloadPDF(finalGrade, subjects, analysis)}
                      className="mx-auto h-12 px-10 text-lg font-bold bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 transition-all duration-300"
                    >
                      <Download className="h-5 w-5 mr-2" />
                      تحميل PDF
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  )
}
