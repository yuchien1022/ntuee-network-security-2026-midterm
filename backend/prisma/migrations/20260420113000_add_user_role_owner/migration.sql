-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('owner', 'user');

-- AlterTable
ALTER TABLE "User"
ADD COLUMN "role" "UserRole" NOT NULL DEFAULT 'user';

-- Ensure at most one owner account can exist.
CREATE UNIQUE INDEX "User_single_owner_idx" ON "User" ("role") WHERE "role" = 'owner';
