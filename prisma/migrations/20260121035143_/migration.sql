/*
  Warnings:

  - You are about to drop the column `categoryId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the column `targetId` on the `Event` table. All the data in the column will be lost.
  - You are about to drop the `EventCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Target` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_categoryId_fkey";

-- DropForeignKey
ALTER TABLE "Event" DROP CONSTRAINT "Event_targetId_fkey";

-- AlterTable
ALTER TABLE "Event" DROP COLUMN "categoryId",
DROP COLUMN "targetId";

-- DropTable
DROP TABLE "EventCategory";

-- DropTable
DROP TABLE "Target";
