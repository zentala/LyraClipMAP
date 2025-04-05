/*
  Warnings:

  - You are about to drop the column `content` on the `Lyrics` table. All the data in the column will be lost.
  - You are about to drop the column `lrc` on the `Lyrics` table. All the data in the column will be lost.
  - Added the required column `text` to the `Lyrics` table without a default value. This is not possible if the table is not empty.
  - Made the column `duration` on table `Song` required. This step will fail if there are existing NULL values in that column.
  - Made the column `audioUrl` on table `Song` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Song" DROP CONSTRAINT "Song_artistId_fkey";

-- DropIndex
DROP INDEX "Song_lyricsId_key";

-- AlterTable
ALTER TABLE "Lyrics" DROP COLUMN "content",
DROP COLUMN "lrc",
ADD COLUMN     "language" TEXT,
ADD COLUMN     "sourceUrl" TEXT,
ADD COLUMN     "text" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Song" ADD COLUMN     "genre" TEXT,
ADD COLUMN     "releaseYear" INTEGER,
ALTER COLUMN "duration" SET NOT NULL,
ALTER COLUMN "audioUrl" SET NOT NULL;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "Artist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
