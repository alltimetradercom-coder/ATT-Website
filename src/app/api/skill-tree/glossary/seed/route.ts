import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { db } = await import('@/lib/db')
    const ZAI = (await import('z-ai-web-dev-sdk')).default
    const body = await request.json()
    const { realmNumber, all } = body as { realmNumber?: number; all?: boolean }

    if (!realmNumber && !all) {
      return NextResponse.json({ error: 'Provide realmNumber or all: true' }, { status: 400 })
    }

    const zai = await ZAI.create()
    const results: Array<{
      termId: string
      term: string
      created: boolean
    }> = []

    // Determine which realms to process
    let realmsToProcess: Array<{ id: number; realmNumber: number; title: string }>

    if (all) {
      realmsToProcess = await db.realm.findMany({
        select: { id: true, realmNumber: true, title: true },
        orderBy: { realmNumber: 'asc' },
      })
    } else {
      const realm = await db.realm.findUnique({
        where: { realmNumber: realmNumber! },
        select: { id: true, realmNumber: true, title: true },
      })
      if (!realm) {
        return NextResponse.json({ error: 'Realm not found' }, { status: 404 })
      }
      realmsToProcess = [realm]
    }

    for (const realmInfo of realmsToProcess) {
      // Fetch all nodes in this realm
      const nodes = await db.node.findMany({
        where: { realmId: realmInfo.id, status: 'published' },
        select: {
          id: true,
          nodeId: true,
          title: true,
          content: true,
          tldr: true,
          cheatsheet: true,
        },
      })

      if (nodes.length === 0) continue

      // Build a summary of node content for the LLM
      const nodeSummaries = nodes.map((n) => ({
        nodeId: n.nodeId,
        title: n.title,
        tldr: n.tldr || '',
        cheatsheet: n.cheatsheet || '',
        contentPreview: (n.content || '').substring(0, 300),
      }))

      // Step 1: Identify key terms
      const identifyPrompt = `You are an expert Indian stock market educator. Given the following lesson nodes from the "${realmInfo.title}" realm (Realm ${realmInfo.realmNumber}) of a trading skill tree, identify 10-15 key trading terms that are essential for students to understand.

For each term, provide:
1. A unique termId in format "G-{camelCase}" (e.g., "G-delta", "G-supportLevel", "G-peRatio")
2. The English term
3. The Hindi translation of the term (in Devanagari script)
4. The Telugu translation of the term (in Telugu script)

IMPORTANT RULES:
- Focus on terms that appear across multiple nodes
- Include both simple terms (like "Bull") and complex terms (like "Greeks Delta")
- Keep trading abbreviations in English even in Hindi/Telugu (NSE, BSE, SEBI, P/E, etc.)
- Use proper Devanagari for Hindi and Telugu script for Telugu

Node data:
${JSON.stringify(nodeSummaries, null, 2)}

Return a JSON array of objects with keys: termId, term, termHi, termTe
Return ONLY the JSON array, no other text.`

      const identifyCompletion = await zai.chat.completions.create({
        messages: [{ role: 'user', content: identifyPrompt }],
      })

      let identifiedTerms: Array<{ termId: string; term: string; termHi: string; termTe: string }>
      try {
        const raw = identifyCompletion.choices?.[0]?.message?.content || '[]'
        const jsonMatch = raw.match(/\[[\s\S]*\]/)
        identifiedTerms = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
      } catch {
        console.error('Failed to parse identified terms for realm', realmInfo.realmNumber)
        continue
      }

      if (!Array.isArray(identifiedTerms) || identifiedTerms.length === 0) continue

      // Step 2: Generate full glossary entries for each term (batch of 5)
      const batchSize = 5
      for (let i = 0; i < identifiedTerms.length; i += batchSize) {
        const batch = identifiedTerms.slice(i, i + batchSize)

        const detailPrompt = `You are an expert Indian stock market educator building a glossary for the "${realmInfo.title}" realm. Generate detailed glossary entries for these terms: ${batch.map((t) => t.term).join(', ')}

Context from realm nodes:
${JSON.stringify(nodeSummaries.slice(0, 10), null, 2)}

For EACH term, provide a JSON object with these exact fields:
- termId: "${batch[0]?.termId?.split('-')[0] || 'G'}-{camelCase}" (unique ID)
- term: English term name
- termHi: Hindi translation in Devanagari
- termTe: Telugu translation in Telugu script
- simpleDefinition: Simple explanation in 1-2 sentences for beginners (English)
- simpleDefinitionHi: Same in Hindi (Devanagari)
- simpleDefinitionTe: Same in Telugu (Telugu script)
- professionalDefinition: Professional/technical definition in 2-3 sentences (English only)
- formula: Mathematical formula if applicable, or null (e.g., "P/E Ratio = Market Price per Share / Earnings per Share")
- commonMistake: A common mistake traders make with this concept (English)
- commonMistakeHi: Same in Hindi
- commonMistakeTe: Same in Telugu
- realExample: A real Indian market example (e.g., "When Reliance Industries trades at ₹2,500 and EPS is ₹80, P/E = 2500/80 = 31.25x")
- realExampleHi: Same in Hindi
- realExampleTe: Same in Telugu
- relatedTerms: JSON array of related term IDs (e.g., ["G-putOption", "G-callOption"])

IMPORTANT:
- Keep NSE, BSE, SEBI, P/E, EPS, F&O, SMA, EMA and other abbreviations in English even in Hindi/Telugu
- Use ₹ for rupees in examples
- Examples must be relevant to Indian stock markets
- simpleDefinition should be explainable to a 12-year-old
- professionalDefinition should be suitable for CFA/NISM exam prep

Return a JSON array of objects. Return ONLY the JSON array, no other text.`

        const detailCompletion = await zai.chat.completions.create({
          messages: [{ role: 'user', content: detailPrompt }],
        })

        let glossaryEntries: Array<Record<string, unknown>>
        try {
          const raw = detailCompletion.choices?.[0]?.message?.content || '[]'
          const jsonMatch = raw.match(/\[[\s\S]*\]/)
          glossaryEntries = JSON.parse(jsonMatch ? jsonMatch[0] : raw)
        } catch {
          console.error('Failed to parse glossary details for batch starting at', i)
          continue
        }

        if (!Array.isArray(glossaryEntries)) continue

        // Step 3: Save to database
        for (const entry of glossaryEntries) {
          try {
            const termId = (entry.termId as string) || `G-${(entry.term as string || '').toLowerCase().replace(/\s+/g, '-')}`
            const termName = (entry.term as string) || ''
            if (!termName) continue

            // Check if term already exists
            const existing = await db.glossary.findUnique({ where: { termId } })

            if (existing) {
              // Update and link to new nodes
              await db.glossaryNode.createMany({
                data: nodes.map((n) => ({ glossaryId: existing.id, nodeId: n.id })),
                skipDuplicates: true,
              })
              results.push({ termId, term: termName, created: false })
              continue
            }

            // Create new glossary entry
            const glossary = await db.glossary.create({
              data: {
                termId,
                term: termName,
                termHi: (entry.termHi as string) || null,
                termTe: (entry.termTe as string) || null,
                simpleDefinition: (entry.simpleDefinition as string) || '',
                simpleDefinitionHi: (entry.simpleDefinitionHi as string) || null,
                simpleDefinitionTe: (entry.simpleDefinitionTe as string) || null,
                professionalDefinition: (entry.professionalDefinition as string) || null,
                formula: (entry.formula as string) || null,
                commonMistake: (entry.commonMistake as string) || null,
                commonMistakeHi: (entry.commonMistakeHi as string) || null,
                commonMistakeTe: (entry.commonMistakeTe as string) || null,
                realExample: (entry.realExample as string) || null,
                realExampleHi: (entry.realExampleHi as string) || null,
                realExampleTe: (entry.realExampleTe as string) || null,
                relatedTerms: entry.relatedTerms ? JSON.stringify(entry.relatedTerms) : null,
              },
            })

            // Link to all nodes in the realm
            await db.glossaryNode.createMany({
              data: nodes.map((n) => ({ glossaryId: glossary.id, nodeId: n.id })),
              skipDuplicates: true,
            })

            results.push({ termId, term: termName, created: true })
          } catch (err) {
            console.error('Failed to save glossary entry:', err)
          }
        }
      }
    }

    const created = results.filter((r) => r.created).length
    return NextResponse.json({
      created,
      total: results.length,
      terms: results,
    })
  } catch (error) {
    console.error('Glossary seed error:', error)
    return NextResponse.json({ error: 'Failed to seed glossary terms' }, { status: 500 })
  }
}
