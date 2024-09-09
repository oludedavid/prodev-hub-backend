//Load the json file that contains the badges
const badges = require("../config/badges.json");

class Permissions {
  constructor() {
    this.permissions = [];
  }

  //Get the permissions for a badge name
  getPermissionsBybadgeName(badgeName) {
    const badge = badges.badges.find((badge) => badge.name === badgeName);
    return badge?.permissions || [];
  }
}

module.exports = Permissions;
