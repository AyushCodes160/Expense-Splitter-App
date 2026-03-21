import { prisma } from '../config/db';

export class GroupService {
  static async listUserGroups(userId: string) {
    const userGroups = await prisma.userGroup.findMany({
      where: { userId },
      include: {
        group: true
      }
    });
    return userGroups.map(ug => ug.group);
  }

  static async createGroup(userId: string, name: string, description?: string) {
    const group = await prisma.group.create({
      data: {
        name,
        description,
        createdBy: userId,
        members: {
          create: {
            userId
          }
        }
      }
    });
    return group;
  }

  static async getGroupDetails(groupId: string) {
    return prisma.group.findUnique({
      where: { id: groupId },
      include: {
        members: {
          include: {
            user: { select: { id: true, username: true, avatarUrl: true } }
          }
        }
      }
    });
  }

  static async addMember(groupId: string, friendId: string) {
    return prisma.userGroup.create({
      data: {
        groupId,
        userId: friendId
      }
    });
  }
}
