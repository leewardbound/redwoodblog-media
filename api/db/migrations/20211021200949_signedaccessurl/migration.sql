/*
  Warnings:

  - You are about to drop the column `publicURLExpires` on the `File` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "File" DROP COLUMN "publicURLExpires",
ADD COLUMN     "signedAccessURL" TEXT,
ADD COLUMN     "signedAccessURLExpires" TIMESTAMP(3);
