import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const realmId = parseInt(id)

    const realm = await db.realm.findUnique({
      where: { id: realmId },
      include: {
        nodes: {
          orderBy: { nodeId: 'asc' },
          select: {
            id: true,
            nodeId: true,
            title: true,
            titleHi: true,
            titleTe: true,
            slug: true,
            contentType: true,
            difficulty: true,
            xp: true,
            badge: true,
            status: true,
            subRealm: true,
            subRealmHi: true,
            subRealmTe: true,
          },
        },
      },
    })

    if (!realm) {
      return NextResponse.json({ error: 'Realm not found' }, { status: 404 })
    }

    // Get edges within this realm and cross-realm edges
    const nodeIds = realm.nodes.map((n) => n.id)
    const edges = await db.edge.findMany({
      where: {
        OR: [{ fromNodeId: { in: nodeIds } }, { toNodeId: { in: nodeIds } }],
      },
      select: {
        edgeId: true,
        fromNodeId: true,
        toNodeId: true,
        relationship: true,
        label: true,
        strength: true,
      },
    })

    const totalXp = realm.nodes.reduce((sum, n) => sum + n.xp, 0)

    return NextResponse.json({
      realm: {
        id: realm.id,
        realmNumber: realm.realmNumber,
        slug: realm.slug,
        title: realm.title,
        titleHi: realm.titleHi,
        titleTe: realm.titleTe,
        subtitle: realm.subtitle,
        subtitleHi: realm.subtitleHi,
        subtitleTe: realm.subtitleTe,
        description: realm.description,
        descriptionHi: realm.descriptionHi,
        descriptionTe: realm.descriptionTe,
        icon: realm.icon,
        spirit: realm.spirit,
        color: realm.color,
        bossName: realm.bossName,
        bossNameHi: realm.bossNameHi,
        bossNameTe: realm.bossNameTe,
        badgeEmoji: realm.badgeEmoji,
        badgeTitle: realm.badgeTitle,
        badgeTitleHi: realm.badgeTitleHi,
        badgeTitleTe: realm.badgeTitleTe,
      },
      nodes: realm.nodes,
      edges,
      totalXp,
    })
  } catch (error) {
    console.error('Error fetching realm:', error)
    return NextResponse.json({ error: 'Failed to fetch realm' }, { status: 500 })
  }
}
