import { supabase } from './supabase'

export interface QuizProgress {
  id: string
  title: string
  difficulty: string
  totalQuestions: number
  attempts: Array<{
    id: string
    score: number           // Raw correct answers (e.g., 22)
    totalQuestions: number  // Total questions (e.g., 30)
    percentage: number      // Calculated percentage (e.g., 73.33)
    timeSpent: number       // Time spent in seconds
    completedAt: string
  }>
  averageScore: number      // Overall average based on correct answers
  bestScore: number         // Best score achieved
  totalAttempts: number
  interpretation: string
}

export interface UserAnalytics {
  totalStudyTime: number
  averageScore: number
  quizzesTaken: number
  studyStreak: number
  filesUploaded: number
  reviewersGenerated: number
  weeklyProgress: Array<{
    date: string
    score: number
    timeSpent: number
  }>
  difficultyBreakdown: Array<{
    difficulty: string
    count: number
    averageScore: number
  }>
  subjectPerformance: Array<{
    subject: string
    averageScore: number
    quizCount: number
    timeSpent: number
  }>
  recentActivity: Array<{
    type: string
    title: string
    date: string
    score?: number
  }>
  // Enhanced Phase 2 Analytics
  contentIntelligence: {
    autoDetectedTopics: Array<{
      topic: string
      confidence: number
      frequency: number
      masteryLevel: number
    }>
    fileTypePerformance: Array<{
      type: string
      avgScore: number
      processingTime: number
      successRate: number
    }>
    contentComplexity: {
      averageReadingLevel: number
      averagePageCount: number
      optimalLength: string
    }
    aiGenerationMetrics: {
      avgQuestionsPerFile: number
      generationSuccessRate: number
      avgProcessingTime: number
    }
  }
  knowledgeMastery: {
    conceptProgression: Array<{
      concept: string
      masteryLevel: number
      timeToMaster: number
      confidenceScore: number
      lastReviewed: string
    }>
    retentionAnalysis: {
      shortTermRetention: number
      mediumTermRetention: number
      longTermRetention: number
      forgettingCurve: Array<{ days: number; retention: number }>
    }
    learningVelocity: {
      conceptsPerHour: number
      improvementRate: number
      plateauIndicator: boolean
    }
  }
  studyOptimization: {
    optimalStudyTimes: Array<{ hour: number; performanceBoost: number }>
    sessionAnalytics: {
      optimalDuration: number
      breakFrequency: number
      focusScore: number
    }
    learningPatterns: {
      preferredDifficulty: string
      learningStyle: string
      strengths: string[]
      improvementAreas: string[]
    }
    recommendations: Array<{
      type: 'timing' | 'difficulty' | 'review' | 'content'
      message: string
      priority: 'high' | 'medium' | 'low'
      actionable: boolean
    }>
  }
  // Phase 3: Machine Learning & Advanced Intelligence
  machineLearning: {
    performancePrediction: {
      nextQuizScorePrediction: number
      confidenceInterval: { min: number; max: number }
      predictionAccuracy: number
      improvementTrajectory: 'ascending' | 'stable' | 'declining'
    }
    adaptiveLearning: {
      recommendedDifficulty: string
      difficultyAdjustmentReason: string
      learningPathOptimization: Array<{
        step: number
        topic: string
        estimatedDuration: number
        priority: number
      }>
      personalizedQuestionTypes: Array<{
        type: string
        effectiveness: number
        recommendationScore: number
      }>
    }
    intelligentInsights: {
      learningPatternAnalysis: {
        dominantPattern: string
        patternStrength: number
        behavioralTrends: string[]
      }
      anomalyDetection: Array<{
        type: 'performance_drop' | 'unusual_timing' | 'difficulty_spike' | 'engagement_change'
        description: string
        severity: 'low' | 'medium' | 'high'
        recommendation: string
      }>
      predictiveAlerts: Array<{
        alertType: 'burnout_risk' | 'plateau_warning' | 'optimal_challenge' | 'review_needed'
        message: string
        triggerDate: string
        preventiveAction: string
      }>
    }
    comparativeAnalytics: {
      percentileRanking: number
      similarLearnerComparison: {
        averageImprovement: number
        yourImprovement: number
        relativePerfomance: 'above_average' | 'average' | 'below_average'
      }
      benchmarkMetrics: Array<{
        metric: string
        yourValue: number
        benchmarkValue: number
        percentileDifference: number
      }>
    }
  }
  advancedVisualizations: {
    heatmaps: {
      studyTimeHeatmap: Array<{ day: string; hour: number; intensity: number }>
      performanceHeatmap: Array<{ subject: string; difficulty: string; score: number }>
      topicMasteryHeatmap: Array<{ topic: string; timeSpent: number; mastery: number }>
    }
    trendAnalysis: {
      performanceTrends: Array<{ period: string; trend: number; significance: number }>
      learningCurves: Array<{ topic: string; curve: Array<{ session: number; mastery: number }> }>
      velocityAnalysis: Array<{ week: string; conceptsLearned: number; velocity: number }>
    }
    interactiveMetrics: {
      drillDownData: Array<{
        category: string
        subcategories: Array<{ name: string; value: number; children?: any[] }>
      }>
      correlationMatrix: Array<{ metric1: string; metric2: string; correlation: number }>
      dimensionalAnalysis: Array<{ dimension: string; coordinates: number[]; cluster: string }>
    }
  }
}

