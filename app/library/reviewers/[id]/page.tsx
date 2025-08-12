"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  ArrowLeft,
  Download,
  Share2,
  BookOpen,
  FileText,
  Brain,
  Clock,
  User,
  Calendar,
  Eye,
  Printer,
} from "lucide-react"
import { ProtectedRoute } from "@/components/auth/protected-route"
import { DashboardLayout } from "@/components/layout/dashboard-layout"
import Link from "next/link"

// Mock data - replace with actual data from your backend
const mockStudyMaterial = {
  id: "1",
  title: "Cell Structure Study Guide",
  type: "summary",
  fileId: "1",
  fileName: "Biology Chapter 5 - Cell Structure.pdf",
  createdAt: "2024-01-16",
  lastAccessed: "2024-01-17",
  readTime: "15 min",
  content: {
    summary: `# Cell Structure Study Guide

## Overview
Cells are the fundamental units of life, and understanding their structure is crucial for biology. This study guide covers the key components and functions of both prokaryotic and eukaryotic cells.

## Key Concepts

### 1. Cell Theory
- All living things are composed of one or more cells
- The cell is the basic unit of life
- All cells arise from pre-existing cells

### 2. Types of Cells

#### Prokaryotic Cells
- No membrane-bound nucleus
- DNA freely floating in cytoplasm
- Examples: Bacteria, Archaea
- Simpler structure

#### Eukaryotic Cells
- Membrane-bound nucleus
- DNA contained within nucleus
- Examples: Plant cells, Animal cells
- Complex internal structure

### 3. Cell Organelles

#### Nucleus
- **Function**: Controls cell activities and contains DNA
- **Structure**: Double membrane with nuclear pores
- **Location**: Center of eukaryotic cells

#### Mitochondria
- **Function**: Powerhouse of the cell - produces ATP
- **Structure**: Double membrane with cristae
- **Location**: Throughout cytoplasm

#### Endoplasmic Reticulum (ER)
- **Rough ER**: Has ribosomes, protein synthesis
- **Smooth ER**: No ribosomes, lipid synthesis
- **Function**: Transport system of the cell

#### Ribosomes
- **Function**: Protein synthesis
- **Location**: Free in cytoplasm or attached to rough ER
- **Structure**: Made of RNA and proteins

#### Golgi Apparatus
- **Function**: Modifies, packages, and ships proteins
- **Structure**: Stack of flattened membranes
- **Process**: Receives from ER, modifies, ships out

### 4. Cell Membrane
- **Structure**: Phospholipid bilayer with embedded proteins
- **Function**: Controls what enters and exits the cell
- **Properties**: Selectively permeable

## Important Terms to Remember

- **Cytoplasm**: Gel-like substance filling the cell
- **Organelle**: Specialized structures within cells
- **Membrane**: Barrier that separates cell contents
- **ATP**: Energy currency of the cell
- **Phospholipid**: Main component of cell membranes

## Study Tips

1. **Create diagrams**: Draw and label cell structures
2. **Use analogies**: Compare organelles to parts of a factory
3. **Practice identification**: Use microscope images to identify structures
4. **Make connections**: Understand how structure relates to function

## Review Questions

1. What are the three main principles of cell theory?
2. How do prokaryotic and eukaryotic cells differ?
3. What is the function of mitochondria and why are they important?
4. Describe the structure and function of the cell membrane.
5. How do rough and smooth ER differ in structure and function?

## Key Takeaways

- Cells are highly organized structures with specific functions
- Each organelle has a unique role in cell survival
- Structure and function are closely related in biology
- Understanding cell structure is fundamental to all biology topics`,

    flashcards: [
      {
        front: "What are the three principles of cell theory?",
        back: "1. All living things are composed of cells\n2. The cell is the basic unit of life\n3. All cells arise from pre-existing cells",
      },
      {
        front: "What is the main difference between prokaryotic and eukaryotic cells?",
        back: "Prokaryotic cells have no membrane-bound nucleus (DNA floats freely), while eukaryotic cells have a membrane-bound nucleus containing DNA.",
      },
      {
        front: "What is the function of mitochondria?",
        back: "Mitochondria are the powerhouse of the cell - they produce ATP (energy) through cellular respiration.",
      },
      {
        front: "What is the difference between rough and smooth ER?",
        back: "Rough ER has ribosomes attached and synthesizes proteins. Smooth ER has no ribosomes and synthesizes lipids.",
      },
      {
        front: "What is the structure of the cell membrane?",
        back: "The cell membrane is a phospholipid bilayer with embedded proteins that controls what enters and exits the cell.",
      },
    ],

    notes: [
      "Cell theory is fundamental - memorize the three principles",
      "Prokaryotic = no nucleus, Eukaryotic = has nucleus",
      "Mitochondria = powerhouse, produces ATP energy",
      "Nucleus = control center, contains DNA",
      "ER = transport system (rough has ribosomes, smooth doesn't)",
      "Golgi = packaging and shipping center",
      "Cell membrane = selective barrier, phospholipid bilayer",
    ],
  },
}

