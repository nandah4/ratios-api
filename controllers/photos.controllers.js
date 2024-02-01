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
                }
            }

        const photos = await prisma.photo.findMany(searchQuery);

        return res.send(successMessageWithData(photos));

    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
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
                userId: parseToken.userId,
                isDeleted: false
            },
            include: {
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
            return res.send(badRequestMessage({
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
        });

        return res.send(successMessageWithData(getPhoto));

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
        return res.status(400).send(badRequestMessage({
            messages: {
                message: "It looks empty here! Start by uploading your favorite photos to fill this space with memories."
            }
        }));
    };

    try {
        const title = req.body.title
        const description = req.body.description
        const locationFile = req.file.path

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

        // Validasi Panjang Title
        if (title && title.length > MAX_TITLE) {
            return res.send(badRequestMessage({
                messages: {
                    message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                }
            }));
        };

        // Replace locationFile nama uploads/photos/
        const fileNameOnly = locationFile.replace(/^uploads[\\\/]photos[\\\/]/, `http://localhost:${ENV_PORT}/files/images/photos/`);

        const newPhoto = await prisma.photo.create({
            data: {
                title,
                description,
                locationFile: fileNameOnly,
                userId: parseToken.userId
            }
        });

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
                error,
                messages: {
                    message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                }
            }));
        };

        // Validasi Panjang Description
        // if (description && description.length > MAX_DESCRIPTION) {
        //     return res.send(badRequestMessage({
        //         messages: {
        //             message: `Description length exceeds the maximum limit of ${MAX_DESCRIPTION} characters.`
        //         }
        //     }));
        // };

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

    try {

        const deletePhoto = await prisma.photo.update({
            where: {
                id: photoId
            },
            data: {
                isDeleted: true,
            },
        });

        if (!deletePhoto || !deletePhoto.isDeleted) {
            return res.send(badRequestMessage({
                messages: {
                    message: "Photo not found. Looks like it's on a coffee break. Don't worry, we're on it!"
                }
            }));
        };

        // isDeleted to true to assocciated comments
        await prisma.comentar.updateMany({
            where: {
                id: photoId,
            },
            data: {
                isDeleted: true
            },
        });

        return res.send(successMessageWithData({
            messages: {
                message: "Photo deletion complete! Your memories are now a bit lighter."
            }
        }));
    } catch (error) {
        return res.send(badRequestMessage({
            messages: {
                message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
            }
        }));
    };


    // Ekstrak nama file dari lokasi file
    // const fileName = path.basename(photo.locationFile);

    // Hapus file photo dari file proyek        
}

module.exports = { getPhoto, getPhotoById, getPhotoByIdUser, createPhoto, updatePhotoById, deletePhotoById };