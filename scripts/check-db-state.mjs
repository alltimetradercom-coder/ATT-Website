import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function check() {
  const totalNodes = await db.node.count();
  const withContent = await db.node.count({ where: { content: { not: null } } });
  const withoutContent = await db.node.count({ where: { content: { equals: null } } });
  const published = await db.node.count({ where: { status: 'published' } });
  const totalQuizzes = await db.quizBank.count();

  console.log('=== Database State ===');
  console.log('Total nodes:', totalNodes);
  console.log('With content:', withContent);
  console.log('Without content:', withoutContent);
  console.log('Published:', published);
  console.log('Total quiz questions:', totalQuizzes);

  const realms = await db.realm.findMany({ orderBy: { realmNumber: 'asc' } });
  for (const r of realms) {
    const nodes = await db.node.count({ where: { realmId: r.id } });
    const content = await db.node.count({ where: { realmId: r.id, content: { not: null } } });
    const quizzes = await db.quizBank.count({ where: { node: { realmId: r.id } } });
    console.log(`  Realm ${r.realmNumber} (${r.title}): ${nodes} nodes, ${content} with content, ${quizzes} quizzes`);
  }

  // Check a sample of realm 2 nodes
  const r2Sample = await db.node.findMany({
    where: { realmId: { in: realms.filter(r => r.realmNumber === 2).map(r => r.id) } },
    select: { nodeId: true, title: true, content: true, status: true },
    take: 3
  });
  console.log('\nRealm 2 sample:');
  for (const n of r2Sample) {
    console.log(`  ${n.nodeId}: ${n.title.substring(0, 40)} | content: ${n.content ? n.content.substring(0, 50) + '...' : 'NULL'} | status: ${n.status}`);
  }

  await db.$disconnect();
}
check();
