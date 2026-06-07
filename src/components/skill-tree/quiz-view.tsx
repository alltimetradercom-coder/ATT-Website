'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  Zap,
  Skull,
  CheckCircle2,
  XCircle,
  ChevronRight,
  RotateCcw,
  Trophy,
  Sparkles,
  Lightbulb,
  Swords,
  Star,
  Target,
  Unlock,
} from 'lucide-react'

interface QuizQuestion {
  id: number
  quizId: string
  type: string
  question: string
  options: string[]
  answer: string
  explanation: string | null
  difficulty: string
  xp: number
  hint: string | null
  bossBattle: boolean
}

interface UnlockedNode {
  nodeId: string
  title: string
}

interface QuizViewProps {
  nodeId: string
  realmColor: string
  isBoss?: boolean
}

type QuizState = 'loading' | 'playing' | 'answered' | 'results'

export function QuizView({ nodeId, realmColor, isBoss = false }: QuizViewProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [state, setState] = useState<QuizState>('loading')
  const [score, setScore] = useState(0)
  const [xpEarned, setXpEarned] = useState(0)
  const [showHint, setShowHint] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [unlockedNodes, setUnlockedNodes] = useState<UnlockedNode[]>([])
  const [progressSubmitted, setProgressSubmitted] = useState(false)
  const answersRef = useRef<Record<string, string>>({})

  const fetchQuiz = useCallback(async () => {
    try {
      const res = await fetch(`/api/skill-tree/quiz/${encodeURIComponent(nodeId)}`)
      const data = await res.json()
      if (!res.ok) {
        return { error: data.error || 'Failed to load quiz', questions: [] as QuizQuestion[] }
      }
      if (!data.hasQuiz || data.questions.length === 0) {
        return { error: 'No quiz questions available', questions: [] as QuizQuestion[] }
      }
      return { error: null, questions: data.questions as QuizQuestion[] }
    } catch {
      return { error: 'Failed to load quiz', questions: [] as QuizQuestion[] }
    }
  }, [nodeId])

  useEffect(() => {
    let cancelled = false
    fetchQuiz().then(({ error: fetchError, questions: qs }) => {
      if (cancelled) return
      if (fetchError) {
        setError(fetchError)
        setState('loading')
      } else {
        setQuestions(qs)
        setCurrentIndex(0)
        setSelectedOption(null)
        setScore(0)
        setXpEarned(0)
        setShowHint(false)
        setState('playing')
      }
    })
    return () => { cancelled = true }
  }, [fetchQuiz])

  const currentQuestion = questions[currentIndex]
  const totalQuestions = questions.length
  const progressPercent = totalQuestions > 0 ? ((currentIndex + 1) / totalQuestions) * 100 : 0

  const handleSelectOption = (option: string) => {
    if (state !== 'playing') return
    setSelectedOption(option)
  }

  const handleSubmitAnswer = () => {
    if (!selectedOption || !currentQuestion) return

    // Track the answer
    answersRef.current[currentQuestion.quizId] = selectedOption

    const isCorrect = selectedOption.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase()
    if (isCorrect) {
      setScore((prev) => prev + 1)
      setXpEarned((prev) => prev + currentQuestion.xp)
    }
    setState('answered')
  }

  const handleNextQuestion = () => {
    if (currentIndex + 1 >= totalQuestions) {
      // Submit to the API and transition to results
      submitQuizToApi()
      setState('results')
    } else {
      setCurrentIndex((prev) => prev + 1)
      setSelectedOption(null)
      setShowHint(false)
      setState('playing')
    }
  }

  const submitQuizToApi = async () => {
    if (progressSubmitted) return
    try {
      const res = await fetch(`/api/skill-tree/quiz/${encodeURIComponent(nodeId)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: answersRef.current }),
      })
      const data = await res.json()
      if (data.unlockedNodes && data.unlockedNodes.length > 0) {
        setUnlockedNodes(data.unlockedNodes)
      }
      setProgressSubmitted(true)
    } catch (e) {
      console.error('Failed to submit quiz progress:', e)
    }
  }

  const handleRetake = () => {
    answersRef.current = {}
    setProgressSubmitted(false)
    setUnlockedNodes([])
    fetchQuiz().then(({ error: fetchError, questions: qs }) => {
      if (fetchError) {
        setError(fetchError)
        setState('loading')
      } else {
        setQuestions(qs)
        setCurrentIndex(0)
        setSelectedOption(null)
        setScore(0)
        setXpEarned(0)
        setShowHint(false)
        setState('playing')
      }
    })
  }

  // Loading state
  if (state === 'loading') {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: realmColor }} />
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-4">
            {isBoss ? <Skull className="h-4 w-4" style={{ color: realmColor }} /> : <Swords className="h-4 w-4" style={{ color: realmColor }} />}
            <h3 className="font-bold text-foreground">Quiz Challenge</h3>
          </div>
          <div className="flex flex-col items-center py-8 text-center">
            <div className="h-10 w-10 rounded-full border-4 border-primary/30 border-t-primary animate-spin mb-4" />
            <p className="text-sm text-muted-foreground">Loading quiz questions...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Error state
  if (error) {
    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
        <div className="h-1 w-full" style={{ backgroundColor: realmColor }} />
        <CardContent className="p-5">
          <div className="flex items-center gap-2 mb-3">
            {isBoss ? <Skull className="h-4 w-4" style={{ color: realmColor }} /> : <Swords className="h-4 w-4" style={{ color: realmColor }} />}
            <h3 className="font-bold text-foreground">Quiz Challenge</h3>
          </div>
          <div className="flex flex-col items-center py-6 text-center">
            <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-3">
              <Skull className="h-6 w-6 text-amber-500/60" />
            </div>
            <p className="text-sm text-muted-foreground">Quiz questions are being prepared for this node.</p>
            <Badge variant="outline" className="mt-2 text-[10px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25">
              +10 XP per correct answer
            </Badge>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Results state
  if (state === 'results') {
    const scorePercent = Math.round((score / totalQuestions) * 100)
    const passed = scorePercent >= 60

    return (
      <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden relative">
        {/* Confetti effect when passed */}
        {passed && (
          <div className="confetti-container">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="confetti-piece" />
            ))}
          </div>
        )}
        <div className="h-1 w-full" style={{ backgroundColor: passed ? '#10B981' : '#EF4444' }} />
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center">
            {/* Result Icon */}
            <div className={`relative mb-4 ${passed ? 'celebrate-bounce' : ''}`}>
              <div
                className={`h-20 w-20 rounded-full flex items-center justify-center ${passed ? 'celebrate-glow' : ''}`}
                style={{
                  backgroundColor: passed ? '#10B98120' : '#EF444420',
                  border: `3px solid ${passed ? '#10B98160' : '#EF444460'}`,
                }}
              >
                {passed ? (
                  <Trophy className="h-9 w-9" style={{ color: '#10B981' }} />
                ) : (
                  <XCircle className="h-9 w-9" style={{ color: '#EF4444' }} />
                )}
              </div>
              {passed && (
                <>
                  <div className="absolute -top-1 -right-1 h-7 w-7 rounded-full bg-amber-500 flex items-center justify-center">
                    <Star className="h-4 w-4 text-white" />
                  </div>
                  {/* Sparkle ring */}
                  <div className="absolute inset-0 rounded-full border-2 border-amber-400/50 sparkle-ring" />
                </>
              )}
            </div>

            {/* Title */}
            <h3 className="text-xl font-black text-foreground mb-1">
              {passed ? 'Quiz Complete!' : 'Keep Practicing!'}
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              {passed
                ? isBoss
                  ? 'You conquered the Boss Battle!'
                  : 'You passed the quiz!'
                : 'You need 60% to pass. Try again!'}
            </p>

            {/* Score Card */}
            <div className="w-full rounded-xl border border-border/60 bg-background/50 p-4 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Score</span>
                <span className="text-lg font-black" style={{ color: passed ? '#10B981' : '#EF4444' }}>
                  {scorePercent}%
                </span>
              </div>
              <Progress
                value={scorePercent}
                className="h-3"
              />
              <div className="grid grid-cols-3 gap-2 pt-1">
                <div className="text-center">
                  <div className="text-lg font-black text-foreground">{score}/{totalQuestions}</div>
                  <div className="text-[10px] text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-black text-primary">{xpEarned} XP</div>
                  <div className="text-[10px] text-muted-foreground">Earned</div>
                </div>
                <div className="text-center">
                  <Badge
                    variant="outline"
                    className={`text-[10px] font-bold ${passed ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25' : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'}`}
                  >
                    {passed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </div>
              </div>
            </div>

            {/* XP Reward Badge */}
            {passed && (
              <div
                className="w-full rounded-xl border p-3 flex items-center gap-3 mb-4 celebrate-glow"
                style={{ borderColor: `${realmColor}40`, backgroundColor: `${realmColor}10` }}
              >
                <div
                  className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${realmColor}25` }}
                >
                  <Zap className="h-5 w-5" style={{ color: realmColor }} />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-foreground">+{xpEarned} XP Earned!</p>
                  <p className="text-[10px] text-muted-foreground">Experience points added to your journey</p>
                </div>
                <Sparkles className="h-5 w-5 shrink-0" style={{ color: realmColor }} />
              </div>
            )}

            {/* Unlocked Nodes */}
            {unlockedNodes.length > 0 && (
              <div className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-3 mb-4">
                <div className="flex items-center gap-2 mb-2">
                  <Unlock className="h-4 w-4 text-emerald-500" />
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">New Nodes Unlocked!</span>
                </div>
                <div className="space-y-1.5">
                  {unlockedNodes.map((node) => (
                    <div key={node.nodeId} className="flex items-center gap-2 text-left">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-foreground">{node.nodeId}</p>
                        <p className="text-[10px] text-muted-foreground">{node.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Boss Battle Badge */}
            {passed && isBoss && (
              <div className="w-full rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center gap-3 mb-4">
                <div className="h-10 w-10 rounded-lg bg-amber-500/20 flex items-center justify-center shrink-0">
                  <Skull className="h-5 w-5 text-amber-500" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-amber-600 dark:text-amber-400">Boss Defeated!</p>
                  <p className="text-[10px] text-muted-foreground">You conquered the Genesis Final Exam</p>
                </div>
              </div>
            )}

            {/* Retake Button */}
            <Button
              onClick={handleRetake}
              variant="outline"
              className="w-full gap-2"
              style={{ borderColor: `${realmColor}40`, color: realmColor }}
            >
              <RotateCcw className="h-4 w-4" />
              Retake Quiz
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Playing / Answered states
  const isCorrect = selectedOption
    ? selectedOption.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase()
    : false

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur-sm overflow-hidden">
      <div className="h-1 w-full" style={{ backgroundColor: realmColor }} />
      <CardContent className="p-5">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            {isBoss || currentQuestion.bossBattle ? (
              <Skull className="h-4 w-4" style={{ color: realmColor }} />
            ) : (
              <Swords className="h-4 w-4" style={{ color: realmColor }} />
            )}
            <h3 className="font-bold text-foreground">
              {isBoss || currentQuestion.bossBattle ? 'Boss Battle' : 'Quiz Challenge'}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-[10px] font-bold bg-primary/10 text-primary border-primary/25">
              <Zap className="h-3 w-3 mr-0.5" /> {xpEarned} XP
            </Badge>
            <Badge
              variant="outline"
              className="text-[10px] font-bold"
              style={{ color: realmColor, borderColor: `${realmColor}40` }}
            >
              {currentIndex + 1}/{totalQuestions}
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <Progress value={progressPercent} className="h-2" />
        </div>

        {/* Question */}
        <div className="mb-4">
          <div className="flex items-start gap-2 mb-1">
            <span className="text-xs font-bold text-muted-foreground shrink-0">Q{currentIndex + 1}.</span>
            <h4 className="text-sm font-semibold text-foreground leading-relaxed">{currentQuestion.question}</h4>
          </div>

          {/* Difficulty + Type Badges */}
          <div className="flex items-center gap-1.5 mt-2 mb-3">
            <Badge
              variant="outline"
              className={`text-[9px] font-bold px-1.5 py-0 h-4 ${
                currentQuestion.difficulty === 'Beginner'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25'
                  : currentQuestion.difficulty === 'Intermediate'
                    ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/25'
                    : 'bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/25'
              }`}
            >
              {currentQuestion.difficulty}
            </Badge>
            <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 bg-muted/50">
              {currentQuestion.type === 'mcq' ? 'Multiple Choice' : currentQuestion.type}
            </Badge>
            {currentQuestion.bossBattle && (
              <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 bg-red-500/15 text-red-500 border-red-500/25">
                <Skull className="h-2.5 w-2.5 mr-0.5" /> BOSS
              </Badge>
            )}
          </div>

          {/* Hint */}
          {currentQuestion.hint && state === 'playing' && !showHint && (
            <button
              onClick={() => setShowHint(true)}
              className="flex items-center gap-1 text-[11px] text-amber-500 hover:text-amber-600 transition-colors mb-3"
            >
              <Lightbulb className="h-3 w-3" />
              Show Hint
            </button>
          )}
          {showHint && currentQuestion.hint && state === 'playing' && (
            <div className="flex items-start gap-1.5 mb-3 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[11px] text-amber-600 dark:text-amber-400 leading-relaxed">{currentQuestion.hint}</p>
            </div>
          )}
        </div>

        {/* Options */}
        <div className="space-y-2 mb-4">
          {currentQuestion.options.map((option, i) => {
            const isSelected = selectedOption === option
            const isAnsweredState = state === 'answered'
            const isCorrectOption = option.trim().toLowerCase() === currentQuestion.answer.trim().toLowerCase()

            let optionStyle = 'border-border/60 bg-background/50 hover:border-primary/40 hover:bg-primary/5'
            if (isSelected && state === 'playing') {
              optionStyle = `border-primary/60 bg-primary/10`
            }
            if (isAnsweredState) {
              if (isCorrectOption) {
                optionStyle = 'border-emerald-500/60 bg-emerald-500/10'
              } else if (isSelected && !isCorrectOption) {
                optionStyle = 'border-red-500/60 bg-red-500/10'
              } else {
                optionStyle = 'border-border/40 bg-background/30 opacity-60'
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleSelectOption(option)}
                disabled={isAnsweredState}
                className={`group w-full flex items-center gap-3 rounded-lg border p-3 text-left transition-all ${optionStyle}`}
              >
                {/* Option Letter */}
                <div
                  className={`flex h-7 w-7 items-center justify-center rounded-lg text-xs font-bold shrink-0 ${
                    isAnsweredState && isCorrectOption
                      ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                      : isAnsweredState && isSelected && !isCorrectOption
                        ? 'bg-red-500/20 text-red-600 dark:text-red-400'
                        : isSelected && state === 'playing'
                          ? 'bg-primary/20 text-primary'
                          : 'bg-muted/50 text-muted-foreground'
                  }`}
                >
                  {isAnsweredState && isCorrectOption ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : isAnsweredState && isSelected && !isCorrectOption ? (
                    <XCircle className="h-4 w-4" />
                  ) : (
                    String.fromCharCode(65 + i)
                  )}
                </div>

                {/* Option Text */}
                <span
                  className={`text-sm flex-1 ${
                    isAnsweredState && isCorrectOption
                      ? 'text-emerald-700 dark:text-emerald-300 font-semibold'
                      : isAnsweredState && isSelected && !isCorrectOption
                        ? 'text-red-700 dark:text-red-300'
                        : isSelected && state === 'playing'
                          ? 'text-foreground font-medium'
                          : 'text-muted-foreground group-hover:text-foreground'
                  }`}
                >
                  {option}
                </span>

                {/* XP indicator for correct answer in answered state */}
                {isAnsweredState && isCorrectOption && (
                  <Badge variant="outline" className="text-[9px] font-bold px-1.5 py-0 h-4 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/25 shrink-0">
                    +{currentQuestion.xp} XP
                  </Badge>
                )}
              </button>
            )
          })}
        </div>

        {/* Explanation (shown after answering) */}
        {state === 'answered' && currentQuestion.explanation && (
          <div className={`mb-4 p-3 rounded-lg border ${
            isCorrect
              ? 'bg-emerald-500/5 border-emerald-500/20'
              : 'bg-red-500/5 border-red-500/20'
          }`}>
            <div className="flex items-center gap-1.5 mb-1.5">
              {isCorrect ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <XCircle className="h-3.5 w-3.5 text-red-500" />
              )}
              <span className={`text-xs font-bold ${isCorrect ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {isCorrect ? 'Correct!' : 'Incorrect'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">{currentQuestion.explanation}</p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {state === 'playing' && (
            <Button
              onClick={handleSubmitAnswer}
              disabled={!selectedOption}
              className="flex-1 gap-2"
              style={{
                backgroundColor: selectedOption ? realmColor : undefined,
                borderColor: realmColor,
              }}
            >
              <Target className="h-4 w-4" />
              Submit Answer
            </Button>
          )}
          {state === 'answered' && (
            <Button
              onClick={handleNextQuestion}
              className="flex-1 gap-2"
              style={{ backgroundColor: realmColor, borderColor: realmColor }}
            >
              {currentIndex + 1 >= totalQuestions ? (
                <>
                  <Trophy className="h-4 w-4" />
                  See Results
                </>
              ) : (
                <>
                  Next Question
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
