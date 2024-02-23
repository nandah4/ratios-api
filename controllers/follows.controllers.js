const { PrismaClient } = require('@prisma/client');
const { badRequestMessage, successMessageWithData } = require('../utils/message');
const { verifyJwt } = require('../utils/jwt');

const prisma = new PrismaClient();

const getFollowersController = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { userId } = req.params;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false,
            },
        });

        if (!existingUser) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "User not found",
                    },
                ],
            }));
        };

        const followers = await prisma.follows.findMany({
            where: {
                followingId: userId,
                follower: {
                    isDeleted: false,
                }
            },
            select: {
                followerId: true,
            },
        });

        const followersData = [];

        for (const follower of followers) {
            const userData = await prisma.user.findUnique({
                where: {
                    id: follower.followerId,
                },
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    email: true,
                    photoUrl: true, 
                }
            });
            userData.followerId = follower.followerId;
            followersData.push(userData);
        }

        return res.status(200).send(successMessageWithData(followersData));

    } catch (error) {
        console.log(error)
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal server error",
                }
            ],
        }));
    };
};

const getFollowingController = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { userId } = req.params;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false
            },
        });

        if (!existingUser) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "User not found"
                    },
                ],
            }));
        };

        const following = await prisma.follows.findMany({
            where: {
                followerId: userId,
                following: {
                    isDeleted: false
                }
            },
            select: {
                followingId: true
            },
        });

        const followingData = [];

        for (const follow of following) {
            const userData = await prisma.user.findUnique({
                where: {
                    id: follow.followingId,
                },
                select: {
                    id: true,
                    username: true,
                    fullName: true,
                    email: true,
                    photoUrl: true,
                }
            });
                userData.followingId = follow.followingId;
                followingData.push(userData)      
        }

        return res.status(200).send(successMessageWithData(followingData))

    } catch (error) {
        console.log(error);
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal server error"
                },
            ],
        }));
    };
}

const followUsersController = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { userId } = req.params;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false
            },
        });

        if (!existingUser) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "User not found",
                    },
                ],
            }));
        };

        const existingFollow = await prisma.follows.findFirst({
            where: {
                followerId: parseToken.userId,
                followingId: userId,
            },
        });

        if (existingFollow) {
            return res.status(400).send(badRequestMessage({
                messages: [
                    {
                        field: "followerId",
                        message: "You already follow this user"
                    },
                ],
            }));
        };

        if (parseToken.userId === userId) {
            return res.status(403).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "You do not have permission to follow"
                    },
                ],
            }));
        };

        const follow = await prisma.follows.create({
            data: {
                followerId: parseToken.userId,
                followingId: userId,
            },
        });

        return res.status(200).send(successMessageWithData(follow));
    } catch (error) {
        console.log(error);
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal server error",
                },
            ],
        }));
    };
}

const unfollowControllers = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { userId } = req.params;

    try {
        const existingUser = await prisma.user.findFirst({
            where: {
                id: userId,
                isDeleted: false,
            },
        });

        if (!existingUser) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "User not found",
                    },
                ],
            }));
        };

        if (parseToken.userId === userId) {
            return res.status(403).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "You do not have permission to unfollow"
                    }
                ]
            }))
        }

        const existingFollow = await prisma.follows.findFirst({
            where: {
                followingId: userId,
                followerId: parseToken.userId,
            },
        });


        if (!existingFollow) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "followingId",
                        message: "You don't follow this user yet"
                    },
                ],
            }));
        };

        const unfollow = await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: parseToken.userId,
                    followingId: userId
                },
            },
        });

        return res.status(200).send(successMessageWithData(unfollow));
    } catch (error) {
        console.log(error);
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal server error"
                }
            ]
        }))
    }
}

const deleteFollowersController = async (req, res) => {
    const parseToken = verifyJwt(req.headers?.authorization);
    const { followerId } = req.params;

    try {
        const existingFollower = await prisma.user.findFirst({
            where: {
                id: followerId,
                isDeleted: false
            },
        });

        if (!existingFollower) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "followerId",
                        message: "User not found"
                    },
                ],
            }));
        };

        if (parseToken.userId === followerId) {
            return res.status(403).send(badRequestMessage({
                messages: [
                    {
                        field: "userId",
                        message: "You cannot unfollow yourself"
                    },
                ],
            }));
        };

        const existingFollow = await prisma.follows.findFirst({
            where: {
                followerId: followerId,
                followingId: parseToken.userId,
            },
        });

        if (!existingFollow) {
            return res.status(404).send(badRequestMessage({
                messages: [
                    {
                        field: "followers",
                        message: "Followers not found"
                    },
                ],
            }));
        };

        const deleteFollower = await prisma.follows.delete({
            where: {
                followerId_followingId: {
                    followerId: followerId,
                    followingId: parseToken.userId,
                },
            },
        });

        return res.status(200).send(successMessageWithData(deleteFollower));
    } catch (error) {
        console.log(error);
        return res.status(500).send(badRequestMessage({
            messages: [
                {
                    message: "Internal server error"
                }
            ]
        }))
    }
}

module.exports = { getFollowersController, getFollowingController, followUsersController, unfollowControllers, deleteFollowersController }
