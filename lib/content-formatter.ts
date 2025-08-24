'use client'

import React from 'react'

/**
 * Utility functions for formatting study material content
 */

export const formatMarkdownContent = (content: string, isPreview = false): React.ReactNode[] => {
  // For preview, limit content length
  const processedContent = isPreview && content.length > 1500 ? content.substring(0, 1500) : content
  const lines = processedContent.split('\n')

  const processLine = (line: string, index: number): React.ReactNode => {
    const trimmedLine = line.trim()
    
    // Skip empty lines
    if (!trimmedLine) {
      return <div key={index} className="h-2" />
    }

    // Main heading (# title) - with emoji support
    if (trimmedLine.startsWith('# ')) {
      const headingText = trimmedLine.substring(2)
      return (
        <h1 key={index} className="text-2xl font-bold text-gray-900 mb-4 pb-2 border-b-2 border-blue-200 flex items-center">
          {headingText}
        </h1>
      )
    }

    // Section heading (## title) - with emoji support
    if (trimmedLine.startsWith('## ')) {
      const headingText = trimmedLine.substring(3)
      return (
        <h2 key={index} className="text-xl font-semibold text-blue-800 mt-6 mb-3 flex items-center">
          <span>{headingText}</span>
        </h2>
      )
    }

    // Subsection heading (### title)
    if (trimmedLine.startsWith('### ')) {
      return (
        <h3 key={index} className="text-lg font-medium text-indigo-700 mt-4 mb-2">
          {trimmedLine.substring(4)}
        </h3>
      )
    }

    // Bold text (**text**)
    if (trimmedLine.includes('**')) {
      const parts = trimmedLine.split('**')
      const formatted = parts.map((part, i) => 
        i % 2 === 1 ? <strong key={i} className="font-semibold text-gray-900">{part}</strong> : part
      )
      return <p key={index} className="mb-2 text-gray-700 leading-relaxed">{formatted}</p>
    }

    // Italic text (*text*) - avoiding conflict with **
    if (trimmedLine.includes('*') && !trimmedLine.includes('**')) {
      const parts = trimmedLine.split('*')
      const formatted = parts.map((part, i) => 
        i % 2 === 1 ? <em key={i} className="italic text-gray-600">{part}</em> : part
      )
      return <p key={index} className="mb-2 text-gray-700 leading-relaxed">{formatted}</p>
    }

    // Bullet points (- item)
    if (trimmedLine.startsWith('- ')) {
      return (
        <div key={index} className="flex items-start mb-2">
          <span className="text-blue-500 mr-3 mt-1 text-lg">•</span>
          <span className="text-gray-700 leading-relaxed flex-1">{trimmedLine.substring(2)}</span>
        </div>
      )
    }

    // Numbered list (1. item)
    if (/^\d+\.\s/.test(trimmedLine)) {
      const match = trimmedLine.match(/^(\d+)\.\s(.*)/)
      if (match) {
        return (
          <div key={index} className="flex items-start mb-2">
            <span className="bg-blue-100 text-blue-800 rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
              {match[1]}
            </span>
            <span className="text-gray-700 leading-relaxed flex-1">{match[2]}</span>
          </div>
        )
      }
    }

    // Blockquote (> text)
    if (trimmedLine.startsWith('> ')) {
      return (
        <blockquote key={index} className="border-l-4 border-blue-400 pl-4 py-2 mb-3 bg-blue-50 italic text-gray-600">
          {trimmedLine.substring(2)}
        </blockquote>
      )
    }

    // Regular paragraph
    return (
      <p key={index} className="mb-3 text-gray-700 leading-relaxed">
        {trimmedLine}
      </p>
    )
  }

  return lines.map((line, index) => processLine(line, index))
}

export const formatPreviewTruncation = (originalLength: number, showLength: number) => {
  if (originalLength <= showLength) return null
  
  return (
    <div className="mt-4 pt-4 border-t border-blue-200">
      <p className="text-sm text-blue-600 font-medium">...</p>
      <p className="text-xs text-blue-500 mt-2">
        Preview shows first {showLength.toLocaleString()} characters. View full study guide to see complete content with enhanced formatting.
      </p>
    </div>
  )
}
