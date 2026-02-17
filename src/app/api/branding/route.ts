// src/app/api/branding/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET /api/branding - Get tenant branding
export async function GET(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id');
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    let branding = await db.tenantBranding.findUnique({
      where: { teamId },
    });

    if (!branding) {
      // Create default branding
      branding = await db.tenantBranding.create({
        data: {
          id: crypto.randomUUID(),
          teamId,
          primaryColor: '#0066CC',
          secondaryColor: '#F0F4F8',
        },
      });
    }

    return NextResponse.json(branding);
  } catch (error) {
    console.error('Error fetching branding:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/branding - Update tenant branding
export async function PUT(request: NextRequest) {
  try {
    const teamId = request.headers.get('x-team-id');
    if (!teamId) {
      return NextResponse.json({ error: 'Team ID required' }, { status: 400 });
    }

    const body = await request.json();
    const { logoUrl, primaryColor, secondaryColor, customDomain, faviconUrl } = body;

    let branding = await db.tenantBranding.findUnique({
      where: { teamId },
    });

    if (!branding) {
      branding = await db.tenantBranding.create({
        data: {
          id: crypto.randomUUID(),
          teamId,
          logoUrl: logoUrl || null,
          primaryColor: primaryColor || '#0066CC',
          secondaryColor: secondaryColor || '#F0F4F8',
          customDomain: customDomain || null,
          faviconUrl: faviconUrl || null,
        },
      });
    } else {
      branding = await db.tenantBranding.update({
        where: { id: branding.id },
        data: {
          ...(logoUrl !== undefined && { logoUrl: logoUrl || null }),
          ...(primaryColor !== undefined && { primaryColor }),
          ...(secondaryColor !== undefined && { secondaryColor }),
          ...(customDomain !== undefined && { customDomain: customDomain || null }),
          ...(faviconUrl !== undefined && { faviconUrl: faviconUrl || null }),
        },
      });
    }

    return NextResponse.json(branding);
  } catch (error: any) {
    console.error('Error updating branding:', error);
    
    // Handle unique constraint violation for custom domain
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Custom domain already in use' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
