import { db } from '@/lib/db'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

// ─── Helpers ────────────────────────────────────────────────

function parseJsonArray(raw: string | null): string[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : [String(parsed)]
  } catch {
    return [raw]
  }
}

function getDifficultyColor(difficulty: string) {
  switch (difficulty) {
    case 'Beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200'
    case 'Intermediate': return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'Advanced': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

// ─── Static Params ──────────────────────────────────────────

export async function generateStaticParams() {
  const nodes = await db.node.findMany({
    where: { status: 'published', slug: { not: '' } },
    select: { slug: true },
  })
  return nodes.map((n) => ({ slug: n.slug }))
}

// ─── Dynamic Metadata ──────────────────────────────────────

type PageProps = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const node = await db.node.findUnique({
    where: { slug },
    include: { realm: true },
  })
  if (!node) return { title: 'Lesson Not Found' }

  const title = node.seoTitle || `${node.title} — AllTimeTrader Skill Tree`
  const description = node.seoDescription || `Learn ${node.title} in the ${node.realm.title} realm of the AllTimeTrader Skill Tree. Free Indian stock market lesson for ${node.difficulty.toLowerCase()} traders.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      url: `https://alltimetrader.com/learn/${slug}`,
      siteName: 'AllTimeTrader',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    alternates: {
      canonical: `https://alltimetrader.com/learn/${slug}`,
    },
  }
}

// ─── Page Component ─────────────────────────────────────────

