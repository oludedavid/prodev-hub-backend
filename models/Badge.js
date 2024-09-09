// models/badge.js
//Load the json file that contains the badges
const badges = require("../config/badges.json");

//Define the badge class
class Badge {
  //Define the constructor that defines the new instance of the badge class
  constructor() {
    this.badges = badges.badges;
  }

  //check if badge is valid or exists
  checkbadgeExists(badgeName) {
    return this.badges.some((badge) => badge.name === badgeName);
  }

  //Define the getbadgeByName method that returns the badge with the specified name
  //Finds and returns a specific badge by its name from the loaded badges.
  getbadgeByName(name) {
    return this.badges.find((badge) => badge.name === name);
  }

  //Define the getbadges method that returns all the badges
  //Returns the entire collection of loaded badges.
  getbadges() {
    return this.badges;
  }
}

module.exports = Badge;
