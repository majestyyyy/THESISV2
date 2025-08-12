"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Brain, CheckCircle, FileText } from "lucide-react"
import { QuizGenerationForm } from "@/components/quiz/quiz-generation-form"
import { QuizPreview } from "@/components/quiz/quiz-preview"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import { generateQuizFromFile } from "@/lib/quiz-utils"
import type { Quiz, QuizGenerationOptions } from "@/lib/quiz-utils"
import { useRouter } from "next/navigation"

// Mock files data - replace with actual data from your backend
const mockFiles = [
  {
    id: "1",
    name: "Biology Chapter 5 - Cell Structure.pdf",
    extractedText:
      "Cell Structure and Function\n\nCells are the fundamental units of life. All living organisms are composed of one or more cells, which serve as the basic building blocks of life. This chapter explores the intricate structure and function of cells, from the simplest prokaryotic cells to the complex eukaryotic cells.\n\nCell Theory\nThe cell theory is a fundamental principle in biology that states:\n1. All living things are composed of one or more cells\n2. The cell is the basic unit of life\n3. All cells arise from pre-existing cells\n\nTypes of Cells\nThere are two main types of cells: prokaryotic and eukaryotic.\n\nProkaryotic Cells\nProkaryotic cells are characterized by the absence of a membrane-bound nucleus. Instead, their genetic material (DNA) is freely suspended in the cytoplasm in a region called the nucleoid. Examples of prokaryotic organisms include bacteria and archaea.\n\nEukaryotic Cells\nEukaryotic cells contain a membrane-bound nucleus that houses the cell's DNA. These cells are more complex than prokaryotic cells and contain various membrane-bound organelles that perform specific functions.\n\nCell Organelles\nThe nucleus is often called the control center of the cell because it contains the cell's DNA and controls gene expression and cell reproduction.\n\nMitochondria are known as the powerhouses of the cell because they generate most of the cell's ATP through cellular respiration.\n\nThe endoplasmic reticulum (ER) is a network of membranes that extends throughout the cytoplasm. There are two types: rough ER (studded with ribosomes) and smooth ER (lacks ribosomes).\n\nRibosomes are the sites of protein synthesis and can be found either free in the cytoplasm or attached to the rough ER.\n\nThe Golgi apparatus modifies, packages, and ships proteins received from the ER.\n\nCell Membrane\nThe cell membrane is a selectively permeable barrier that controls what enters and exits the cell. It is composed of a phospholipid bilayer with embedded proteins.",
  },
  {
    id: "2",
    name: "Physics Notes - Thermodynamics.docx",
    extractedText:
      "Thermodynamics: The Study of Energy and Heat\n\nThermodynamics is the branch of physics that deals with the relationships between heat, work, temperature, and energy. It describes how thermal energy is converted to and from other forms of energy and how it affects matter.\n\nThe Four Laws of Thermodynamics\n\nZeroth Law of Thermodynamics\nIf two systems are in thermal equilibrium with a third system, then they are in thermal equilibrium with each other. This law establishes the concept of temperature.\n\nFirst Law of Thermodynamics\nEnergy cannot be created or destroyed, only transferred or converted from one form to another. This is also known as the law of conservation of energy. Mathematically: ΔU = Q - W, where ΔU is the change in internal energy, Q is heat added to the system, and W is work done by the system.\n\nSecond Law of Thermodynamics\nThe entropy of an isolated system never decreases. Heat flows naturally from hot to cold objects, and it is impossible to convert heat completely into work without some other change occurring.\n\nThird Law of Thermodynamics\nThe entropy of a perfect crystal at absolute zero temperature is exactly zero.\n\nKey Concepts\n\nHeat vs Temperature\nHeat is the transfer of thermal energy between objects at different temperatures, while temperature is a measure of the average kinetic energy of particles in a substance.\n\nThermodynamic Processes\n- Isothermal: Temperature remains constant\n- Adiabatic: No heat exchange with surroundings\n- Isobaric: Pressure remains constant\n- Isochoric: Volume remains constant\n\nHeat Engines and Efficiency\nA heat engine converts thermal energy into mechanical work. The efficiency of a heat engine is limited by the Carnot efficiency: η = 1 - (Tc/Th), where Tc is the temperature of the cold reservoir and Th is the temperature of the hot reservoir.",
  },
  {
    id: "3",
    name: "Chemistry Lab Report.txt",
    extractedText:
      "Chemistry Lab Report: Acid-Base Titration\n\nObjective: To determine the concentration of an unknown hydrochloric acid (HCl) solution using sodium hydroxide (NaOH) as the titrant.\n\nIntroduction\nTitration is a quantitative analytical technique used to determine the concentration of an unknown solution by reacting it with a solution of known concentration. In acid-base titrations, an acid and base react to form water and a salt.\n\nThe reaction between HCl and NaOH is: HCl + NaOH → NaCl + H2O\n\nMaterials and Methods\n- 0.1 M NaOH solution (standardized)\n- Unknown HCl solution\n- Phenolphthalein indicator\n- Burette, pipette, conical flask\n- White tile for better endpoint detection\n\nProcedure:\n1. Rinse all glassware with distilled water\n2. Fill the burette with 0.1 M NaOH solution\n3. Pipette 25.0 mL of unknown HCl into conical flask\n4. Add 2-3 drops of phenolphthalein indicator\n5. Titrate slowly until permanent pink color appears\n6. Record the volume of NaOH used\n7. Repeat the titration three times\n\nResults\nTrial 1: 24.8 mL NaOH\nTrial 2: 24.6 mL NaOH\nTrial 3: 24.7 mL NaOH\nAverage: 24.7 mL NaOH\n\nCalculations\nUsing the formula: M1V1 = M2V2\nWhere M1 = molarity of HCl (unknown)\nV1 = volume of HCl = 25.0 mL\nM2 = molarity of NaOH = 0.1 M\nV2 = volume of NaOH = 24.7 mL\n\nM1 = (M2 × V2) / V1 = (0.1 × 24.7) / 25.0 = 0.0988 M\n\nConclusion\nThe concentration of the unknown HCl solution is 0.0988 M or approximately 0.099 M.",
  },
  {
    id: "4",
    name: "Mathematics - Calculus Fundamentals.pdf",
    extractedText:
      "Calculus Fundamentals: Limits, Derivatives, and Integrals\n\nIntroduction to Calculus\nCalculus is a branch of mathematics that studies continuous change. It has two main branches: differential calculus (concerning rates of change and slopes) and integral calculus (concerning accumulation of quantities and areas under curves).\n\nLimits\nA limit describes the behavior of a function as its input approaches a particular value. The limit of f(x) as x approaches a is written as: lim(x→a) f(x) = L\n\nThis means that as x gets arbitrarily close to a, f(x) gets arbitrarily close to L.\n\nProperties of Limits:\n- lim(x→a) [f(x) + g(x)] = lim(x→a) f(x) + lim(x→a) g(x)\n- lim(x→a) [f(x) × g(x)] = lim(x→a) f(x) × lim(x→a) g(x)\n- lim(x→a) [f(x)/g(x)] = lim(x→a) f(x) / lim(x→a) g(x), provided lim(x→a) g(x) ≠ 0\n\nDerivatives\nThe derivative of a function measures how the function changes as its input changes. It represents the slope of the tangent line at any point on the function's graph.\n\nThe derivative of f(x) is denoted as f'(x) or df/dx and is defined as:\nf'(x) = lim(h→0) [f(x+h) - f(x)]/h\n\nCommon Derivative Rules:\n- Power Rule: d/dx(x^n) = nx^(n-1)\n- Product Rule: d/dx[f(x)g(x)] = f'(x)g(x) + f(x)g'(x)\n- Chain Rule: d/dx[f(g(x))] = f'(g(x)) × g'(x)\n\nIntegrals\nIntegration is the reverse process of differentiation. The integral of a function represents the area under its curve.\n\nThe indefinite integral of f(x) is written as: ∫f(x)dx = F(x) + C\nwhere F'(x) = f(x) and C is the constant of integration.\n\nThe definite integral from a to b is: ∫[a to b] f(x)dx = F(b) - F(a)\n\nFundamental Theorem of Calculus\nThis theorem connects differentiation and integration:\nIf F(x) = ∫[a to x] f(t)dt, then F'(x) = f(x)",
  },
]

