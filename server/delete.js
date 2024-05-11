/*
standalone script to delete a toon and all its chapters and pages
you must manually delete the toon directory at ./content/:toonid
*/
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.toon.findUnique({
    where: {
        id: parseInt(process.argv[2])
    },
    include: {
        chapters: {
            include: {
                pages: {
                    include: {
                        image: true
                    }
                }
            }
        }
    }
}).then(async (toon) => {
    if(toon) {
        console.log(`Deleting toon: ${toon.title}`);
        console.log(toon);
        for(let i = 0; i < toon.chapters.length; i++) {
            let chapter = toon.chapters[i];
            let imgs = [];
            let pages = [];
            chapter.pages.forEach((page) => {
                imgs.push(page.image.id);
                pages.push(page.id);
            });
            await prisma.$transaction([
                prisma.page.deleteMany({
                    where: {
                        id: {
                            in: pages
                        }
                    }
                }),
                prisma.image.deleteMany({
                    where: {
                        id: {
                            in: imgs
                        }
                    }
                }),
                prisma.chapter.delete({
                    where: {
                        id: chapter.id
                    }
                })
            ]).then(() => {
                console.log(`Deleted chapter: ${chapter.name}`);
            })
        }
        await prisma.toon.delete({
            where: {
                id: toon.id
            }
        }).then(() => {
            console.log(`Deleted toon: ${toon.title}`);
            console.log(`Remember to delete the toon directory at ./content/${toon.id}`);
        });
    }
    else {
        console.log(`Toon not found.`);
    }
});
