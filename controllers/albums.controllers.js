const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, successCreateMessageWithData, badRequestMessage } = require("../utils/message");

// GET ALBUM BY USER ID
const getAlbumsByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  const prisma = new PrismaClient();

  const albums = await prisma.album.findMany({
    where: {
      userId: parseToken.userId,
      isDeleted: false,
    },
  });

  return res.status(200).send(successMessageWithData(albums));
};

// GET DETAIL ALBUM
const getAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const { albumId } = req.params;
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();

  try {
    const album = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId: parseToken.userId,
        isDeleted: false,
      },
      include: {
        photos: {
          where: {
            isDeleted: false,
          },
          include: {
            user: true
          }
        }
      }
    });

    return res.send(successMessageWithData(album));
  } catch (error) {
    
  }

  

};

const createAlbumByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const { title, description } = req.body;
  


  if (!title) {
    return res.send(badRequestMessage({
      messages: {
        message: "Title is required"
      }
    }))
  };

  const newAlbum = await prisma.album.create({
    data: {
      title: title,
      description: description,
      userId: parseToken.userId,
    },
    
  });

  return res.send(successCreateMessageWithData());
};

const updateAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const dataUpdate = {};

  if (req.body?.title) {
    dataUpdate.title = req.body?.title;
  }

  if (req.body?.description) {
    dataUpdate.description = req.body?.description;
  }

  const prisma = new PrismaClient();

  const updateAlbum = await prisma.album.update({
    where: {
      userId: parseToken.userId,
      id: albumId,
    },
    data: dataUpdate,
  });

  return res.send(successMessageWithData(updateAlbum));
};

const deleteAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const prisma = new PrismaClient();

  try {
    const deleteAlbum = await prisma.album.update({
      where: {
        id: albumId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.send(successMessageWithData({
      messages: {
        message: "Succes delete"
      },
    }));
  } catch (error) {
    return res.send(badRequestMessage({
      messages: {
        message: "Internal server error"
      }
    }))
  }
};

//  ADD PHOTO TO ALBUM
const addPhotoToAlbum = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const {albumId, photoId} = req.params;
  // const {photoId} = req.body;
  
  const prisma = new PrismaClient();

  try {
    const findAlbum= await prisma.album.findFirst({
      where: {
        id: albumId,
        userId: parseToken.userId,
        isDeleted: false
      },
    });

    const findPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: parseToken.userId,
        isDeleted: false
      },
    });

    if (!findAlbum) {
      return res.send(badRequestMessage({
        messages: {
          message: "Album not found"
        },
      }));
    } else if(!findPhoto) {
      return res.send(badRequestMessage({
        messages: {
          message: "Foto not found"
        }
      }))
    }

    await prisma.photo.update({
      where: {
        id: photoId
      },
      data: {
        albumId: albumId,
      },
    });

    return res.send(successMessageWithData({
      messages: {
        message: "succes add photo to album"
      }
    }))
  } catch (error) {
    console.log(error);
    return res.send(badRequestMessage({
      messages: {
        message: "Internal server error"
      }
    }))
  };
};

// DELETE PHOTO FROM ALBUM
const deletePhotoFromAlbum = async(req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const {albumId, photoId} = req.params;

  try {
    const findAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId: parseToken.userId,
      },
    });

    const findPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        userId: parseToken.userId,
      }
    });

    if(!findAlbum) {
      return res.status(404).send({
        messages: {
          message: "Album not found"
        },
      });
    };

    if(!findPhoto) {
      return res.status(404).send({
        messages: {
          message: "Photo not found"
        }
      });
    };

    const deletePhoto = await prisma.photo.update({
      where: {
        id: photoId
      },
      data: {
        albumId: null
      },
    });

    return res.status(200).send(successMessageWithData({
      messages: {
        message: "Succes delete photo to album"
      }
    }))
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      messages: {
        message: "Internal Server Error",
      },
    });
  };
};

module.exports = {
  getAlbumsByUserIdController,
  createAlbumByUserIdController,
  getAlbumByAlbumIdAndUserIdController,
  updateAlbumByUserIdController: updateAlbumByAlbumIdAndUserIdController,
  deleteAlbumByAlbumIdAndUserIdController,
  addPhotoToAlbum,
  deletePhotoFromAlbum,
};
