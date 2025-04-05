/*
  Warnings:

  - Changed the type of `permission` on the `PlaylistShare` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PlaylistPermission" AS ENUM ('VIEW', 'EDIT');

-- AlterTable
ALTER TABLE "PlaylistShare" DROP COLUMN "permission",
ADD COLUMN     "permission" "PlaylistPermission" NOT NULL;
