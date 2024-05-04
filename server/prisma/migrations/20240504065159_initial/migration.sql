-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ONGOING', 'COMPLETED', 'HIATUS', 'DISCONTINUED');

-- CreateEnum
CREATE TYPE "UploadStatus" AS ENUM ('PENDING', 'UPLOADED', 'FAILED', 'DELETED');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "registertime" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Permissions" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "create" BOOLEAN NOT NULL DEFAULT false,
    "admin" BOOLEAN NOT NULL DEFAULT false,
    "disabled" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Permissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadHistory" (
    "id" SERIAL NOT NULL,
    "userid" INTEGER NOT NULL,
    "chapterid" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Author" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Author_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Artist" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Artist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Genre" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Genre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "Tag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Toon" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "alttitle" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ONGOING',
    "summary" TEXT NOT NULL,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "coverid" INTEGER,

    CONSTRAINT "Toon_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Chapter" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "toonid" INTEGER NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "Chapter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Page" (
    "id" SERIAL NOT NULL,
    "order" INTEGER NOT NULL,
    "chapterid" INTEGER NOT NULL,
    "imageid" INTEGER NOT NULL,

    CONSTRAINT "Page_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Image" (
    "id" SERIAL NOT NULL,
    "transport" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "status" "UploadStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "Image_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_AuthorToToon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_ArtistToToon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_GenreToToon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "_TagToToon" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "Permissions_userid_key" ON "Permissions"("userid");

-- CreateIndex
CREATE UNIQUE INDEX "Author_name_key" ON "Author"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Artist_name_key" ON "Artist"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Genre_name_key" ON "Genre"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Tag_name_key" ON "Tag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Toon_slug_key" ON "Toon"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Image_transport_key" ON "Image"("transport");

-- CreateIndex
CREATE UNIQUE INDEX "_AuthorToToon_AB_unique" ON "_AuthorToToon"("A", "B");

-- CreateIndex
CREATE INDEX "_AuthorToToon_B_index" ON "_AuthorToToon"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ArtistToToon_AB_unique" ON "_ArtistToToon"("A", "B");

-- CreateIndex
CREATE INDEX "_ArtistToToon_B_index" ON "_ArtistToToon"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_GenreToToon_AB_unique" ON "_GenreToToon"("A", "B");

-- CreateIndex
CREATE INDEX "_GenreToToon_B_index" ON "_GenreToToon"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_TagToToon_AB_unique" ON "_TagToToon"("A", "B");

-- CreateIndex
CREATE INDEX "_TagToToon_B_index" ON "_TagToToon"("B");

-- AddForeignKey
ALTER TABLE "Permissions" ADD CONSTRAINT "Permissions_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadHistory" ADD CONSTRAINT "ReadHistory_userid_fkey" FOREIGN KEY ("userid") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReadHistory" ADD CONSTRAINT "ReadHistory_chapterid_fkey" FOREIGN KEY ("chapterid") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Toon" ADD CONSTRAINT "Toon_coverid_fkey" FOREIGN KEY ("coverid") REFERENCES "Image"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_toonid_fkey" FOREIGN KEY ("toonid") REFERENCES "Toon"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_chapterid_fkey" FOREIGN KEY ("chapterid") REFERENCES "Chapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Page" ADD CONSTRAINT "Page_imageid_fkey" FOREIGN KEY ("imageid") REFERENCES "Image"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToToon" ADD CONSTRAINT "_AuthorToToon_A_fkey" FOREIGN KEY ("A") REFERENCES "Author"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_AuthorToToon" ADD CONSTRAINT "_AuthorToToon_B_fkey" FOREIGN KEY ("B") REFERENCES "Toon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToToon" ADD CONSTRAINT "_ArtistToToon_A_fkey" FOREIGN KEY ("A") REFERENCES "Artist"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ArtistToToon" ADD CONSTRAINT "_ArtistToToon_B_fkey" FOREIGN KEY ("B") REFERENCES "Toon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToToon" ADD CONSTRAINT "_GenreToToon_A_fkey" FOREIGN KEY ("A") REFERENCES "Genre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_GenreToToon" ADD CONSTRAINT "_GenreToToon_B_fkey" FOREIGN KEY ("B") REFERENCES "Toon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToToon" ADD CONSTRAINT "_TagToToon_A_fkey" FOREIGN KEY ("A") REFERENCES "Tag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TagToToon" ADD CONSTRAINT "_TagToToon_B_fkey" FOREIGN KEY ("B") REFERENCES "Toon"("id") ON DELETE CASCADE ON UPDATE CASCADE;
