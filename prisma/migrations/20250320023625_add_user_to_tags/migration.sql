/*
  Warnings:

  - A unique constraint covering the columns `[slug,userId]` on the table `Post` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[slug,userId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Tag` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `userId` to the `Tag` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "Tag_name_key";

-- DropIndex
DROP INDEX "Tag_slug_key";

-- DropIndex
DROP INDEX "Post_slug_key";

-- 创建默认管理员用户（如果不存在）
INSERT INTO "User" ("id", "name", "email", "role") 
SELECT 'default-admin', '管理员', 'admin@example.com', 'admin'
WHERE NOT EXISTS (SELECT 1 FROM "User" WHERE "email" = 'admin@example.com');

-- 为所有现有标签设置默认用户ID
ALTER TABLE "Tag" ADD COLUMN "userId" TEXT;
UPDATE "Tag" SET "userId" = (SELECT "id" FROM "User" LIMIT 1);
ALTER TABLE "Tag" ALTER COLUMN "userId" SET NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Post_slug_userId_key" ON "Post"("slug", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_slug_userId_key" ON "Tag"("slug", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_userId_key" ON "Tag"("name", "userId");

-- AddForeignKey
ALTER TABLE "Tag" ADD CONSTRAINT "Tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
