/*
  Warnings:

  - You are about to drop the column `farmSize` on the `Farm` table. All the data in the column will be lost.
  - You are about to drop the column `farmerId` on the `Farm` table. All the data in the column will be lost.
  - You are about to drop the `Farmer` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location` to the `Farm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Farm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `Farm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Farm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Farm" DROP CONSTRAINT "Farm_farmerId_fkey";

-- DropForeignKey
ALTER TABLE "Farmer" DROP CONSTRAINT "Farmer_userId_fkey";

-- AlterTable
ALTER TABLE "Farm" DROP COLUMN "farmSize",
DROP COLUMN "farmerId",
ADD COLUMN     "location" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "size" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "userId" TEXT NOT NULL;

-- DropTable
DROP TABLE "Farmer";

-- AddForeignKey
ALTER TABLE "Farm" ADD CONSTRAINT "Farm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
