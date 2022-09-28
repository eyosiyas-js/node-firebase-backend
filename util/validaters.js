const isEmail = (email) => {
  const regX =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  if (email.match(regX)) return true;
  else return false;
};

const isEmpty = (string) => {
  if (string.trim() === "") return true;
  else return false;
};

const validatersSignUPData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = `Must not be empty`;
  } else if (!isEmail(data.email)) {
    errors.email = "Must be a valid email address";
  }

  if (isEmpty(data.password)) {
    errors.password = "Must not be empty";
  }

  if (isEmpty(data.confirmPassword)) {
    errors.password = "Must not be empty";
  }

  if (data.password !== data.confirmPassword) {
    errors.confirmPassword = "Passwords does not match";
  }

  if (isEmpty(data.handle)) {
    errors.handle = "Must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length === 0 ? true : false,
  };
};

const validatersLoginData = (data) => {
  let errors = {};

  if (isEmpty(data.email)) {
    errors.email = "Must not be empty";
  }
  if (isEmpty(data.password)) {
    errors.password = "Must not be empty";
  }

  return {
    errors,
    valid: Object.keys(errors).length == 0 ? true : false,
  };
};

const reduceUserDetails = (data) => {
  let details = {};
  if (!isEmpty(data.bio.trim())) {
    details.bio = data.bio;
  }
  if (!isEmpty(data.location.trim())) {
    details.location = data.location;
  }
  return details;
};

const reduceComment = (data) => {
  let comments = {};
  if (!isEmpty(data.body.trim())) {
    comments = data.body;
  }

  return comments;
};

export {
  isEmail,
  isEmpty,
  validatersSignUPData,
  validatersLoginData,
  reduceUserDetails,
  reduceComment,
};
