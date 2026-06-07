import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const GUEST_USER_ID = 'guest'

// GET: Fetch all progress for the guest user with computed stats
export async function GET() {
  try {
    // Ensure initial progress records exist for all nodes
    await ensureInitialProgress()

    const progress = await db.userProgress.findMany({
      where: { userId: GUEST_USER_ID },
      include: {
        node: {
          select: {
            id: true,
            nodeId: true,
            xp: true,
            realmId: true,
            contentType: true,
            realm: { select: { id: true, realmNumber: true, title: true } },
          },
        },
      },
      orderBy: { nodeId: 'asc' },
    })

    // Compute stats
    const totalXpEarned = progress.reduce((sum, p) => sum + p.xpEarned, 0)
    const completedNodes = progress.filter((p) => p.status === 'completed').length
    const availableNodes = progress.filter((p) => p.status === 'available').length
    const inProgressNodes = progress.filter((p) => p.status === 'in_progress').length

    // Per-realm progress
    const realmMap = new Map<number, { realmId: number; realmNumber: number; realmTitle: string; totalNodes: number; completedNodes: number; xpEarned: number }>()
    for (const p of progress) {
      const realmId = p.node.realmId
      if (!realmMap.has(realmId)) {
        realmMap.set(realmId, {
          realmId,
          realmNumber: p.node.realm.realmNumber,
          realmTitle: p.node.realm.title,
          totalNodes: 0,
          completedNodes: 0,
          xpEarned: 0,
        })
      }
      const entry = realmMap.get(realmId)!
      entry.totalNodes++
      if (p.status === 'completed') {
        entry.completedNodes++
        entry.xpEarned += p.xpEarned
      }
    }

    return NextResponse.json({
      progress: progress.map((p) => ({
        id: p.id,
        userId: p.userId,
        nodeId: p.nodeId,
        nodeNodeId: p.node.nodeId,
        status: p.status,
        readPercent: p.readPercent,
        quizScore: p.quizScore,
        quizBestScore: p.quizBestScore,
        xpEarned: p.xpEarned,
        completedAt: p.completedAt,
        nodeXp: p.node.xp,
        contentType: p.node.contentType,
      })),
      stats: {
        totalXpEarned,
        completedNodes,
        availableNodes,
        inProgressNodes,
        totalNodes: progress.length,
      },
      realmProgress: Array.from(realmMap.values()),
    })
  } catch (error) {
    console.error('Error fetching progress:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

// POST: Initialize progress for a user (create records for all nodes if they don't exist)
export async function POST() {
  try {
    const result = await ensureInitialProgress()
    return NextResponse.json({ initialized: true, recordsCreated: result.created })
  } catch (error) {
    console.error('Error initializing progress:', error)
    return NextResponse.json({ error: 'Failed to initialize progress' }, { status: 500 })
  }
}

/**
 * Ensures that UserProgress records exist for all nodes for the guest user.
 * First node of each realm starts as "available", all others as "locked".
 * Returns the count of newly created records.
 */
async function ensureInitialProgress(): Promise<{ created: number }> {
  // Get all nodes
  const allNodes = await db.node.findMany({
    select: { id: true, nodeId: true, realmId: true },
    orderBy: [{ realmId: 'asc' }, { nodeId: 'asc' }],
  })

  // Get existing progress
  const existingProgress = await db.userProgress.findMany({
    where: { userId: GUEST_USER_ID },
    select: { nodeId: true },
  })
  const existingNodeIds = new Set(existingProgress.map((p) => p.nodeId))

  // Find first node of each realm (lowest nodeId string per realm)
  const firstNodePerRealm = new Map<number, number>()
  for (const node of allNodes) {
    if (!firstNodePerRealm.has(node.realmId)) {
      firstNodePerRealm.set(node.realmId, node.id)
    }
  }

  // Create missing progress records
  const toCreate = allNodes.filter((n) => !existingNodeIds.has(n.id))
  let created = 0

  for (const node of toCreate) {
    const isFirst = firstNodePerRealm.get(node.realmId) === node.id
    await db.userProgress.create({
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
    created++
  }

  return { created }
}
