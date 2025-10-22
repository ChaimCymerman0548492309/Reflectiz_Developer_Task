-- CreateTable
CREATE TABLE "RequestLog" (
    "id" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT,

    CONSTRAINT "RequestLog_pkey" PRIMARY KEY ("id")
);
