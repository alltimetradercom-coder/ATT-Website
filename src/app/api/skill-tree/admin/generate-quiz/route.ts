import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

function buildQuizPrompt(node: {
  id: number
  nodeId: string
  title: string
  slug: string
  contentType: string
  difficulty: string
  subRealm: string | null
  content: string | null
}, isBoss: boolean) {
  const questionCount = isBoss ? 5 : 3
  const difficultyNote = isBoss
    ? 'These are BOSS BATTLE questions - make them harder, more comprehensive, and require deeper understanding. Combine multiple concepts from the Genesis realm.'
    : 'These are regular quiz questions for a beginner node. Keep them clear and educational.'

  return `You are an expert Indian stock market educator creating quiz questions for a gamified trading learning platform called AllTimeTrader (ATT).

Generate ${questionCount} multiple-choice quiz questions for this lesson node:

Node ID: ${node.nodeId}
Title: ${node.title}
Topic Slug: ${node.slug}
Content Type: ${node.contentType}
Difficulty: ${node.difficulty}
Sub-Realm: ${node.subRealm || 'General'}
${isBoss ? 'BOSS BATTLE: Yes - this is the final exam node for the Genesis realm.' : ''}

${node.content ? `Lesson Content Summary (for context):\n${node.content.substring(0, 800)}` : ''}

IMPORTANT RULES:
1. Questions must be about INDIAN stock markets (NSE, BSE, SEBI, Indian companies, INR currency)
2. ${difficultyNote}
3. Each question must have exactly 4 options with exactly 1 correct answer
4. Include a clear explanation for why the answer is correct
5. Include a helpful hint for each question
6. Be accurate and educational — this is for real learners
7. DO NOT use any emoji characters in your output
8. Questions should test understanding, not just memorization
9. Use real Indian market examples where appropriate (Reliance, TCS, Infosys, HDFC, etc.)
10. For the correct answer, use the EXACT text of the correct option (not A/B/C/D)

Return a JSON object with EXACTLY these fields:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "answer": "Exact text of the correct option",
      "explanation": "Why this answer is correct and why others are wrong",
      "hint": "A helpful hint without giving away the answer",
      "difficulty": "Beginner",
      "xp": 10,
      "type": "mcq"
    }
  ]
}

For boss battle questions, use difficulty "Intermediate" and xp of 20.

Return ONLY the JSON object, no markdown code fences, no extra text.`
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nodeId, force = false } = body

    if (!nodeId) {
      return NextResponse.json({ error: 'nodeId is required' }, { status: 400 })
    }

    // Fetch the node
    const node = await db.node.findUnique({
      where: { nodeId },
      include: { realm: { select: { title: true, spirit: true, realmNumber: true } } },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Check if quiz already exists (unless force=true)
    if (!force) {
      const existingCount = await db.quizBank.count({
        where: { nodeId: node.id },
      })
      if (existingCount > 0) {
        return NextResponse.json({
          message: 'Quiz questions already exist for this node. Use force=true to regenerate.',
          nodeId: node.nodeId,
          title: node.title,
          existingCount,
        })
      }
    }

    // If force, delete existing quiz questions
    if (force) {
      await db.quizBank.deleteMany({ where: { nodeId: node.id } })
    }

    const isBoss = node.nodeId === 'R1-N15' || node.contentType === 'Certification'

    console.log(`[Quiz Engine] Generating quiz for ${nodeId}: ${node.title} (Boss: ${isBoss})`)

    // Generate quiz using LLM
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indian stock market educator. You always respond with valid JSON only. No markdown, no code fences, just the raw JSON object.',
        },
        {
          role: 'user',
          content: buildQuizPrompt(node, isBoss),
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      return NextResponse.json({ error: 'LLM returned empty response' }, { status: 500 })
    }

    // Parse the LLM response
    let parsed: { questions: Array<{
      question: string
      options: string[]
      answer: string
      explanation: string
      hint: string
      difficulty: string
      xp: number
      type: string
    }> }
    try {
      let cleanContent = rawContent.trim()
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(cleanContent)
    } catch {
      console.error('[Quiz Engine] Failed to parse LLM response:', rawContent.substring(0, 500))
      return NextResponse.json({
        error: 'Failed to parse LLM response as JSON',
        raw: rawContent.substring(0, 500),
      }, { status: 500 })
    }

    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return NextResponse.json({ error: 'LLM response missing questions array' }, { status: 500 })
    }

    // Insert quiz questions into the database
    const created = []
    for (let i = 0; i < parsed.questions.length; i++) {
      const q = parsed.questions[i]
      const quizId = `Q-${node.nodeId}-${String(i + 1).padStart(2, '0')}`

      try {
        const quiz = await db.quizBank.create({
          data: {
            quizId,
            nodeId: node.id,
            type: q.type || 'mcq',
            question: q.question,
            options: JSON.stringify(q.options),
            answer: q.answer,
            explanation: q.explanation || null,
            hint: q.hint || null,
            difficulty: q.difficulty || node.difficulty,
            xp: q.xp || (isBoss ? 20 : 10),
            bossBattle: isBoss,
          },
        })
        created.push({ quizId: quiz.quizId, question: quiz.question.substring(0, 60) + '...' })
      } catch (err) {
        console.error(`[Quiz Engine] Failed to create quiz ${quizId}:`, err)
        created.push({ quizId, error: 'Failed to create' })
      }
    }

    console.log(`[Quiz Engine] Successfully generated ${created.length} quiz questions for ${nodeId}`)

    return NextResponse.json({
      success: true,
      nodeId: node.nodeId,
      title: node.title,
      questionCount: created.length,
      questions: created,
    })
  } catch (error) {
    console.error('[Quiz Engine] Error:', error)
    return NextResponse.json({
      error: 'Quiz generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Batch generate quiz questions for an entire realm
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { realmId, force = false } = body

    if (!realmId) {
      return NextResponse.json({ error: 'realmId is required' }, { status: 400 })
    }

    const nodes = await db.node.findMany({
      where: { realmId },
      orderBy: { nodeId: 'asc' },
      select: {
        id: true,
        nodeId: true,
        title: true,
        slug: true,
        contentType: true,
        difficulty: true,
        subRealm: true,
        content: true,
      },
    })

    if (nodes.length === 0) {
      return NextResponse.json({ message: 'No nodes found in this realm', count: 0 })
    }

    // Filter out nodes that already have quiz questions (unless force=true)
    const nodesToProcess = force
      ? nodes
      : await filterNodesWithoutQuiz(nodes)

    if (nodesToProcess.length === 0) {
      return NextResponse.json({ message: 'All nodes in this realm already have quiz questions', count: 0 })
    }

    // If force, delete existing quiz questions for these nodes
    if (force) {
      const nodeIds = nodes.map((n) => n.id)
      await db.quizBank.deleteMany({
        where: { nodeId: { in: nodeIds } },
      })
    }

    // Generate quiz for each node sequentially to avoid rate limits
    const results = []
    const zai = await ZAI.create()

    for (const node of nodesToProcess) {
      try {
        const isBoss = node.nodeId === 'R1-N15' || node.contentType === 'Certification'
        console.log(`[Quiz Engine] Generating quiz for ${node.nodeId}: ${node.title} (Boss: ${isBoss})`)

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert Indian stock market educator. You always respond with valid JSON only. No markdown, no code fences, just the raw JSON object.',
            },
            {
              role: 'user',
              content: buildQuizPrompt(node, isBoss),
            },
          ],
          temperature: 0.7,
          max_tokens: 3000,
        })

        const rawContent = completion.choices[0]?.message?.content
        if (!rawContent) {
          results.push({ nodeId: node.nodeId, status: 'error', error: 'Empty LLM response' })
          continue
        }

        let parsed: { questions: Array<{
          question: string
          options: string[]
          answer: string
          explanation: string
          hint: string
          difficulty: string
          xp: number
          type: string
        }> }
        try {
          let cleanContent = rawContent.trim()
          if (cleanContent.startsWith('```')) {
            cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
          }
          parsed = JSON.parse(cleanContent)
        } catch {
          results.push({ nodeId: node.nodeId, status: 'error', error: 'JSON parse failed' })
          continue
        }

        if (!parsed.questions || !Array.isArray(parsed.questions)) {
          results.push({ nodeId: node.nodeId, status: 'error', error: 'Missing questions array' })
          continue
        }

        // Insert all questions for this node
        let createdCount = 0
        for (let i = 0; i < parsed.questions.length; i++) {
          const q = parsed.questions[i]
          const quizId = `Q-${node.nodeId}-${String(i + 1).padStart(2, '0')}`

          try {
            await db.quizBank.create({
              data: {
                quizId,
                nodeId: node.id,
                type: q.type || 'mcq',
                question: q.question,
                options: JSON.stringify(q.options),
                answer: q.answer,
                explanation: q.explanation || null,
                hint: q.hint || null,
                difficulty: q.difficulty || node.difficulty,
                xp: q.xp || (isBoss ? 20 : 10),
                bossBattle: isBoss,
              },
            })
            createdCount++
          } catch (err) {
            console.error(`[Quiz Engine] Failed to create quiz ${quizId}:`, err)
          }
        }

        results.push({
          nodeId: node.nodeId,
          title: node.title,
          status: 'success',
          questionCount: createdCount,
          isBoss,
        })

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 800))
      } catch (err) {
        results.push({
          nodeId: node.nodeId,
          status: 'error',
          error: err instanceof Error ? err.message : 'Unknown error',
        })
      }
    }

    return NextResponse.json({
      realmId,
      totalNodes: nodesToProcess.length,
      results,
      successful: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'error').length,
    })
  } catch (error) {
    console.error('[Quiz Engine Batch Error]:', error)
    return NextResponse.json({
      error: 'Batch quiz generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

async function filterNodesWithoutQuiz(nodes: { id: number; nodeId: string; title: string; slug: string; contentType: string; difficulty: string; subRealm: string | null; content: string | null }[]) {
  const filtered = []
  for (const node of nodes) {
    const count = await db.quizBank.count({ where: { nodeId: node.id } })
    if (count === 0) {
      filtered.push(node)
    }
  }
  return filtered
}
