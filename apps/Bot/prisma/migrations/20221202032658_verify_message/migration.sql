-- CreateTable
CREATE TABLE "verify_messages" (
    "id" VARCHAR(20) NOT NULL,
    "channelId" VARCHAR(20) NOT NULL,
    "guildId" VARCHAR(20) NOT NULL,
    "content" VARCHAR(2000) NOT NULL,

    CONSTRAINT "verify_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "verify_messages_guildId_key" ON "verify_messages"("guildId");
