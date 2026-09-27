import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client/client";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting database seed with rich contestant profiles...");

  // 1. Clean existing records in reverse dependency order
  await prisma.contestantCategoryAssignment.deleteMany({});
  await prisma.contestantMedia.deleteMany({});
  await prisma.awardCategory.deleteMany({});
  await prisma.division.deleteMany({});
  await prisma.eventAuditLog.deleteMany({});
  await prisma.contestant.deleteMany({});
  await prisma.event.deleteMany({});
  console.log("  ✓ Cleaned existing database records");

  const now = Date.now();
  const organizerId = "usr_organizer_mock_01";

  // 2. Active Event: Miss Visayas 2026 with full categories, divisions, photos & videos
  const activeEvent = await prisma.event.create({
    data: {
      id: "evt_active_01",
      slug: "miss-visayas-2026",
      title: "Miss Visayas 2026",
      description:
        "Celebrating island heritage, tourism diplomacy, and grassroots community empowerment across the Western, Central, and Eastern Visayas regions.",
      bannerUrl:
        "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - 1000 * 60 * 60 * 24), // -1 day
      endsAt: new Date(now + 1000 * 60 * 60 * 48), // +2 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      organizerId,
    },
  });

  // Award categories
  const catPeoplesChoice = await prisma.awardCategory.create({
    data: {
      eventId: activeEvent.id,
      name: "People's Choice",
      description: "Fan favorite selected entirely via authenticated public voting.",
    },
  });

  const catGown = await prisma.awardCategory.create({
    data: {
      eventId: activeEvent.id,
      name: "Best in Evening Gown",
      description: "Elegance, stage poise, and haute couture craftsmanship.",
    },
  });

  const catSwimsuit = await prisma.awardCategory.create({
    data: {
      eventId: activeEvent.id,
      name: "Best in Swimsuit",
      description: "Fitness, wellness, and runway vitality.",
    },
  });

  // Contestant 1 (Female)
  await prisma.contestant.create({
    data: {
      id: "cst_visayas_01",
      eventId: activeEvent.id,
      contestantNumber: 1,
      name: "Hannah Patricia Gomez",
      division: "FEMALE",
      status: "ACTIVE",
      hometown: "Cebu City, Cebu",
      heightCm: 176,
      bio: "Marine biology graduate from University of San Carlos pioneering coral reef restoration sanctuaries.",
      advocacy:
        "Preserving marine biodiversity and supporting coastal artisanal fisherfolk livelihoods.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      instagramUrl: "https://instagram.com/hannahgomez",
      tiktokUrl: "https://tiktok.com/@hannah_visayas",
      facebookUrl: "https://facebook.com/hannahgomez.official",
      voteCount: 1840,
      media: {
        create: [
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
            displayOrder: 0,
            aspectRatio: "4:5",
            isCover: true,
          },
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
            displayOrder: 1,
            aspectRatio: "4:5",
            isCover: false,
          },
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
            displayOrder: 2,
            aspectRatio: "4:5",
            isCover: false,
          },
          {
            mediaType: "VIDEO_EMBED",
            url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
            embedPlatform: "YOUTUBE",
            embedId: "dQw4w9WgXcQ",
            displayOrder: 3,
            aspectRatio: "9:16",
            isCover: false,
          },
        ],
      },
      categories: {
        create: [{ awardCategoryId: catPeoplesChoice.id }, { awardCategoryId: catGown.id }],
      },
    },
  });

  // Contestant 2 (Female)
  await prisma.contestant.create({
    data: {
      id: "cst_visayas_02",
      eventId: activeEvent.id,
      contestantNumber: 2,
      name: "Alyssa Marie Tan",
      division: "FEMALE",
      status: "ACTIVE",
      hometown: "Iloilo City, Iloilo",
      heightCm: 173,
      bio: "Social entrepreneur advocating for traditional Hablon textile weaving and fair-trade artisans.",
      advocacy:
        "Revitalizing indigenous Philippine weaving heritage through modern ethical fashion.",
      avatarUrl:
        "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
      instagramUrl: "https://instagram.com/alyssatan",
      tiktokUrl: "https://tiktok.com/@alyssatan_ph",
      voteCount: 1620,
      media: {
        create: [
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
            displayOrder: 0,
            aspectRatio: "4:5",
            isCover: true,
          },
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
            displayOrder: 1,
            aspectRatio: "4:5",
            isCover: false,
          },
        ],
      },
      categories: {
        create: [{ awardCategoryId: catPeoplesChoice.id }, { awardCategoryId: catSwimsuit.id }],
      },
    },
  });

  // Contestant 3 (Male Division)
  await prisma.contestant.create({
    data: {
      id: "cst_visayas_03",
      eventId: activeEvent.id,
      contestantNumber: 1,
      name: "Marcus Aurelius Ramos",
      division: "MALE",
      status: "ACTIVE",
      hometown: "Bacolod City, Negros Occidental",
      heightCm: 185,
      bio: "Civil engineer and sustainable organic agriculture advocate in Western Visayas.",
      advocacy: "Solar-powered irrigation and food security for smallholder sugarcane farmers.",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
      instagramUrl: "https://instagram.com/marcusramos",
      voteCount: 1450,
      media: {
        create: [
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
            displayOrder: 0,
            aspectRatio: "4:5",
            isCover: true,
          },
        ],
      },
      categories: {
        create: [{ awardCategoryId: catPeoplesChoice.id }],
      },
    },
  });

  // Contestant 4 (LGBTQ+ Division)
  await prisma.contestant.create({
    data: {
      id: "cst_visayas_04",
      eventId: activeEvent.id,
      contestantNumber: 1,
      name: "Kylie De Chavez",
      division: "LGBTQ",
      status: "ACTIVE",
      hometown: "Tacloban City, Leyte",
      heightCm: 178,
      bio: "Public health educator and human rights activist promoting inclusive healthcare access.",
      advocacy: "Equal opportunities, diversity education, and community healthcare initiatives.",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
      instagramUrl: "https://instagram.com/kyliedechavez",
      voteCount: 1980,
      media: {
        create: [
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
            displayOrder: 0,
            aspectRatio: "4:5",
            isCover: true,
          },
        ],
      },
      categories: {
        create: [{ awardCategoryId: catPeoplesChoice.id }, { awardCategoryId: catGown.id }],
      },
    },
  });

  console.log(
    `  ✓ Seeded Active Event: ${activeEvent.title} with 4 contestants across 3 divisions`,
  );

  // 3. Scheduled Event (Miss Luzon 2026)
  const scheduledEvent = await prisma.event.create({
    data: {
      id: "evt_scheduled_01",
      slug: "miss-luzon-2026",
      title: "Miss Luzon 2026",
      description:
        "The premier cultural heritage, beauty, and youth advocacy pageant of Northern and Central Luzon. Support your candidate via authenticated digital voting.",
      bannerUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now + 1000 * 60 * 60 * 24 * 3), // +3 days
      endsAt: new Date(now + 1000 * 60 * 60 * 24 * 7), // +7 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      organizerId,
    },
  });

  const catLuzonPC = await prisma.awardCategory.create({
    data: {
      eventId: scheduledEvent.id,
      name: "People's Choice",
      description: "Selected by audience vote.",
    },
  });

  await prisma.contestant.create({
    data: {
      id: "cst_luzon_01",
      eventId: scheduledEvent.id,
      contestantNumber: 1,
      name: "Maria Angelica Santos",
      division: "FEMALE",
      status: "ACTIVE",
      hometown: "Vigan, Ilocos Sur",
      heightCm: 175,
      bio: "Advocate for marine conservation, sustainable coastal ecotourism, and youth literacy.",
      advocacy: "Coastal marine rehabilitation and empowering youth in rural fishing communities.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      instagramUrl: "https://instagram.com/mariaangelica",
      voteCount: 0,
      media: {
        create: [
          {
            mediaType: "PHOTO",
            url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
            displayOrder: 0,
            aspectRatio: "4:5",
            isCover: true,
          },
        ],
      },
      categories: {
        create: [{ awardCategoryId: catLuzonPC.id }],
      },
    },
  });

  console.log(`  ✓ Seeded Scheduled Event: ${scheduledEvent.title}`);

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
