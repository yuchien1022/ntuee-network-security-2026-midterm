import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function parseArgs(argv) {
  const args = { username: null, email: null };

  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i] === "--username") {
      args.username = argv[i + 1]?.trim() || null;
      i += 1;
    } else if (argv[i] === "--email") {
      args.email = argv[i + 1]?.trim().toLowerCase() || null;
      i += 1;
    }
  }

  return args;
}

async function main() {
  const { username, email } = parseArgs(process.argv.slice(2));

  if ((!username && !email) || (username && email)) {
    throw new Error("Usage: node scripts/set-owner.mjs --username <username> OR --email <email>");
  }

  const where = username ? { username } : { email };

  const targetUser = await prisma.user.findUnique({ where, select: { id: true, username: true, email: true } });
  if (!targetUser) {
    throw new Error("Target user not found. Create the account first, then set it as owner.");
  }

  await prisma.$transaction(async (tx) => {
    await tx.user.updateMany({
      where: { role: "owner", NOT: { id: targetUser.id } },
      data: { role: "user" },
    });

    await tx.user.update({
      where: { id: targetUser.id },
      data: { role: "owner" },
    });
  });

  console.log(`Owner account set to ${targetUser.username} (${targetUser.email}).`);
}

main()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
