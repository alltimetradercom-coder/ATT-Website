import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// GET: Fetch a certificate by its certificateId (public endpoint for sharing/verification)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ certificateId: string }> }
) {
  try {
    const { certificateId } = await params

    const certificate = await db.certificate.findUnique({
      where: { certificateId },
    })

    if (!certificate) {
      return NextResponse.json({ error: 'Certificate not found' }, { status: 404 })
    }

    // Get realm details
    const realmIds: number[] = JSON.parse(certificate.realmIds)
    const realms = await db.realm.findMany({
      where: { id: { in: realmIds } },
      select: {
        id: true,
        realmNumber: true,
        title: true,
        icon: true,
        color: true,
        badgeEmoji: true,
        badgeTitle: true,
      },
      orderBy: { realmNumber: 'asc' },
    })

    // Get user info (placeholder since we're using guest user)
    const userName = certificate.userId === 'guest' ? 'Guest Trader' : certificate.userId

    return NextResponse.json({
      certificate: {
        id: certificate.id,
        certificateId: certificate.certificateId,
        level: certificate.level,
        realmIds: certificate.realmIds,
        issuedAt: certificate.issuedAt.toISOString(),
      },
      user: { name: userName },
      realms,
      verified: true,
    })
  } catch (error) {
    console.error('Error fetching certificate:', error)
    return NextResponse.json({ error: 'Failed to fetch certificate' }, { status: 500 })
  }
}
