const MAX_TITLE = 200;

const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const { ENV_PORT } = require('../environtment');

const prisma = new PrismaClient();

// GET ALL PHOTO
const getPhoto = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { query } = req.query;

    try {
        let searchQuery =  {
                where: {
                    isDeleted: false,
                    OR: [
                        {
                            title: {
                                contains: query
                            },
                        },
                        {
                            description: {
                                contains: query
                            },
                            
                        },
                    ],
                },
                include: {
                    user: true
                },    
        }
        const photos = await prisma.photo.findMany(searchQuery);

        const photosHideUserPassword = photos.map(photo => {
            const userWithoutPassword = { ...photo.user };
            delete userWithoutPassword.password;
            delete userWithoutPassword.role;
            return { ...photo, user: userWithoutPassword };
        })

        return res.status(200).send(successMessageWithData(photosHideUserPassword));

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

// GET PHOTO BY ID USER
const getPhotoByIdUser = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { userId } = req.params;

    try {
        const findUser = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false,
            },
        });

        if (!findUser) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "User not found"
                    }
                ]
            }))
        }

        // Get All Foto User Id
        const getPhoto = await prisma.photo.findMany({
            where: {
                userId: userId,
                isDeleted: false
            },
            include: {
                user: true
            },
        });

        const photoWithoutPassword = getPhoto.map(photo => {
            const userWithoutPassword = { ...photo.user };
            delete userWithoutPassword.password;
            return { ...photo, user: userWithoutPassword }
        });

        return res.status(200).send(successMessageWithData(photoWithoutPassword));

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
                        field: "id",
                        message: "Photo not found"
                    },
                ],
            }));
        };

        //photos
        const userWithoutPassword = { ...photo.user };
        delete userWithoutPassword.password;
        delete userWithoutPassword.role;
        delete userWithoutPassword.address;
        delete userWithoutPassword.createdAt;
        delete userWithoutPassword.updatedAt;
        const photosHideUserPassword = { ...photo, user: userWithoutPassword };
        //comentar
        const comentarUserWithoutPassword = photosHideUserPassword.comentars.map(comentar => {
            const hidePasswordComentar = { ...comentar.user };
            delete hidePasswordComentar.password;
            delete hidePasswordComentar.role;
            delete hidePasswordComentar.address;
            delete hidePasswordComentar.createdAt;
            delete hidePasswordComentar.updatedAt;
            return { ...comentar, user: hidePasswordComentar };
        });
        const photoHidePasswordComentar = { ...photosHideUserPassword, comentars: comentarUserWithoutPassword }
        //like
        const likeUserWithoutPassword = photoHidePasswordComentar.likes.map(like => {
            const hidePasswordLike = { ...like.user };
            delete hidePasswordLike.password;
            delete hidePasswordLike.role;
            delete hidePasswordLike.address;
            delete hidePasswordLike.createdAt;
            delete hidePasswordLike.updatedAt;
            return { ...like, user: hidePasswordLike };
        })

        const photoHidePasswordLike = { ...photoHidePasswordComentar, likes: likeUserWithoutPassword }

        const userHasLiked = photoHidePasswordLike.likes.some(like => like.userId === parseToken.userId);

        const photoWithIsLiked = { ...photoHidePasswordLike, isLiked: userHasLiked }

        return res.status(200).send(successMessageWithData(photoWithIsLiked));
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
        if (!locationFile) {
            error.push({
                field: "locationFile",
                message: "File upload is required and Only JPG, JPEG and PNG files are allowed."
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
                        field: "title",
                        message: `Title length exceeds the maximum limit of ${MAX_TITLE} characters.`
                    },
                ],
            }));
        };

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

        const hideUserPassword = { ...newPhoto.user };
        delete hideUserPassword.password;

        const photoWithoutPassword = { ...newPhoto, user: hideUserPassword };

        return res.status(200).send(successMessageWithData(photoWithoutPassword));
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
                        field: "photoId",
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

        if (error.length !== 0) {
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
                        field: "title",
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

        const hidePasswordUser = { ...updatePhoto.user };
        delete hidePasswordUser.password;
        const photoWithoutPassword = { ...updatePhoto, user: hidePasswordUser };

        return res.status(200).send(successMessageWithData(photoWithoutPassword));

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
                isDeleted: false,
            },
        });

        if (!photoToDelete) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId",
                        message: "photo not found"
                    }
                ]
            }))
        }

        if (photoToDelete.userId !== parseToken.userId) {
            return res.status(403).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "You don`t have permission to delete this foto",
                    },
                ]
            }))
        }

        // isDeleted to true to assocciated comments
        await prisma.comentar.updateMany({
            where: {
                photoId: photoId,
            },
            data: {
                isDeleted: true
            },
        });

        await prisma.like.deleteMany({
            where: {
                photoId: photoId,
            },
        });

        const deletePhoto = await prisma.photo.update({
            where: {
                id: photoId,
                userId: parseToken.userId,
            },
            data: {
                isDeleted: true,
                albumId: null
            },
        });

        if (!deletePhoto) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "photoId",
                        message: "Photo not found",
                    },
                ],
            }));
        };

        return res.status(200).send(successMessageWithData(deletePhoto));
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
}

module.exports = { getPhoto, getPhotoById, getPhotoByIdUser, createPhoto, updatePhotoById, deletePhotoById };