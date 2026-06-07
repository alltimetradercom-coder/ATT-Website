import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { db } = await import('@/lib/db')
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')?.trim()
    const realm = searchParams.get('realm')
    const node = searchParams.get('node')
    const lang = searchParams.get('lang') || 'en'

    // Build where clause
    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { term: { contains: search, mode: 'insensitive' } },
        { simpleDefinition: { contains: search, mode: 'insensitive' } },
        { professionalDefinition: { contains: search, mode: 'insensitive' } },
        { termHi: { contains: search } },
        { termTe: { contains: search } },
      ]
    }

    if (node) {
      where.nodes = {
        some: {
          node: {
            nodeId: { contains: node, mode: 'insensitive' },
          },
        },
      }
    }

    // For realm filter, we need nodes from that realm
    if (realm) {
      const realmNum = parseInt(realm, 10)
      if (!isNaN(realmNum)) {
        const realmRecord = await db.realm.findUnique({ where: { realmNumber: realmNum } })
        if (realmRecord) {
          where.nodes = {
            some: {
              node: {
                realmId: realmRecord.id,
              },
            },
          }
        }
      }
    }

    const terms = await db.glossary.findMany({
      where: Object.keys(where).length > 0 ? where : undefined,
      include: {
        nodes: {
          select: { nodeId: true },
        },
      },
      orderBy: { term: 'asc' },
    })

    const result = terms.map((t) => ({
      id: t.id,
      termId: t.termId,
      term: t.term,
      termHi: t.termHi,
      termTe: t.termTe,
      simpleDefinition: t.simpleDefinition,
      simpleDefinitionHi: t.simpleDefinitionHi,
      simpleDefinitionTe: t.simpleDefinitionTe,
      professionalDefinition: t.professionalDefinition,
      formula: t.formula,
      commonMistake: t.commonMistake,
      commonMistakeHi: t.commonMistakeHi,
      commonMistakeTe: t.commonMistakeTe,
      realExample: t.realExample,
      realExampleHi: t.realExampleHi,
      realExampleTe: t.realExampleTe,
      relatedTerms: t.relatedTerms,
      nodeCount: t.nodes.length,
    }))

    return NextResponse.json({ terms: result })
  } catch (error) {
    console.error('Glossary list error:', error)
    return NextResponse.json({ terms: [], error: 'Failed to fetch glossary terms' }, { status: 500 })
  }
}
