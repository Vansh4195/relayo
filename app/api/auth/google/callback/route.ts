import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getTokensFromCode } from '@/lib/google';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/dashboard/settings?error=missing_params', req.url)
      );
    }

    // Decode state to get workspaceId
    const { workspaceId } = JSON.parse(
      Buffer.from(state, 'base64').toString('utf-8')
    );

    // Exchange code for tokens
    const tokens = await getTokensFromCode(code);

    // Store or update integration
    const existingIntegration = await prisma.integration.findFirst({
      where: {
        workspaceId,
        provider: 'GOOGLE',
      },
    });

    if (existingIntegration) {
      await prisma.integration.update({
        where: { id: existingIntegration.id },
        data: {
          googleAccessToken: tokens.access_token || null,
          googleRefreshToken: tokens.refresh_token || null,
          googleExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    } else {
      await prisma.integration.create({
        data: {
          workspaceId,
          provider: 'GOOGLE',
          label: 'Google Account',
          googleAccessToken: tokens.access_token || null,
          googleRefreshToken: tokens.refresh_token || null,
          googleExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
        },
      });
    }

    // Redirect back to settings with success
    return NextResponse.redirect(
      new URL('/dashboard/settings?google=connected', req.url)
    );
  } catch (error) {
    console.error('Error in Google OAuth callback:', error);
    return NextResponse.redirect(
      new URL('/dashboard/settings?error=oauth_failed', req.url)
    );
  }
}
