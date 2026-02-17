// src/lib/eventTracking.ts
import { checkUsageLimit, incrementEventCount } from './usage';
import { db } from './db';

export class TrackingLimitExceeded extends Error {
  constructor(message: string = 'Usage limit exceeded') {
    super(message);
    this.name = 'TrackingLimitExceeded';
  }
}

/**
 * Validates and tracks an event for a website
 * Throws TrackingLimitExceeded if usage limit is reached
 */
export async function validateAndTrackEvent(
  teamId: string,
  websiteId: string
) {
  // Check if usage limit is exceeded
  const limitExceeded = await checkUsageLimit(teamId);
  if (limitExceeded) {
    throw new TrackingLimitExceeded(
      'Monthly event limit exceeded. Upgrade your plan to continue tracking.'
    );
  }

  // Verify the website belongs to this team
  const website = await db.website.findFirst({
    where: {
      id: websiteId,
      team: {
        id: teamId,
      },
    },
  });

  if (!website) {
    throw new Error('Invalid website or team');
  }

  // Increment the event count
  await incrementEventCount(teamId, 1);

  return website;
}

/**
 * Creates a middleware response for usage limit exceeded
 */
export function createUsageLimitResponse() {
  return new Response(
    JSON.stringify({
      error: 'Usage limit exceeded',
      message: 'Monthly event limit exceeded. Upgrade your plan to continue tracking.',
      code: 'USAGE_LIMIT_EXCEEDED',
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': '86400', // Retry after 1 day
      },
    }
  );
}
