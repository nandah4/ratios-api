const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, badRequestMessage } = require("../utils/message");
const { Extensions } = require("@prisma/client/runtime/library");
const { response } = require("express");

const prisma = new PrismaClient();

// ADMIN - getAllUser
const getAllUserController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { users, currentPage = 1 } = req.query;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have permission to access this resource",
            },
          ],
        })
      );
    }

    const per_page = parseInt(req.query.page);
    const offset = (currentPage - 1) * per_page;

    const total_user = await prisma.user.count({
      where: {
        role: "USER",
      },
    });

    const total_page = Math.ceil(total_user / per_page);

    if (!per_page || currentPage > total_page) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "currentPage",
              message: "Page not fond",
            },
          ],
        })
      );
    }

    let getAllUser;
    if (currentPage > 0) {
      if (users) {
        getAllUser = await prisma.user.findMany({
          where: {
            role: "USER",
            OR: [
              {
                username: {
                  contains: users,
                },
              },
              {
                fullName: {
                  contains: users,
                },
              },
            ],
          },

          skip: offset,
          take: per_page,
          orderBy: {
            isDeleted: "asc",
          },
        });
      } else {
        getAllUser = await prisma.user.findMany({
          where: {
            role: "USER",
          },
          skip: offset,
          take: per_page,
          orderBy: {
            isDeleted: "asc",
          },
        });
      }
    } else {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "currentPage",
              message: "Page not found",
            },
          ],
        })
      );
    }

    const responseData = {
      page: currentPage,
      per_page: per_page,
      total_user: total_user,
      total_page: total_page,
      data: getAllUser.map(user => ({
        id: user.id,
        username: user.username,
        fullName: user.fullName,
        password: user.password,
        photoUrl: user.photoUrl,
        email: user.email,
        address: user.address,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        isDeleted: user.isDeleted,
        role: user.role
      }))
    };
    

    return res.status(200).send(successMessageWithData(responseData));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - Detail User
const detailUserByAdminController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { userId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have permission to access this resource",
            },
          ],
        })
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "USER",
      },
      include: {
        _count: {
          select: {
            photos: true,
            albums: true,
            followers: true,
            following: true,
            likes: true,
            comentars: true,
          },
        },
      },
    });

    if (!existingUser) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "User not found",
            },
          ],
        })
      );
    }

    return res.status(200).send(successMessageWithData(existingUser));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - deleteUser
const deleteUserController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { userId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "role",
              message: "You don`t have permission to access this resource",
            },
          ],
        })
      );
    }

    const findUser = await prisma.user.findFirst({
      where: {
        id: userId,
        role: "USER",
      },
    });

    if (!findUser) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "userId",
              message: "User not found",
            },
          ],
        })
      );
    }

    const deleteUser = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).send(successMessageWithData(deleteUser));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - GET ALL FOTO
const getAllPhotoController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { photos, currentPage = 1 } = req.query;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have access this resource",
            },
          ],
        })
      );
    }

    const per_page = parseInt(req.query.page);
    const offset = (currentPage - 1) * per_page;

    const total_photo = await prisma.photo.count({
      where: {
        user: {
          role: "USER",
        },
      },
    });

    const total_page = Math.ceil(total_photo / per_page);

    if (!per_page || currentPage > total_page) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "currentPage",
              message: "Page not found",
            },
          ],
        })
      );
    }

    let getAllPhoto;

    if (currentPage > 0) {
      if (photos) {
        getAllPhoto = await prisma.photo.findMany({
          where: {
            user: {
              role: "USER",
            },
            OR: [
              {
                title: {
                  contain: photos,
                },
              },
              {
                description: {
                  contains: photos,
                },
              }
            ],
          },

          skip: offset,
          take: per_page,
          orderBy: {
            createdAt: 'desc',
          }
        });
      } else {
        getAllPhoto = await prisma.photo.findMany({
          where: {
            user: {
              role: 'USER'
            },
          },
          skip: offset,
          take: per_page,
          orderBy: {
            createdAt: 'desc'
          }
        })
      }
    } else {
      return res.status(404).send(badRequestMessage({
        messages: [
          {
            field: "currentPage",
            message: "Page not found"
          }
        ]
      }))
    }

    const responseData = {
      page: currentPage,
      per_page: per_page,
      total_user: total_photo,
      total_page: total_page,
      data: getAllPhoto.map(photo => ({
        id: photo.id,
        userId: photo.userId,
        title: photo.title,
        description: photo.description,
        locationFile: photo.locationFile,
        createdAt: photo.createdAt,
        updatedAt: photo.updatedAt,
        isDeleted: photo.isDeleted,
      }))
    };

    return res.status(200).send(successMessageWithData(responseData));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - GET DETAIL PHOTO
const detailPhotoByAdminController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { photoId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId and role",
              message: "You don`t have access this resource",
            },
          ],
        })
      );
    }

    const existingPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
        user: {
          role: "USER",
        },
      },
    });

    if (!existingPhoto) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "photoId",
              message: "Foto not found",
            },
          ],
        })
      );
    }

    const photo = await prisma.photo.findFirst({
      where: {
        id: photoId,
      },
      include: {
        user: true,
        albums: true,
        likes: true,
        comentars: true,
      },
    });

    return res.status(200).send(successMessageWithData(photo));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - DELETE PHOTO
const deletePhotoController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { photoId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have access this resouerce",
            },
          ],
        })
      );
    }

    const deletePhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).send(successMessageWithData(deletePhoto));
  } catch (error) {
    console.log(error);
  }
};

// ADMIN - DELETE COMENTAR
const deleteComentarByAdminController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { comentarId } = req.params;

  try {
    const admin = await prisma.user.findUnique({
      where: {
        id: parseToken.userId,
        role: "ADMIN",
      },
    });

    if (!admin || admin.role !== "ADMIN") {
      return res.status(403).send(
        badRequestMessage({
          messages: [
            {
              field: "userId or role",
              message: "You don`t have access this resouerce",
            },
          ],
        })
      );
    }

    const existingComentar = await prisma.comentar.findFirst({
      where: {
        id: comentarId,
        user: {
          role: "USER",
        },
      },
    });

    if (!existingComentar) {
      return res.status(404).send(
        badRequestMessage({
          messages: [
            {
              field: "comentarId",
              message: "Comentar not found",
            },
          ],
        })
      );
    }

    const deleteComentar = await prisma.comentar.update({
      where: {
        id: comentarId,
      },
      data: {
        isDeleted: true,
      },
    });

    return res.status(200).send(successMessageWithData(deleteComentar));
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  getAllUserController,
  detailUserByAdminController,
  deleteUserController,
  getAllPhotoController,
  detailPhotoByAdminController,
  deletePhotoController,
  deleteComentarByAdminController,
};
