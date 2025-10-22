/*
  Warnings:

  - Made the column `status` on table `RequestLog` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "RequestLog" ALTER COLUMN "status" SET NOT NULL;
