/*
  Warnings:

  - You are about to drop the column `career` on the `Profile` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `Profile` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "career",
DROP COLUMN "name",
ADD COLUMN     "bio" TEXT;
