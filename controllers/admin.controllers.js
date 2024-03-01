const { PrismaClient } = require("@prisma/client");
const { verifyJwt } = require("../utils/jwt");
const { successMessageWithData, badRequestMessage } = require("../utils/message");
const { Extensions } = require("@prisma/client/runtime/library");
const { response } = require("express");

const prisma = new PrismaClient();

// ADMIN - getAllUser
const getAllUserController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { currentPage = 1, isDeleted = "false", search } = req.query;

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

    const total_user_active = await prisma.user.count({
      where: {
        role: "USER",
        isDeleted: false,
      },
    });

    const total_page = Math.ceil(total_user_active / per_page);

    let getAllUser;
    if (!currentPage || !per_page || !isDeleted) {
      getAllUser = await prisma.user.findMany({
        where: {
          isDeleted: false,
          role: "USER",
        },
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
      });

      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_user_active: total_user_active,
        total_all_user: total_user,
        total_all_page: total_page,
        data: getAllUser.map((user) => ({
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
          role: user.role,
        })),
      };

      return res.status(200).send(successMessageWithData(responseData));
    } else if (isDeleted === "false") {
      getAllUser = await prisma.user.findMany({
        where: {
          role: "USER",
          isDeleted: false,
          OR: search
            ? [
                {
                  username: {
                    contains: search,
                  },
                },
                {
                  fullName: {
                    contains: search,
                  },
                },
              ]
            : undefined,
        },
        skip: offset,
        take: per_page,
        orderBy: {
          createdAt: "desc",
        },
      });

      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_user_active: total_user_active,
        total_all_user: total_user,
        total_all_page: total_page,
        data: getAllUser.map((user) => ({
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
          role: user.role,
        })),
      };

      return res.status(200).send(successMessageWithData(responseData));
    } else if (isDeleted === "true") {
      getAllUser = await prisma.user.findMany({
        where: {
          role: "USER",
          isDeleted: true,
          OR: search
            ? [
                {
                  username: {
                    contains: search,
                  },
                },
                {
                  fullName: {
                    contains: search,
                  },
                },
              ]
            : undefined,
        },
        skip: offset,
        take: per_page,
        orderBy: {
          createdAt: "desc",
        },
      });

      const total_user_deleted = await prisma.user.count({
        where: {
          role: "USER",
          isDeleted: true,
        },
      });

      const total_page = Math.ceil(total_user_deleted / per_page);

      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_user_deleted: total_user_deleted,
        total_all_user: total_user,
        total_all_page: total_page,
        data: getAllUser.map((user) => ({
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
          role: user.role,
        })),
      };
      return res.status(200).send(successMessageWithData(responseData));
    } else {
      getAllUser = await prisma.user.findMany({
        where: {
          role: "USER",
        },
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
      });

      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_user_active: total_user_active,
        total_all_user: total_user,
        total_all_page: total_page,
        data: getAllUser.map((user) => ({
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
          role: user.role,
        })),
      };
      return res.status(200).send(successMessageWithData(responseData));
    }
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
// ADMIN - updateIsdeletedUser
const updateIsdeletedUser = async (req, res) => {
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
              message: "You don`t have access this resource",
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

    const userUpdate = await prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        isDeleted: false,
      },
    });

    return res.status(200).send(successMessageWithData(userUpdate));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages:
          "Internal Server Error. Don't worry, our team is on it! In the meantime, you might want to refresh the page or come back later.",
      })
    );
  }
};

// ADMIN - GET ALL FOTO
const getAllPhotoController = async (req, res) => {
  const parseToken = verifyJwt(req.headers?.authorization);
  const { currentPage = 1, isDeleted = "false", search } = req.query;

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

    const total_photo_active = await prisma.photo.count({
      where: {
        isDeleted: false,
        user: {
          role: "USER",
        },
      },
    });

    const total_page = Math.ceil(total_photo_active / per_page);

    let getAllPhoto;
    if (!per_page || !currentPage || !isDeleted) {
      getAllPhoto = await prisma.photo.findMany({
        where: {
          user: {
            role: "USER",
          },
        },
        include: {
          user: true,
        },
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
      });
      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_photo_active: total_photo_active,
        total_all_photo: total_photo,
        tota_all_page: total_page,
        data: [...getAllPhoto],
      };

      return res.status(200).send(successMessageWithData(responseData));
    } else if (isDeleted === "false") {
      getAllPhoto = await prisma.photo.findMany({
        where: {
          isDeleted: false,
          user: {
            role: "USER",
          },
          OR: search
            ? [
                {
                  title: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
              ]
            : undefined,
        },
        include: {
          user: true,
        },
        skip: offset,
        take: per_page,
        orderBy: {
          createdAt: "desc",
        },
      });
      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_photo_active: total_photo_active,
        total_all_photo: total_photo,
        total_all_page: total_page,
        data: [...getAllPhoto],
      };

      return res.status(200).send(successMessageWithData(responseData));
    } else if (isDeleted === "true") {
      getAllPhoto = await prisma.photo.findMany({
        where: {
          isDeleted: true,
          user: {
            role: "USER",
          },
          OR: search
            ? [
                {
                  title: {
                    contains: search,
                  },
                },
                {
                  description: {
                    contains: search,
                  },
                },
              ]
            : undefined,
        },
        include: {
          user: true,
        },
        skip: offset,
        take: per_page,
        orderBy: {
          createdAt: "desc",
        },
      });

      const total_photo_deleted = await prisma.photo.count({
        where: {
          isDeleted: true,
          user: {
            role: "USER",
          },
        },
      });

      const total_page = Math.ceil(total_photo_deleted / per_page);
      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_photo_deleted: total_photo_deleted,
        total_all_photo: total_photo,
        total_all_page: total_page,
        data: [...getAllPhoto],
      };

      return res.status(200).send(successMessageWithData(responseData));
    } else {
      getAllPhoto = await prisma.photo.findMany({
        where: {
          user: {
            role: "USER",
          },
        },
        include: {
          user: true,
        },
        take: 8,
        orderBy: {
          createdAt: "desc",
        },
      });
      const responseData = {
        page: currentPage,
        per_page: per_page,
        total_photo_active: total_photo_active,
        total_all_photo: total_photo,
        total_all_page: total_page,
        data: [...getAllPhoto],
      };

      return res.status(200).send(successMessageWithData(responseData));
    }
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

    const deletePhoto = await prisma.photo.update({
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

// ADMIN - UPDATE IS DELETED
const updatePhotoIsDeleted = async (req, res) => {
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

    const existingPhoto = await prisma.photo.findFirst({
      where: {
        id: photoId,
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

    const updatePhoto = await prisma.photo.update({
      where: {
        id: photoId,
      },
      data: {
        isDeleted: false,
      },
    });

    return res.status(200).send(successMessageWithData(updatePhoto));
  } catch (error) {
    console.log(error);
    return res.status(500).send(
      badRequestMessage({
        messages: "Internal Server Error",
      })
    );
  }
};

module.exports = {
  getAllUserController,
  detailUserByAdminController,
  deleteUserController,
  updateIsdeletedUser,
  getAllPhotoController,
  detailPhotoByAdminController,
  deletePhotoController,
  deleteComentarByAdminController,
  updatePhotoIsDeleted,
};