export async function getUserAnalytics(): Promise<UserAnalytics> {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch real data from database
  const [
    filesData,
    reviewersData,
    quizzesData,
    attemptsData,
    studySessionsData,
    streaksData
  ] = await Promise.all([
    supabase.from('files').select('*').eq('user_id', user.id),
    supabase.from('reviewers').select('*').eq('user_id', user.id),
    supabase.from('quizzes').select('*').eq('user_id', user.id),
    supabase.from('quiz_attempts').select('*').eq('user_id', user.id),
    supabase.from('study_sessions').select('*').eq('user_id', user.id),
    supabase.from('learning_streaks').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(1)
  ])

  const files = filesData.data || []
  const reviewers = reviewersData.data || []
  const quizzes = quizzesData.data || []
  const attempts = attemptsData.data || []
  const studySessions = studySessionsData.data || []
  const currentStreak = streaksData.data?.[0]

  // Calculate basic metrics
  const totalStudyTime = studySessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  const averageScore = attempts.length > 0 ? 
    attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length : 0
  const uniqueQuizzes = new Set(attempts.map(attempt => attempt.quiz_id))
  const quizzesTaken = uniqueQuizzes.size

  // Calculate weekly progress (last 7 days)
  const weeklyProgress: Array<{ date: string; score: number; timeSpent: number }> = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    const dayAttempts = attempts.filter(attempt => 
      attempt.created_at?.startsWith(dateStr)
    )
    const dayStudySessions = studySessions.filter(session =>
      session.created_at?.startsWith(dateStr)
    )
    
    weeklyProgress.push({
      date: dateStr,
      score: dayAttempts.length > 0 ? 
        dayAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / dayAttempts.length : 0,
      timeSpent: dayStudySessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
    })
  }

  // Calculate difficulty breakdown
  const difficultyMap = new Map()
  quizzes.forEach(quiz => {
    const difficulty = quiz.difficulty || 'Medium'
    const quizAttempts = attempts.filter(attempt => attempt.quiz_id === quiz.id)
    const avgScore = quizAttempts.length > 0 ?
      quizAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / quizAttempts.length : 0
    
    if (!difficultyMap.has(difficulty)) {
      difficultyMap.set(difficulty, { count: 0, totalScore: 0, attempts: 0 })
    }
    const current = difficultyMap.get(difficulty)
    current.count += 1
    current.totalScore += avgScore
    current.attempts += quizAttempts.length
  })

  const difficultyBreakdown = Array.from(difficultyMap.entries()).map(([difficulty, data]) => ({
    difficulty,
    count: data.count,
    averageScore: data.attempts > 0 ? data.totalScore / data.count : 0
  }))

  // Calculate subject performance (using file types as proxy for subjects)
  const subjectMap = new Map<string, { scores: number[], quizCount: number, timeSpent: number }>()
  files.forEach(file => {
    const subject = file.subject || file.file_name?.split('.')[0] || 'General'
    const fileQuizzes = quizzes.filter(quiz => quiz.file_id === file.id)
    const fileAttempts = attempts.filter(attempt => 
      fileQuizzes.some(quiz => quiz.id === attempt.quiz_id)
    )
    const fileSessions = studySessions.filter(session => session.file_id === file.id)
    
    if (!subjectMap.has(subject)) {
      subjectMap.set(subject, { scores: [], quizCount: 0, timeSpent: 0 })
    }
    const current = subjectMap.get(subject)!
    current.scores.push(...fileAttempts.map(attempt => attempt.score || 0))
    current.quizCount += fileQuizzes.length
    current.timeSpent += fileSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
  })

  const subjectPerformance = Array.from(subjectMap.entries()).map(([subject, data]) => ({
    subject,
    averageScore: data.scores.length > 0 ? 
      data.scores.reduce((sum: number, score: number) => sum + score, 0) / data.scores.length : 0,
    quizCount: data.quizCount,
    timeSpent: data.timeSpent
  }))

  // Recent activity
  const recentActivity = [
    ...attempts.slice(-10).map(attempt => {
      const quiz = quizzes.find(q => q.id === attempt.quiz_id)
      return {
        type: 'quiz',
        title: quiz?.title || 'Quiz',
        date: attempt.created_at || '',
        score: attempt.score
      }
    }),
    ...files.slice(-5).map(file => ({
      type: 'upload',
      title: file.file_name || 'File',
      date: file.created_at || ''
    })),
    ...reviewers.slice(-5).map(reviewer => ({
      type: 'reviewer',
      title: reviewer.title || 'Study Guide',
      date: reviewer.created_at || ''
    }))
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)

  // Enhanced Phase 2 Analytics
  const contentIntelligence = {
    autoDetectedTopics: files.flatMap(file => {
      const topics = file.extracted_topics || []
      return topics.map((topic: any) => ({
        topic: topic.name || topic,
        confidence: topic.confidence || 0.8,
        frequency: topic.frequency || 1,
        masteryLevel: Math.random() * 100 // TODO: Calculate from quiz performance
      }))
    }).slice(0, 10),
    
    fileTypePerformance: Array.from(
      files.reduce((map, file) => {
        const type = file.file_name?.split('.').pop() || 'unknown'
        const fileQuizzes = quizzes.filter(q => q.file_id === file.id)
        const fileAttempts = attempts.filter(a => fileQuizzes.some(q => q.id === a.quiz_id))
        
        if (!map.has(type)) {
          map.set(type, { scores: [], processingTimes: [], successCount: 0, totalFiles: 0 })
        }
        const current = map.get(type)!
        current.scores.push(...fileAttempts.map(a => a.score || 0))
        current.processingTimes.push(file.processing_time || 30)
        current.successCount += file.status === 'completed' ? 1 : 0
        current.totalFiles += 1
        return map
      }, new Map<string, { scores: number[], processingTimes: number[], successCount: number, totalFiles: number }>())
    ).map((entry) => {
      const [type, data] = entry as [string, any]
      return {
        type,
        avgScore: data.scores.length > 0 ? data.scores.reduce((s: number, score: number) => s + score, 0) / data.scores.length : 0,
        processingTime: data.processingTimes.reduce((s: number, time: number) => s + time, 0) / data.processingTimes.length,
        successRate: (data.successCount / data.totalFiles) * 100
      }
    }),
    
    contentComplexity: {
      averageReadingLevel: files.reduce((sum, file) => sum + (file.reading_level || 12), 0) / Math.max(files.length, 1),
      averagePageCount: files.reduce((sum, file) => sum + (file.page_count || 10), 0) / Math.max(files.length, 1),
      optimalLength: files.length > 0 && files.reduce((sum, file) => sum + (file.page_count || 10), 0) / files.length > 20 ? 'Long-form content' : 'Short-form content'
    },
    
    aiGenerationMetrics: {
      avgQuestionsPerFile: quizzes.length > 0 ? quizzes.reduce((sum, quiz) => sum + (quiz.questions?.length || 10), 0) / quizzes.length : 0,
      generationSuccessRate: (quizzes.filter(q => q.status === 'completed').length / Math.max(quizzes.length, 1)) * 100,
      avgProcessingTime: files.reduce((sum, file) => sum + (file.processing_time || 30), 0) / Math.max(files.length, 1)
    }
  }

  const knowledgeMastery = {
    conceptProgression: Array.from(
      attempts.reduce((map, attempt) => {
        const quiz = quizzes.find(q => q.id === attempt.quiz_id)
        const concept = quiz?.title || 'General Concept'
        
        if (!map.has(concept)) {
          map.set(concept, { scores: [], attempts: [], firstAttempt: attempt.created_at })
        }
        const current = map.get(concept)!
        current.scores.push(attempt.score || 0)
        current.attempts.push(attempt)
        return map
      }, new Map<string, { scores: number[], attempts: any[], firstAttempt: any }>())
    ).map((entry) => {
      const [concept, data] = entry as [string, any]
      return {
        concept,
        masteryLevel: data.scores.reduce((s: number, score: number) => s + score, 0) / data.scores.length,
        timeToMaster: data.attempts.length * 30, // Estimated minutes
        confidenceScore: data.scores.length > 1 ? 
          Math.min(100, (data.scores[data.scores.length - 1] - data.scores[0] + 50)) : 50,
        lastReviewed: data.attempts[data.attempts.length - 1]?.created_at || ''
      }
    }).slice(0, 10),
    
    retentionAnalysis: {
      shortTermRetention: Math.min(100, averageScore + 5),
      mediumTermRetention: Math.min(100, averageScore - 5),
      longTermRetention: Math.min(100, averageScore - 15),
      forgettingCurve: [
        { days: 1, retention: Math.min(100, averageScore) },
        { days: 7, retention: Math.min(100, averageScore - 10) },
        { days: 30, retention: Math.min(100, averageScore - 20) },
        { days: 90, retention: Math.min(100, averageScore - 30) }
      ]
    },
    
    learningVelocity: {
      conceptsPerHour: totalStudyTime > 0 ? (uniqueQuizzes.size / (totalStudyTime / 60)) : 0,
      improvementRate: attempts.length > 1 ? 
        ((attempts[attempts.length - 1]?.score || 0) - (attempts[0]?.score || 0)) / attempts.length : 0,
      plateauIndicator: attempts.slice(-5).every(attempt => Math.abs((attempt.score || 0) - averageScore) < 10)
    }
  }

  const studyOptimization = {
    optimalStudyTimes: Array.from({ length: 24 }, (_, hour) => {
      const hourAttempts = attempts.filter(attempt => {
        const attemptHour = new Date(attempt.created_at || '').getHours()
        return attemptHour === hour
      })
      return {
        hour,
        performanceBoost: hourAttempts.length > 0 ?
          (hourAttempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / hourAttempts.length) - averageScore : 0
      }
    }).filter(data => Math.abs(data.performanceBoost) > 0).slice(0, 8),
    
    sessionAnalytics: {
      optimalDuration: studySessions.length > 0 ?
        studySessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0) / studySessions.length : 45,
      breakFrequency: studySessions.length > 0 ? Math.floor(studySessions.length / 7) : 1,
      focusScore: Math.min(100, (totalStudyTime / Math.max(attempts.length, 1)) * 2)
    },
    
    learningPatterns: {
      preferredDifficulty: difficultyBreakdown.sort((a, b) => b.count - a.count)[0]?.difficulty || 'Medium',
      learningStyle: 'Mixed', // Simplified - most people use multiple learning styles
      strengths: subjectPerformance
        .filter(subject => subject.averageScore > averageScore)
        .map(subject => subject.subject)
        .slice(0, 3),
      improvementAreas: subjectPerformance
        .filter(subject => subject.averageScore < averageScore)
        .map(subject => subject.subject)
        .slice(0, 3)
    },
    
    recommendations: [
      ...(averageScore < 70 ? [{
        type: 'difficulty' as const,
        message: 'Consider starting with easier questions to build confidence',
        priority: 'high' as const,
        actionable: true
      }] : []),
      ...(totalStudyTime < 60 ? [{
        type: 'timing' as const,
        message: 'Increase study time to at least 1 hour per week',
        priority: 'medium' as const,
        actionable: true
      }] : []),
      ...(attempts.length > 0 && attempts.slice(-3).every(a => (a.score || 0) < averageScore) ? [{
        type: 'review' as const,
        message: 'Review previous topics before attempting new quizzes',
        priority: 'high' as const,
        actionable: true
      }] : []),
      {
        type: 'content' as const,
        message: 'Upload more study materials to improve AI question generation',
        priority: files.length < 5 ? 'high' as const : 'low' as const,
        actionable: true
      }
    ]
  }

  // Phase 3: Machine Learning & Advanced Intelligence Calculations
  const machineLearning = {
    performancePrediction: {
      nextQuizScorePrediction: Math.min(100, Math.max(0, 
        averageScore + (attempts.length > 3 ? 
          (attempts.slice(-3).reduce((sum, a) => sum + (a.score || 0), 0) / 3 - averageScore) * 0.7 : 0)
      )),
      confidenceInterval: {
        min: Math.max(0, averageScore - 15),
        max: Math.min(100, averageScore + 15)
      },
      predictionAccuracy: attempts.length > 5 ? 
        Math.min(95, 60 + (attempts.length * 2)) : 60,
      improvementTrajectory: (attempts.length > 3 ? (
        attempts.slice(-3).reduce((sum, a) => sum + (a.score || 0), 0) / 3 > averageScore ? 'ascending' :
        Math.abs(attempts.slice(-3).reduce((sum, a) => sum + (a.score || 0), 0) / 3 - averageScore) < 5 ? 'stable' : 'declining'
      ) : 'stable') as 'ascending' | 'stable' | 'declining'
    },
    
    adaptiveLearning: {
      recommendedDifficulty: averageScore > 85 ? 'Hard' : averageScore > 70 ? 'Medium' : 'Easy',
      difficultyAdjustmentReason: averageScore > 85 ? 
        'Consistently high performance indicates readiness for advanced challenges' :
        averageScore > 70 ?
        'Moderate performance suggests maintaining current difficulty with gradual increases' :
        'Focus on building confidence with easier questions before advancing',
      learningPathOptimization: subjectPerformance
        .sort((a, b) => a.averageScore - b.averageScore)
        .slice(0, 5)
        .map((subject, index) => ({
          step: index + 1,
          topic: subject.subject,
          estimatedDuration: Math.max(30, 60 - (subject.averageScore * 0.5)),
          priority: 100 - (subject.averageScore * 0.8)
        })),
      personalizedQuestionTypes: [
        { type: 'Multiple Choice', effectiveness: averageScore > 75 ? 85 : 70, recommendationScore: 90 },
        { type: 'True/False', effectiveness: averageScore > 80 ? 75 : 85, recommendationScore: 80 },
        { type: 'Short Answer', effectiveness: averageScore > 70 ? 90 : 60, recommendationScore: averageScore > 70 ? 95 : 65 },
        { type: 'Essay', effectiveness: averageScore > 80 ? 95 : 50, recommendationScore: averageScore > 80 ? 90 : 40 }
      ].sort((a, b) => b.recommendationScore - a.recommendationScore)
    },
    
    intelligentInsights: {
      learningPatternAnalysis: {
        dominantPattern: totalStudyTime > 300 ? 'Intensive Learner' : 
                        totalStudyTime > 150 ? 'Consistent Learner' : 'Casual Learner',
        patternStrength: Math.min(100, (totalStudyTime / 5) + (uniqueQuizzes.size * 10)),
        behavioralTrends: [
          ...(averageScore > 85 ? ['High Achievement Orientation'] : []),
          ...(totalStudyTime > 200 ? ['High Engagement'] : []),
          ...(attempts.length > quizzes.length * 1.5 ? ['Repetitive Practice'] : []),
          ...(studySessions.length > files.length * 2 ? ['Thorough Review Habits'] : [])
        ]
      },
      anomalyDetection: [
        ...(attempts.length > 0 && attempts.slice(-3).every(a => (a.score || 0) < averageScore - 20) ? [{
          type: 'performance_drop' as const,
          description: 'Recent scores significantly below average',
          severity: 'high' as const,
          recommendation: 'Consider reviewing foundational concepts and taking breaks'
        }] : []),
        ...(studySessions.some(s => (s.duration_minutes || 0) > 180) ? [{
          type: 'unusual_timing' as const,
          description: 'Extended study sessions detected',
          severity: 'medium' as const,
          recommendation: 'Break long sessions into shorter, more focused periods'
        }] : []),
        ...(attempts.some(a => a.created_at && new Date(a.created_at).getHours() < 6) ? [{
          type: 'unusual_timing' as const,
          description: 'Late night or early morning quiz attempts',
          severity: 'low' as const,
          recommendation: 'Consider studying during peak alertness hours'
        }] : [])
      ],
      predictiveAlerts: [
        ...(totalStudyTime > 400 && averageScore < 70 ? [{
          alertType: 'burnout_risk' as const,
          message: 'High study time with declining performance may indicate burnout',
          triggerDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          preventiveAction: 'Schedule regular breaks and vary study methods'
        }] : []),
        ...(attempts.length > 10 && attempts.slice(-5).every(a => Math.abs((a.score || 0) - averageScore) < 5) ? [{
          alertType: 'plateau_warning' as const,
          message: 'Performance plateau detected - consider increasing challenge',
          triggerDate: new Date().toISOString(),
          preventiveAction: 'Try harder difficulty levels or new question types'
        }] : []),
        ...(averageScore > 90 && difficultyBreakdown.find(d => d.difficulty === 'Easy')?.count === quizzesTaken ? [{
          alertType: 'optimal_challenge' as const,
          message: 'Ready for more challenging content',
          triggerDate: new Date().toISOString(),
          preventiveAction: 'Increase difficulty to Medium or Hard level'
        }] : [])
      ]
    },
    
    comparativeAnalytics: {
      percentileRanking: Math.min(99, Math.max(1, 
        50 + ((averageScore - 75) * 0.8) + ((totalStudyTime - 120) * 0.1)
      )),
      similarLearnerComparison: {
        averageImprovement: 12, // Benchmark average
        yourImprovement: attempts.length > 5 ? 
          ((attempts[attempts.length - 1]?.score || 0) - (attempts[0]?.score || 0)) / attempts.length : 0,
        relativePerfomance: averageScore > 80 ? 'above_average' as const : 
                           averageScore > 60 ? 'average' as const : 'below_average' as const
      },
      benchmarkMetrics: [
        {
          metric: 'Average Score',
          yourValue: averageScore,
          benchmarkValue: 75,
          percentileDifference: ((averageScore - 75) / 75) * 100
        },
        {
          metric: 'Study Time (minutes)',
          yourValue: totalStudyTime,
          benchmarkValue: 180,
          percentileDifference: ((totalStudyTime - 180) / 180) * 100
        },
        {
          metric: 'Quizzes Completed',
          yourValue: quizzesTaken,
          benchmarkValue: 8,
          percentileDifference: ((quizzesTaken - 8) / 8) * 100
        }
      ]
    }
  }

  const advancedVisualizations = {
    heatmaps: {
      studyTimeHeatmap: Array.from({ length: 7 }, (_, dayIndex) => 
        Array.from({ length: 24 }, (_, hour) => {
          const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayIndex]
          const sessionsAtHour = studySessions.filter(session => {
            const sessionDate = new Date(session.created_at || '')
            return sessionDate.getDay() === dayIndex && sessionDate.getHours() === hour
          })
          return {
            day: dayName,
            hour,
            intensity: sessionsAtHour.reduce((sum, session) => sum + (session.duration_minutes || 0), 0)
          }
        })
      ).flat(),
      
      performanceHeatmap: subjectPerformance.flatMap(subject =>
        ['Easy', 'Medium', 'Hard'].map(difficulty => {
          const subjectQuizzes = quizzes.filter(q => {
            const file = files.find(f => f.id === q.file_id)
            return (file?.subject || file?.file_name?.split('.')[0]) === subject.subject
          })
          const difficultyAttempts = attempts.filter(a => {
            const quiz = subjectQuizzes.find(q => q.id === a.quiz_id && q.difficulty === difficulty)
            return !!quiz
          })
          const avgScore = difficultyAttempts.length > 0 ?
            difficultyAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / difficultyAttempts.length : 0
          
          return {
            subject: subject.subject,
            difficulty,
            score: avgScore
          }
        })
      ),
      
      topicMasteryHeatmap: files.flatMap(file => {
        const topics = file.extracted_topics || []
        const fileQuizzes = quizzes.filter(q => q.file_id === file.id)
        const fileAttempts = attempts.filter(a => 
          fileQuizzes.some(q => q.id === a.quiz_id)
        )
        const fileSessions = studySessions.filter(s => s.file_id === file.id)
        
        return topics.map((topic: any) => ({
          topic: topic.name || topic,
          timeSpent: fileSessions.reduce((sum, session) => sum + (session.duration_minutes || 0), 0),
          mastery: fileAttempts.length > 0 ?
            fileAttempts.reduce((sum, a) => sum + (a.score || 0), 0) / fileAttempts.length : 0
        }))
      }).slice(0, 20)
    },
    
    trendAnalysis: {
      performanceTrends: weeklyProgress.map((week, index) => ({
        period: `Week ${index + 1}`,
        trend: index > 0 ? week.score - weeklyProgress[index - 1].score : 0,
        significance: Math.abs(index > 0 ? week.score - weeklyProgress[index - 1].score : 0) > 10 ? 1 : 0.5
      })),
      
      learningCurves: (() => {
        const curveMap = attempts.reduce((map, attempt) => {
          const quiz = quizzes.find(q => q.id === attempt.quiz_id)
          const topic = quiz?.title || 'General'
          
          if (!map.has(topic)) {
            map.set(topic, [])
          }
          map.get(topic)!.push({
            session: map.get(topic)!.length + 1,
            mastery: attempt.score || 0
          })
          return map
        }, new Map<string, Array<{ session: number; mastery: number }>>())
        
        return Array.from(curveMap.entries()).map((entry) => {
          const [topic, curve] = entry as [string, any]
          return { topic, curve }
        }).slice(0, 10)
      })(),
      
      velocityAnalysis: weeklyProgress.map((week, index) => ({
        week: `Week ${index + 1}`,
        conceptsLearned: Math.floor(week.timeSpent / 30), // Estimate concepts per 30min
        velocity: index > 0 ? 
          Math.floor(week.timeSpent / 30) - Math.floor(weeklyProgress[index - 1].timeSpent / 30) : 0
      }))
    },
    
    interactiveMetrics: {
      drillDownData: [
        {
          category: 'Performance',
          subcategories: subjectPerformance.map(subject => ({
            name: subject.subject,
            value: subject.averageScore,
            children: ['Easy', 'Medium', 'Hard'].map(diff => ({
              name: diff,
              value: Math.random() * 100 // Placeholder for detailed breakdown
            }))
          }))
        },
        {
          category: 'Time Distribution',
          subcategories: subjectPerformance.map(subject => ({
            name: subject.subject,
            value: subject.timeSpent
          }))
        }
      ],
      
      correlationMatrix: [
        { metric1: 'Study Time', metric2: 'Performance', correlation: 0.65 },
        { metric1: 'Quiz Frequency', metric2: 'Retention', correlation: 0.72 },
        { metric1: 'Difficulty Level', metric2: 'Improvement', correlation: 0.58 },
        { metric1: 'Session Length', metric2: 'Focus Score', correlation: -0.43 }
      ],
      
      dimensionalAnalysis: subjectPerformance.map((subject, index) => ({
        dimension: subject.subject,
        coordinates: [subject.averageScore, subject.timeSpent / 60, subject.quizCount],
        cluster: subject.averageScore > 80 ? 'High Performers' : 
                subject.averageScore > 60 ? 'Average Performers' : 'Developing Learners'
      }))
    }
  }

  return {
    totalStudyTime,
    averageScore: Math.round(averageScore),
    quizzesTaken,
    studyStreak: currentStreak?.current_streak || 0,
    filesUploaded: files.length,
    reviewersGenerated: reviewers.length,
    weeklyProgress,
    difficultyBreakdown,
    subjectPerformance,
    recentActivity,
    contentIntelligence,
    knowledgeMastery,
    studyOptimization,
    machineLearning,
    advancedVisualizations
  }
}

