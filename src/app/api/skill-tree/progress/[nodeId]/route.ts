import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const GUEST_USER_ID = 'guest'

// GET: Get progress for a specific node (by nodeId string like "R1-N1")
export async function GET(_request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  try {
    const { nodeId } = await params

    // Find the node by nodeId string
    const node = await db.node.findUnique({
      where: { nodeId },
      select: { id: true, nodeId: true, xp: true, contentType: true },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

    // Find or create progress record
    let progress = await db.userProgress.findUnique({
      where: {
        userId_nodeId: {
          userId: GUEST_USER_ID,
          nodeId: node.id,
        },
      },
    })

    if (!progress) {
      // Create initial progress - check if this is a first node
      const isFirstNode = await isFirstNodeInRealm(node.id, node.contentType)
      progress = await db.userProgress.create({
        data: {
          userId: GUEST_USER_ID,
          nodeId: node.id,
          status: isFirstNode ? 'available' : 'locked',
          readPercent: 0,
          quizScore: 0,
          quizBestScore: 0,
          xpEarned: 0,
        },
      })
    }

    // Also get prerequisite info (which nodes must be completed before this one)
    const prerequisiteEdges = await db.edge.findMany({
      where: {
        toNodeId: node.id,
        relationship: { in: ['prerequisite', 'leads_to'] },
      },
      include: {
        fromNode: {
          select: { id: true, nodeId: true, title: true, xp: true },
        },
      },
    })

    const prerequisites = prerequisiteEdges.map((e) => ({
      nodeId: e.fromNode.nodeId,
      title: e.fromNode.title,
      dbId: e.fromNode.id,
    }))

    // Check if all prerequisites are completed
    if (prerequisites.length > 0) {
      const prereqIds = prerequisites.map((p) => p.dbId)
      const completedPrereqs = await db.userProgress.findMany({
        where: {
          userId: GUEST_USER_ID,
          nodeId: { in: prereqIds },
          status: 'completed',
        },
      })
      const allPrereqsCompleted = completedPrereqs.length === prereqIds.length

      // If all prereqs are completed but node is still locked, unlock it
      if (allPrereqsCompleted && progress.status === 'locked') {
        progress = await db.userProgress.update({
          where: { id: progress.id },
          data: { status: 'available' },
        })
      }
    }

    return NextResponse.json({
      progress: {
        id: progress.id,
        userId: progress.userId,
        nodeId: progress.nodeId,
        nodeNodeId: node.nodeId,
        status: progress.status,
        readPercent: progress.readPercent,
        quizScore: progress.quizScore,
        quizBestScore: progress.quizBestScore,
        xpEarned: progress.xpEarned,
        completedAt: progress.completedAt,
        nodeXp: node.xp,
      },
      prerequisites,
    })
  } catch (error) {
    console.error('Error fetching node progress:', error)
    return NextResponse.json({ error: 'Failed to fetch node progress' }, { status: 500 })
  }
}

// POST: Update progress for a node (mark as started, update read percent, etc.)
export async function POST(request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  try {
    const { nodeId } = await params
    const body = await request.json()
    const { action, readPercent }: { action: 'start' | 'read'; readPercent?: number } = body

    const node = await db.node.findUnique({
      where: { nodeId },
      select: { id: true, nodeId: true, xp: true },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

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
      const isFirst = await isFirstNodeInRealm(node.id, '')
      progress = await db.userProgress.create({
        data: {
          userId: GUEST_USER_ID,
          nodeId: node.id,
          status: isFirst ? 'available' : 'locked',
          readPercent: 0,
          quizScore: 0,
          quizBestScore: 0,
          xpEarned: 0,
        },
      })
    }

    // If locked, don't allow progress
    if (progress.status === 'locked') {
      return NextResponse.json({ error: 'Node is locked. Complete prerequisites first.' }, { status: 403 })
    }

    if (action === 'start' && progress.status === 'available') {
      progress = await db.userProgress.update({
        where: { id: progress.id },
        data: { status: 'in_progress' },
      })
    }

    if (action === 'read' && typeof readPercent === 'number') {
      const updateData: Record<string, unknown> = {
        readPercent: Math.min(100, Math.max(progress.readPercent, readPercent)),
      }
      // If reading and still "available", mark as in_progress
      if (progress.status === 'available') {
        updateData.status = 'in_progress'
      }
      progress = await db.userProgress.update({
        where: { id: progress.id },
        data: updateData,
      })
    }

    return NextResponse.json({
      progress: {
        id: progress.id,
        userId: progress.userId,
        nodeId: progress.nodeId,
        nodeNodeId: node.nodeId,
        status: progress.status,
        readPercent: progress.readPercent,
        quizScore: progress.quizScore,
        quizBestScore: progress.quizBestScore,
        xpEarned: progress.xpEarned,
        completedAt: progress.completedAt,
        nodeXp: node.xp,
      },
    })
  } catch (error) {
    console.error('Error updating node progress:', error)
    return NextResponse.json({ error: 'Failed to update node progress' }, { status: 500 })
  }
}

// PUT: Update quiz score for a node
export async function PUT(request: Request, { params }: { params: Promise<{ nodeId: string }> }) {
  try {
    const { nodeId } = await params
    const body = await request.json()
    const { quizScore }: { quizScore: number } = body

    if (typeof quizScore !== 'number' || quizScore < 0 || quizScore > 100) {
      return NextResponse.json({ error: 'quizScore must be a number between 0 and 100' }, { status: 400 })
    }

    const node = await db.node.findUnique({
      where: { nodeId },
      select: { id: true, nodeId: true, xp: true },
    })

    if (!node) {
      return NextResponse.json({ error: 'Node not found' }, { status: 404 })
    }

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

    const newBestScore = Math.max(progress.quizBestScore, quizScore)
    const updateData: Record<string, unknown> = {
      quizScore,
      quizBestScore: newBestScore,
    }

    // If score >= 60% and not already completed, mark as completed
    let newlyCompleted = false
    let unlockedNodes: Array<{ nodeId: string; title: string }> = []

    if (quizScore >= 60 && progress.status !== 'completed') {
      updateData.status = 'completed'
      updateData.xpEarned = node.xp
      updateData.completedAt = new Date()
      newlyCompleted = true
    }

    progress = await db.userProgress.update({
      where: { id: progress.id },
      data: updateData,
    })

    // If newly completed, unlock next nodes
    if (newlyCompleted) {
      unlockedNodes = await unlockNextNodes(node.id)
    }

    return NextResponse.json({
      progress: {
        id: progress.id,
        userId: progress.userId,
        nodeId: progress.nodeId,
        nodeNodeId: node.nodeId,
        status: progress.status,
        readPercent: progress.readPercent,
        quizScore: progress.quizScore,
        quizBestScore: progress.quizBestScore,
        xpEarned: progress.xpEarned,
        completedAt: progress.completedAt,
        nodeXp: node.xp,
      },
      newlyCompleted,
      unlockedNodes,
    })
  } catch (error) {
    console.error('Error updating quiz score:', error)
    return NextResponse.json({ error: 'Failed to update quiz score' }, { status: 500 })
  }
}

/**
 * Check if a node is the first node in its realm.
 * A node is "first" if it has the lowest database ID within its realm,
 * or if there are no prerequisite edges pointing to it.
 */
async function isFirstNodeInRealm(nodeDbId: number, _contentType: string): Promise<boolean> {
  // Find the node's realm
  const node = await db.node.findUnique({
    where: { id: nodeDbId },
    select: { realmId: true },
  })
  if (!node) return false

  // Find the first node in the realm (by database id, which is autoincrement)
  const firstNode = await db.node.findFirst({
    where: { realmId: node.realmId },
    orderBy: { id: 'asc' },
    select: { id: true },
  })

  return firstNode?.id === nodeDbId
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
