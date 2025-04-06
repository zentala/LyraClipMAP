/*
  Warnings:

  - You are about to drop the column `audioUrl` on the `Song` table. All the data in the column will be lost.
  - Made the column `lyricsId` on table `Song` required. This step will fail if there are existing NULL values in that column.
  - Made the column `genre` on table `Song` required. This step will fail if there are existing NULL values in that column.
  - Made the column `releaseYear` on table `Song` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_lyricsId_fkey";

-- AlterTable
ALTER TABLE "Lyrics" ALTER COLUMN "sourceUrl" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Song" DROP COLUMN "audioUrl",
ALTER COLUMN "lyricsId" SET NOT NULL,
ALTER COLUMN "genre" SET NOT NULL,
ALTER COLUMN "releaseYear" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_lyricsId_fkey" FOREIGN KEY ("lyricsId") REFERENCES "Lyrics"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
