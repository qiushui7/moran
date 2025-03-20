-- CreateTable
CREATE TABLE "Profile" (
    "id" TEXT NOT NULL,
    "signature" TEXT,
    "githubUrl" TEXT,
    "linkedinUrl" TEXT,
    "contactEmail" TEXT,
    "name" TEXT NOT NULL,
    "career" TEXT,
    "title" TEXT NOT NULL DEFAULT 'Welcome to my blog!',
    "userId" TEXT NOT NULL,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
