import { NextRequest, NextResponse } from 'next/server';
import { verifyIdToken } from './firebase-admin';
import { prisma } from './prisma';

export interface AuthUser {
  firebaseUid: string;
  email: string;
  userId: string;
  workspaceId: string;
}

/**
 * Authenticates a request and returns user info
 * Returns null if authentication fails
 */
export async function authenticateRequest(req: NextRequest): Promise<AuthUser | null> {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.get('authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.split('Bearer ')[1];

    // Verify token with Firebase Admin
    const decodedToken = await verifyIdToken(token);

    if (!decodedToken) {
      return null;
    }

    // Get or create user in database
    let user = await prisma.user.findUnique({
      where: { firebaseUid: decodedToken.uid },
      include: {
        memberships: {
          include: {
            workspace: true,
          },
          take: 1,
        },
      },
    });

    // If user doesn't exist, create user and workspace
    if (!user) {
      const workspace = await prisma.workspace.create({
        data: {
          name: `${decodedToken.email}'s Workspace`,
        },
      });

      user = await prisma.user.create({
        data: {
          firebaseUid: decodedToken.uid,
          email: decodedToken.email || '',
          name: decodedToken.name || null,
          memberships: {
            create: {
              role: 'owner',
              workspaceId: workspace.id,
            },
          },
        },
        include: {
          memberships: {
            include: {
              workspace: true,
            },
          },
        },
      });
    }

    return {
      firebaseUid: user.firebaseUid,
      email: user.email,
      userId: user.id,
      workspaceId: user.memberships[0].workspaceId,
    };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}
