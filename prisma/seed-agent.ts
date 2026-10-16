import "dotenv/config";
import { env } from "@/env";
import { db } from "@/lib/db";
import type { PrismaClient } from "@/generated/client/client";
import {
  MOCK_ADMIN_SESSION,
  MOCK_ORGANIZER_SESSION,
  MOCK_VOTER_1_SESSION,
  MOCK_VOTER_2_SESSION,
  MOCK_JUDGE_SESSION,
  MOCK_STATIC_TOKENS,
} from "@/lib/auth/__mocks__/session-fixtures";

export interface AgentSeedManifest {
  timestamp: string;
  environment: string;
  users: {
    admin: {
      userId: string;
      email: string;
      name?: string | undefined;
      role?: string | undefined;
      token: string;
    };
    organizer: {
      userId: string;
      email: string;
      name?: string | undefined;
      role?: string | undefined;
      token: string;
    };
    voter1: {
      userId: string;
      email: string;
      name?: string | undefined;
      role?: string | undefined;
      token: string;
    };
    voter2: {
      userId: string;
      email: string;
      name?: string | undefined;
      role?: string | undefined;
      token: string;
    };
    judge: {
      userId: string;
      email: string;
      name?: string | undefined;
      role?: string | undefined;
      token: string;
    };
  };
  events: {
    live: {
      id: string;
      slug: string;
      title: string;
      publicationStatus: string;
      divisionId: string;
      positionId: string;
      contestants: Array<{
        id: string;
        name: string;
        contestantNumber: number;
        voteCount: number;
      }>;
      awardCategories: Array<{
        id: string;
        name: string;
      }>;
      rubricCriteria: Array<{
        id: string;
        title: string;
        weight: number;
        maxScore: number;
      }>;
      paymentTransactions: Array<{
        id: string;
        referenceNumber: string;
        status: string;
        amountInPhp: number;
      }>;
      votes: Array<{
        id: string;
        voteType: string;
        voteWeight: number;
        contestantId: string;
        voterId: string;
      }>;
    };
    draft: {
      id: string;
      slug: string;
      title: string;
      publicationStatus: string;
      divisionId: string;
      contestants: Array<{
        id: string;
        name: string;
        contestantNumber: number;
      }>;
      awardCategories: Array<{
        id: string;
        name: string;
      }>;
    };
  };
}

export const AGENT_FIXTURE_IDS = {
  events: {
    live: "evt_agent_pageant_live_01",
    draft: "evt_agent_pageant_draft_01",
  },
  slugs: {
    live: "miss-electa-live-2026",
    draft: "miss-electa-draft-2026",
  },
  divisions: {
    liveFemale: "div_agent_live_female",
    draftFemale: "div_agent_draft_female",
  },
  positions: {
    liveQueen: "pos_agent_live_queen",
  },
  awardCategories: {
    livePeoplesChoice: "cat_agent_live_peoples_choice",
    liveEveningGown: "cat_agent_live_best_evening_gown",
    draftPeoplesChoice: "cat_agent_draft_peoples_choice",
  },
  rubricCriteria: {
    poise: "crit_agent_live_poise",
    advocacy: "crit_agent_live_advocacy",
  },
  contestants: {
    live1: "cst_agent_live_01",
    live2: "cst_agent_live_02",
    draft1: "cst_agent_draft_01",
  },
  media: {
    live1Cover: "med_agent_live_01",
    live2Cover: "med_agent_live_02",
    draft1Cover: "med_agent_draft_01",
  },
  categoryAssignments: {
    live1PeoplesChoice: "cca_agent_live_01_cat1",
    live2PeoplesChoice: "cca_agent_live_02_cat1",
    draft1PeoplesChoice: "cca_agent_draft_01_cat1",
  },
  transactions: {
    livePaid1: "tx_agent_paid_01",
  },
  referenceNumbers: {
    livePaid1: "REF-AGENT-TX-001",
  },
  votes: {
    liveBoost1: "vote_agent_boost_01",
    liveFree1: "vote_agent_free_01",
  },
  voterParticipations: {
    vp1: "vp_agent_01",
    vp2: "vp_agent_02",
  },
} as const;

export function enforceSafeEnvironment(nodeEnv: string = env.NODE_ENV): void {
  if (nodeEnv === "production") {
    throw new Error("Refusing to run agent database seeder in production environment!");
  }
}

