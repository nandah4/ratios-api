const { PrismaClient } = require("@prisma/client");
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");

const prisma = new PrismaClient();

const createLikeByIdUser = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    try { 
        const existingPhoto = await prisma.photo.findFirst({
            where: {
                id: photoId,
                isDeleted: false
            },
        });

        if (!existingPhoto) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId",
                        message: "Photo not found"
                    },
                ],
            }));
        };

        // cek apakah user sudah like photo tsb
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: parseToken.userId,
                photoId: photoId,
            },
        });

        if (existingLike) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId and userId",
                        message: "Oops! You've already liked this photo."
                    },
                ],
            }));
        };

        // create like
        const createLike = await prisma.like.create({
            data: {
                userId: parseToken.userId,
                photoId: photoId,
            },
            include: {
                user: true
            }
        });

        return res.status(200).send(successMessageWithData(createLike));
    } catch (error) {
        console.log(error);
        return res.send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ],
        }));
    };
};

// DELETE LIKE
const deleteLikeByIdUser = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    try {
        const findPhoto = await prisma.photo.findUnique({
            where: {
                id: photoId,
                isDeleted: false
            }
        });

        if (!findPhoto) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId",
                        message: "Photo not found",
                    },
                ],
            }));
        };

        // cek apakah user sudah like atau belum
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: parseToken.userId,
                photoId: photoId
            },
        });

        if (!existingLike) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId and userId",
                        message: "Oops! It seems like you haven't liked this photo yet. Give it a thumbs up and spread the love!"
                    },
                ]
            }));
        };

        if(existingLike.userId !== parseToken.userId) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        field: "userId and photoId",
                        message:  "You don't have permission to delete this like",
                    },
                ],
            }));
        };

        await prisma.like.delete({
            where: {
                userId_photoId: {
                    userId: parseToken.userId,
                    photoId: photoId
                }
            },
        });

        return res.status(200).send(successMessageWithData());
    } catch (error) {
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ]
        }));
    };
};

module.exports = { createLikeByIdUser, deleteLikeByIdUser }