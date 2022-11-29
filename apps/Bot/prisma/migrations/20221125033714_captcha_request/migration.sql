-- CreateTable
CREATE TABLE "CaptchaRequest" (
    "id" TEXT NOT NULL,
    "userId" VARCHAR(18) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "guildId" VARCHAR(18) NOT NULL,

    CONSTRAINT "CaptchaRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CaptchaRequest_userId_key" ON "CaptchaRequest"("userId");
