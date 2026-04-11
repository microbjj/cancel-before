-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "lastSeenDevice" TEXT,
ADD COLUMN     "lastSeenIp" TEXT,
ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER';
