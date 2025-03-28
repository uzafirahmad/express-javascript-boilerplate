-- AlterTable
ALTER TABLE "User" ALTER COLUMN "account_verification_token" SET DEFAULT gen_random_uuid();
