import { Mongo } from 'meteor/mongo';

export const People = new Mongo.Collection('people');

// added permission to update the person to set check-in and check-out
People.allow({
  update() {
    return true;
  },
});
