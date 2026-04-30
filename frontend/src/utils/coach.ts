export function getCoachAdvice(user: any) {
  const xp = user.xp || 0;
  const streak = user.streak || 0;
  const problems = user.problems || 0;

  if (streak === 0) {
    return "Start your streak today. Small wins matter.";
  }

  if (problems < 2) {
    return "You need more practice. Solve at least 3 problems.";
  }

  if (xp > 300) {
    return "Great progress. Push to reach the next level.";
  }

  return "Stay consistent. You're improving.";
}

export function generatePlan(user: any) {
  const plan: string[] = [];

  if ((user.problems || 0) < 3) {
    plan.push("Solve 3 DSA problems");
  }

  if (!user.morningDone) {
    plan.push("Complete morning session");
  }

  if (!user.eveningDone) {
    plan.push("Complete evening session");
  }

  if ((user.streak || 0) < 5) {
    plan.push("Maintain streak today");
  }

  if (plan.length === 0) {
    plan.push("Review advanced concepts");
    plan.push("Take a rest or focus on projects");
  }

  return plan;
}

export function calculateXP(user: any, stats: any) {
  // +40 per session, +10 per problem
  const sessions = stats?.totalCompleted || 0;
  const problems = stats?.totalProblems || 0;
  return (sessions * 40) + (problems * 10);
}

export function getLevel(xp: number) {
  if (xp < 100) return "Beginner";
  if (xp < 300) return "Intermediate";
  if (xp < 700) return "Pro";
  return "Master";
}
