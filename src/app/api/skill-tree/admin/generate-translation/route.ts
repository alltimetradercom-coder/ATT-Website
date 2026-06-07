import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

// POST: Generate Hindi or Telugu translation for a single node
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { nodeId, lang } = body as { nodeId: string; lang: 'hi' | 'te' }

    if (!nodeId || !lang) {
      return NextResponse.json({ error: 'nodeId and lang (hi/te) required' }, { status: 400 })
    }

    const node = await db.node.findUnique({
      where: { nodeId },
      select: {
        id: true, nodeId: true, title: true, content: true,
        tldr: true, cheatsheet: true, mindNote: true,
        contentHi: true, contentTe: true,
      },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    if (!node.content) {
      return NextResponse.json({ error: 'Node has no English content' }, { status: 400 })
    }

    // Check if already translated
    if (lang === 'hi' && node.contentHi) {
      return NextResponse.json({ message: 'Already translated to Hindi', nodeId })
    }
    if (lang === 'te' && node.contentTe) {
      return NextResponse.json({ message: 'Already translated to Telugu', nodeId })
    }

    const langName = lang === 'hi' ? 'Hindi' : 'Telugu'
    const zai = await ZAI.create()

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are an expert translator for Indian stock market educational content. Translate from English to ${langName}. Use proper ${langName} script. Keep technical terms (NSE, BSE, SEBI, P/E, ROE, Delta, etc.) in English. Return valid JSON only, no code fences.`,
        },
        {
          role: 'user',
          content: `Translate to ${langName}:
Title: ${node.title}
Content: ${node.content}
TLDR: ${node.tldr}
Cheatsheet: ${node.cheatsheet}
MindNote: ${node.mindNote}

Return JSON: { "content": "translated content", "tldr": [translated items], "cheatsheet": [translated items], "mindNote": "translated sentence" }`,
        },
      ],
      temperature: 0.3,
      max_tokens: 2500,
    })

    let raw = completion.choices[0]?.message?.content || ''
    raw = raw.trim()
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
    }
    const parsed = JSON.parse(raw.trim())

    // Parse arrays if they came as strings
    let tldrArr = parsed.tldr
    if (typeof tldrArr === 'string') {
      try { tldrArr = JSON.parse(tldrArr) } catch { tldrArr = [tldrArr] }
    }
    let cheatArr = parsed.cheatsheet
    if (typeof cheatArr === 'string') {
      try { cheatArr = JSON.parse(cheatArr) } catch { cheatArr = [cheatArr] }
    }

    const updateData: Record<string, unknown> = {
      [lang === 'hi' ? 'contentHi' : 'contentTe']: parsed.content,
      [lang === 'hi' ? 'tldrHi' : 'tldrTe']: JSON.stringify(tldrArr),
      [lang === 'hi' ? 'cheatsheetHi' : 'cheatsheetTe']: JSON.stringify(cheatArr),
      [lang === 'hi' ? 'mindNoteHi' : 'mindNoteTe']: parsed.mindNote,
    }

    await db.node.update({
      where: { nodeId },
      data: updateData,
    })

    return NextResponse.json({
      success: true,
      nodeId,
      lang,
      contentLength: parsed.content?.length || 0,
    })
  } catch (error) {
    console.error('[Translation] Error:', error)
    return NextResponse.json({
      error: 'Translation failed',
      details: error instanceof Error ? error.message.substring(0, 200) : 'Unknown',
    }, { status: 500 })
  }
}
