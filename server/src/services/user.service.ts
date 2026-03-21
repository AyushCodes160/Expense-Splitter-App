import { prisma } from '../config/db';

export class UserService {
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, email: true, avatarUrl: true }
    });
    return user;
  }

  static async searchUsers(query: string) {
    return prisma.user.findMany({
      where: {
        OR: [
          { username: { contains: query } },
          { email: { contains: query } }
        ]
      },
      select: { id: true, username: true, avatarUrl: true },
      take: 10
    });
  }
}
