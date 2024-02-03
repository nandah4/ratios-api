const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, successCreateMessageWithData, badRequestMessage } = require("../utils/message");
const { parse } = require("dotenv");

// GET ALBUM BY USER ID
const getAlbumsByUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);

  const prisma = new PrismaClient();

  const albums = await prisma.album.findMany({
    where: {
      userId: parseToken.userId,
      isDeleted: false,
    },
    include: {
      user: true
    }
  });

  if (albums.length === 0) {
    return res.status(200).send(successMessageWithData({
      messages: [
        {
          field: "id",
          message: "You haven't created any albums yet. Create an album to organize your photos!"
        },
      ],
    }));
  };

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

    if (!album) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId or userId",
            message: "album not found"
          },
        ],
      }));
    };

    return res.send(successMessageWithData(album));
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
        message: "Title is required"
      });
    };

    if (!description) {
      error.push({
        field: "description",
        message: "Description is required",
      });
    };

    if (error.length !== 0) {
      return res.status(400).send(badRequestMessage({
        messages: [
          ...error
        ]
      }))
    }

    const newAlbum = await prisma.album.create({
      data: {
        title: title,
        description: description,
        userId: parseToken.userId,
      },
      include: {
        user: true,
      }
    });

    return res.send(successMessageWithData(newAlbum));
  } catch (error) {
    return res.status(500).send({
      messages: [
        {
          message: "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later."
        },
      ],
    });
  };
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
  try {
    const findAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        userId: parseToken.userId,
      },
    });

    if (!findAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId or userId",
            message: "Album not found"
          },
        ],
      }));
    };

    // if (!findAlbum || !findAlbum.userId !== parseToken.userId) {
    //   return res.status(400).send(badRequestMessage({
    //     messages: [
    //       {
    //         message: "You don`t have permission to update this album"
    //       },
    //     ],
    //   }));
    // };

    const updateAlbum = await prisma.album.update({
      where: {
        userId: parseToken.userId,
        id: albumId,
      },
      data: dataUpdate,
      include: {
        user: true
      }
    });

    return res.status(200).send(successMessageWithData(updateAlbum));
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

const deleteAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { albumId } = req.params;

  const prisma = new PrismaClient();

  try {
    // const findAlbum = await prisma.album.findFirst({
    //   where: {
    //     id: albumId,
    //     userId: parseToken.userId,
    //   },
    // });

    const deleteAlbum = await prisma.album.update({
      where: {
        id: albumId,
        userId: parseToken.userId,
      },
      data: {
        isDeleted: true,
      },
    });
    if (!deleteAlbum) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "albumId or userId",
            message: "Album not found",
          },
        ],
      }));
    };

    return res.status(200).send(successMessageWithData());
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
  const { albumId, photoId } = req.params;
  // const {photoId} = req.body;

  const prisma = new PrismaClient();

  try {
    const findAlbum = await prisma.album.findFirst({
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
          field: "albumId or userId",
          message: "Album not found"
        },
      }));
    } else if (!findPhoto) {
      return res.send(badRequestMessage({
        messages: {
          field: "photoId or userId",
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
const deletePhotoFromAlbum = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const { albumId, photoId } = req.params;

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

    if (!findAlbum) {
      return res.status(404).send({
        messages: {
          message: "Album not found"
        },
      });
    };

    if (!findPhoto) {
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