export async function seedAgentDatabase(
  prismaClient: PrismaClient = db,
): Promise<AgentSeedManifest> {
  enforceSafeEnvironment();

  const now = new Date();
  const startsAt = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000); // 2 days ago
  const endsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000); // in 14 days

  // Step 1: Idempotent clean-up of agent fixtures in reverse dependency order
  const agentEventIds = [AGENT_FIXTURE_IDS.events.live, AGENT_FIXTURE_IDS.events.draft];

  await prismaClient.vote.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.paymentTransaction.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.voterParticipation.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.judgeScore.deleteMany({
    where: {
      criterionId: {
        in: [AGENT_FIXTURE_IDS.rubricCriteria.poise, AGENT_FIXTURE_IDS.rubricCriteria.advocacy],
      },
    },
  });

  await prismaClient.judgeEvaluation.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.rubricCriterion.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.contestantCategoryAssignment.deleteMany({
    where: {
      awardCategoryId: {
        in: [
          AGENT_FIXTURE_IDS.awardCategories.livePeoplesChoice,
          AGENT_FIXTURE_IDS.awardCategories.liveEveningGown,
          AGENT_FIXTURE_IDS.awardCategories.draftPeoplesChoice,
        ],
      },
    },
  });

  await prismaClient.contestantMedia.deleteMany({
    where: {
      contestantId: {
        in: [
          AGENT_FIXTURE_IDS.contestants.live1,
          AGENT_FIXTURE_IDS.contestants.live2,
          AGENT_FIXTURE_IDS.contestants.draft1,
        ],
      },
    },
  });

  await prismaClient.contestant.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.awardCategory.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.eventPosition.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.division.deleteMany({
    where: { eventId: { in: agentEventIds } },
  });

  await prismaClient.event.deleteMany({
    where: { id: { in: agentEventIds } },
  });

  // Step 2: Seed LIVE Event (active voting)
  const liveEvent = await prismaClient.event.create({
    data: {
      id: AGENT_FIXTURE_IDS.events.live,
      slug: AGENT_FIXTURE_IDS.slugs.live,
      title: "Miss Electa Philippines 2026 (Live Mock)",
      description: "Autonomous agent fixture event for live voting, categories, and judging tests.",
      bannerUrl:
        "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=80",
      startsAt,
      endsAt,
      publicationStatus: "PUBLISHED",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      isFreeVotingOnly: false,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId: MOCK_ORGANIZER_SESSION.userId,
      archetype: "PAGEANT",
      allowedEmailDomains: [],
    },
  });

  // Step 3: Seed DRAFT Event
  const draftEvent = await prismaClient.event.create({
    data: {
      id: AGENT_FIXTURE_IDS.events.draft,
      slug: AGENT_FIXTURE_IDS.slugs.draft,
      title: "Miss Electa Philippines 2026 (Draft Preview)",
      description:
        "Autonomous agent fixture event in draft mode for organizer workflow verification.",
      bannerUrl:
        "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
      startsAt: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      endsAt: new Date(now.getTime() + 21 * 24 * 60 * 60 * 1000),
      publicationStatus: "DRAFT",
      showResultsOnClose: true,
      isFreeVotingEnabled: true,
      dailyFreeVoteLimit: 1,
      takeRatePercentage: 12.0,
      organizerId: MOCK_ORGANIZER_SESSION.userId,
      archetype: "PAGEANT",
      allowedEmailDomains: [],
    },
  });

  // Step 4: Seed Divisions
  const liveDivision = await prismaClient.division.create({
    data: {
      id: AGENT_FIXTURE_IDS.divisions.liveFemale,
      eventId: liveEvent.id,
      name: "Female Division",
      description: "Official female pageant candidates",
      displayOrder: 1,
    },
  });

  const draftDivision = await prismaClient.division.create({
    data: {
      id: AGENT_FIXTURE_IDS.divisions.draftFemale,
      eventId: draftEvent.id,
      name: "Female Division",
      description: "Draft candidates",
      displayOrder: 1,
    },
  });

  // Step 5: Seed Positions
  const livePosition = await prismaClient.eventPosition.create({
    data: {
      id: AGENT_FIXTURE_IDS.positions.liveQueen,
      eventId: liveEvent.id,
      name: "Pageant Queen",
      description: "Grand title holder",
      maxSelectionsPerVoter: 1,
      minSelectionsPerVoter: 1,
      displayOrder: 1,
      isVotingOpen: true,
    },
  });

  // Step 6: Seed Award Categories
  const liveCat1 = await prismaClient.awardCategory.create({
    data: {
      id: AGENT_FIXTURE_IDS.awardCategories.livePeoplesChoice,
      eventId: liveEvent.id,
      name: "People's Choice Award",
      description: "Public voting award for fan favorite contestant",
      isVotingOpen: true,
      displayOrder: 1,
    },
  });

  const liveCat2 = await prismaClient.awardCategory.create({
    data: {
      id: AGENT_FIXTURE_IDS.awardCategories.liveEveningGown,
      eventId: liveEvent.id,
      name: "Best in Evening Gown",
      description: "Elegance and poise in official evening gown segment",
      isVotingOpen: true,
      displayOrder: 2,
    },
  });

  const draftCat1 = await prismaClient.awardCategory.create({
    data: {
      id: AGENT_FIXTURE_IDS.awardCategories.draftPeoplesChoice,
      eventId: draftEvent.id,
      name: "People's Choice Award",
      description: "Draft category for review",
      isVotingOpen: false,
      displayOrder: 1,
    },
  });

  // Step 7: Seed Rubric Criteria (for Live Pageant)
  const criterion1 = await prismaClient.rubricCriterion.create({
    data: {
      id: AGENT_FIXTURE_IDS.rubricCriteria.poise,
      eventId: liveEvent.id,
      title: "Poise & Elegance",
      description: "Stage presence, posture, and poise during walk",
      weight: 0.4,
      maxScore: 10,
      displayOrder: 1,
    },
  });

  const criterion2 = await prismaClient.rubricCriterion.create({
    data: {
      id: AGENT_FIXTURE_IDS.rubricCriteria.advocacy,
      eventId: liveEvent.id,
      title: "Advocacy & Impact",
      description: "Communication clarity and passion for chosen social cause",
      weight: 0.6,
      maxScore: 10,
      displayOrder: 2,
    },
  });

  // Step 8: Seed Contestants
  const liveContestant1 = await prismaClient.contestant.create({
    data: {
      id: AGENT_FIXTURE_IDS.contestants.live1,
      eventId: liveEvent.id,
      contestantNumber: 1,
      name: "Aurelia Santos",
      division: "FEMALE",
      divisionId: liveDivision.id,
      status: "ACTIVE",
      hometown: "Cebu City",
      heightCm: 175,
      bio: "Advocate for marine conservation and sustainable ecotourism.",
      advocacy: "Protecting coastal reef systems across the Visayas.",
      avatarUrl:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80",
      voteCount: 10,
      positionId: livePosition.id,
    },
  });

  const liveContestant2 = await prismaClient.contestant.create({
    data: {
      id: AGENT_FIXTURE_IDS.contestants.live2,
      eventId: liveEvent.id,
      contestantNumber: 2,
      name: "Beatriz Reyes",
      division: "FEMALE",
      divisionId: liveDivision.id,
      status: "ACTIVE",
      hometown: "Davao City",
      heightCm: 173,
      bio: "Community organizer and digital education literacy advocate.",
      advocacy: "Bridging the digital divide for indigenous school learners.",
      avatarUrl:
        "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80",
      voteCount: 1,
      positionId: livePosition.id,
    },
  });

  const draftContestant1 = await prismaClient.contestant.create({
    data: {
      id: AGENT_FIXTURE_IDS.contestants.draft1,
      eventId: draftEvent.id,
      contestantNumber: 1,
      name: "Clara Tan",
      division: "FEMALE",
      divisionId: draftDivision.id,
      status: "ACTIVE",
      hometown: "Iloilo City",
      heightCm: 170,
      bio: "Draft candidate profile for organizer setup validation.",
      advocacy: "Art preservation and historical heritage promotion.",
      avatarUrl:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80",
      voteCount: 0,
    },
  });

  // Step 9: Contestant Media
  await prismaClient.contestantMedia.create({
    data: {
      id: AGENT_FIXTURE_IDS.media.live1Cover,
      contestantId: liveContestant1.id,
      mediaType: "PHOTO",
      url: liveContestant1.avatarUrl,
      aspectRatio: "4:5",
      isCover: true,
      displayOrder: 1,
    },
  });

  await prismaClient.contestantMedia.create({
    data: {
      id: AGENT_FIXTURE_IDS.media.live2Cover,
      contestantId: liveContestant2.id,
      mediaType: "PHOTO",
      url: liveContestant2.avatarUrl,
      aspectRatio: "4:5",
      isCover: true,
      displayOrder: 1,
    },
  });

  await prismaClient.contestantMedia.create({
    data: {
      id: AGENT_FIXTURE_IDS.media.draft1Cover,
      contestantId: draftContestant1.id,
      mediaType: "PHOTO",
      url: draftContestant1.avatarUrl,
      aspectRatio: "4:5",
      isCover: true,
      displayOrder: 1,
    },
  });

  // Step 10: Category Assignments
  await prismaClient.contestantCategoryAssignment.create({
    data: {
      id: AGENT_FIXTURE_IDS.categoryAssignments.live1PeoplesChoice,
      contestantId: liveContestant1.id,
      awardCategoryId: liveCat1.id,
    },
  });

  await prismaClient.contestantCategoryAssignment.create({
    data: {
      id: AGENT_FIXTURE_IDS.categoryAssignments.live2PeoplesChoice,
      contestantId: liveContestant2.id,
      awardCategoryId: liveCat1.id,
    },
  });

  await prismaClient.contestantCategoryAssignment.create({
    data: {
      id: AGENT_FIXTURE_IDS.categoryAssignments.draft1PeoplesChoice,
      contestantId: draftContestant1.id,
      awardCategoryId: draftCat1.id,
    },
  });

  // Step 11: Seed Pre-seeded Payment Transaction
  const transaction = await prismaClient.paymentTransaction.create({
    data: {
      id: AGENT_FIXTURE_IDS.transactions.livePaid1,
      referenceNumber: AGENT_FIXTURE_IDS.referenceNumbers.livePaid1,
      eventId: liveEvent.id,
      contestantId: liveContestant1.id,
      awardCategoryId: liveCat1.id,
      voterIdentifier: MOCK_VOTER_1_SESSION.userId,
      amountInPhp: 100.0,
      amountInCents: 10000,
      votesAwarded: 10,
      bonusVotes: 0,
      status: "PAID",
      provider: "MOCK",
      paymentChannel: "GCASH",
      paidAt: now,
    },
  });

  // Step 12: Seed Pre-seeded Votes
  const boostVote = await prismaClient.vote.create({
    data: {
      id: AGENT_FIXTURE_IDS.votes.liveBoost1,
      eventId: liveEvent.id,
      contestantId: liveContestant1.id,
      voterId: MOCK_VOTER_1_SESSION.userId,
      awardCategoryId: liveCat1.id,
      voteType: "BOOST",
      voteWeight: 10,
      paymentTransactionId: transaction.id,
      positionId: livePosition.id,
      createdAt: now,
    },
  });

  const freeVote = await prismaClient.vote.create({
    data: {
      id: AGENT_FIXTURE_IDS.votes.liveFree1,
      eventId: liveEvent.id,
      contestantId: liveContestant2.id,
      voterId: MOCK_VOTER_2_SESSION.userId,
      awardCategoryId: liveCat1.id,
      voteType: "FREE",
      voteWeight: 1,
      positionId: livePosition.id,
      createdAt: now,
    },
  });

  // Step 13: Seed Voter Participation
  await prismaClient.voterParticipation.create({
    data: {
      id: AGENT_FIXTURE_IDS.voterParticipations.vp1,
      eventId: liveEvent.id,
      userId: MOCK_VOTER_1_SESSION.userId,
      votedAt: now,
    },
  });

  await prismaClient.voterParticipation.create({
    data: {
      id: AGENT_FIXTURE_IDS.voterParticipations.vp2,
      eventId: liveEvent.id,
      userId: MOCK_VOTER_2_SESSION.userId,
      votedAt: now,
    },
  });

  return {
    timestamp: now.toISOString(),
    environment: env.NODE_ENV,
    users: {
      admin: {
        userId: MOCK_ADMIN_SESSION.userId,
        email: MOCK_ADMIN_SESSION.email,
        name: MOCK_ADMIN_SESSION.name,
        role: MOCK_ADMIN_SESSION.role,
        token: MOCK_STATIC_TOKENS.admin,
      },
      organizer: {
        userId: MOCK_ORGANIZER_SESSION.userId,
        email: MOCK_ORGANIZER_SESSION.email,
        name: MOCK_ORGANIZER_SESSION.name,
        role: MOCK_ORGANIZER_SESSION.role,
        token: MOCK_STATIC_TOKENS.organizer,
      },
      voter1: {
        userId: MOCK_VOTER_1_SESSION.userId,
        email: MOCK_VOTER_1_SESSION.email,
        name: MOCK_VOTER_1_SESSION.name,
        role: MOCK_VOTER_1_SESSION.role,
        token: MOCK_STATIC_TOKENS.voter1,
      },
      voter2: {
        userId: MOCK_VOTER_2_SESSION.userId,
        email: MOCK_VOTER_2_SESSION.email,
        name: MOCK_VOTER_2_SESSION.name,
        role: MOCK_VOTER_2_SESSION.role,
        token: MOCK_STATIC_TOKENS.voter2,
      },
      judge: {
        userId: MOCK_JUDGE_SESSION.userId,
        email: MOCK_JUDGE_SESSION.email,
        name: MOCK_JUDGE_SESSION.name,
        role: MOCK_JUDGE_SESSION.role,
        token: MOCK_STATIC_TOKENS.judge,
      },
    },
    events: {
      live: {
        id: liveEvent.id,
        slug: liveEvent.slug,
        title: liveEvent.title,
        publicationStatus: liveEvent.publicationStatus,
        divisionId: liveDivision.id,
        positionId: livePosition.id,
        contestants: [
          {
            id: liveContestant1.id,
            name: liveContestant1.name,
            contestantNumber: liveContestant1.contestantNumber,
            voteCount: liveContestant1.voteCount,
          },
          {
            id: liveContestant2.id,
            name: liveContestant2.name,
            contestantNumber: liveContestant2.contestantNumber,
            voteCount: liveContestant2.voteCount,
          },
        ],
        awardCategories: [
          { id: liveCat1.id, name: liveCat1.name },
          { id: liveCat2.id, name: liveCat2.name },
        ],
        rubricCriteria: [
          {
            id: criterion1.id,
            title: criterion1.title,
            weight: Number(criterion1.weight),
            maxScore: criterion1.maxScore,
          },
          {
            id: criterion2.id,
            title: criterion2.title,
            weight: Number(criterion2.weight),
            maxScore: criterion2.maxScore,
          },
        ],
        paymentTransactions: [
          {
            id: transaction.id,
            referenceNumber: transaction.referenceNumber,
            status: transaction.status,
            amountInPhp: Number(transaction.amountInPhp),
          },
        ],
        votes: [
          {
            id: boostVote.id,
            voteType: boostVote.voteType,
            voteWeight: boostVote.voteWeight,
            contestantId: boostVote.contestantId,
            voterId: boostVote.voterId,
          },
          {
            id: freeVote.id,
            voteType: freeVote.voteType,
            voteWeight: freeVote.voteWeight,
            contestantId: freeVote.contestantId,
            voterId: freeVote.voterId,
          },
        ],
      },
      draft: {
        id: draftEvent.id,
        slug: draftEvent.slug,
        title: draftEvent.title,
        publicationStatus: draftEvent.publicationStatus,
        divisionId: draftDivision.id,
        contestants: [
          {
            id: draftContestant1.id,
            name: draftContestant1.name,
            contestantNumber: draftContestant1.contestantNumber,
          },
        ],
        awardCategories: [{ id: draftCat1.id, name: draftCat1.name }],
      },
    },
  };
}

// CLI execution entrypoint
if (typeof process !== "undefined" && process.argv[1]?.includes("seed-agent")) {
  seedAgentDatabase(db)
    .then((manifest) => {
      console.log("\n========================================================");
      console.log("🌱 Electa Headless Agent Mock DB Seeder Complete");
      console.log("========================================================");
      console.log(JSON.stringify(manifest, null, 2));
      console.log("========================================================\n");
      process.exit(0);
    })
    .catch((err) => {
      console.error("❌ Agent DB seed failed:", err);
      process.exit(1);
    });
}
