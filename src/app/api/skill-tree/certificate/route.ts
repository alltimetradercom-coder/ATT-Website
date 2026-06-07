import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

const GUEST_USER_ID = 'guest'

// GET: Fetch all certificates for a user
export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId') || GUEST_USER_ID

    const certificates = await db.certificate.findMany({
      where: { userId },
      orderBy: { issuedAt: 'desc' },
    })

    // Enrich with realm details
    const enriched = await Promise.all(
      certificates.map(async (cert) => {
        const realmIds: number[] = JSON.parse(cert.realmIds)
        const realms = await db.realm.findMany({
          where: { id: { in: realmIds } },
          select: { id: true, title: true, icon: true, color: true },
          orderBy: { realmNumber: 'asc' },
        })

        return {
          id: cert.id,
          certificateId: cert.certificateId,
          level: cert.level,
          realmIds: cert.realmIds,
          issuedAt: cert.issuedAt.toISOString(),
          realmDetails: realms,
        }
      })
    )

    return NextResponse.json({ certificates: enriched })
  } catch (error) {
    console.error('Error fetching certificates:', error)
    return NextResponse.json({ error: 'Failed to fetch certificates' }, { status: 500 })
  }
}
