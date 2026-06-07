import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim()

    if (!query || query.length < 2) {
      return NextResponse.json({ results: [] })
    }

    // Search nodes by title, nodeId, or content type
    const nodes = await db.node.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { titleHi: { contains: query } },
          { titleTe: { contains: query } },
          { nodeId: { contains: query } },
          { contentType: { contains: query } },
          { difficulty: { contains: query } },
        ],
      },
      select: {
        id: true,
        nodeId: true,
        title: true,
        titleHi: true,
        titleTe: true,
        difficulty: true,
        xp: true,
        contentType: true,
        realmId: true,
        status: true,
        realm: {
          select: {
            id: true,
            title: true,
            titleHi: true,
            titleTe: true,
            icon: true,
            color: true,
          },
        },
      },
      take: 20,
      orderBy: { nodeId: 'asc' },
    })

    const results = nodes.map((n) => ({
      nodeId: n.nodeId,
      title: n.title,
      titleHi: n.titleHi,
      titleTe: n.titleTe,
      difficulty: n.difficulty,
      xp: n.xp,
      contentType: n.contentType,
      realmId: n.realmId,
      realmTitle: n.realm.title,
      realmTitleHi: n.realm.titleHi,
      realmTitleTe: n.realm.titleTe,
      realmIcon: n.realm.icon,
      realmColor: n.realm.color,
      status: n.status,
    }))

    return NextResponse.json({ results })
  } catch (error) {
    console.error('Error searching nodes:', error)
    return NextResponse.json({ error: 'Search failed' }, { status: 500 })
  }
}
