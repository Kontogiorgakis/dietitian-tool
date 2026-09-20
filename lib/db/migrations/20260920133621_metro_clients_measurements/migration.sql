/*
  Warnings:

  - You are about to drop the `todos` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('FEMALE', 'MALE', 'OTHER');

-- CreateEnum
CREATE TYPE "GoalDirection" AS ENUM ('LOSE', 'GAIN', 'MAINTAIN');

-- DropForeignKey
ALTER TABLE "todos" DROP CONSTRAINT "todos_user_id_fkey";

-- DropTable
DROP TABLE "todos";

-- CreateTable
CREATE TABLE "clients" (
    "id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "sex" "Sex" NOT NULL,
    "birth_date" DATE NOT NULL,
    "height_cm" DOUBLE PRECISION NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "goal_text" TEXT,
    "target_weight_kg" DOUBLE PRECISION,
    "goal_direction" "GoalDirection" NOT NULL DEFAULT 'LOSE',
    "activity_level" TEXT,
    "medical_history" TEXT,
    "medication" TEXT,
    "allergies" TEXT,
    "intolerances" TEXT,
    "conditions" TEXT,
    "diet_preferences" TEXT,
    "habits" TEXT,
    "history_completed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "measurements" (
    "id" TEXT NOT NULL,
    "client_id" TEXT NOT NULL,
    "visited_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "draft" BOOLEAN NOT NULL DEFAULT true,
    "weight_kg" DOUBLE PRECISION,
    "waist_cm" DOUBLE PRECISION,
    "hip_cm" DOUBLE PRECISION,
    "chest_cm" DOUBLE PRECISION,
    "arm_cm" DOUBLE PRECISION,
    "thigh_cm" DOUBLE PRECISION,
    "body_fat_pct" DOUBLE PRECISION,
    "lean_mass_kg" DOUBLE PRECISION,
    "water_pct" DOUBLE PRECISION,
    "skinfold_biceps_mm" DOUBLE PRECISION,
    "skinfold_triceps_mm" DOUBLE PRECISION,
    "skinfold_subscapular_mm" DOUBLE PRECISION,
    "skinfold_suprailiac_mm" DOUBLE PRECISION,
    "blood_pressure" TEXT,
    "pulse_bpm" INTEGER,
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "measurements_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "clients_last_name_first_name_idx" ON "clients"("last_name", "first_name");

-- CreateIndex
CREATE INDEX "measurements_client_id_visited_at_idx" ON "measurements"("client_id", "visited_at");

-- AddForeignKey
ALTER TABLE "measurements" ADD CONSTRAINT "measurements_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE CASCADE;
