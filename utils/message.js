const badRequestMessage = ({ messages, error }) => {
  return {
    status: 400,
    message: "Bad Request",
    errors: {
      error,
      messages: messages,
    },
  };
};

const successMessageWithData = (data) => {
  return {
    stastus: 200,
    message: "Success",
    data: data,
  };
};

const successCreateMessageWithData = () => {
  return {
    stastus: 201,
    message: "Successfull create",
  };
};

const authMessage = () => {
  return {
    status: 401,
    message: "Unauthorized",
  };
};

module.exports = { badRequestMessage, successMessageWithData, successCreateMessageWithData, authMessage };
