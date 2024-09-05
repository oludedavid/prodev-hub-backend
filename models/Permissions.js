//Load the json file that contains the roles
const roles = require("../config/roles.json");

class Permissions {
  constructor() {
    this.permissions = [];
  }

  //Get the permissions for a role name
  getPermissionsByRoleName(roleName) {
    const role = roles.roles.find((role) => role.name === roleName);
    return role?.permissions || [];
  }
}

module.exports = Permissions;
