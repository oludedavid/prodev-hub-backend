// models/role.js
//Load the json file that contains the roles
const roles = require("../config/roles.json");

//Define the Role class
class Role {
  //Define the constructor that defines the new instance of the Role class
  constructor() {
    this.roles = roles.roles;
  }

  //check if role is valid or exists
  checkRoleExists(roleName) {
    return this.roles.some((role) => role.name === roleName);
  }

  //Define the getRoleByName method that returns the role with the specified name
  //Finds and returns a specific role by its name from the loaded roles.
  getRoleByName(name) {
    return this.roles.find((role) => role.name === name);
  }

  //Define the getRoles method that returns all the roles
  //Returns the entire collection of loaded roles.
  getRoles() {
    return this.roles;
  }
}

module.exports = Role;
