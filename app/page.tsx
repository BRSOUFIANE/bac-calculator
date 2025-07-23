'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Calculator, BookOpen, Target, TrendingUp, Download, Award, Clock, CheckCircle, AlertCircle, Star } from 'lucide-react'
import jsPDF from 'jspdf'

interface Subject {
  name: string
  coefficient: number
  grade: number
}

interface BacResult {
  totalPoints: number
  totalCoefficients: number
  average: number
  status: 'ممتاز' | 'جيد جداً' | 'جيد' | 'مقبول' | 'راسب'
  mention: string
  subjects: Subject[]
  calculatedAt: Date
}

const BRANCHES = {
  'علوم تجريبية': {
    subjects: [
      { name: 'الرياضيات', coefficient: 7 },
      { name: 'العلوم الفيزيائية', coefficient: 6 },
      { name: 'العلوم الطبيعية', coefficient: 6 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'التاريخ والجغرافيا', coefficient: 2 },
      { name: 'التربية الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 2 }
    ]
  },
  'رياضيات': {
    subjects: [
      { name: 'الرياضيات', coefficient: 9 },
      { name: 'العلوم الفيزيائية', coefficient: 6 },
      { name: 'العلوم الطبيعية', coefficient: 3 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'التاريخ والجغرافيا', coefficient: 2 },
      { name: 'التربية الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 3 }
    ]
  },
  'تقني رياضي': {
    subjects: [
      { name: 'الرياضيات', coefficient: 6 },
      { name: 'العلوم الفيزيائية', coefficient: 5 },
      { name: 'التكنولوجيا', coefficient: 7 },
      { name: 'الهندسة المدنية', coefficient: 2 },
      { name: 'اللغة العربية', coefficient: 3 },
      { name: 'اللغة الفرنسية', coefficient: 2 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'التاريخ والجغرافيا', coefficient: 2 },
      { name: 'التربية الإسلامية', coefficient: 2 },
      { name: 'الفلسفة', coefficient: 1 }
    ]
  },
  'آداب وفلسفة': {
    subjects: [
      { name: 'الفلسفة', coefficient: 7 },
      { name: 'اللغة العربية', coefficient: 5 },
      { name: 'التاريخ والجغرافيا', coefficient: 4 },
      { name: 'اللغة الفرنسية', coefficient: 3 },
      { name: 'اللغة الإنجليزية', coefficient: 2 },
      { name: 'الرياضيات', coefficient: 2 },
      { name: 'العلوم الفيزيائية', coefficient: 2 },
      { name: 'العلوم الطبيعية', coefficient: 2 },
      { name: 'التربية الإسلامية', coefficient: 2 }
    ]
  }
}

export default function BacCalculator() {
  const [selectedBranch, setSelectedBranch] = useState<string>('')
  const [subjects, setSubjects] = useState<Subject[]>([])
  const [result, setResult] = useState<BacResult | null>(null)
  const [activeTab, setActiveTab] = useState('calculator')

  useEffect(() => {
    if (selectedBranch && BRANCHES[selectedBranch as keyof typeof BRANCHES]) {
      const branchSubjects = BRANCHES[selectedBranch as keyof typeof BRANCHES].subjects.map(subject => ({
        ...subject,
        grade: 0
      }))
      setSubjects(branchSubjects)
    }
  }, [selectedBranch])

  const updateGrade = (index: number, grade: number) => {
    const updatedSubjects = [...subjects]
    updatedSubjects[index].grade = grade
    setSubjects(updatedSubjects)
  }

  const calculateBAC = () => {
    const totalPoints = subjects.reduce((sum, subject) => sum + (subject.grade * subject.coefficient), 0)
    const totalCoefficients = subjects.reduce((sum, subject) => sum + subject.coefficient, 0)
    const average = totalPoints / totalCoefficients

    let status: BacResult['status']
    let mention: string

    if (average >= 16) {
      status = 'ممتاز'
      mention = 'ممتاز'
    } else if (average >= 14) {
      status = 'جيد جداً'
      mention = 'جيد جداً'
    } else if (average >= 12) {
      status = 'جيد'
      mention = 'جيد'
    } else if (average >= 10) {
      status = 'مقبول'
      mention = 'مقبول'
    } else {
      status = 'راسب'
      mention = 'راسب'
    }

    const bacResult: BacResult = {
      totalPoints,
      totalCoefficients,
      average,
      status,
      mention,
      subjects: [...subjects],
      calculatedAt: new Date()
    }

    setResult(bacResult)
  }

  const generatePDF = () => {
    if (!result) return

    const doc = new jsPDF()
    
    // إعداد الخط العربي
    doc.setFont('helvetica')
    
    // العنوان الرئيسي
    doc.setFontSize(20)
    doc.setTextColor(41, 128, 185)
    doc.text('نتائج حاسبة شهادة البكالوريا', 105, 30, { align: 'center' })
    
    // خط فاصل
    doc.setDrawColor(41, 128, 185)
    doc.setLineWidth(0.5)
    doc.line(20, 35, 190, 35)
    
    // معلومات النتيجة
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`الشعبة: ${selectedBranch}`, 20, 50)
    doc.text(`التاريخ: ${result.calculatedAt.toLocaleDateString('ar-DZ')}`, 20, 60)
    
    // النتيجة النهائية
    doc.setFontSize(16)
    doc.setTextColor(41, 128, 185)
    doc.text('النتيجة النهائية:', 20, 80)
    
    doc.setFontSize(14)
    doc.setTextColor(0, 0, 0)
    doc.text(`المعدل العام: ${result.average.toFixed(2)}/20`, 20, 95)
    doc.text(`الحالة: ${result.status}`, 20, 105)
    doc.text(`التقدير: ${result.mention}`, 20, 115)
    
    // جدول النقاط
    doc.setFontSize(12)
    doc.setTextColor(41, 128, 185)
    doc.text('تفاصيل النقاط:', 20, 135)
    
    let yPosition = 150
    doc.setTextColor(0, 0, 0)
    
    result.subjects.forEach((subject, index) => {
      if (yPosition > 270) {
        doc.addPage()
        yPosition = 30
      }
      
      const points = (subject.grade * subject.coefficient).toFixed(1)
      doc.text(`${subject.name}: ${subject.grade}/20 × ${subject.coefficient} = ${points} نقطة`, 20, yPosition)
      yPosition += 10
    })
    
    // المجموع النهائي
    yPosition += 10
    doc.setFontSize(12)
    doc.setTextColor(41, 128, 185)
    doc.text(`المجموع: ${result.totalPoints.toFixed(1)} / ${result.totalCoefficients * 20}`, 20, yPosition)
    
    // حفظ الملف
    doc.save(`نتائج-البكالوريا-${selectedBranch}-${new Date().toLocaleDateString('ar-DZ')}.pdf`)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ممتاز': return 'bg-green-500'
      case 'جيد جداً': return 'bg-blue-500'
      case 'جيد': return 'bg-yellow-500'
      case 'مقبول': return 'bg-orange-500'
      default: return 'bg-red-500'
    }
  }

  const getProgressColor = (average: number) => {
    if (average >= 16) return 'bg-green-500'
    if (average >= 14) return 'bg-blue-500'
    if (average >= 12) return 'bg-yellow-500'
    if (average >= 10) return 'bg-orange-500'
    return 'bg-red-500'
  }

  return (
    <div className="subtle-aurora-bg min-h-screen">
      {/* خلفية متحركة */}
      <div className="grid-pattern-overlay"></div>
      <div className="floating-particles">
        {[...Array(10)].map((_, i) => (
          <div key={i}></div>
        ))}
      </div>

      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* العنوان الرئيسي */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600 shadow-lg">
              <Calculator className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              حاسبة شهادة البكالوريا
            </h1>
          </div>
          <p className="text-lg text-gray-300 max-w-2xl mx-auto">
            احسب معدلك في شهادة البكالوريا بدقة واحصل على تحليل شامل لنتائجك مع إمكانية حفظها في ملف PDF
          </p>
        </div>

        {/* شريط التنقل المحسن */}
        <div className="mb-8 animate-fade-in-up animation-delay-200">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl p-1">
              <TabsTrigger 
                value="calculator" 
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-lg transition-all duration-300"
              >
                <Calculator className="w-4 h-4" />
                <span className="hidden sm:inline">الحاسبة</span>
              </TabsTrigger>
              <TabsTrigger 
                value="strategy" 
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-lg transition-all duration-300"
              >
                <Target className="w-4 h-4" />
                <span className="hidden sm:inline">استراتيجية الدراسة</span>
              </TabsTrigger>
              <TabsTrigger 
                value="tips" 
                className="flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-white text-gray-300 rounded-lg transition-all duration-300"
              >
                <BookOpen className="w-4 h-4" />
                <span className="hidden sm:inline">نصائح ومعلومات</span>
              </TabsTrigger>
            </TabsList>

            {/* قسم الحاسبة */}
            <TabsContent value="calculator" className="mt-6 space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* بطاقة إدخال البيانات */}
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Calculator className="w-5 h-5" />
                      إدخال النقاط
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      اختر شعبتك وأدخل نقاطك في كل مادة
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="branch" className="text-white mb-2 block">الشعبة</Label>
                      <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                        <SelectTrigger className="bg-white/10 border-white/20 text-white">
                          <SelectValue placeholder="اختر الشعبة" />
                        </SelectTrigger>
                        <SelectContent className="select-content">
                          {Object.keys(BRANCHES).map((branch) => (
                            <SelectItem key={branch} value={branch}>
                              {branch}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {subjects.length > 0 && (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {subjects.map((subject, index) => (
                          <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                            <div className="flex-1">
                              <Label className="text-white text-sm">{subject.name}</Label>
                              <div className="text-xs text-gray-400">المعامل: {subject.coefficient}</div>
                            </div>
                            <div className="w-20">
                              <Input
                                type="number"
                                min="0"
                                max="20"
                                step="0.25"
                                value={subject.grade || ''}
                                onChange={(e) => updateGrade(index, parseFloat(e.target.value) || 0)}
                                className="bg-white/10 border-white/20 text-white text-center"
                                placeholder="0"
                              />
                            </div>
                            <div className="text-xs text-gray-400 w-12 text-center">
                              /20
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {subjects.length > 0 && (
                      <Button 
                        onClick={calculateBAC} 
                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg transition-all duration-300"
                      >
                        <Calculator className="w-4 h-4 mr-2" />
                        احسب المعدل
                      </Button>
                    )}
                  </CardContent>
                </Card>

                {/* بطاقة النتائج */}
                {result && (
                  <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift animate-fade-in-scale">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center justify-between text-white">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          النتيجة النهائية
                        </div>
                        <Button
                          onClick={generatePDF}
                          size="sm"
                          variant="outline"
                          className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          PDF
                        </Button>
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* المعدل العام */}
                      <div className="text-center space-y-2">
                        <div className="text-4xl font-bold text-white">
                          {result.average.toFixed(2)}/20
                        </div>
                        <Badge className={`${getStatusColor(result.status)} text-white px-4 py-1 text-sm`}>
                          {result.status}
                        </Badge>
                      </div>

                      {/* شريط التقدم */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm text-gray-300">
                          <span>التقدم نحو الهدف</span>
                          <span>{((result.average / 20) * 100).toFixed(1)}%</span>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3">
                          <div 
                            className={`h-3 rounded-full transition-all duration-1000 ${getProgressColor(result.average)}`}
                            style={{ width: `${Math.min((result.average / 20) * 100, 100)}%` }}
                          ></div>
                        </div>
                      </div>

                      {/* تفاصيل النقاط */}
                      <div className="space-y-2">
                        <h4 className="font-semibold text-white">تفاصيل النقاط:</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div>المجموع: {result.totalPoints.toFixed(1)} نقطة</div>
                          <div>مجموع المعاملات: {result.totalCoefficients}</div>
                          <div>أقصى نقاط ممكنة: {result.totalCoefficients * 20}</div>
                        </div>
                      </div>

                      {/* رسالة تحفيزية */}
                      <Alert className="bg-white/10 border-white/20">
                        <AlertCircle className="h-4 w-4 text-white" />
                        <AlertDescription className="text-gray-300">
                          {result.average >= 10 
                            ? `مبروك! لقد نجحت بتقدير ${result.mention}. استمر في التفوق!`
                            : `لا تيأس! يمكنك تحسين نقاطك والوصول للنجاح. ركز على المواد ذات المعاملات العالية.`
                          }
                        </AlertDescription>
                      </Alert>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* قسم استراتيجية الدراسة المحسن */}
            <TabsContent value="strategy" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* خطة الدراسة الذكية */}
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Target className="w-5 h-5" />
                      خطة الدراسة الذكية
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      استراتيجية مدروسة لتحقيق أفضل النتائج
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="p-2 rounded-full bg-blue-500/20">
                          <Star className="w-4 h-4 text-blue-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">ركز على المواد الأساسية</h4>
                          <p className="text-sm text-gray-300">ابدأ بالمواد ذات المعاملات العالية في شعبتك</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="p-2 rounded-full bg-green-500/20">
                          <Clock className="w-4 h-4 text-green-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">إدارة الوقت</h4>
                          <p className="text-sm text-gray-300">خصص 60% من وقتك للمواد الأساسية و40% للمواد الثانوية</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="p-2 rounded-full bg-purple-500/20">
                          <CheckCircle className="w-4 h-4 text-purple-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">المراجعة المنتظمة</h4>
                          <p className="text-sm text-gray-300">راجع ما درسته كل أسبوع لضمان عدم النسيان</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3 rounded-lg bg-white/5 border border-white/10">
                        <div className="p-2 rounded-full bg-orange-500/20">
                          <Award className="w-4 h-4 text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">حل التمارين</h4>
                          <p className="text-sm text-gray-300">اهتم بحل تمارين السنوات السابقة والتمارين النموذجية</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* جدول زمني مقترح */}
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Clock className="w-5 h-5" />
                      الجدول الزمني المقترح
                    </CardTitle>
                    <CardDescription className="text-gray-300">
                      توزيع يومي للدراسة الفعالة
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {[
                        { time: '08:00 - 10:00', activity: 'المادة الأساسية الأولى', color: 'bg-blue-500/20 text-blue-300' },
                        { time: '10:30 - 12:00', activity: 'المادة الأساسية الثانية', color: 'bg-green-500/20 text-green-300' },
                        { time: '14:00 - 15:30', activity: 'مراجعة وحل التمارين', color: 'bg-purple-500/20 text-purple-300' },
                        { time: '16:00 - 17:00', activity: 'المواد الثانوية', color: 'bg-orange-500/20 text-orange-300' },
                        { time: '19:00 - 20:00', activity: 'مراجعة عامة', color: 'bg-pink-500/20 text-pink-300' }
                      ].map((item, index) => (
                        <div key={index} className={`p-3 rounded-lg ${item.color} border border-white/10`}>
                          <div className="flex justify-between items-center">
                            <span className="font-semibold">{item.time}</span>
                            <span className="text-sm">{item.activity}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* نصائح للمراجعة */}
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift lg:col-span-2">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BookOpen className="w-5 h-5" />
                      تقنيات المراجعة الفعالة
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white">للمواد العلمية:</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            فهم المفاهيم قبل الحفظ
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            حل تمارين متنوعة يومياً
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            استخدام الرسوم والمخططات
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                            مراجعة القوانين والقواعد
                          </li>
                        </ul>
                      </div>
                      <div className="space-y-3">
                        <h4 className="font-semibold text-white">للمواد الأدبية:</h4>
                        <ul className="space-y-2 text-sm text-gray-300">
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            القراءة المتكررة والتلخيص
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            إنشاء خرائط ذهنية
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            التدرب على الكتابة والتعبير
                          </li>
                          <li className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            حفظ النصوص والشواهد المهمة
                          </li>
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* قسم النصائح والمعلومات */}
            <TabsContent value="tips" className="mt-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <BookOpen className="w-5 h-5" />
                      نصائح مهمة للنجاح
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      {[
                        'ابدأ المراجعة مبكراً ولا تؤجل',
                        'نظم وقتك واتبع جدولاً زمنياً محدداً',
                        'اهتم بصحتك الجسدية والنفسية',
                        'تناول وجبات صحية ومارس الرياضة',
                        'احصل على قسط كافٍ من النوم',
                        'تجنب السهر المفرط قبل الامتحان',
                        'راجع مع زملائك وشارك المعرفة',
                        'استعن بالأساتذة عند الحاجة'
                      ].map((tip, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                          <span className="text-gray-300 text-sm">{tip}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-xl hover-lift">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <AlertCircle className="w-5 h-5" />
                      معلومات مهمة
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
                        <h4 className="font-semibold text-blue-300 mb-2">شروط النجاح:</h4>
                        <p className="text-sm text-gray-300">الحصول على معدل عام 10/20 على الأقل</p>
                      </div>

                      <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20">
                        <h4 className="font-semibold text-green-300 mb-2">التقديرات:</h4>
                        <div className="text-sm text-gray-300 space-y-1">
                          <div>• ممتاز: 16/20 فما فوق</div>
                          <div>• جيد جداً: 14-15.99/20</div>
                          <div>• جيد: 12-13.99/20</div>
                          <div>• مقبول: 10-11.99/20</div>
                        </div>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20">
                        <h4 className="font-semibold text-purple-300 mb-2">نصيحة:</h4>
                        <p className="text-sm text-gray-300">
                          ركز على المواد ذات المعاملات العالية في شعبتك لتحقيق أفضل النتائج
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}