export default function StudyMaterialPage({ params }: { params: { id: string } }) {
  const [activeTab, setActiveTab] = useState("content")

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "summary":
        return <FileText className="h-5 w-5" />
      case "flashcards":
        return <Brain className="h-5 w-5" />
      case "notes":
        return <BookOpen className="h-5 w-5" />
      default:
        return <FileText className="h-5 w-5" />
    }
  }

  const getTypeBadge = (type: string) => {
    const colors = {
      summary: "bg-blue-100 text-blue-800",
      flashcards: "bg-purple-100 text-purple-800",
      notes: "bg-green-100 text-green-800",
    }
    return (
      <Badge className={colors[type as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    )
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/library">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Library
                </Button>
              </Link>
              <div>
                <div className="flex items-center space-x-3">
                  {getTypeIcon(mockStudyMaterial.type)}
                  <h1 className="text-3xl font-bold text-gray-900">{mockStudyMaterial.title}</h1>
                  {getTypeBadge(mockStudyMaterial.type)}
                </div>
                <p className="mt-2 text-gray-600">Generated from: {mockStudyMaterial.fileName}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button variant="outline" size="sm">
                <Printer className="mr-2 h-4 w-4" />
                Print
              </Button>
              <Button variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" />
                Export
              </Button>
            </div>
          </div>

          {/* Metadata */}
          <Card>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Created</p>
                    <p className="font-medium">{mockStudyMaterial.createdAt}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Last Accessed</p>
                    <p className="font-medium">{mockStudyMaterial.lastAccessed}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Read Time</p>
                    <p className="font-medium">{mockStudyMaterial.readTime}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium capitalize">{mockStudyMaterial.type}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="content">Study Guide</TabsTrigger>
              <TabsTrigger value="flashcards">Flashcards ({mockStudyMaterial.content.flashcards.length})</TabsTrigger>
              <TabsTrigger value="notes">Quick Notes ({mockStudyMaterial.content.notes.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="content" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Study Guide Content</span>
                  </CardTitle>
                  <CardDescription>Comprehensive study material generated from your uploaded file</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <div
                      className="whitespace-pre-wrap text-sm leading-relaxed"
                      dangerouslySetInnerHTML={{
                        __html: mockStudyMaterial.content.summary
                          .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold mb-4 text-gray-900">$1</h1>')
                          .replace(/^## (.*$)/gm, '<h2 class="text-xl font-semibold mb-3 mt-6 text-gray-800">$1</h2>')
                          .replace(/^### (.*$)/gm, '<h3 class="text-lg font-medium mb-2 mt-4 text-gray-700">$1</h3>')
                          .replace(/^#### (.*$)/gm, '<h4 class="text-base font-medium mb-2 mt-3 text-gray-600">$4</h4>')
                          .replace(/^\*\*(.*?)\*\*/gm, '<strong class="font-semibold text-gray-900">$1</strong>')
                          .replace(/^- (.*$)/gm, '<li class="ml-4 mb-1">$1</li>')
                          .replace(/\n\n/g, '</p><p class="mb-4">')
                          .replace(/^(?!<[h|l])/gm, '<p class="mb-4">'),
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="flashcards" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Brain className="h-5 w-5" />
                    <span>Flashcards</span>
                  </CardTitle>
                  <CardDescription>Interactive flashcards for quick review and memorization</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    {mockStudyMaterial.content.flashcards.map((card, index) => (
                      <Card key={index} className="border-l-4 border-l-purple-500">
                        <CardContent className="p-4">
                          <div className="space-y-3">
                            <div>
                              <p className="text-sm font-medium text-purple-700 mb-2">Question:</p>
                              <p className="text-gray-900">{card.front}</p>
                            </div>
                            <Separator />
                            <div>
                              <p className="text-sm font-medium text-green-700 mb-2">Answer:</p>
                              <p className="text-gray-700 whitespace-pre-line">{card.back}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notes" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BookOpen className="h-5 w-5" />
                    <span>Quick Notes</span>
                  </CardTitle>
                  <CardDescription>Key points and takeaways for quick reference</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockStudyMaterial.content.notes.map((note, index) => (
                      <div
                        key={index}
                        className="flex items-start space-x-3 p-3 bg-green-50 rounded-lg border-l-4 border-l-green-500"
                      >
                        <div className="flex-shrink-0 w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </div>
                        <p className="text-gray-700 text-sm">{note}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  )
}
