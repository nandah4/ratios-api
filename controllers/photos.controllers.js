const MAX_TITLE = 200;

const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const fs = require('fs/promises');
const { ENV_PORT } = require('../environtment');

const prisma = new PrismaClient();

// GET ALL PHOTO
const getPhoto = async (req, res) => {
    const { title } = req.query;

    try {
        const searchQuery = title ? {
            where: {
                isDeleted: false,
                title: {
                    contains: title,
                },
            },
        }
            : {
                where: {
                    isDeleted: false
                },
                include: {
                    user: true
                },
            };

        const photos = await prisma.photo.findMany(searchQuery);
        return res.status(200).send(successMessageWithData(photos));

    } catch (error) {
        console.log(error);
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ],
        }));
    };
};

// GET PHOTO BY ID PHOTO
const getPhotoById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params

    try {
        const photo = await prisma.photo.findFirst({
            where: {
                id: photoId,
                isDeleted: false
            },
            include: {
                user: true,
                comentars: {
                    where: {
                        isDeleted: false,
                    },
                    include: {
                        user: true,
                    },
                },
                likes: {
                    include: {
                        user: true
                    },
                },
            },
        });

        if (!photo) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        message: "Photo not found"
                    },
                ],
            }));
        };

        return res.status(200).send(successMessageWithData(photo));
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

// GET PHOTO BY ID USER
const getPhotoByIdUser = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);

    try {
        // Get All Foto User Id
        const getPhoto = await prisma.photo.findMany({
            where: {
                userId: parseToken.userId,
                isDeleted: false
            },
            include: {
                user: true
            },
        });
        return res.status(200).send(successMessageWithData(getPhoto));

    } catch (error) {
        console.log(error)
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ],
        }));
    };
};

// CREATE PHOTO
const createPhoto = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);

    try {
        const title = req.body?.title;
        const description = req.body?.description;
        const locationFile = req.file?.filename;

        const error = [];

        if (!title) {
            error.push({
                field: "title",
                message: "Title is required when uploading a photo."
            });
        };
        if (!description) {
            error.push({
                field: "description",
                message: "Description is required when uploading a photo."
            });
        };
        if(!locationFile) {
            error.push({
                field: "locationFile",
                message: "It looks empty here! Start by uploading your favorite photos to fill this space with memories."
            });
        }

        if (error.length !== 0) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    ...error
                ],
            }));
        }
        // Validasi Panjang Title
        if (title && title.length > MAX_TITLE) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                    },
                ],
            }));
        };

        // Replace locationFile nama uploads/photos/
        // const fileNameOnly = locationFile.replace(/^uploads[\\\/]photos[\\\/]/, '');

        const newPhoto = await prisma.photo.create({
            data: {
                title,
                description,
                locationFile,
                userId: parseToken.userId
            },
            include: {
                user: true,
            },
        });

        return res.status(200).send(successMessageWithData(newPhoto));
        //         message: "Hooray! Your photo has been uploaded successfully. Celebrate the moment!"

    } catch (error) {
        console.log(error)
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ],
        }));
    };
};

// UPDATE PHOTO BY ID PHOTO
const updatePhotoById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    try {
        const findPhoto = await prisma.photo.findFirst({
            where: {
                id: photoId,
                userId: parseToken.userId,
                isDeleted: false
            },
        });

        if (!findPhoto) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        message: "Photo Not Found!"
                    }
                ],
            }))
        };

        const title = req.body?.title;
        const description = req.body?.description;
        const error = [];

        if (!title) {
            error.push({
                field: "title",
                message: "Title is required when update a photo."
            });
        };
        
        if (!description) {
            error.push({
                field: "description",
                message: "Description is required when update a photo."
            });
        };

        if(error.length !== 0) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    ...error
                ],
            }));
        };

        // Validasi Panjang Title
        if (title && title.length > MAX_TITLE) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                    },
                ],
            }));
        };

        const updatePhoto = await prisma.photo.update({
            where: {
                id: photoId,
                userId: parseToken.userId,
            },
            data: {
                title: title || findPhoto.title,
                description: description || findPhoto.description
            },
            include: {
                user: true
            }
        });


        return res.status(200).send(successMessageWithData(updatePhoto));

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

// DELETE PHOTO
const deletePhotoById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;
    try {
        const photoToDelete = await prisma.photo.findFirst({
            where: {
                id: photoId,
                userId: parseToken.userId
            },
        });

        if (!photoToDelete || photoToDelete.userId !== parseToken.userId) {
            return res.status(403).send(badRequestMessage({
                messages: [
                    {
                        message: "You don`t have permission to delete this foto",
                    },
                ]
            }))
        }

        const deletePhoto = await prisma.photo.update({
            where: {
                id: photoId,
                userId: parseToken.userId,
            },
            data: {
                isDeleted: true,
            },
        });

        // isDeleted to true to assocciated comments
        await prisma.comentar.updateMany({
            where: {
                id: photoId,
                userId: parseToken.userId
            },
            data: {
                isDeleted: true
            },
        });

        return res.status(200).send(successMessageWithData({
            messages: [
                {
                    message: "Photo deletion complete! Your memories are now a bit lighter."
                },
            ]
        }));
    } catch (error) {
        console.log(error)
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
                },
            ],
        }));
    };

    // Ekstrak nama file dari lokasi file
    // const fileName = path.basename(photo.locationFile);

    // Hapus file photo dari file proyek        
}

module.exports = { getPhoto, getPhotoById, getPhotoByIdUser, createPhoto, updatePhotoById, deletePhotoById };