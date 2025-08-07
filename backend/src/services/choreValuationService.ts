import { prisma } from '../models';

// Define SkillLevel enum to match Prisma schema
enum SkillLevel {
  BASIC = 'BASIC',
  INTERMEDIATE = 'INTERMEDIATE', 
  ADVANCED = 'ADVANCED'
}

export class ChoreValuationService {
  private static getSkillBonus(skillLevel: SkillLevel): number {
    switch (skillLevel) {
      case SkillLevel.BASIC:
        return 0;
      case SkillLevel.INTERMEDIATE:
        return 0.15; // 15% bonus
      case SkillLevel.ADVANCED:
        return 0.30; // 30% bonus
      default:
        return 0;
    }
  }

  private static async getRarityBonus(
    choreId: string,
    completedBy: string,
    householdId: string,
    skillLevel: SkillLevel
  ): Promise<number> {
    if (skillLevel === SkillLevel.BASIC) {
      return 0;
    }

    const householdMembers = await prisma.user.findMany({
      where: { householdId },
    });

    if (householdMembers.length < 2) {
      return 0;
    }

    const skillfulMembers = await prisma.completedChore.findMany({
      where: {
        householdId,
        chore: {
          skillLevel,
        },
      },
      distinct: ['completedBy'],
      select: {
        completedBy: true,
      },
    });

    const uniqueSkillfulMembers = new Set(skillfulMembers.map((sc: any) => sc.completedBy));
    uniqueSkillfulMembers.add(completedBy);

    if (uniqueSkillfulMembers.size === 1 && householdMembers.length === 2) {
      return 0.25; // 25% rarity bonus
    }

    return 0;
  }

  public static async calculateChoreValue(
    choreId: string,
    completedBy: string,
    timeSpent: number
  ): Promise<number> {
    const chore = await prisma.chore.findUnique({
      where: { id: choreId },
      include: { household: true },
    });

    if (!chore) {
      throw new Error('Chore not found');
    }

    const baseRate = chore.household.baseRate;
    const skillLevel = chore.skillLevel as SkillLevel;
    const skillBonus = this.getSkillBonus(skillLevel);
    const rarityBonus = await this.getRarityBonus(
      choreId,
      completedBy,
      chore.householdId,
      skillLevel
    );

    const baseValue = baseRate * timeSpent;
    const skillBonusAmount = baseValue * skillBonus;
    const rarityBonusAmount = baseValue * rarityBonus;

    return baseValue + skillBonusAmount + rarityBonusAmount;
  }
}