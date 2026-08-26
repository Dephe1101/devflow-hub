-- CreateTable
CREATE TABLE "user" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "passwordHash" TEXT,
    "authProvider" TEXT DEFAULT 'LOCAL',
    "googleId" TEXT,
    "githubId" TEXT,
    "avatarUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "agent_device" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeen" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "agent_device_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "description" VARCHAR(500),
    "color" VARCHAR(7),
    "icon" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPinned" BOOLEAN NOT NULL DEFAULT false,
    "lastLaunchedAt" TIMESTAMP(3),
    "launchCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workspace_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource" (
    "id" UUID NOT NULL,
    "createdByUserId" UUID NOT NULL,
    "type" VARCHAR(20) NOT NULL,
    "value" TEXT NOT NULL,
    "displayName" VARCHAR(100),
    "faviconUrl" TEXT,
    "healthStatus" VARCHAR(20) DEFAULT 'UNKNOWN',
    "lastHealthCheck" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_resource" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isEnabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "workspace_resource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag" (
    "id" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "name" VARCHAR(50) NOT NULL,
    "color" VARCHAR(7),

    CONSTRAINT "tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resource_tag" (
    "id" UUID NOT NULL,
    "resourceId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "resource_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workspace_tag" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "tagId" UUID NOT NULL,

    CONSTRAINT "workspace_tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "note" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "resourceId" UUID,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT,
    "type" VARCHAR(20) NOT NULL,
    "category" VARCHAR(50),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "launch_log" (
    "id" UUID NOT NULL,
    "workspaceId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "deviceId" UUID,
    "results" JSONB,
    "webUrlsOpened" INTEGER NOT NULL DEFAULT 0,
    "localPathsOpened" INTEGER NOT NULL DEFAULT 0,
    "failedCount" INTEGER NOT NULL DEFAULT 0,
    "status" VARCHAR(20) NOT NULL,
    "launchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "launch_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_googleId_key" ON "user"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_githubId_key" ON "user"("githubId");

-- CreateIndex
CREATE UNIQUE INDEX "agent_device_deviceId_key" ON "agent_device"("deviceId");

-- CreateIndex
CREATE INDEX "agent_device_userId_idx" ON "agent_device"("userId");

-- CreateIndex
CREATE INDEX "idx_workspace_user_pinned" ON "workspace"("userId", "isPinned", "sortOrder");

-- CreateIndex
CREATE INDEX "idx_resource_user_type" ON "resource"("createdByUserId", "type");

-- CreateIndex
CREATE INDEX "idx_workspace_resource_order" ON "workspace_resource"("workspaceId", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_resource_workspaceId_resourceId_key" ON "workspace_resource"("workspaceId", "resourceId");

-- CreateIndex
CREATE UNIQUE INDEX "tag_userId_name_key" ON "tag"("userId", "name");

-- CreateIndex
CREATE UNIQUE INDEX "resource_tag_resourceId_tagId_key" ON "resource_tag"("resourceId", "tagId");

-- CreateIndex
CREATE UNIQUE INDEX "workspace_tag_workspaceId_tagId_key" ON "workspace_tag"("workspaceId", "tagId");

-- CreateIndex
CREATE INDEX "idx_note_workspace_type" ON "note"("workspaceId", "type");

-- CreateIndex
CREATE INDEX "idx_note_resource" ON "note"("resourceId");

-- CreateIndex
CREATE INDEX "idx_launch_log_workspace" ON "launch_log"("workspaceId", "launchedAt");

-- CreateIndex
CREATE INDEX "idx_launch_log_user" ON "launch_log"("userId", "launchedAt");

-- AddForeignKey
ALTER TABLE "agent_device" ADD CONSTRAINT "agent_device_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace" ADD CONSTRAINT "workspace_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_resource" ADD CONSTRAINT "workspace_resource_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_resource" ADD CONSTRAINT "workspace_resource_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag" ADD CONSTRAINT "tag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_tag" ADD CONSTRAINT "resource_tag_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resource_tag" ADD CONSTRAINT "resource_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_tag" ADD CONSTRAINT "workspace_tag_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workspace_tag" ADD CONSTRAINT "workspace_tag_tagId_fkey" FOREIGN KEY ("tagId") REFERENCES "tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "note" ADD CONSTRAINT "note_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launch_log" ADD CONSTRAINT "launch_log_workspaceId_fkey" FOREIGN KEY ("workspaceId") REFERENCES "workspace"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "launch_log" ADD CONSTRAINT "launch_log_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
