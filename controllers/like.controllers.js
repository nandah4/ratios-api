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
            const deleteLike = await prisma.like.delete({
                where: {
                    userId_photoId: {
                        userId: parseToken.userId,
                        photoId: photoId
                    }
                }
            });

            return res.status(200).send(successMessageWithData())
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

        const hidePasswordUser = { ...createLike.user };
        delete hidePasswordUser.password;
        const photoHidePasswordLike = { ...createLike, user: hidePasswordUser };

        return res.status(200).send(successMessageWithData(photoHidePasswordLike));
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

module.exports = { createLikeByIdUser }