const { PrismaClient } = require("@prisma/client");
const { badRequestMessage, successMessageWithData } = require("../utils/message");
const { hashPassword } = require("../utils/password");

function loginController(req, res) {
  return res.send("login");
}

async function registerController(req, res) {
  try {
    const { username, fullname, password, confirmPassword, email, address } = req.body;

    if (confirmPassword !== password) {
      return res.send(
        badRequestMessage({
          messages: [
            {
              field: "confirmPassword",
              message: "Password and confirmation do not match.",
            },
          ],
        })
      );
    }

    const prisma = new PrismaClient();

    const check = await prisma.user.findMany({
      where: {
        OR: [
          {
            username: username,
          },
          {
            email: email,
          },
        ],
      },
    });

    if (check) {
      check.map((item) => {
        if (item.email === email && item.username === username) {
          return res.status(400).send(
            badRequestMessage({
              messages: [
                {
                  field: "email",
                  message: "Email address is already in use",
                },
                {
                  field: "username",
                  message: "Username address is already in use",
                },
              ],
            })
          );
        }

        if (item.email === email) {
          return res.status(400).send(
            badRequestMessage({
              messages: [
                {
                  field: "email",
                  message: "Email address is already in use",
                },
              ],
            })
          );
        }

        if (item.username === username) {
          return res.status(400).send(
            badRequestMessage({
              messages: [
                {
                  field: "username",
                  message: "Username address is already in use",
                },
              ],
            })
          );
        }
      });
    }

    const hashUserPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        username: username,
        fullName: fullname,
        password: hashUserPassword,
        email: email,
        address: address,
        photoUrl: "default-profile.jpeg",
      },
    });

    return res.send(successMessageWithData(newUser));
  } catch (error) {
    console.log(error);
  }
}

module.exports = { loginController, registerController };