export async function getQuizProgress(): Promise<QuizProgress[]> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return []

    // Get all quizzes for the user
    const { data: quizzes, error: quizzesError } = await supabase
      .from('quizzes')
      .select('id, title, difficulty, total_questions, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (quizzesError) {
      console.error('Error fetching quizzes:', {
        message: quizzesError.message,
        details: quizzesError.details,
        hint: quizzesError.hint,
        code: quizzesError.code
      })
      return []
    }

    if (!quizzes || quizzes.length === 0) return []

    // Get all attempts for these quizzes
    const quizIds = quizzes.map(q => q.id)
    const { data: attempts, error: attemptsError } = await supabase
      .from('quiz_attempts')
      .select('id, quiz_id, score, total_questions, time_taken, answers, completed_at')
      .in('quiz_id', quizIds)
      .order('completed_at', { ascending: false })

    if (attemptsError) {
      console.error('Error fetching attempts:', {
        message: attemptsError.message,
        details: attemptsError.details,
        hint: attemptsError.hint,
        code: attemptsError.code
      })
      return []
    }

    // Process each quiz and its attempts
    const quizProgress: QuizProgress[] = quizzes.map(quiz => {
      const quizAttempts = attempts?.filter(attempt => attempt.quiz_id === quiz.id) || []
      
      // Calculate correct answers from each attempt
      const correctAnswersArray = quizAttempts.map(attempt => {
        // If answers are stored as an array, count correct ones
        if (attempt.answers && Array.isArray(attempt.answers)) {
          return attempt.answers.filter((answer: any) => answer.isCorrect).length;
        }
        // Otherwise, convert score back to raw count (assuming score is percentage)
        return Math.round((attempt.score / 100) * attempt.total_questions);
      });
      
      // Calculate average based on correct answers
      const averageCorrectAnswers = correctAnswersArray.length > 0 ? 
        correctAnswersArray.reduce((sum, score) => sum + score, 0) / correctAnswersArray.length : 0;
      const averageScore = quiz.total_questions > 0 ? Math.round((averageCorrectAnswers / quiz.total_questions) * 100) : 0;
      
      // Calculate best score
      const bestScore = correctAnswersArray.length > 0 ? Math.max(...correctAnswersArray) : 0
      
      // Generate interpretation message based on attempts and average score
      let interpretation = ''
      if (quizAttempts.length === 0) {
        interpretation = 'No attempts yet - try this quiz to see your progress!'
      } else if (quizAttempts.length === 1) {
        interpretation = averageScore >= 80 ? 'Great first attempt! You can retake to improve further.' : 
                        averageScore >= 60 ? 'Good start! Consider reviewing the material and retaking.' :
                        'Keep studying and try again - you\'ve got this!'
      } else {
        interpretation = averageScore >= 90 ? `Excellent performance! Average score: ${averageScore}% across ${quizAttempts.length} attempts.` :
                        averageScore >= 80 ? `Great work! Average score: ${averageScore}% across ${quizAttempts.length} attempts.` :
                        averageScore >= 70 ? `Good progress! Average score: ${averageScore}% across ${quizAttempts.length} attempts.` :
                        `Keep practicing! Average score: ${averageScore}% across ${quizAttempts.length} attempts.`
      }

      return {
        id: quiz.id,
        title: quiz.title,
        difficulty: quiz.difficulty || 'Medium',
        totalQuestions: quiz.total_questions,
        attempts: quizAttempts.map(attempt => {
          // Calculate correct answers from the stored answers or use the score field appropriately
          const correctAnswers = (attempt.answers && Array.isArray(attempt.answers)) ? 
            // If answers are stored as an array, count correct ones
            attempt.answers.filter((answer: any) => answer.isCorrect).length :
            // Otherwise, convert percentage back to raw count or use score directly
            Math.round((attempt.score / 100) * attempt.total_questions);
          
          return {
            id: attempt.id,
            score: correctAnswers,                   // Raw correct answers (e.g., 22)
            totalQuestions: attempt.total_questions, // Total questions (e.g., 29)
            percentage: Math.round((correctAnswers / attempt.total_questions) * 100), // Percentage
            timeSpent: attempt.time_taken || 0,      // Time spent in seconds
            completedAt: attempt.completed_at
          }
        }),
        averageScore,
        bestScore,
        totalAttempts: quizAttempts.length,
        interpretation
      }
    })

    return quizProgress

  } catch (error) {
    console.error('Error getting quiz progress:', error)
    return []
  }
}

export function getScoreColor(score: number): string {
  if (score >= 90) return 'text-green-600'
  if (score >= 80) return 'text-blue-600'
  if (score >= 70) return 'text-yellow-600'
  if (score >= 60) return 'text-orange-600'
  return 'text-red-600'
}
