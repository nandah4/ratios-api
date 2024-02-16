const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, successCreateMessageWithData, badRequestMessage } = require("../utils/message");
const { parse } = require("dotenv");

// GET DETAIL ALBUM
const getAlbumByAlbumIdAndUserIdController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const prisma = new PrismaClient();
  const { albumId } = req.params;

  try {
    const existingAlbum = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false,
      },
    });

    if (!existingAlbum) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "albumId",
              message: "Album not found",
            },
          ],
        })
      );
    }

    const album = await prisma.album.findFirst({
      where: {
        id: albumId,
        isDeleted: false,
      },
      select : {
        id: true,
        userId: true,
        title: true,
        description: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            photoUrl: true,
          },
        },
        photos: {
          where: {
            isDeleted: false,
          },
          select: {
            id: true,
            userId: true,
            title: true,
            description: true,
            locationFile: true,
            user: {
              select: {
                id: true,
                username: true,
                fullName: true,
                email: true,
                photoUrl: true,
              },
          },
          },
        },
      }
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

    // const hideUserPasswordPhotoAlbum = album.map(photo => {
    //   const photoWithoutPassword = photo.photos.map(photo => {
    //     const userWithoutPassword = {...photo.user};
    //     delete userWithoutPassword.password;
    //     return {...photo, user: userWithoutPassword};
    //   })
    //   return {...photo, user: photoWithoutPassword};
    // })

    return res.status(200).send(successMessageWithData(album));
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
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            photoUrl: true
          }
        }
      }
    });

    // const hideUserPasswordPhotoAlbum = { ...newAlbum.user };
    // delete hideUserPasswordPhotoAlbum.password;
    // delete hideUserPasswordPhotoAlbum.role;
    // const hidePassword = { ...newAlbum, user: hideUserPasswordPhotoAlbum };

    return res.send(successMessageWithData(newAlbum));
  } catch (error) {
    console.log(error)
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
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "albumId",
              message: "Album not found",
            },
          ],
        })
      );
    }

    if (findAlbum.userId !== parseToken.userId) {
      return res.status(400).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "You don`t have permission to update this album",
            },
          ],
        })
      );
    }

    const title = req.body?.title;
    const description = req.body?.description;
    const error = [];

    if (!title) {
      error.push({
        field: "title",
        message: "title is required",
      });
    }

    if (error.length !== 0) {
      return res.status(404).send(
        badRequestMessage({
          messages: [...error],
        })
      );
    }

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
        user: {
          select: {
            id: true,
            username: true,
            fullName: true,
            email: true,
            photoUrl: true,
          },
        },
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
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "albumId",
              message: "Album not found",
            },
          ],
        })
      );
    }

    if (findAlbum.userId !== parseToken.userId) {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "You don`t have permission to delete this album",
            },
          ],
        })
      );
    }

    // await prisma.photo.updateMany({
    //   where: {
    //     albumId: albumId,
    //   },
    //   data: {
    //     albumId: null,
    //   },
    // });

    const album = await prisma.album.update({
      where: {
        id: albumId,
        userId: parseToken.userId,
      },
      data: {
        isDeleted: true,
      },
    });

    if (!album) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "albumId",
              message: "Album not found",
            },
          ],
        })
      );
    }

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
        isDeleted: false,
      },
    });

    if (!findAlbum) {
      return res.status(404).send(
        badRequestMessage({
          messages: {
            field: "albumId",
            message: "Album not found",
          },
        })
      );
    }

    const findPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        isDeleted: false,
      },
    });

    if (!findPhoto) {
      return res.status(404).send(
        badRequestMessage({
          messages: {
            field: "photoId",
            message: "Foto not found",
          },
        })
      );
    }

    if (findAlbum.userId !== parseToken.userId) {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "You don't have permission to add this photo to the album",
            },
          ],
        })
      );
    }

    const addPhotoToAlbum = await prisma.album.update({
      where: {
        id: albumId,
      },
      data: {
        photos: {
          connect: {
            id: photoId
          }
        }
      }
    });

  await prisma.photo.update({
      where: {
        id: photoId,
      },
      data: {
        albums: {
          connect: {
            id: albumId
          }
        }
      }
    });

    return res.status(200).send(successMessageWithData());

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

    if (!findAlbum) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "albumId",
              message: "Album not found",
            },
          ],
        })
      );
    }

    const findPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        isDeleted: false,
      },
    });

    if (!findPhoto) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "photoId",
              message: "photo not found",
            },
          ],
        })
      );
    }

    if (findAlbum.userId !== parseToken.userId) {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "You don`t have permission to delete this foto from album",
            },
          ],
        })
      );
    }

    if(!findPhoto.albums.some(album => album.id === albumId)) {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "photoId",
            message: "Photo already removed from the album"
          }
        ]
      }))
    }

    const deletePhoto = await prisma.album.update({
      where: {
        id: albumId,
      },
      data: {
        photos: {
          disconnect: {
            id: photoId
          }
        }
      },
    });

    return res.status(200).send(successMessageWithData());
  } catch (error) {
    console.log(error);
    return res.status(500).send({
      messages: [
        {
          message: "Internal server error",
        },
      ],
    });
  }
};

module.exports = {
  createAlbumByUserIdController,
  getAlbumByAlbumIdAndUserIdController,
  updateAlbumByUserIdController: updateAlbumByAlbumIdAndUserIdController,
  deleteAlbumByAlbumIdAndUserIdController,
  addPhotoToAlbum,
  deletePhotoFromAlbum,
};
