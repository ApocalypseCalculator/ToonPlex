-- CreateTable
CREATE TABLE "Favourite" (
    "userid" INTEGER NOT NULL,
    "toonid" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Favourite_pkey" PRIMARY KEY ("userid","toonid")
);

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Favourite" ADD CONSTRAINT "Favourite_toonid_fkey" FOREIGN KEY ("toonid") REFERENCES "Toon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
