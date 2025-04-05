/*
  Warnings:

  - Made the column `language` on table `Lyrics` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sourceUrl` on table `Lyrics` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Lyrics" ALTER COLUMN "language" SET NOT NULL,
ALTER COLUMN "sourceUrl" SET NOT NULL;
