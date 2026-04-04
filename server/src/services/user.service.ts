import { prisma } from '../config/db';

export class UserService {
  static async getUserById(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, username: true, fullName: true, email: true, avatarUrl: true }
    });
    return user ? { ...user, full_name: user.fullName } : null;
  }

  static async updateProfile(userId: string, data: { username?: string; full_name?: string }) {
    const updateData: any = {};
    if (data.username) updateData.username = data.username;
    if (data.full_name !== undefined) updateData.fullName = data.full_name;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, fullName: true, email: true, avatarUrl: true }
    });
    return { ...user, full_name: user.fullName };
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
