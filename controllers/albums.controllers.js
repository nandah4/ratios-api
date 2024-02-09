const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, successCreateMessageWithData, badRequestMessage } = require("../utils/message");
const { parse } = require("dotenv");

// GET ALBUM BY USER ID
const getAlbumsByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { userId } = req.params;

  const prisma = new PrismaClient();

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
          },
        ],
      }));
    };

    const album = await prisma.album.findMany({
      where: {
        userId: userId,
        isDeleted: false
      },
      include: {
        user: true,
      },
    });

    return res.status(200).send(successMessageWithData(album));
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

// GET DETAIL ALBUM
const getAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const { albumId } = req.params;

  try {
    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false
      },
    });

    if (!existingAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId",
            message: "Album not found"
          },
        ],
      }));
    };

    const album = await prisma.album.findMany({
      where: {
        id: albumId,
        isDeleted: false,
      },
      include: {
        photos: {
          where: {
            isDeleted: false,
          },
          include: {
            user: true,
          },
        },
      },
    });

    if (!album) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "albumId or userId",
              message: "album not found",
            },
          ],
        })
      );
    }

    return res.send(successMessageWithData(album));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
          },
        ],
      })
    );
  }
};

const createAlbumByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();

  const title = req.body?.title;
  const description = req.body?.description;
  const error = [];

  try {
    if (!title) {
      error.push({
        field: "title",
        message: "Title is required",
      });
    }

    if (!description) {
      error.push({
        field: "description",
        message: "Description is required",
      });
    }

    if (error.length !== 0) {
      return res.status(400).send(
        badRequestMessage({
          messages: [...error],
        })
      );
    }

    const newAlbum = await prisma.album.create({
      data: {
        title: title,
        description: description,
        userId: parseToken.userId,
      },
      include: {
        user: true,
      },
    });

    return res.send(successMessageWithData(newAlbum));
  } catch (error) {
    return res.status(500).send({
      messages: [
        {
          message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
        },
      ],
    });
  }
};

const updateAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const prisma = new PrismaClient();
  try {
    const findAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false,
      },
    });

    if (!findAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId",
            message: "Album not found"
          },
        ],
      }));
    };


    if (findAlbum.userId !== parseToken.userId) {
      return res.status(400).send(badRequestMessage({
        messages: [
          {
            field: "userId",
            message: "You don`t have permission to update this album"
          },
        ],
      }));
    };

    const title = req.body?.title;
    const description = req.body?.description;
    const error = [];

    if (!title) {
      error.push({
        field: "title",
        message: "title is required",
      });
    };

    if (error.length !== 0) {
      return res.status(404).send(badRequestMessage({
        messages: [
          ...error
        ],
      }));
    };

    const updateAlbum = await prisma.album.update({
      where: {
        userId: parseToken.userId,
        id: albumId,
      },
      data: {
        title: title,
        description: description,
      },
      include: {
        user: true,
      },
    });

    return res.status(200).send(successMessageWithData(updateAlbum));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: [
          {
            message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
          },
        ],
      })
    );
  }
};

const deleteAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const prisma = new PrismaClient();

  try {
    const findAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false,
      },
    });

    if (!findAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId",
            message: "Album not found",
          },
        ],
      }));
    };

    if(findAlbum.userId !== parseToken.userId) {
      return res.status(403).send(badRequestMessage({
        messages: [
          {
            field: "userId",
            message: "You don`t have permission to delete this album",
          },
        ],
      }));
    };


    await prisma.photo.updateMany({
      where: {
        albumId: albumId,
        userId: parseToken.userId,
      },
      data: {
        albumId: null,
      },
    });

    const album = await prisma.album.update({
      where: {
        id: albumId,
      },
      data: {
        isDeleted: true,
      },
    });

    if (!album) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId",
            message: "Album not found",
          },
        ],
      }));
    };

    return res.status(200).send(successMessageWithData(album));
  } catch (error) {
    console.log(error);
    return res.send(
      badRequestMessage({
        messages: {
          message: "Internal server error",
        },
      })
    );
  }
};

//  ADD PHOTO TO ALBUM
const addPhotoToAlbum = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId, photoId } = req.params;

  const prisma = new PrismaClient();

  try {
    const findAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false
      },
    });

    if (!findAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: {
          field: "albumId",
          message: "Album not found"
        },
      }));
    };

    const findPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        isDeleted: false
      },
    });

    if (!findPhoto) {
      return res.status(404).send(badRequestMessage({
        messages: {
          field: "photoId",
          message: "Foto not found"
        },
      }));
    };

    if( findAlbum.userId !== parseToken.userId || findPhoto.userId !== parseToken.userId) {
      return res.status(403).send(badRequestMessage({
        messages: [
          {
            field: "userId",
            message: "You don't have permission to add this photo to the album"
          },
        ],
      }));
    };

    const addPhoto = await prisma.photo.update({
      where: {
        id: photoId,
        userId: parseToken.userId,
      },
      data: {
        albumId: albumId,
      },
    });

    return res.status(200).send(successMessageWithData(addPhoto))
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: {
          message: "Internal server error",
        },
      })
    );
  }
};

// DELETE PHOTO FROM ALBUM
const deletePhotoFromAlbum = async (req, res) => {  
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const { albumId, photoId } = req.params;

  try {

    const findAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false,
      },
    });

    if(!findAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId",
            message: "Album not found",
          }
        ]
      }))
    }

    const findPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        isDeleted: false,
      }
    });

    if (!findPhoto) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "photoId",
            message: "photo not found",
          },
        ],
      }));
    }

    if(findAlbum.userId !== parseToken.userId || findPhoto.userId !== parseToken.userId) {
      return res.status(403).send(badRequestMessage({
        messages: [
          {
            field: "userId",
            message: "You don`t have permission to delete this foto from album",
          }
        ]
      }))
    }

    const deletePhoto = await prisma.photo.update({
      where: {
        id: photoId,
        userId: parseToken.userId,
        albumId: albumId,
      },
      data: {
        albumId: null,
      },
    });

    return res.status(200).send(successMessageWithData(deletePhoto));
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      messages: [
        {
          message: "Internal server error"
        }
      ]
    });
  }
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
