const badRequestMessage = ({ messages, error }) => {
  return {
    status: 400,
    messages: "bad request",
    errors: {
      error,
      messages: messages,
    },
  };
};

const successMessageWithData = (data) => {
  return {
    stastus: 200,
    message: "success",
    data: data,
  };
};

module.exports = { badRequestMessage, successMessageWithData };
