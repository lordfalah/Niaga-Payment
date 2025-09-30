/*
  Warnings:

  - You are about to alter the column `quantity` on the `order_item` table. The data in that column could be lost. The data in that column will be cast from `Integer` to `SmallInt`.

*/
-- CreateEnum
CREATE TYPE "public"."TPayment" AS ENUM ('CASH', 'QRIS');

-- DropForeignKey
ALTER TABLE "public"."order_item" DROP CONSTRAINT "order_item_productId_fkey";

-- AlterTable
ALTER TABLE "public"."order" ADD COLUMN     "payment" "public"."TPayment" NOT NULL DEFAULT 'CASH',
ADD COLUMN     "qrisData" TEXT,
ALTER COLUMN "status" SET DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "public"."order_item" ALTER COLUMN "quantity" SET DEFAULT 1,
ALTER COLUMN "quantity" SET DATA TYPE SMALLINT;

-- AddForeignKey
ALTER TABLE "public"."order_item" ADD CONSTRAINT "order_item_productId_fkey" FOREIGN KEY ("productId") REFERENCES "public"."product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
