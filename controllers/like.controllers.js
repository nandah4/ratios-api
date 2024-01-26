const { PrismaClient } = require("@prisma/client");
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");

const prisma = new PrismaClient();


const createLikeByIdUser = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    try {
        // cek apakah user sudah like photo tsb
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: parseToken.userId,
                photoId: photoId,
            },
        });

        if (existingLike) {
            return res.send(badRequestMessage({
                messages: {
                    messages: "Oops! You've already liked this photo."
                },
            }));
        };

        // create like
        const createLike = await prisma.like.create({
            data: {
                userId: parseToken.userId,
                photoId: photoId,
            },
        });

        return res.send(successMessageWithData({
            messages: {
                messages: "You've successfully liked the photo! 🎉"
            },
        }));

    } catch (error) {
        console.log(error);
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            },
        }));
    };
};

// DELETE LIKE
const deleteLikeByIdUser = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    try {
        // cek apakah user sudah like atau belum
        const existingLike = await prisma.like.findFirst({
            where: {
                userId: parseToken.userId,
                photoId: photoId
            },
        });

        if (!existingLike) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Oops! It seems like you haven't liked this photo yet. Give it a thumbs up and spread the love!"
                },
            }));
        };

        await prisma.like.delete({
            where: {
                userId_photoId:{
                    userId: parseToken.userId,
                    photoId: photoId
                }
            },
        });

        return res.send(successMessageWithData({
            messages: {
                message: "You've successfully unliked the photo. It's no longer in your liked collection. Keep exploring!"
            },
        }));
    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            },
        }));
    };
};

module.exports = { createLikeByIdUser, deleteLikeByIdUser }