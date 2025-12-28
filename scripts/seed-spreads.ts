
import { db } from "../src/db";
import { spreads, spreadPositions } from "../src/db/schema";
import { SPREADS } from "../src/lib/spreads";
import { SPREADS_ZH } from "../src/lib/spreads.zh";
import { eq } from "drizzle-orm";

async function seed() {
  console.log("Seeding spreads...");

  // Clear existing spreads (cascade will clear positions)
  await db.delete(spreads);

  // Helper to insert a spread and its positions
  const insertSpread = async (data: any, lang: string) => {
    const [insertedSpread] = await db.insert(spreads).values({
      slug: data.id,
      lang: lang,
      name: data.name,
      description: data.description,
      detail: data.detail,
      difficulty: data.difficulty,
      recommended: data.recommended,
      tags: data.tags,
    }).returning({ id: spreads.id });

    if (data.positions && data.positions.length > 0) {
      await db.insert(spreadPositions).values(
        data.positions.map((pos: any) => ({
          spreadId: insertedSpread.id,
          positionIndex: pos.id,
          name: pos.name,
          description: pos.description,
          x: pos.x,
          y: pos.y,
        }))
      );
    }
  };

  // Insert English spreads
  for (const spread of SPREADS) {
    await insertSpread(spread, 'en');
  }

  // Insert Chinese spreads
  for (const spread of SPREADS_ZH) {
    await insertSpread(spread, 'zh');
  }

  console.log("Seeding completed.");
  process.exit(0);
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
