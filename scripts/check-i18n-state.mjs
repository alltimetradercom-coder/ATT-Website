import { PrismaClient } from '@prisma/client';
const db = new PrismaClient();

async function check() {
  // Check Hindi/Telugu translation status
  const withContentHi = await db.node.count({ where: { contentHi: { not: null } } });
  const withContentTe = await db.node.count({ where: { contentTe: { not: null } } });
  const withTldrHi = await db.node.count({ where: { tldrHi: { not: null } } });
  const withTldrTe = await db.node.count({ where: { tldrTe: { not: null } } });
  const withCheatHi = await db.node.count({ where: { cheatsheetHi: { not: null } } });
  const withMindNoteHi = await db.node.count({ where: { mindNoteHi: { not: null } } });

  console.log('=== i18n Translation Status ===');
  console.log('contentHi:', withContentHi, '/ 270');
  console.log('contentTe:', withContentTe, '/ 270');
  console.log('tldrHi:', withTldrHi, '/ 270');
  console.log('tldrTe:', withTldrTe, '/ 270');
  console.log('cheatsheetHi:', withCheatHi, '/ 270');
  console.log('mindNoteHi:', withMindNoteHi, '/ 270');

  // Check glossary
  const glossaryCount = await db.glossary.count();
  console.log('\n=== Glossary Status ===');
  console.log('Glossary terms:', glossaryCount);

  // Check certificates
  const certCount = await db.certificate.count();
  console.log('\n=== Certificate Status ===');
  console.log('Certificates:', certCount);

  // Check quiz i18n
  const quizWithHi = await db.quizBank.count({ where: { questionHi: { not: null } } });
  const quizWithTe = await db.quizBank.count({ where: { questionTe: { not: null } } });
  console.log('\n=== Quiz i18n ===');
  console.log('Quiz with Hindi:', quizWithHi, '/ 836');
  console.log('Quiz with Telugu:', quizWithTe, '/ 836');

  await db.$disconnect();
}
check();
