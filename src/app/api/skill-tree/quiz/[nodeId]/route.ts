import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const GUEST_USER_ID = 'guest'

// GET: Fetch all quiz questions for a specific node (by nodeId string like "R1-N1")
export async function GET(_request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  try {
    const { nodeId } = await params

    // Find the node first
    const node = await db.node.findUnique({
      where: { nodeId },
      select: { id: true, nodeId: true, title: true, xp: true, contentType: true },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Fetch all quiz questions for this node
    const quizzes = await db.quizBank.findMany({
      where: { nodeId: node.id },
      orderBy: { quizId: 'asc' },
      select: {
        id: true,
        quizId: true,
        type: true,
        question: true,
        questionHi: true,
        questionTe: true,
        options: true,
        optionsHi: true,
        optionsTe: true,
        answer: true,
        answerHi: true,
        answerTe: true,
        explanation: true,
        explanationHi: true,
        explanationTe: true,
        difficulty: true,
        xp: true,
        hint: true,
        hintHi: true,
        hintTe: true,
        bossBattle: true,
      },
    })

    if (quizzes.length === 0) {
      return NextResponse.json({
        nodeId: node.nodeId,
        title: node.title,
        hasQuiz: false,
        questions: [],
      })
    }

    // Parse JSON options fields for each quiz
    const questions = quizzes.map((q) => ({
      ...q,
      options: JSON.parse(q.options),
      optionsHi: q.optionsHi ? JSON.parse(q.optionsHi) : null,
      optionsTe: q.optionsTe ? JSON.parse(q.optionsTe) : null,
    }))

    return NextResponse.json({
      nodeId: node.nodeId,
      title: node.title,
      hasQuiz: true,
      totalQuestions: questions.length,
      totalXp: questions.reduce((sum: number, q: { xp: number }) => sum + q.xp, 0),
      isBossBattle: questions.some((q: { bossBattle: boolean }) => q.bossBattle),
      questions,
    })
  } catch (error) {
    console.error('Error fetching quiz:', error)
    return NextResponse.json({ error: 'Failed to fetch quiz' }, { status: 500 })
  }
}

// POST: Submit quiz answers, calculate score, save progress, and unlock next nodes
export async function POST(request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  try {
    const { nodeId } = await params
    const body = await request.json()
    const { answers }: { answers: Record<string, string> } = body

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json({ error: 'answers object is required' }, { status: 400 })
    }

    // Find the node
    const node = await db.node.findUnique({
      where: { nodeId },
      select: { id: true, nodeId: true, title: true, xp: true },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Fetch all quiz questions for this node
    const quizzes = await db.quizBank.findMany({
      where: { nodeId: node.id },
      orderBy: { quizId: 'asc' },
      select: {
        quizId: true,
        question: true,
        answer: true,
        explanation: true,
        xp: true,
        bossBattle: true,
      },
    })

    if (quizzes.length === 0) {
      return NextResponse.json({ error: 'No quiz questions found for this node' }, { status: 404 })
    }

    // Calculate score
    let correctCount = 0
    let totalXpEarned = 0
    const results = quizzes.map((q) => {
      const userAnswer = answers[q.quizId] || ''
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase()
      if (isCorrect) {
        correctCount++
        totalXpEarned += q.xp
      }
      return {
        quizId: q.quizId,
        question: q.question,
        correctAnswer: q.answer,
        userAnswer,
        isCorrect,
        explanation: q.explanation,
        xpEarned: isCorrect ? q.xp : 0,
        xpPossible: q.xp,
        isBossBattle: q.bossBattle,
      }
    })

    const totalPossibleXp = quizzes.reduce((sum, q) => sum + q.xp, 0)
    const scorePercent = Math.round((correctCount / quizzes.length) * 100)
    const passed = scorePercent >= 60

    // ---- Save progress to UserProgress ----
    // Ensure progress record exists
    let progress = await db.userProgress.findUnique({
      where: {
        userId_nodeId: {
          userId: GUEST_USER_ID,
          nodeId: node.id,
        },
      },
    })

    if (!progress) {
      progress = await db.userProgress.create({
        data: {
          userId: GUEST_USER_ID,
          nodeId: node.id,
          status: 'in_progress',
          readPercent: 0,
          quizScore: 0,
          quizBestScore: 0,
          xpEarned: 0,
        },
      })
    }

    const newBestScore = Math.max(progress.quizBestScore, scorePercent)
    let newlyCompleted = false
    let unlockedNodes: Array<{ nodeId: string; title: string }> = []

    if (passed && progress.status !== 'completed') {
      // Mark as completed
      await db.userProgress.update({
        where: { id: progress.id },
        data: {
          status: 'completed',
          quizScore: scorePercent,
          quizBestScore: newBestScore,
          xpEarned: node.xp,
          completedAt: new Date(),
        },
      })
      newlyCompleted = true

      // Unlock next nodes
      unlockedNodes = await unlockNextNodes(node.id)
    } else {
      // Just update quiz scores
      await db.userProgress.update({
        where: { id: progress.id },
        data: {
          quizScore: scorePercent,
          quizBestScore: newBestScore,
        },
      })
    }

    return NextResponse.json({
      nodeId: node.nodeId,
      title: node.title,
      totalQuestions: quizzes.length,
      correctAnswers: correctCount,
      scorePercent,
      xpEarned: totalXpEarned,
      xpPossible: totalPossibleXp,
      passed,
      results,
      // Progress-specific fields
      newlyCompleted,
      nodeXpEarned: passed && newlyCompleted ? node.xp : 0,
      unlockedNodes,
    })
  } catch (error) {
    console.error('Error submitting quiz:', error)
    return NextResponse.json({ error: 'Failed to submit quiz' }, { status: 500 })
  }
}

/**
 * When a node is completed, find and unlock next nodes based on Edge connections.
 * Returns the list of newly unlocked nodes.
 */
async function unlockNextNodes(completedNodeDbId: number): Promise<Array<{ nodeId: string; title: string }>> {
  // Find edges from this node where relationship is prerequisite or leads_to
  const edges = await db.edge.findMany({
    where: {
      fromNodeId: completedNodeDbId,
      relationship: { in: ['prerequisite', 'leads_to'] },
    },
    select: { toNodeId: true },
  })

  const unlocked: Array<{ nodeId: string; title: string }> = []

  for (const edge of edges) {
    // Check if the target node's progress is currently "locked"
    const targetProgress = await db.userProgress.findUnique({
      where: {
        userId_nodeId: {
          userId: GUEST_USER_ID,
          nodeId: edge.toNodeId,
        },
      },
    })

    if (targetProgress && targetProgress.status === 'locked') {
      // Check if ALL prerequisites for the target node are now completed
      const allPrereqEdges = await db.edge.findMany({
        where: {
          toNodeId: edge.toNodeId,
          relationship: { in: ['prerequisite', 'leads_to'] },
        },
        select: { fromNodeId: true },
      })

      const prereqNodeIds = allPrereqEdges.map((e) => e.fromNodeId)
      const completedPrereqs = await db.userProgress.findMany({
        where: {
          userId: GUEST_USER_ID,
          nodeId: { in: prereqNodeIds },
          status: 'completed',
        },
      })

      // Only unlock if all prerequisites are completed
      if (completedPrereqs.length === prereqNodeIds.length) {
        await db.userProgress.update({
          where: { id: targetProgress.id },
          data: { status: 'available' },
        })

        // Get node info for response
        const targetNode = await db.node.findUnique({
          where: { id: edge.toNodeId },
          select: { nodeId: true, title: true },
        })

        if (targetNode) {
          unlocked.push({ nodeId: targetNode.nodeId, title: targetNode.title })
        }
      }
    }
  }

  return unlocked
}