export default async function LearnPage({ params }: PageProps) {
  const { slug } = await params

  const node = await db.node.findUnique({
    where: { slug },
    include: {
      realm: true,
      edgesFrom: {
        include: {
          toNode: {
            include: { realm: { select: { title: true, icon: true, color: true, slug: true } } },
          },
        },
        take: 6,
      },
      edgesTo: {
        include: {
          fromNode: {
            include: { realm: { select: { title: true, icon: true, color: true, slug: true } } },
          },
        },
        take: 6,
      },
      glossaryTerms: {
        include: { glossary: true },
        take: 12,
      },
      quizzes: {
        take: 1,
      },
    },
  })

  if (!node || node.status !== 'published') {
    notFound()
  }

  // ── Derived data ──
  const realm = node.realm
  const keyTakeaways = parseJsonArray(node.keyTakeaways)
  const traderTips = parseJsonArray(node.traderTips)
  const importantNotes = parseJsonArray(node.importantNotes)
  const tldrItems = parseJsonArray(node.tldr)
  const cheatsheetItems = parseJsonArray(node.cheatsheet)
  const hasContent = node.content && node.content.length > 10
  const isBoss = node.contentType === 'Certification'
  const quiz = node.quizzes[0]
  const quizOptions = quiz ? parseJsonArray(quiz.options) : []

  // Connected nodes (from edges)
  const connectedNodes = [
    ...node.edgesFrom.map((e) => ({
      nodeId: e.toNode.nodeId,
      title: e.toNode.title,
      slug: e.toNode.slug,
      difficulty: e.toNode.difficulty,
      xp: e.toNode.xp,
      relationship: e.relationship,
      realm: e.toNode.realm,
    })),
    ...node.edgesTo.map((e) => ({
      nodeId: e.fromNode.nodeId,
      title: e.fromNode.title,
      slug: e.fromNode.slug,
      difficulty: e.fromNode.difficulty,
      xp: e.fromNode.xp,
      relationship: e.relationship,
      realm: e.fromNode.realm,
    })),
  ]

  // Next node (first leads_to edge)
  const nextNode = node.edgesFrom.find((e) => e.relationship === 'leads_to')

  // Glossary terms
  const glossaryTerms = node.glossaryTerms.map((gn) => gn.glossary)

  // ── JSON-LD ──
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LearningResource',
    name: node.title,
    description: node.seoDescription || node.tldr || `Learn ${node.title}`,
    educationalLevel: node.difficulty,
    learningResourceType: 'Lesson',
    url: `https://alltimetrader.com/learn/${slug}`,
    isPartOf: {
      '@type': 'Course',
      name: realm.title,
      provider: {
        '@type': 'Organization',
        name: 'AllTimeTrader',
        url: 'https://alltimetrader.com',
      },
    },
  }

  // ── Content paragraphs ──
  const contentParagraphs = hasContent
    ? (node.content || '').split(/\n\s*\n/).filter((p: string) => p.trim().length > 0)
    : []

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="min-h-screen flex flex-col bg-white text-gray-900">
        {/* ── Breadcrumb ── */}
        <nav aria-label="Breadcrumb" className="border-b border-gray-200 bg-gray-50">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-3">
            <ol className="flex items-center gap-1.5 text-sm text-gray-500 flex-wrap">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">Home</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">Skill Tree</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">{realm.icon} {realm.title}</Link>
              </li>
              <li aria-hidden="true">/</li>
              <li>
                <span className="text-gray-900 font-medium" aria-current="page">{node.title}</span>
              </li>
            </ol>
          </div>
        </nav>

        {/* ── Main Content ── */}
        <article className="flex-1">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12 space-y-8">

            {/* Header */}
            <header>
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${getDifficultyColor(node.difficulty)}`}>
                  {node.difficulty}
                </span>
                <span className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  {node.xp} XP
                </span>
                <span className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-2.5 py-0.5 text-xs font-semibold text-gray-600">
                  {node.contentType}
                </span>
                {isBoss && (
                  <span className="inline-flex items-center rounded-full border border-red-200 bg-red-50 px-2.5 py-0.5 text-xs font-semibold text-red-700">
                    Boss Battle
                  </span>
                )}
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 leading-tight">
                {node.title}
              </h1>
              <div className="mt-3 flex items-center gap-2 text-sm text-gray-500">
                <span>{realm.icon}</span>
                <span>{realm.title} Realm</span>
                <span aria-hidden="true">&middot;</span>
                <span>Lesson {node.nodeId}</span>
              </div>
            </header>

            {/* Story/Lore */}
            {node.lore && (
              <section className="rounded-xl border border-purple-200 bg-purple-50 p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-purple-700 mb-2">
                  <span aria-hidden="true">&#2728;</span> Story
                  {node.storyChapter && (
                    <span className="font-normal text-purple-500 ml-1">&mdash; {node.storyChapter}</span>
                  )}
                </h2>
                <p className="text-sm text-purple-800 leading-relaxed italic">{node.lore}</p>
              </section>
            )}

            {/* Mind Note */}
            {node.mindNote && (
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="flex items-center gap-2 text-sm font-bold text-emerald-700 mb-2">
                  <span aria-hidden="true">&#129504;</span> Mind Note
                </h2>
                <p className="text-sm text-emerald-900 leading-relaxed italic">&ldquo;{node.mindNote}&rdquo;</p>
              </section>
            )}

            {/* Full Lesson Content */}
            {hasContent && (
              <section className="prose prose-gray max-w-none">
                <h2 className="text-xl font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Lesson Content</h2>
                {contentParagraphs.map((paragraph: string, i: number) => (
                  <p key={i} className="text-gray-700 leading-relaxed mb-4">{paragraph.trim()}</p>
                ))}
              </section>
            )}

            {/* Key Takeaways */}
            {keyTakeaways.length > 0 && (
              <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-emerald-800 mb-3">
                  <span aria-hidden="true">&#11088;</span> Key Takeaways
                </h2>
                <ul className="space-y-2">
                  {keyTakeaways.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-600 font-bold mt-0.5 shrink-0">{i + 1}.</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Trader Tips */}
            {traderTips.length > 0 && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-amber-800 mb-3">
                  <span aria-hidden="true">&#128161;</span> Trader Tips
                </h2>
                <ul className="space-y-2">
                  {traderTips.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-amber-500 shrink-0">&#128161;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Important Notes */}
            {importantNotes.length > 0 && (
              <section className="rounded-xl border border-red-200 bg-red-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-red-800 mb-3">
                  <span aria-hidden="true">&#9888;&#65039;</span> Important Notes
                </h2>
                <ul className="space-y-2">
                  {importantNotes.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-red-500 shrink-0">&#9888;&#65039;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Cheatsheet */}
            {cheatsheetItems.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                  <span aria-hidden="true">&#128203;</span> Cheatsheet
                </h2>
                <ul className="space-y-2">
                  {cheatsheetItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-600 font-bold shrink-0">&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* TL;DR */}
            {tldrItems.length > 0 && (
              <section className="rounded-xl border border-gray-200 bg-gray-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-800 mb-3">
                  <span aria-hidden="true">&#9889;</span> TL;DR
                </h2>
                <ul className="space-y-2">
                  {tldrItems.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <span className="text-emerald-600 font-bold shrink-0">&#8226;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Connected Nodes */}
            {connectedNodes.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Connected Lessons</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {connectedNodes.map((cn) => (
                    <Link
                      key={cn.nodeId}
                      href={`/learn/${cn.slug}`}
                      className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-3 hover:border-emerald-400 hover:shadow-sm transition-all"
                    >
                      <span className="text-lg shrink-0" aria-hidden="true">{cn.realm.icon}</span>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate">
                          {cn.title}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">{cn.realm.title}</span>
                          <span className="text-xs text-gray-400">&middot;</span>
                          <span className="text-xs text-gray-500">{cn.xp} XP</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Glossary Terms */}
            {glossaryTerms.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-gray-900 mb-4 border-b border-gray-200 pb-2">Glossary Terms</h2>
                <div className="flex flex-wrap gap-2">
                  {glossaryTerms.map((term) => (
                    <span
                      key={term.termId}
                      className="inline-flex items-center rounded-full border border-gray-200 bg-gray-50 px-3 py-1 text-sm text-gray-700"
                    >
                      <strong className="text-gray-900">{term.term}</strong>
                      {term.simpleDefinition && (
                        <>
                          <span className="mx-1.5 text-gray-300">&mdash;</span>
                          <span>{term.simpleDefinition}</span>
                        </>
                      )}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Quiz Preview */}
            {quiz && (
              <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-amber-800 mb-3">
                  <span aria-hidden="true">&#9876;&#65039;</span> Quiz Preview
                </h2>
                <p className="text-sm text-gray-700 font-medium mb-3">{quiz.question}</p>
                <ol className="space-y-1.5 list-decimal list-inside mb-4">
                  {quizOptions.map((opt, i) => (
                    <li key={i} className="text-sm text-gray-600">{opt}</li>
                  ))}
                </ol>
                <Link
                  href="/"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-4 py-2 text-sm font-bold text-white hover:bg-amber-600 transition-colors"
                >
                  Take the Full Quiz
                  <span aria-hidden="true">&rarr;</span>
                </Link>
              </section>
            )}

            {/* Next Lesson + Back to Realm */}
            <section className="flex flex-col sm:flex-row gap-3">
              {nextNode && (
                <Link
                  href={`/learn/${nextNode.toNode.slug}`}
                  className="flex-1 flex items-center justify-between rounded-xl border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100 transition-colors group"
                >
                  <div>
                    <p className="text-xs text-emerald-600 font-medium">Next Lesson</p>
                    <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">{nextNode.toNode.title}</p>
                  </div>
                  <span className="text-emerald-600 text-xl" aria-hidden="true">&rarr;</span>
                </Link>
              )}
              <Link
                href="/"
                className="flex-1 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 hover:bg-gray-100 transition-colors group"
              >
                <div>
                  <p className="text-xs text-gray-500 font-medium">Back to Realm</p>
                  <p className="text-sm font-bold text-gray-900 group-hover:text-emerald-700">{realm.icon} {realm.title}</p>
                </div>
                <span className="text-gray-400 text-xl group-hover:text-emerald-600" aria-hidden="true">&rarr;</span>
              </Link>
            </section>

            {/* CTA: Explore Skill Tree */}
            <section className="rounded-xl border-2 border-emerald-300 bg-gradient-to-br from-emerald-50 to-teal-50 p-6 sm:p-8 text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mb-2">
                Explore the Full ATT Skill Tree
              </h2>
              <p className="text-sm text-gray-600 mb-5 max-w-lg mx-auto">
                Unlock 270+ lessons across 13 realms, take quizzes, earn XP, and become a certified trader. All free, all in your browser.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-6 py-3 text-sm font-bold text-white hover:bg-emerald-700 transition-colors shadow-sm"
              >
                Open Skill Tree
                <span aria-hidden="true">&#127793;</span>
              </Link>
            </section>

            {/* SEBI Disclaimer */}
            <section className="rounded-xl border border-amber-300 bg-amber-50 p-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-amber-600" aria-hidden="true">&#9888;&#65039;</span>
                <h2 className="text-sm font-bold text-amber-700">IMPORTANT LEGAL DISCLOSURES</h2>
              </div>
              <div className="space-y-3 text-xs text-gray-600">
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">1. NOT SEBI REGISTERED</p>
                  <p>
                    AllTimeTrader.com is NOT a SEBI registered investment advisor, research analyst, or stock broker.
                    We do NOT provide buy/sell recommendations, stock tips, advisory services, portfolio management,
                    or guaranteed returns.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">2. EDUCATIONAL PURPOSE ONLY</p>
                  <p>
                    All calculators, tools, and data are for educational purposes only. Please consult a
                    SEBI-registered advisor before making investment decisions.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">3. DATA ACCURACY</p>
                  <p>
                    Market data may be delayed. We are not responsible for data accuracy. Verify from official
                    sources (NSE/BSE) before trading.
                  </p>
                </div>
                <div>
                  <p className="font-semibold text-gray-900 mb-0.5">4. RISK DISCLAIMER</p>
                  <p>
                    Trading in stock markets involves substantial risk. Past performance does not guarantee future
                    returns. Never invest more than you can afford to lose.
                  </p>
                </div>
              </div>
            </section>

          </div>
        </article>

        {/* ── Footer ── */}
        <footer className="border-t border-gray-200 bg-gray-50 mt-auto">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <p>&copy; 2025 AllTimeTrader.com. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/disclaimer" className="hover:text-emerald-600 transition-colors">Disclaimer</Link>
              <Link href="/privacy" className="hover:text-emerald-600 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-emerald-600 transition-colors">Terms</Link>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
