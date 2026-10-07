import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/client/client";
import type {
  ContestantDivision,
  EventPublicationStatus,
  MediaType,
  EmbedPlatform,
} from "../src/generated/client/client";

const connectionString =
  process.env.DATABASE_URL ?? "postgresql://postgres:postgres@127.0.0.1:54322/postgres";
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

interface ContestantSeedInput {
  id: string;
  contestantNumber: number;
  name: string;
  division: ContestantDivision;
  divisionName?: string;
  status?: "ACTIVE" | "HIDDEN" | "WITHDRAWN";
  hometown: string;
  heightCm: number;
  bio: string;
  advocacy: string;
  avatarUrl: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  facebookUrl?: string;
  voteCount: number;
  categoryNames?: string[];
  media?: Array<{
    mediaType: MediaType;
    url: string;
    embedPlatform?: EmbedPlatform;
    embedId?: string;
    displayOrder: number;
    aspectRatio?: string;
    isCover: boolean;
  }>;
}

interface EventSeedInput {
  id: string;
  slug: string;
  title: string;
  description: string;
  bannerUrl: string;
  startsAt: Date;
  endsAt: Date;
  publicationStatus: EventPublicationStatus;
  draftPassphraseHash?: string | null;
  showResultsOnClose?: boolean;
  isFreeVotingEnabled?: boolean;
  dailyFreeVoteLimit?: number;
  takeRatePercentage?: number;
  organizerId: string;
  divisions: Array<{
    name: string;
    description: string;
    displayOrder: number;
  }>;
  awardCategories: Array<{
    name: string;
    description: string;
    isVotingOpen?: boolean;
    displayOrder: number;
  }>;
  contestants: ContestantSeedInput[];
}

