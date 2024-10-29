-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PAYROLL_STAFF', 'SUPERVISOR', 'ASSOCIATE');

-- CreateEnum
CREATE TYPE "MissPunchReason" AS ENUM ('FORGOT_TIME_CARD', 'LOST_TIME_CARD', 'FORGOT_TO_PUNCH', 'IN_THE_FIELD', 'OTHER');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "sso" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TimePunch" (
    "id" TEXT NOT NULL,
    "employeeId" TEXT NOT NULL,
    "supervisorId" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "timeIn" TIMESTAMP(3),
    "timeOut" TIMESTAMP(3),
    "mealIn" TIMESTAMP(3),
    "mealOut" TIMESTAMP(3),
    "missPunchReason" "MissPunchReason",
    "otherReason" TEXT,
    "location" TEXT NOT NULL,
    "amount" TEXT,
    "signature" TEXT,
    "signatureDate" TIMESTAMP(3),
    "isDigitallySigned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimePunch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UploadedDocument" (
    "id" TEXT NOT NULL,
    "timePunchId" TEXT NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UploadedDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "timePunchId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "changes" JSONB NOT NULL,
    "performedBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_sso_key" ON "User"("sso");

-- CreateIndex
CREATE UNIQUE INDEX "UploadedDocument_timePunchId_key" ON "UploadedDocument"("timePunchId");

-- AddForeignKey
ALTER TABLE "TimePunch" ADD CONSTRAINT "TimePunch_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimePunch" ADD CONSTRAINT "TimePunch_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UploadedDocument" ADD CONSTRAINT "UploadedDocument_timePunchId_fkey" FOREIGN KEY ("timePunchId") REFERENCES "TimePunch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_timePunchId_fkey" FOREIGN KEY ("timePunchId") REFERENCES "TimePunch"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
