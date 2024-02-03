const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");

const prisma = new PrismaClient;

// CREATE COMENTAR BY ID USER
const createComentarById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    const comentar = req.body?.comentar;

    try {
        const findPhoto = await prisma.photo.findFirst({
            where: {
                id: photoId,
                isDeleted: false,
            },
        });

        if (!findPhoto) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId",
                        message: "Photo not found"
                    },
                ]
            }));
        };

        if (!comentar) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        field: "Comentar",
                        message: "Oops! Please make sure to enter your comment before submitting."
                    },
                ],
            }));
        };

        const createdComentar = await prisma.comentar.create({
            data: {
                userId: parseToken.userId,
                photoId: photoId,
                comentar: comentar
            },
            include: {
                user: true
            }
        });

        return res.status(200).send(successMessageWithData(createdComentar));
        // return res.send(successMessageWithData({
        //     messages: {
        //         message: "Comment successfully created!",
        //         additionalInfo: "Your thoughts have been shared. Thanks for contributing!"
        //     },
        // }));

    } catch (error) {
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ],
        }));
    };
};

// UPDATE COMENTAR BY USER ID DAN ID COMENT

// DELETE COMENTAR BY ID COMENTAR
const deleteComentarById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { comentarId } = req.params;

    try {
        const findComentar = await prisma.comentar.findUnique({
            where: {
                id: comentarId,
                isDeleted: false
            },
        });

        if (!findComentar) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "comentarId",
                        message: "Comentar not found"
                    },
                ],
            }));
        };

        const deleteComentar = await prisma.comentar.update({
            where: {
                id: comentarId,
                userId: parseToken.userId
            },
            data: {
                isDeleted: true,
            },
        });

        return res.status(200).send(successMessageWithData());

    } catch (error) {
        console.log(error)
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                }
            ]
        }));
    }
};


module.exports = { createComentarById, deleteComentarById };
