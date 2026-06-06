import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET(_request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  try {
    const { nodeId } = await params

    const node = await db.node.findUnique({
      where: { nodeId },
      include: {
        realm: {
          select: {
            id: true,
            realmNumber: true,
            title: true,
            titleHi: true,
            titleTe: true,
            icon: true,
            color: true,
            slug: true,
          },
        },
      },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Get all edges connected to this node
    const edgesFrom = await db.edge.findMany({
      where: { fromNodeId: node.id },
      include: {
        toNode: {
          select: {
            id: true,
            nodeId: true,
            title: true,
            titleHi: true,
            titleTe: true,
            difficulty: true,
            xp: true,
            contentType: true,
            realm: { select: { id: true, title: true, icon: true, color: true } },
          },
        },
      },
    })

    const edgesTo = await db.edge.findMany({
      where: { toNodeId: node.id },
      include: {
        fromNode: {
          select: {
            id: true,
            nodeId: true,
            title: true,
            titleHi: true,
            titleTe: true,
            difficulty: true,
            xp: true,
            contentType: true,
            realm: { select: { id: true, title: true, icon: true, color: true } },
          },
        },
      },
    })

    // Build connected nodes list (deduplicated)
    const connectedNodesMap = new Map<string, typeof edgesFrom[0]['toNode'] & { relationship: string; direction: string }>()

    for (const e of edgesFrom) {
      const key = e.toNode.nodeId
      if (!connectedNodesMap.has(key)) {
        connectedNodesMap.set(key, { ...e.toNode, relationship: e.relationship, direction: 'from' })
      }
    }
    for (const e of edgesTo) {
      const key = e.fromNode.nodeId
      if (!connectedNodesMap.has(key)) {
        connectedNodesMap.set(key, { ...e.fromNode, relationship: e.relationship, direction: 'to' })
      }
    }

    return NextResponse.json({
      node: {
        id: node.id,
        nodeId: node.nodeId,
        title: node.title,
        titleHi: node.titleHi,
        titleTe: node.titleTe,
        slug: node.slug,
        contentType: node.contentType,
        difficulty: node.difficulty,
        xp: node.xp,
        badge: node.badge,
        badgeHi: node.badgeHi,
        badgeTe: node.badgeTe,
        content: node.content,
        contentHi: node.contentHi,
        contentTe: node.contentTe,
        tldr: node.tldr,
        tldrHi: node.tldrHi,
        tldrTe: node.tldrTe,
        cheatsheet: node.cheatsheet,
        cheatsheetHi: node.cheatsheetHi,
        cheatsheetTe: node.cheatsheetTe,
        mindNote: node.mindNote,
        mindNoteHi: node.mindNoteHi,
        mindNoteTe: node.mindNoteTe,
        status: node.status,
        subRealm: node.subRealm,
        subRealmHi: node.subRealmHi,
        subRealmTe: node.subRealmTe,
        storyChapter: node.storyChapter,
        bossBattle: node.bossBattle,
        lore: node.lore,
      },
      realm: node.realm,
      connectedNodes: Array.from(connectedNodesMap.values()),
      edges: [
        ...edgesFrom.map((e) => ({ edgeId: e.edgeId, from: node.nodeId, to: e.toNode.nodeId, relationship: e.relationship, label: e.label })),
        ...edgesTo.map((e) => ({ edgeId: e.edgeId, from: e.fromNode.nodeId, to: node.nodeId, relationship: e.relationship, label: e.label })),
      ],
    })
  } catch (error) {
    console.error('Error fetching node:', error)
    return NextResponse.json({ error: 'Failed to fetch node' }, { status: 500 })
  }
}