export default function GenerateQuizPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationProgress, setGenerationProgress] = useState(0)
  const [generatedQuiz, setGeneratedQuiz] = useState<Quiz | null>(null)
  const [savedQuiz, setSavedQuiz] = useState<Quiz | null>(null)
  const router = useRouter()

  const handleGenerate = async (options: QuizGenerationOptions) => {
    setIsGenerating(true)
    setGenerationProgress(0)
    setGeneratedQuiz(null)

    try {
      const selectedFile = mockFiles.find((f) => f.id === options.fileId)
      if (!selectedFile) {
        throw new Error("Selected file not found")
      }

      const quiz = await generateQuizFromFile(options, selectedFile.extractedText, setGenerationProgress)
      setGeneratedQuiz(quiz)
    } catch (error) {
      console.error("Failed to generate quiz:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveQuiz = async (quiz: Quiz) => {
    console.log("Saving quiz:", quiz)
    setSavedQuiz(quiz)

    setTimeout(() => {
      router.push("/quizzes")
    }, 1500)
  }

  const handleCancelPreview = () => {
    setGeneratedQuiz(null)
    setGenerationProgress(0)
  }

  if (savedQuiz) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="max-w-2xl mx-auto py-16 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Quiz Saved Successfully!</h1>
            <p className="text-gray-600 mb-8">Your quiz "{savedQuiz.title}" has been saved and is ready to be taken.</p>
            <div className="space-y-4">
              <Card className="text-left">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold">{savedQuiz.title}</h3>
                      <p className="text-sm text-gray-600">
                        {savedQuiz.totalQuestions} questions • {savedQuiz.difficulty} difficulty
                      </p>
                    </div>
                    <FileText className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900">Generate AI Quiz</h1>
            <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
              Create personalized quizzes from your uploaded study materials using advanced AI technology.
            </p>
          </div>

          {!generatedQuiz && !isGenerating && (
            <div className="max-w-2xl mx-auto">
              <QuizGenerationForm files={mockFiles} onGenerate={handleGenerate} isGenerating={isGenerating} />
            </div>
          )}

          {isGenerating && (
            <div className="max-w-2xl mx-auto">
              <Card>
                <CardHeader className="text-center">
                  <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-pulse" />
                  <CardTitle>Generating Your Quiz</CardTitle>
                  <CardDescription>AI is analyzing your content and creating personalized questions...</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Progress value={generationProgress} className="w-full" />
                  <div className="text-center text-sm text-gray-600">
                    {generationProgress < 30 && "Analyzing document content..."}
                    {generationProgress >= 30 && generationProgress < 60 && "Identifying key concepts..."}
                    {generationProgress >= 60 && generationProgress < 90 && "Generating questions..."}
                    {generationProgress >= 90 && "Finalizing quiz..."}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {generatedQuiz && (
            <div className="max-w-4xl mx-auto">
              <Alert className="mb-6">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Quiz generated successfully! Review and edit the questions below, then save your quiz.
                </AlertDescription>
              </Alert>
              <QuizPreview quiz={generatedQuiz} onSave={handleSaveQuiz} onCancel={handleCancelPreview} />
            </div>
          )}
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
