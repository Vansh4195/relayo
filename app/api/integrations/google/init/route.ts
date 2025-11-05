import { NextRequest, NextResponse } from 'next/server';
import { authenticateRequest } from '@/lib/auth-middleware';
import { getAuthUrl } from '@/lib/google';

export async function GET(req: NextRequest) {
  const user = await authenticateRequest(req);

  if (!user) {
    return NextResponse.json(
      { error: 'Missing or invalid authorization header' },
      { status: 401 }
    );
  }

  try {
    // Debug: Check environment variables
    console.log('Environment variables check:');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'MISSING');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? 'SET' : 'MISSING');
    console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);

    // Generate OAuth URL
    const authUrl = getAuthUrl();

    console.log('Generated OAuth URL:', authUrl);

    // Store workspaceId in state parameter (you might want to encrypt this)
    const state = Buffer.from(
      JSON.stringify({ workspaceId: user.workspaceId })
    ).toString('base64');

    const urlWithState = `${authUrl}&state=${state}`;

    console.log('Final URL with state:', urlWithState);

    return NextResponse.json({ url: urlWithState });
  } catch (error) {
    console.error('Error initializing Google OAuth:', error);
    return NextResponse.json(
      { error: 'Failed to initialize OAuth' },
      { status: 500 }
    );
  }
}
