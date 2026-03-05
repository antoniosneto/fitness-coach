-- CreateTable
CREATE TABLE "training_preferences" (
    "training_preference_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "machines_only" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_preferences_pkey" PRIMARY KEY ("training_preference_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "training_preferences_user_id_key" ON "training_preferences"("user_id");

-- AddForeignKey
ALTER TABLE "training_preferences" ADD CONSTRAINT "training_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("user_id") ON DELETE RESTRICT ON UPDATE CASCADE;
