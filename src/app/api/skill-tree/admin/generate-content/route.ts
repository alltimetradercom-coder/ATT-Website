import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// Content generation prompt template for a single node
function buildPrompt(node: {
  nodeId: string
  title: string
  slug: string
  contentType: string
  difficulty: string
  xp: number
  subRealm: string | null
}) {
  return `You are an expert Indian stock market educator creating content for a gamified trading learning platform called AllTimeTrader (ATT).

Generate rich, detailed educational content for this lesson node:

Node ID: ${node.nodeId}
Title: ${node.title}
Topic Slug: ${node.slug}
Content Type: ${node.contentType}
Difficulty: ${node.difficulty}
XP Value: ${node.xp}
Sub-Realm: ${node.subRealm || 'General'}

IMPORTANT RULES:
1. Content must be about INDIAN stock markets (NSE, BSE, SEBI, Indian companies, INR currency)
2. Use beginner-friendly language — this is the Genesis (first) realm
3. Include real Indian examples (Reliance, TCS, Infosys, HDFC, etc.)
4. Be accurate and educational — this is for real learners
5. Make it engaging with an RPG/adventure flavor where appropriate
6. DO NOT use any emoji characters in your output

Return a JSON object with EXACTLY these fields:
{
  "content": "Full lesson content in plain text (300-500 words). Write in clear paragraphs. Cover the topic comprehensively for an absolute beginner in Indian stock markets. Include real examples and analogies. Do NOT use markdown headers or bold - just plain text with clear paragraph breaks.",
  "tldr": ["Bullet 1", "Bullet 2", "Bullet 3", "Bullet 4"],
  "cheatsheet": ["Quick fact 1", "Quick fact 2", "Quick fact 3", "Quick fact 4", "Quick fact 5"],
  "mindNote": "One memorable sentence of wisdom about this topic",
  "lore": "2-3 sentences of RPG-style story flavor connecting this lesson to the trading adventure (e.g., 'In the ancient markets of Dalal Street...')",
  "storyChapter": "Chapter name like 'Chapter 1: The Arena Awakens'",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "traderTips": ["Tip 1", "Tip 2", "Tip 3"],
  "importantNotes": ["Note 1", "Note 2"],
  "badge": "Badge name for completing this node (e.g., 'Market Initiate', 'Exchange Scout')",
  "seoTitle": "SEO-optimized page title (60 chars max)",
  "seoDescription": "SEO meta description (155 chars max)"
}

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
      include: { realm: { select: { title: true, spirit: true } } },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Skip if content already exists (unless force=true)
    if (node.content && node.content.length > 10 && !force) {
      return NextResponse.json({
        message: 'Node already has content. Use force=true to regenerate.',
        nodeId: node.nodeId,
        title: node.title,
      })
    }

    console.log(`[Content Engine] Generating content for ${nodeId}: ${node.title}`)

    // Generate content using LLM
    const zai = await ZAI.create()
    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert Indian stock market educator. You always respond with valid JSON only. No markdown, no code fences, just the raw JSON object.',
        },
        {
          role: 'user',
          content: buildPrompt(node),
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    })

    const rawContent = completion.choices[0]?.message?.content
    if (!rawContent) {
      return NextResponse.json({ error: 'LLM returned empty response' }, { status: 500 })
    }

    // Parse the LLM response - handle potential markdown code fences
    let parsed: Record<string, unknown>
    try {
      let cleanContent = rawContent.trim()
      // Remove markdown code fences if present
      if (cleanContent.startsWith('```')) {
        cleanContent = cleanContent.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
      }
      parsed = JSON.parse(cleanContent)
    } catch (parseError) {
      console.error('[Content Engine] Failed to parse LLM response:', rawContent.substring(0, 500))
      return NextResponse.json({
        error: 'Failed to parse LLM response as JSON',
        raw: rawContent.substring(0, 500),
      }, { status: 500 })
    }

    // Update the node in the database
    const updated = await db.node.update({
      where: { nodeId },
      data: {
        content: parsed.content as string || null,
        tldr: Array.isArray(parsed.tldr) ? JSON.stringify(parsed.tldr) : null,
        cheatsheet: Array.isArray(parsed.cheatsheet) ? JSON.stringify(parsed.cheatsheet) : null,
        mindNote: parsed.mindNote as string || null,
        lore: parsed.lore as string || null,
        storyChapter: parsed.storyChapter as string || null,
        keyTakeaways: Array.isArray(parsed.keyTakeaways) ? JSON.stringify(parsed.keyTakeaways) : null,
        traderTips: Array.isArray(parsed.traderTips) ? JSON.stringify(parsed.traderTips) : null,
        importantNotes: Array.isArray(parsed.importantNotes) ? JSON.stringify(parsed.importantNotes) : null,
        badge: parsed.badge as string || null,
        seoTitle: parsed.seoTitle as string || null,
        seoDescription: parsed.seoDescription as string || null,
        status: 'published',
        lastUpdated: new Date().toISOString().split('T')[0],
      },
    })

    console.log(`[Content Engine] Successfully generated content for ${nodeId}`)

    return NextResponse.json({
      success: true,
      nodeId: updated.nodeId,
      title: updated.title,
      contentLength: updated.content?.length || 0,
      status: updated.status,
    })
  } catch (error) {
    console.error('[Content Engine] Error:', error)
    return NextResponse.json({
      error: 'Content generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}

// Batch generate for an entire realm
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { realmId } = body

    if (!realmId) {
      return NextResponse.json({ error: 'realmId is required' }, { status: 400 })
    }

    const nodes = await db.node.findMany({
      where: { realmId, content: { equals: null } },
      orderBy: { nodeId: 'asc' },
      select: {
        nodeId: true,
        title: true,
        slug: true,
        contentType: true,
        difficulty: true,
        xp: true,
        subRealm: true,
      },
    })

    if (nodes.length === 0) {
      return NextResponse.json({ message: 'All nodes in this realm already have content', count: 0 })
    }

    // Generate content for each node sequentially to avoid rate limits
    const results = []
    const zai = await ZAI.create()

    for (const node of nodes) {
      try {
        console.log(`[Content Engine] Generating ${node.nodeId}: ${node.title}`)

        const completion = await zai.chat.completions.create({
          messages: [
            {
              role: 'system',
              content: 'You are an expert Indian stock market educator. You always respond with valid JSON only. No markdown, no code fences, just the raw JSON object.',
            },
            {
              role: 'user',
              content: buildPrompt(node),
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

        let parsed: Record<string, unknown>
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

        await db.node.update({
          where: { nodeId: node.nodeId },
          data: {
            content: parsed.content as string || null,
            tldr: Array.isArray(parsed.tldr) ? JSON.stringify(parsed.tldr) : null,
            cheatsheet: Array.isArray(parsed.cheatsheet) ? JSON.stringify(parsed.cheatsheet) : null,
            mindNote: parsed.mindNote as string || null,
            lore: parsed.lore as string || null,
            storyChapter: parsed.storyChapter as string || null,
            keyTakeaways: Array.isArray(parsed.keyTakeaways) ? JSON.stringify(parsed.keyTakeaways) : null,
            traderTips: Array.isArray(parsed.traderTips) ? JSON.stringify(parsed.traderTips) : null,
            importantNotes: Array.isArray(parsed.importantNotes) ? JSON.stringify(parsed.importantNotes) : null,
            badge: parsed.badge as string || null,
            seoTitle: parsed.seoTitle as string || null,
            seoDescription: parsed.seoDescription as string || null,
            status: 'published',
            lastUpdated: new Date().toISOString().split('T')[0],
          },
        })

        results.push({
          nodeId: node.nodeId,
          title: node.title,
          status: 'success',
          contentLength: (parsed.content as string)?.length || 0,
        })

        // Small delay to avoid rate limiting
        await new Promise((r) => setTimeout(r, 500))
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
      totalNodes: nodes.length,
      results,
      successful: results.filter((r) => r.status === 'success').length,
      failed: results.filter((r) => r.status === 'error').length,
    })
  } catch (error) {
    console.error('[Content Engine Batch Error]:', error)
    return NextResponse.json({
      error: 'Batch content generation failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    }, { status: 500 })
  }
}
