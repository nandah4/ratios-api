const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");

const prisma = new PrismaClient;

// CREATE COMENTAR BY ID USER
const createComentarById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;
    const { comentar } = req.body;

    try {
        const findPhoto = await prisma.photo.findFirst({
            where: {
                id: photoId,
                isDeleted: false,
            }
        });

        if (!findPhoto) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Photo not found"
                },
            }));
        };

        if (!comentar) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Oops! It seems like you forgot to add your comment. Please make sure to enter your comment before submitting."
                }
            }))
        };

        const createdComentar = await prisma.comentar.create({
            data: {
                userId: parseToken.userId,
                photoId: photoId,
                comentar: comentar
            },
        });

        return res.send(successMessageWithData({
            messages: {
                message: "Comment successfully created!",
                additionalInfo: "Your thoughts have been shared. Thanks for contributing!"
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

// DELETE COMENTAR BY ID COMENTAR
const deleteComentarById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { comentarId } = req.params;

    try {
        const deleteComentar = await prisma.comentar.update({
            where: {
                id: comentarId,
                userId: parseToken.userId
            },
            data: {
                isDeleted: true,
            },
        });

        if (!deleteComentar) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Comment Not Found"
                },
            }));
        };

        return res.send(successMessageWithData({
            messages: {
                message: "Comment successfully deleted!",
            },
        }));

    } catch (error) {
        console.log(error)
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
        }));
    }
};


module.exports = { createComentarById, deleteComentarById };
