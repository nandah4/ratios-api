const MAX_TITLE = 100;
const MAX_DESCRIPTION = 1000;

const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const fs = require('fs/promises');
const path = require('path');
const { resolveTxt } = require('dns');

const prisma = new PrismaClient();

// GET ALL PHOTO
const getPhoto = async (req, res) => {
    try {
        const photos = await prisma.photo.findMany();

        return res.send(successMessageWithData(photos));

    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
        }));
    }
}

// GET PHOTO BY ID PHOTO
const getPhotoById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params

    try {
        const photo = await prisma.photo.findFirst({
            where: {
                id: photoId,
                userId: parseToken.userId,
                isDeleted: false
            }
        });

        if (!photo) {
            return res.status(404).send(badRequestMessage({
                messages:
                {
                    message: "Photo not found or unauthorized access"
                }
            }));
        };

        return res.send(successMessageWithData(photo));

    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            },
        }));
    };
};

// CREATE PHOTO
const createPhoto = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);

    if (!req.file) {
        return res.send(badRequestMessage({
            messages: {
                message: "It looks empty here! Start by uploading your favorite photos to fill this space with memories."
            }
        }));
    };

    try {
        const title = req.body.title
        const description = req.body.description
        const locationFile = req.file.path
        const userId = req.body.userId

        if (!title) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Title is required when uploading a photo."
                }
            }))
        };

        if (!description) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Description is required when uploading a photo."
                }
            }))
        };

        const newPhoto = await prisma.photo.create({
            data: {
                title,
                description,
                locationFile,
                userId: parseToken.userId
            }
        });

        // Validasi Panjang Title
        if (title && title.length > MAX_TITLE) {
            return res.send(badRequestMessage({
                messages: {
                    message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                }
            }));
        }

        // Validasi Panjang Description
        if (description && description.length > MAX_DESCRIPTION) {
            return res.send(badRequestMessage({
                message: `Description length exceeds the maximum limit of ${MAX_DESCRIPTION} characters.`
            }));
        };

        return res.send(successMessageWithData({
            messages: {
                message: "Hooray! Your photo has been uploaded successfully. Celebrate the moment!"
            }
        }));

    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
        }))
    };
};

// UPDATE PHOTO  BY ID PHOTO
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
            return res.send(badRequestMessage({
                messages: {
                    message: "Photo Not Found!"
                }
            }))
        };

        const { title, description } = req.body;

        // Validasi Panjang Title
        if (title && title.length > MAX_TITLE) {
            return res.send(badRequestMessage({
                messages: {
                    message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                }
            }));
        };

        // Validasi Panjang Description
        if (description && description.length > MAX_DESCRIPTION) {
            return res.send(badRequestMessage({
                messages: {
                    message: `Description length exceeds the maximum limit of ${MAX_DESCRIPTION} characters.`
                }
            }));
        };

        const updatePhoto = await prisma.photo.update({
            where: {
                id: photoId
            },
            data: {
                title: title || findPhoto.title,
                description: description || findPhoto.description
            }
        });

        if (!title) {
            return res.status(404).send(badRequestMessage({
                messages: {
                    message: "Title is required when update a photo."
                }
            }));
        };

        if (!description) {
            return res.status(404).send(badRequestMessage({
                messages: {
                    message: "Description is required when uploading a photo."
                }
            }));
        };

        if (updatePhoto) {
            return res.send(successMessageWithData({
                messages: {
                    message: "Photo Successfully update"
                }
            }));
        };

    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
        }));
    };
};

// DELETE PHOTO
const deletePhotoById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    // const photo = await prisma.photo.findUnique({
    //     where: {
    //         id: photoId
    //     }
    // });

    
    const deletePhoto = await prisma.photo.update({
        where: {
            id: photoId
        },
        data: {
            isDeleted: true,
        },
    });
    
    if (!deletePhoto) {
        return res.send(badRequestMessage({
            messages: {
                message: "Photo not found. Looks like it's on a coffee break. Don't worry, we're on it!"
            }
        }));
    };

    // Ekstrak nama file dari lokasi file
    const fileName = path.basename(photo.locationFile);

    // Hapus file photo dari file proyek
    try {
        await fs.unlink(`uploads/product/${fileName}`);
        return res.send(successMessageWithData({
            messages: {
                message: "Photo deletion complete! Your memories are now a bit lighter."
            }
        }));
    } catch (error) {
        console.error("Kesalahan menghapus file", error);
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
        }));
    };
}

module.exports = { getPhoto, getPhotoById, createPhoto, updatePhotoById, deletePhotoById };