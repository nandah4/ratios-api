const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { verifyJwt } = require("../utils/jwt");
const fs = require('fs/promises');
const path = require('path');

const prisma = new PrismaClient();

// GET ALL PHOTO
const getPhoto = async (req, res) => {
    try {
        const photos = await prisma.photo.findMany();

        return res.send(successMessageWithData(photos));

    } catch (error) {
        return res.send(badRequestMessage);
    }
}

// GET PHOTO BY ID
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

        if(!photo) {
            return res.status(404).send({
                message: "Photo not found or unauthorized access"
            })
        };

        return res.status(200).send({
            message: "Photo Succes Uploaded",
            data: photo
        })

    } catch (error) {
        return res.status(500).send({
            message: "Internal server error"
        })
    }
}

// CREATE PHOTO
const createPhoto = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);

    if (!req.file) {
        return res.status(400).send({
            message: "It looks empty here! Start by uploading your favorite photos to fill this space with memories."
        });
    }

    try {
        const title = req.body.title
        const description = req.body.description
        const locationFile = req.file.path
        const userId = req.body.userId

        if(!title) {
            return res.status(422).send({
                message: "Title is required when uploading a photo."
            })
        }
        
        if(!description) {
            return res.status(422).send({
                message: "Description is required when uploading a photo."
            })
        }

        const newPhoto = await prisma.photo.create({
            data: {
                title,
                description,
                locationFile,
                userId: parseToken.userId
            }
        });

        return res.status(201).send("Hooray! Your photo has been uploaded successfully. Celebrate the moment!")

    } catch (error) {
        return res.send(badRequestMessage({
            messages: error.message
        }))
    }

}

// DELETE PHOTO
const deletePhotoById = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { photoId } = req.params;

    const photo = await prisma.photo.findUnique({
        where: {
            id: photoId
        }
    });

    if (!photo) {
        return res.status(404).send({
            message: "404 Error: Photo not found. Looks like it's on a coffee break. Don't worry, we're on it!"
        })
    };

    const deletePhoto = await prisma.photo.delete({
        where: {
            id: photoId
        },
    });

    // Ekstrak nama file dari lokasi file
    const fileName = path.basename(photo.locationFile);

    // Hapus file photo dari file proyek
    try {
        await fs.unlink(`uploads/product/${fileName}`);
        return res.status(200).send({
            message: "Photo deletion complete! Your memories are now a bit lighter."
        })
    } catch (error) {
        console.error("Kesalahan menghapus file", error);
        return res.status(500).send({
            message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
        })
    };
}

module.exports = { getPhoto, getPhotoById, createPhoto, deletePhotoById };