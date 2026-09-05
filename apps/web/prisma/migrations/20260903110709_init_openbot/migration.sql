-- CreateTable
CREATE TABLE "agent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "currentVersion" INTEGER NOT NULL DEFAULT 0,
    "architectureSummary" TEXT NOT NULL,
    "spec" JSONB NOT NULL,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_session" (
    "id" TEXT NOT NULL,
    "goal" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "iterations" JSONB NOT NULL,
    "targetScore" INTEGER NOT NULL DEFAULT 85,
    "agentId" TEXT,
    "userId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "agent_session_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "agent_userId_idx" ON "agent"("userId");

-- CreateIndex
CREATE INDEX "agent_session_userId_idx" ON "agent_session"("userId");

-- CreateIndex
CREATE INDEX "agent_session_agentId_idx" ON "agent_session"("agentId");

-- AddForeignKey
ALTER TABLE "agent" ADD CONSTRAINT "agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_session" ADD CONSTRAINT "agent_session_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "agent"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_session" ADD CONSTRAINT "agent_session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
