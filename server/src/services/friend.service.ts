import { prisma } from '../config/db';

export class FriendService {
  static async sendFriendRequest(userId: string, friendId: string) {
    if (userId === friendId) throw new Error("Cannot add yourself");

    // Check if a request already exists
    const existing = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: userId, user2Id: friendId },
          { user1Id: friendId, user2Id: userId }
        ]
      }
    });

    if (existing) {
      if (existing.status === 'accepted') throw new Error("Already friends");
      throw new Error("Friend request already exists");
    }

    return prisma.friendship.create({
      data: {
        user1Id: userId,
        user2Id: friendId,
        status: 'pending'
      }
    });
  }

  static async acceptFriendRequest(userId: string, requestId: string) {
    const request = await prisma.friendship.findUnique({ where: { id: requestId } });
    if (!request) throw new Error("Request not found");

    if (request.user2Id !== userId) {
      throw new Error("You can only accept requests sent to you");
    }

    return prisma.friendship.update({
      where: { id: requestId },
      data: { status: 'accepted' }
    });
  }

  static async getFriends(userId: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'accepted',
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: { select: { id: true, username: true, avatarUrl: true } },
        user2: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    return friendships.map(f => {
      const friend = f.user1Id === userId ? f.user2 : f.user1;
      return {
        friendshipId: f.id,
        ...friend
      };
    });
  }

  static async getPendingRequests(userId: string) {
    const requests = await prisma.friendship.findMany({
      where: {
        user2Id: userId,
        status: 'pending'
      },
      include: {
        user1: { select: { id: true, username: true, avatarUrl: true } }
      }
    });

    return requests.map(f => ({
      requestId: f.id,
      sender: f.user1,
      createdAt: f.createdAt
    }));
  }
}
