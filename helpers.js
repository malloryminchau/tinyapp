const getUserByEmail = function(email, database) {
  for(let element in database) {
    if (database[element].email === email) {
      let user = element;
      return user;
    }
  }
};

module.exports = getUserByEmail