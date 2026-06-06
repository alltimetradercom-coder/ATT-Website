import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const [nodes, edges, realms] = await Promise.all([
      db.node.findMany({
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
          subRealm: true,
          status: true,
        },
        orderBy: { nodeId: 'asc' },
      }),
      db.edge.findMany({
        select: {
          id: true,
          edgeId: true,
          fromNodeId: true,
          toNodeId: true,
          relationship: true,
          label: true,
          strength: true,
        },
      }),
      db.realm.findMany({
        orderBy: { sortOrder: 'asc' },
        select: {
          id: true,
          realmNumber: true,
          title: true,
          icon: true,
          color: true,
          spirit: true,
        },
      }),
    ])

    // Build a map from db node id to node info for edge resolution
    const nodeMap = new Map(nodes.map((n) => [n.id, n]))

    // Convert edges to use nodeId strings
    const mappedEdges = edges
      .map((e) => {
        const fromNode = nodeMap.get(e.fromNodeId)
        const toNode = nodeMap.get(e.toNodeId)
        if (!fromNode || !toNode) return null
        return {
          id: e.edgeId,
          source: fromNode.nodeId,
          target: toNode.nodeId,
          relationship: e.relationship,
          label: e.label,
          strength: e.strength,
        }
      })
      .filter(Boolean)

    return NextResponse.json({ nodes, edges: mappedEdges, realms })
  } catch (error) {
    console.error('Error fetching map data:', error)
    return NextResponse.json({ error: 'Failed to fetch map data' }, { status: 500 })
  }
}
