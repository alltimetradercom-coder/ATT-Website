import { NextResponse } from 'next/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ termId: string }> }
) {
  try {
    const { db } = await import('@/lib/db')
    const { termId } = await params

    const term = await db.glossary.findUnique({
      where: { termId },
      include: {
        nodes: {
          include: {
            node: {
              select: {
                id: true,
                nodeId: true,
                title: true,
                slug: true,
                realm: {
                  select: {
                    id: true,
                    title: true,
                    icon: true,
                    color: true,
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!term) {
      return NextResponse.json({ error: 'Term not found' }, { status: 404 })
    }

    const { nodes: glossaryNodes, ...termData } = term

    const nodes = glossaryNodes.map((gn) => ({
      nodeId: gn.node.nodeId,
      title: gn.node.title,
      slug: gn.node.slug,
      realm: gn.node.realm,
    }))

    return NextResponse.json({ term: termData, nodes })
  } catch (error) {
    console.error('Glossary term detail error:', error)
    return NextResponse.json({ error: 'Failed to fetch glossary term' }, { status: 500 })
  }
}
