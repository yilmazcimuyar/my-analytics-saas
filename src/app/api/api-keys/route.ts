// src/app/api/api-keys/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

function generateApiKey(): { key: string; secret: string } {
  const key = 'ak_' + crypto.randomBytes(16).toString('hex');
  const secret = crypto.randomBytes(32).toString('hex');
  return { key, secret };
}

// GET /api/api-keys - List API keys for team
export async function GET(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id');
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const apiKeys = await db.apiKey.findMany({
      where: { teamId },
      select: {
        id: true,
        name: true,
        key: true,
        isActive: true,
        lastUsedAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json(apiKeys);
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/api-keys - Create new API key
export async function POST(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id');
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { key, secret } = generateApiKey();

    const apiKey = await db.apiKey.create({
      data: {
        id: crypto.randomUUID(),
        teamId,
        name,
        key,
        secret,
        isActive: true,
      },
    });

    // Return secret only on creation (for security)
    return NextResponse.json(
      {
        id: apiKey.id,
        name: apiKey.name,
        key: apiKey.key,
        secret: apiKey.secret, // Only shown once
        isActive: apiKey.isActive,
        createdAt: apiKey.createdAt,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/api-keys/[id] - Delete API key
export async function DELETE(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id');
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'API key ID required' },
        { status: 400 }
      );
    }

    const apiKey = await db.apiKey.findUnique({
      where: { id },
    });

    if (!apiKey || apiKey.teamId !== teamId) {
      return NextResponse.json(
        { error: 'API key not found' },
        { status: 404 }
      );
    }

    await db.apiKey.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