async function main() {
  console.log("🌱 Starting database seed with 10 events and rich contestant profiles...");

  // 1. Clean existing records in reverse dependency order
  await prisma.vote.deleteMany({});
  await prisma.paymentTransaction.deleteMany({});
  await prisma.payoutRequest.deleteMany({});
  await prisma.contestantCategoryAssignment.deleteMany({});
  await prisma.contestantMedia.deleteMany({});
  await prisma.awardCategory.deleteMany({});
  await prisma.division.deleteMany({});
  await prisma.eventAuditLog.deleteMany({});
  await prisma.contestant.deleteMany({});
  await prisma.event.deleteMany({});
  console.log("  ✓ Cleaned existing database records");

  const now = Date.now();
  const DAY_MS = 1000 * 60 * 60 * 24;
  const organizerId = "usr_organizer_mock_01";

  const eventsData: EventSeedInput[] = [
    // -------------------------------------------------------------
    // EVENT 1: Miss Visayas 2026 (Live / Published)
    // -------------------------------------------------------------
    {
      id: "evt_visayas_01",
      slug: "miss-visayas-2026",
      title: "Miss Visayas 2026",
      description:
        "Celebrating island heritage, tourism diplomacy, and grassroots community empowerment across the Western, Central, and Eastern Visayas regions.",
      bannerUrl:
        "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 2), // Started 2 days ago
      endsAt: new Date(now + DAY_MS * 3), // Ends in 3 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Official female candidates", displayOrder: 1 },
        { name: "Male Division", description: "Official male candidates", displayOrder: 2 },
        { name: "LGBTQ+ Division", description: "Official LGBTQ+ candidates", displayOrder: 3 },
      ],
      awardCategories: [
        {
          name: "People's Choice",
          description: "Fan favorite selected entirely via authenticated public voting.",
          displayOrder: 1,
        },
        {
          name: "Best in Evening Gown",
          description: "Elegance, stage poise, and haute couture craftsmanship.",
          displayOrder: 2,
        },
        {
          name: "Best in Swimsuit",
          description: "Fitness, wellness, and runway vitality.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_vis_01",
          contestantNumber: 1,
          name: "Hannah Patricia Gomez",
          division: "FEMALE",
          divisionName: "Female Division",
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
          categoryNames: ["People's Choice", "Best in Evening Gown"],
          media: [
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
              mediaType: "VIDEO_EMBED",
              url: "https://www.youtube.com/shorts/dQw4w9WgXcQ",
              embedPlatform: "YOUTUBE",
              embedId: "dQw4w9WgXcQ",
              displayOrder: 2,
              aspectRatio: "9:16",
              isCover: false,
            },
          ],
        },
        {
          id: "cst_vis_02",
          contestantNumber: 2,
          name: "Alyssa Marie Tan",
          division: "FEMALE",
          divisionName: "Female Division",
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
          categoryNames: ["People's Choice", "Best in Swimsuit"],
          media: [
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
        {
          id: "cst_vis_03",
          contestantNumber: 3,
          name: "Beatrice Elena Villar",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Bacolod City, Negros Occidental",
          heightCm: 174,
          bio: "Culinary artist and agro-tourism developer showcasing Negrense slow food heritage.",
          advocacy: "Sustainable gastronomy and youth culinary apprenticeship in rural provinces.",
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/beatricevillar",
          voteCount: 1310,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_vis_04",
          contestantNumber: 1,
          name: "Marcus Aurelius Ramos",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Bacolod City, Negros Occidental",
          heightCm: 185,
          bio: "Civil engineer and sustainable organic agriculture advocate in Western Visayas.",
          advocacy: "Solar-powered irrigation and food security for smallholder sugarcane farmers.",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/marcusramos",
          voteCount: 1450,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_vis_05",
          contestantNumber: 2,
          name: "Gabriel John Navarro",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Dumaguete City, Negros Oriental",
          heightCm: 182,
          bio: "Physical therapist and youth sports development organizer championing provincial athletics.",
          advocacy: "Community wellness clinics and youth adaptive sports inclusivity.",
          avatarUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/gabnavarro",
          voteCount: 1120,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_vis_06",
          contestantNumber: 1,
          name: "Kylie De Chavez",
          division: "LGBTQ",
          divisionName: "LGBTQ+ Division",
          status: "ACTIVE",
          hometown: "Tacloban City, Leyte",
          heightCm: 178,
          bio: "Public health educator and human rights activist promoting inclusive healthcare access.",
          advocacy:
            "Equal opportunities, diversity education, and community healthcare initiatives.",
          avatarUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/kyliedechavez",
          voteCount: 1980,
          categoryNames: ["People's Choice", "Best in Evening Gown"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 2: Miss Luzon 2026 (Scheduled / Upcoming)
    // -------------------------------------------------------------
    {
      id: "evt_luzon_02",
      slug: "miss-luzon-2026",
      title: "Miss Luzon 2026",
      description:
        "The premier cultural heritage, beauty, and youth advocacy pageant of Northern and Central Luzon. Support your candidate via authenticated digital voting.",
      bannerUrl:
        "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now + DAY_MS * 3), // Starts in 3 days
      endsAt: new Date(now + DAY_MS * 10), // Ends in 10 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Official female candidates", displayOrder: 1 },
      ],
      awardCategories: [
        {
          name: "People's Choice",
          description: "Selected entirely by digital votes.",
          displayOrder: 1,
        },
        {
          name: "Darling of the Press",
          description: "Selected by media accreditation delegates.",
          displayOrder: 2,
        },
        {
          name: "Best Cultural Attire",
          description: "Artisanal provincial costume showcase.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_luz_01",
          contestantNumber: 1,
          name: "Maria Angelica Santos",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Vigan, Ilocos Sur",
          heightCm: 175,
          bio: "Advocate for marine conservation, sustainable coastal ecotourism, and youth literacy.",
          advocacy:
            "Coastal marine rehabilitation and empowering youth in rural fishing communities.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/mariaangelica",
          voteCount: 0,
          categoryNames: ["People's Choice", "Best Cultural Attire"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_luz_02",
          contestantNumber: 2,
          name: "Camille Louise Dizon",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "San Fernando, Pampanga",
          heightCm: 172,
          bio: "Food technology researcher preserving traditional culinary fermentation techniques.",
          advocacy: "Modern food preservation systems for agrarian farming communities.",
          avatarUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/camilledizon",
          voteCount: 0,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_luz_03",
          contestantNumber: 3,
          name: "Sophia Isabel Reyes",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Baguio City, Benguet",
          heightCm: 171,
          bio: "Botanical illustrator and indigenous Cordillera textile weaving patron.",
          advocacy: "Supporting Benguet upland farmers and youth artisan heritage.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/sophiareyes",
          voteCount: 0,
          categoryNames: ["People's Choice", "Best Cultural Attire"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_luz_04",
          contestantNumber: 4,
          name: "Danielle Nicole Cruz",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Batangas City, Batangas",
          heightCm: 176,
          bio: "Renewable energy consultant and advocate for clean marine sanctuaries in Verde Island Passage.",
          advocacy: "Clean oceans, coral protection, and environmental policy literacy.",
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/daniellecruz",
          voteCount: 0,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 3: Mister Philippines 2026 (Live / Published)
    // -------------------------------------------------------------
    {
      id: "evt_mister_03",
      slug: "mister-philippines-2026",
      title: "Mister Philippines 2026",
      description:
        "The country's definitive gentleman pageant showcasing leadership, athletic endurance, and civic stewardship.",
      bannerUrl:
        "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 1), // Started 1 day ago
      endsAt: new Date(now + DAY_MS * 4), // Ends in 4 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 10.0,
      organizerId,
      divisions: [
        { name: "Male Division", description: "Official male titleholders", displayOrder: 1 },
      ],
      awardCategories: [
        {
          name: "People's Choice",
          description: "Nationwide authenticated vote leader.",
          displayOrder: 1,
        },
        {
          name: "Best in Formal Wear",
          description: "Bespoke tailoring, poise, and gentlemanly presence.",
          displayOrder: 2,
        },
        {
          name: "Fitness & Physique",
          description: "Athleticism, stamina, and dedication to peak health.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_mr_01",
          contestantNumber: 1,
          name: "Christian David Mercado",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Quezon City, Metro Manila",
          heightCm: 188,
          bio: "Software developer and youth STEM mentor encouraging tech education in underserved barangays.",
          advocacy: "Digital inclusion and coding scholarships for public high school students.",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/christianmercado",
          voteCount: 2350,
          categoryNames: ["People's Choice", "Best in Formal Wear"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_mr_02",
          contestantNumber: 2,
          name: "Joshua Paolo Mendoza",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Davao City, Davao del Sur",
          heightCm: 183,
          bio: "Certified fitness trainer and community emergency rescue volunteer.",
          advocacy: "Disaster preparedness training and proactive mental health awareness.",
          avatarUrl:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/joshmendoza",
          voteCount: 1980,
          categoryNames: ["People's Choice", "Fitness & Physique"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_mr_03",
          contestantNumber: 3,
          name: "Ethan Rafael Castillo",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Angeles City, Pampanga",
          heightCm: 186,
          bio: "Architectural conservationist promoting heritage preservation across colonial church plazas.",
          advocacy: "Historic landmark restoration and urban green canopy development.",
          avatarUrl:
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/ethancastillo",
          voteCount: 1720,
          categoryNames: ["People's Choice", "Best in Formal Wear"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_mr_04",
          contestantNumber: 4,
          name: "Liam Anthony Alcantara",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Cagayan de Oro, Misamis Oriental",
          heightCm: 181,
          bio: "Whitewater rafting instructor and eco-tourism steward promoting river conservation.",
          advocacy: "Watershed protection and sustainable adventure ecotourism.",
          avatarUrl:
            "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/liamalcantara",
          voteCount: 1490,
          categoryNames: ["People's Choice", "Fitness & Physique"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 4: Binibining Kalikasan 2026 (Live / Published)
    // -------------------------------------------------------------
    {
      id: "evt_kalikasan_04",
      slug: "binibining-kalikasan-2026",
      title: "Binibining Kalikasan 2026",
      description:
        "Championing sustainable development, zero-waste lifestyle innovations, and climate action across the archipelago.",
      bannerUrl:
        "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 3), // Started 3 days ago
      endsAt: new Date(now + DAY_MS * 2), // Ends in 2 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Senior advocates", displayOrder: 1 },
        { name: "Teen Division", description: "Youth eco-warriors (15-18)", displayOrder: 2 },
      ],
      awardCategories: [
        {
          name: "People's Choice",
          description: "Top candidate voted by audiences.",
          displayOrder: 1,
        },
        {
          name: "Eco-Advocate of the Year",
          description: "Most impactful environmental field work project.",
          displayOrder: 2,
        },
        {
          name: "Best in Upcycled Eco-Gown",
          description: "Creative stage gowns fashioned from recyclable materials.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_kal_01",
          contestantNumber: 1,
          name: "Jasmine Joy Villanueva",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Puerto Princesa, Palawan",
          heightCm: 177,
          bio: "Environmental scientist active in mangrove reforestation and sea turtle nesting sanctuary preservation.",
          advocacy: "Mangrove restoration and anti-plastic marine pollution pacts.",
          avatarUrl:
            "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/jasminevillanueva",
          voteCount: 2890,
          categoryNames: ["People's Choice", "Eco-Advocate of the Year"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_kal_02",
          contestantNumber: 2,
          name: "Katrina Chloe Bautista",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Legazpi City, Albay",
          heightCm: 174,
          bio: "Geologist and disaster resilience educator working alongside communities around Mount Mayon.",
          advocacy: "Community climate mitigation and sustainable geothermal stewardship.",
          avatarUrl:
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/katrinabautista",
          voteCount: 2410,
          categoryNames: ["People's Choice", "Best in Upcycled Eco-Gown"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_kal_03",
          contestantNumber: 3,
          name: "Samantha Reese Morales",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Tagaytay City, Cavite",
          heightCm: 172,
          bio: "Permaculture designer encouraging urban balcony farming and localized composting systems.",
          advocacy: "Circular food systems and reduction of metropolitan organic waste.",
          avatarUrl:
            "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/samanthamorales",
          voteCount: 1980,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_kal_04",
          contestantNumber: 1,
          name: "Chloe Mae Sarmiento",
          division: "TEEN",
          divisionName: "Teen Division",
          status: "ACTIVE",
          hometown: "Naga City, Camarines Sur",
          heightCm: 168,
          bio: "High school student council president organizing youth tree-planting expeditions in Mount Isarog.",
          advocacy: "Youth environmental literacy and school zero-waste canteen initiatives.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/chloesarmiento",
          voteCount: 1540,
          categoryNames: ["People's Choice", "Eco-Advocate of the Year"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_kal_05",
          contestantNumber: 2,
          name: "Andrea Gail Soriano",
          division: "TEEN",
          divisionName: "Teen Division",
          status: "ACTIVE",
          hometown: "Calapan, Oriental Mindoro",
          heightCm: 169,
          bio: "Student journalist shedding light on watershed protection and river cleanup drives.",
          advocacy: "Protecting freshwater basins and eliminating single-use plastics in schools.",
          avatarUrl:
            "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/andreasoriano",
          voteCount: 1370,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1524502397800-2eeaad7c3fe5?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 5: Queen of the South 2026 (Live / Published)
    // -------------------------------------------------------------
    {
      id: "evt_queen_05",
      slug: "queen-of-the-south-2026",
      title: "Queen of the South 2026",
      description:
        "The grandest celebration of transgender elegance, equality advocacy, and performing arts excellence in Southern Philippines.",
      bannerUrl:
        "https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 1), // Started 1 day ago
      endsAt: new Date(now + DAY_MS * 2), // Ends in 2 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "LGBTQ+ Division", description: "Official pageant contenders", displayOrder: 1 },
      ],
      awardCategories: [
        {
          name: "People's Choice",
          description: "Awarded to the overall public vote leader.",
          displayOrder: 1,
        },
        {
          name: "Best in Haute Couture",
          description: "High-fashion craftsmanship and stage delivery.",
          displayOrder: 2,
        },
        {
          name: "Trailblazer Advocate",
          description: "Excellence in civil rights, policy change, and inclusion.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_qn_01",
          contestantNumber: 1,
          name: "Roxie Dominique Salvador",
          division: "LGBTQ",
          divisionName: "LGBTQ+ Division",
          status: "ACTIVE",
          hometown: "Davao City, Davao del Sur",
          heightCm: 179,
          bio: "Fashion model and LGBTQ+ human rights speaker advocating for anti-discrimination ordinances.",
          advocacy:
            "Workplace equality, gender sensitivity education, and mental healthcare support.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/roxiesalvador",
          voteCount: 3120,
          categoryNames: ["People's Choice", "Best in Haute Couture"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_qn_02",
          contestantNumber: 2,
          name: "Mikaela Simone Flores",
          division: "LGBTQ",
          divisionName: "LGBTQ+ Division",
          status: "ACTIVE",
          hometown: "General Santos City, South Cotabato",
          heightCm: 176,
          bio: "Creative director and producer bridging community theater with grassroots gender advocacy.",
          advocacy: "Queer performing arts mentorship and community clinic access.",
          avatarUrl:
            "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/mikaelaflores",
          voteCount: 2840,
          categoryNames: ["People's Choice", "Trailblazer Advocate"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_qn_03",
          contestantNumber: 3,
          name: "Celine Antoinette Perez",
          division: "LGBTQ",
          divisionName: "LGBTQ+ Division",
          status: "ACTIVE",
          hometown: "Zamboanga City, Zamboanga del Sur",
          heightCm: 175,
          bio: "Linguistics graduate and bilingual radio host fostering interfaith and queer unity in Western Mindanao.",
          advocacy: "Interfaith dialogue, youth education, and cultural harmony.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/celineperez",
          voteCount: 2690,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_qn_04",
          contestantNumber: 4,
          name: "Nikki Valentina Diaz",
          division: "LGBTQ",
          divisionName: "LGBTQ+ Division",
          status: "ACTIVE",
          hometown: "Cagayan de Oro, Misamis Oriental",
          heightCm: 177,
          bio: "Registered nurse championing inclusive healthcare screening protocols in provincial hospitals.",
          advocacy: "Affordable public healthcare and destigmatizing trans medical counseling.",
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/nikkidiaz",
          voteCount: 2150,
          categoryNames: ["People's Choice", "Trailblazer Advocate"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 6: Bb. Lungsod ng Maynila 2026 (Scheduled / Upcoming)
    // -------------------------------------------------------------
    {
      id: "evt_manila_06",
      slug: "bb-lungsod-ng-maynila-2026",
      title: "Bb. Lungsod ng Maynila 2026",
      description:
        "The historical capital's official pageant spotlighting district heritage, urban renewal, and youth civic engagement.",
      bannerUrl:
        "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now + DAY_MS * 5), // Starts in 5 days
      endsAt: new Date(now + DAY_MS * 14), // Ends in 14 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "District ambassadors", displayOrder: 1 },
      ],
      awardCategories: [
        {
          name: "People's Choice",
          description: "Top candidate voted by citizens across Manila's 6 districts.",
          displayOrder: 1,
        },
        {
          name: "Manila Heritage Ambassador",
          description: "Champion of historical landmark preservation and tourism.",
          displayOrder: 2,
        },
        {
          name: "Best Modern Filipiniana",
          description: "Innovation on national dress by contemporary designers.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_mnl_01",
          contestantNumber: 1,
          name: "Patricia Anne Dela Cruz",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Intramuros, Manila",
          heightCm: 173,
          bio: "Heritage tour guide and architecture graduate advocating for walkable, accessible historic districts.",
          advocacy: "Historic conservation and pedestrian-friendly public spaces.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/patriciadc",
          voteCount: 0,
          categoryNames: ["People's Choice", "Manila Heritage Ambassador"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_mnl_02",
          contestantNumber: 2,
          name: "Bianca Ysabel Lim",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Binondo, Manila",
          heightCm: 170,
          bio: "Cultural historian and food blogger promoting Chinatown heritage cuisine and cultural harmony.",
          advocacy: "Cross-cultural historical archives and heritage preservation.",
          avatarUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/biancalim",
          voteCount: 0,
          categoryNames: ["People's Choice", "Best Modern Filipiniana"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_mnl_03",
          contestantNumber: 3,
          name: "Angela Therese Javier",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Malate, Manila",
          heightCm: 175,
          bio: "Community artist organizing street mural programs and youth theater in bohemian Manila.",
          advocacy: "Grassroots public art and mental wellbeing workshops for urban youths.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/angelajavier",
          voteCount: 0,
          categoryNames: ["People's Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_mnl_04",
          contestantNumber: 4,
          name: "Janelle Rose Valenzuela",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Sampaloc, Manila",
          heightCm: 172,
          bio: "University Belt student activist providing academic tutorials and feeding drives for street kids.",
          advocacy: "Accessible education and nutritious school meal programs.",
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/janellevalenzuela",
          voteCount: 0,
          categoryNames: ["People's Choice", "Manila Heritage Ambassador"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 7: National Campus Idol 2026 (Live / Published)
    // -------------------------------------------------------------
    {
      id: "evt_campus_07",
      slug: "national-campus-idol-2026",
      title: "National Campus Idol 2026",
      description:
        "The ultimate inter-collegiate scholastic leadership and performing arts pageant celebrating exceptional student role models.",
      bannerUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 2), // Started 2 days ago
      endsAt: new Date(now + DAY_MS * 5), // Ends in 5 days
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 10.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Collegiate ambassadresses", displayOrder: 1 },
        { name: "Male Division", description: "Collegiate ambassadors", displayOrder: 2 },
      ],
      awardCategories: [
        {
          name: "Campus Favorite",
          description: "Top candidate voted by students nationwide.",
          displayOrder: 1,
        },
        {
          name: "Best in Talent",
          description: "Exceptional mastery in musical, vocal, or dance performance.",
          displayOrder: 2,
        },
        {
          name: "Scholastic Leadership Award",
          description: "Academic excellence and community service record.",
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_cmp_01",
          contestantNumber: 1,
          name: "Clarisse Angela Cortez",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Quezon City (UP Diliman)",
          heightCm: 171,
          bio: "Broadcast communication junior, debate team captain, and campus radio station manager.",
          advocacy: "Campus press freedom and media literacy workshops for high schoolers.",
          avatarUrl:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/clarissecortez",
          voteCount: 2150,
          categoryNames: ["Campus Favorite", "Scholastic Leadership Award"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_cmp_02",
          contestantNumber: 2,
          name: "Victoria Denise Romero",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Manila (De La Salle University)",
          heightCm: 173,
          bio: "Industrial engineering student and varsity track & field athlete.",
          advocacy: "Women in STEM and youth sports scholarship funds.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/victoriaromero",
          voteCount: 1890,
          categoryNames: ["Campus Favorite", "Best in Talent"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_cmp_03",
          contestantNumber: 1,
          name: "Justin Miguel Ocampo",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Quezon City (Ateneo de Manila)",
          heightCm: 184,
          bio: "Management economics student and jazz ensemble saxophone soloist.",
          advocacy:
            "Music education for public school music programs and mental wellness through arts.",
          avatarUrl:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/justinmocampo",
          voteCount: 1940,
          categoryNames: ["Campus Favorite", "Best in Talent"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_cmp_04",
          contestantNumber: 2,
          name: "Carlos Emmanuel Vega",
          division: "MALE",
          divisionName: "Male Division",
          status: "ACTIVE",
          hometown: "Manila (UST)",
          heightCm: 180,
          bio: "Medical technology senior and university community medical mission coordinator.",
          advocacy:
            "Free blood typing, vaccination drives, and basic medical aid in impoverished communities.",
          avatarUrl:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/carlosvega",
          voteCount: 1630,
          categoryNames: ["Campus Favorite", "Scholastic Leadership Award"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 8: Miss Mindanao Heritage 2026 (Ended / Concluded)
    // -------------------------------------------------------------
    {
      id: "evt_mindanao_08",
      slug: "miss-mindanao-heritage-2026",
      title: "Miss Mindanao Heritage 2026",
      description:
        "An exquisite celebration of Mindanao's cultural tapestry, indigenous fabrics, and cross-cultural peace diplomacy.",
      bannerUrl:
        "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 14), // Started 14 days ago
      endsAt: new Date(now - DAY_MS * 2), // Ended 2 days ago
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Official regional titleholders", displayOrder: 1 },
      ],
      awardCategories: [
        {
          name: "People's Choice Winner",
          description: "Audience choice winner of the grand title.",
          isVotingOpen: false,
          displayOrder: 1,
        },
        {
          name: "Best in Inaul Cultural Attire",
          description: "Showcase of traditional Maguindanaon weave.",
          isVotingOpen: false,
          displayOrder: 2,
        },
        {
          name: "Peace & Unity Ambassador",
          description: "Recognizing outstanding intercommunity peacebuilding.",
          isVotingOpen: false,
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_min_01",
          contestantNumber: 1,
          name: "Fatima Zahra Dimaporo",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Marawi City, Lanao del Sur",
          heightCm: 175,
          bio: "International relations scholar championing Meranaw cultural preservation and youth peace councils.",
          advocacy: "Interfaith peace councils and educational rebuild funds for Marawi youth.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/fatimadimaporo",
          voteCount: 4820,
          categoryNames: [
            "People's Choice Winner",
            "Best in Inaul Cultural Attire",
            "Peace & Unity Ambassador",
          ],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_min_02",
          contestantNumber: 2,
          name: "Stephanie Grace Alonto",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Davao City, Davao del Sur",
          heightCm: 177,
          bio: "Cacao social entrepreneur supporting indigenous Bagobo-Tagabawa farm cooperatives.",
          advocacy: "Ethical fair-trade cacao production and indigenous ancestral domain rights.",
          avatarUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/stephaniealonto",
          voteCount: 4390,
          categoryNames: ["People's Choice Winner", "Best in Inaul Cultural Attire"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_min_03",
          contestantNumber: 3,
          name: "Maria Kristina Tan",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Zamboanga City, Zamboanga del Sur",
          heightCm: 173,
          bio: "Yakan weaving ambassador and advocate for preserving endangered Chavacano literature.",
          advocacy: "Preserving Yakan textile heritage and coastal community livelihood.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/mariatan",
          voteCount: 3910,
          categoryNames: ["People's Choice Winner"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_min_04",
          contestantNumber: 4,
          name: "Nur-Aina Usman",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Cotabato City, Maguindanao del Norte",
          heightCm: 172,
          bio: "Human rights legal aid assistant and advocate for grassroots youth empowerment in BARMM.",
          advocacy: "Access to justice and legal rights seminars for young women in BARMM.",
          avatarUrl:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/nurainausman",
          voteCount: 3450,
          categoryNames: ["People's Choice Winner", "Peace & Unity Ambassador"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 9: Reyna ng Bulakenya 2026 (Draft / Preview)
    // -------------------------------------------------------------
    {
      id: "evt_bulacan_09",
      slug: "reyna-ng-bulakenya-2026",
      title: "Reyna ng Bulakenya 2026",
      description:
        "Commemorating the birthplace of Philippine independence and Singkaban festival arts through a modern provincial beauty and talent pageant.",
      bannerUrl:
        "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now + DAY_MS * 10), // Starts in 10 days
      endsAt: new Date(now + DAY_MS * 20), // Ends in 20 days
      publicationStatus: "DRAFT",
      draftPassphraseHash: "$2b$10$eprnVK4Z.68QvAshPIEtsOTFlV8A59aSuUgdPDp/tL7mK/k1W.22u", // mock hash
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Municipal queens", displayOrder: 1 },
        { name: "Teen Division", description: "Junior representatives", displayOrder: 2 },
      ],
      awardCategories: [
        {
          name: "People's Choice Preview",
          description: "Digital audience award (Preview mode).",
          displayOrder: 1,
        },
        {
          name: "Singkaban Festival Queen",
          description: "Best representation of Bulacan bamboo art tradition.",
          displayOrder: 2,
        },
      ],
      contestants: [
        {
          id: "cst_blk_01",
          contestantNumber: 1,
          name: "Kristine Joy Roxas",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Malolos, Bulacan",
          heightCm: 174,
          bio: "Heritage docent at Barasoain Historical Landmark advocating for Philippine constitutional history education.",
          advocacy: "Youth historical literacy and preservation of historical manuscripts.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/kristineroxas",
          voteCount: 0,
          categoryNames: ["People's Choice Preview", "Singkaban Festival Queen"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_blk_02",
          contestantNumber: 2,
          name: "Joanna Marie Castro",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Meycauayan, Bulacan",
          heightCm: 172,
          bio: "Fine jewelry designer continuing Meycauayan's renowned filigree gold craftsmanship.",
          advocacy: "Sustaining Philippine heritage jewelry artisan guilds.",
          avatarUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/joannacastro",
          voteCount: 0,
          categoryNames: ["People's Choice Preview"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_blk_03",
          contestantNumber: 1,
          name: "Bea Alyssa Bernabe",
          division: "TEEN",
          divisionName: "Teen Division",
          status: "ACTIVE",
          hometown: "San Jose del Monte, Bulacan",
          heightCm: 167,
          bio: "Youth math olympiad finalist inspiring young girls to pursue competitive STEM fields.",
          advocacy: "Robotics and mathematics clubs in provincial public schools.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/beabernabe",
          voteCount: 0,
          categoryNames: ["People's Choice Preview"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517456793572-1d8efd6dc135?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },

    // -------------------------------------------------------------
    // EVENT 10: Sinulog Festival Queen 2026 (Archived)
    // -------------------------------------------------------------
    {
      id: "evt_sinulog_10",
      slug: "sinulog-festival-queen-2026",
      title: "Sinulog Festival Queen 2026",
      description:
        "The grandest festival queen coronation of Cebu's world-famous Sinulog festivities, celebrating devotion, culture, and dance artistry.",
      bannerUrl:
        "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1600&q=80",
      startsAt: new Date(now - DAY_MS * 60), // 60 days ago
      endsAt: new Date(now - DAY_MS * 45), // 45 days ago
      publicationStatus: "ARCHIVED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId,
      divisions: [
        { name: "Female Division", description: "Lead festival dancers", displayOrder: 1 },
      ],
      awardCategories: [
        {
          name: "Grand Festival Queen",
          description: "Top lead dancer and festival ambassador.",
          isVotingOpen: false,
          displayOrder: 1,
        },
        {
          name: "Best in Festival Costume",
          description: "Grandest visual costume design.",
          isVotingOpen: false,
          displayOrder: 2,
        },
        {
          name: "Audience Choice",
          description: "Fan favorite selected by audience ballots.",
          isVotingOpen: false,
          displayOrder: 3,
        },
      ],
      contestants: [
        {
          id: "cst_snl_01",
          contestantNumber: 1,
          name: "Maria Lourdes Cabahug",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Cebu City, Cebu",
          heightCm: 176,
          bio: "Ballet and traditional Filipino folk dancer performing as lead festival queen for Tribu Lumad.",
          advocacy: "Cultural arts scholarships and traditional folk dance preservation.",
          avatarUrl:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/marialourdescabahug",
          voteCount: 5620,
          categoryNames: ["Grand Festival Queen", "Best in Festival Costume", "Audience Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_snl_02",
          contestantNumber: 2,
          name: "Kimberly Anne Teo",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Mandaue City, Cebu",
          heightCm: 173,
          bio: "Choreographer and youth physical education instructor fostering community dance troupes.",
          advocacy: "Youth wellness and cultural performing arts enrichment in public schools.",
          avatarUrl:
            "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/kimberlyanneteo",
          voteCount: 5180,
          categoryNames: ["Grand Festival Queen", "Audience Choice"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
        {
          id: "cst_snl_03",
          contestantNumber: 3,
          name: "Princess Diana Yap",
          division: "FEMALE",
          divisionName: "Female Division",
          status: "ACTIVE",
          hometown: "Lapu-Lapu City, Cebu",
          heightCm: 175,
          bio: "Tourism ambassador and certified scuba divemaster promoting Olango Island eco-tourism.",
          advocacy: "Marine biodiversity and community-led sustainable island tourism.",
          avatarUrl:
            "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
          instagramUrl: "https://instagram.com/princessdianayap",
          voteCount: 4790,
          categoryNames: ["Grand Festival Queen"],
          media: [
            {
              mediaType: "PHOTO",
              url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
              displayOrder: 0,
              aspectRatio: "4:5",
              isCover: true,
            },
          ],
        },
      ],
    },
  ];

  let totalContestantsCreated = 0;

  // Execute seeding sequentially per event
  for (const eventInput of eventsData) {
    const createdEvent = await prisma.event.create({
      data: {
        id: eventInput.id,
        slug: eventInput.slug,
        title: eventInput.title,
        description: eventInput.description,
        bannerUrl: eventInput.bannerUrl,
        startsAt: eventInput.startsAt,
        endsAt: eventInput.endsAt,
        publicationStatus: eventInput.publicationStatus,
        draftPassphraseHash: eventInput.draftPassphraseHash ?? null,
        showResultsOnClose: eventInput.showResultsOnClose ?? true,
        isFreeVotingEnabled: eventInput.isFreeVotingEnabled ?? true,
        dailyFreeVoteLimit: eventInput.dailyFreeVoteLimit ?? 1,
        takeRatePercentage: eventInput.takeRatePercentage ?? 12.0,
        organizerId: eventInput.organizerId,
      },
    });

    // Create divisions
    const divisionRecordMap = new Map<string, string>();
    for (const div of eventInput.divisions) {
      const createdDiv = await prisma.division.create({
        data: {
          eventId: createdEvent.id,
          name: div.name,
          description: div.description,
          displayOrder: div.displayOrder,
        },
      });
      divisionRecordMap.set(div.name, createdDiv.id);
    }

    // Create award categories
    const categoryRecordMap = new Map<string, string>();
    for (const cat of eventInput.awardCategories) {
      const createdCat = await prisma.awardCategory.create({
        data: {
          eventId: createdEvent.id,
          name: cat.name,
          description: cat.description,
          isVotingOpen: cat.isVotingOpen ?? true,
          displayOrder: cat.displayOrder,
        },
      });
      categoryRecordMap.set(cat.name, createdCat.id);
    }

    // Create contestants
    for (const cst of eventInput.contestants) {
      const divisionId = cst.divisionName ? divisionRecordMap.get(cst.divisionName) : null;

      const createdContestant = await prisma.contestant.create({
        data: {
          id: cst.id,
          eventId: createdEvent.id,
          contestantNumber: cst.contestantNumber,
          name: cst.name,
          division: cst.division,
          divisionId: divisionId ?? null,
          status: cst.status ?? "ACTIVE",
          hometown: cst.hometown,
          heightCm: cst.heightCm,
          bio: cst.bio,
          advocacy: cst.advocacy,
          avatarUrl: cst.avatarUrl,
          instagramUrl: cst.instagramUrl ?? null,
          tiktokUrl: cst.tiktokUrl ?? null,
          facebookUrl: cst.facebookUrl ?? null,
          voteCount: cst.voteCount,
        },
      });

      // Create media entries
      if (cst.media && cst.media.length > 0) {
        for (const m of cst.media) {
          await prisma.contestantMedia.create({
            data: {
              contestantId: createdContestant.id,
              mediaType: m.mediaType,
              url: m.url,
              embedPlatform: m.embedPlatform ?? "NONE",
              embedId: m.embedId ?? null,
              displayOrder: m.displayOrder,
              aspectRatio: m.aspectRatio ?? "4:5",
              isCover: m.isCover,
            },
          });
        }
      }

      // Assign categories
      if (cst.categoryNames && cst.categoryNames.length > 0) {
        for (const catName of cst.categoryNames) {
          const awardCategoryId = categoryRecordMap.get(catName);
          if (awardCategoryId) {
            await prisma.contestantCategoryAssignment.create({
              data: {
                contestantId: createdContestant.id,
                awardCategoryId,
              },
            });
          }
        }
      }

      totalContestantsCreated += 1;
    }

    console.log(
      `  ✓ Seeded Event [${createdEvent.publicationStatus}]: "${createdEvent.title}" with ${eventInput.contestants.length} contestants across ${eventInput.divisions.length} divisions`,
    );
  }

  console.log(
    `\n🎉 Database seeding completed successfully! Seeded ${eventsData.length} events and ${totalContestantsCreated} contestants.`,
  );
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
