import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

const GUEST_USER_ID = 'guest'

// Level mapping: level name -> realm numbers that must be completed
const LEVEL_REALM_MAP: Record<string, number[]> = {
  genesis: [1],
  warrior: [2],
  guardian: [3],
  slayer: [4],
  shadow: [5],
  master: [6],
  empire: [7],
  legendary: [8],
  quant: [9],
  professional: [10],
  automation: [11],
  'lore-keeper': [12],
  institutional: [13],
  'trader-novice': [1, 2, 3],
  'trader-warrior': [1, 2, 3, 4, 5, 6],
  'trader-legend': [1, 2, 3, 4, 5, 6, 7, 8, 9],
  'trader-grandmaster': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13],
}

// Realm number -> database realm id lookup
async function getRealmIdByNumber(realmNumber: number): Promise<number | null> {
  const realm = await db.realm.findFirst({
    where: { realmNumber },
    select: { id: true },
  })
  return realm?.id ?? null
}

// POST: Issue a certificate
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const userId = body.userId || GUEST_USER_ID
    const { level, realmNumber } = body

    // Determine which level and realms to check
    let targetLevel: string
    let requiredRealmNumbers: number[]

    if (level) {
      // Level was specified directly
      if (!LEVEL_REALM_MAP[level]) {
        return NextResponse.json(
          { error: `Invalid level. Valid levels: ${Object.keys(LEVEL_REALM_MAP).join(', ')}` },
          { status: 400 }
        )
      }
      targetLevel = level
      requiredRealmNumbers = LEVEL_REALM_MAP[level]
    } else if (realmNumber) {
      // Realm number was specified — issue single-realm certificate
      const realmIndex = Object.entries(LEVEL_REALM_MAP).find(
        ([, realms]) => realms.length === 1 && realms[0] === realmNumber
      )
      if (!realmIndex) {
        return NextResponse.json(
          { error: `No single-realm certificate for realm ${realmNumber}` },
          { status: 400 }
        )
      }
      targetLevel = realmIndex[0]
      requiredRealmNumbers = realmIndex[1]
    } else {
      return NextResponse.json(
        { error: 'Provide either "level" or "realmNumber" in the request body' },
        { status: 400 }
      )
    }

    // Check if certificate already exists for this user+level
    const existing = await db.certificate.findFirst({
      where: { userId, level: targetLevel },
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Certificate already issued for this level', certificate: existing },
        { status: 409 }
      )
    }

    // Get realm IDs from realm numbers
    const realmIds: number[] = []
    for (const rn of requiredRealmNumbers) {
      const rid = await getRealmIdByNumber(rn)
      if (rid === null) {
        return NextResponse.json(
          { error: `Realm with number ${rn} not found` },
          { status: 404 }
        )
      }
      realmIds.push(rid)
    }

    // Check if user has completed ALL nodes in the required realms
    for (const realmId of realmIds) {
      const nodesInRealm = await db.node.findMany({
        where: { realmId },
        select: { id: true },
      })
      const nodeIds = nodesInRealm.map((n) => n.id)

      const completedCount = await db.userProgress.count({
        where: {
          userId,
          nodeId: { in: nodeIds },
          status: 'completed',
        },
      })

      if (completedCount < nodeIds.length) {
        return NextResponse.json(
          {
            error: 'Not all nodes completed in required realms',
            level: targetLevel,
            realmId,
            completed: completedCount,
            total: nodeIds.length,
          },
          { status: 403 }
        )
      }
    }

    // Generate unique certificate ID
    const timestamp = Date.now().toString(36).toUpperCase()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    const certificateId = `ATT-CERT-${timestamp}-${random}`

    // Issue the certificate
    const certificate = await db.certificate.create({
      data: {
        userId,
        level: targetLevel,
        realmIds: JSON.stringify(realmIds),
        certificateId,
      },
    })

    // Enrich with realm details
    const realms = await db.realm.findMany({
      where: { id: { in: realmIds } },
      select: { id: true, title: true, icon: true, color: true },
      orderBy: { realmNumber: 'asc' },
    })

    return NextResponse.json({
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        level: certificate.level,
        realmIds: certificate.realmIds,
        issuedAt: certificate.issuedAt.toISOString(),
        realmDetails: realms,
      },
    })
  } catch (error) {
    console.error('Error issuing certificate:', error)
    return NextResponse.json({ error: 'Failed to issue certificate' }, { status: 500 })
  }
}
