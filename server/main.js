import { Meteor } from 'meteor/meteor';
import { Promise } from 'meteor/promise';

import { loadInitialData } from '../imports/infra/initial-data';
import { People } from '../imports/collections/people';

Meteor.startup(() => {
  // DON'T CHANGE THE NEXT LINE
  loadInitialData();

  // YOU CAN DO WHATEVER YOU WANT HERE

  // creating a method to find participantes not cheked-out and group them by company
  Meteor.methods({
    aggregatePeopleByCompany(communityId) {
      const result = Promise.await(
        People.aggregate([
          {
            $match: {
              communityId: communityId,
              checkIn: { $exists: true },
              checkOut: { $exists: false },
            },
          },
          {
            $group: {
              _id: {
                _id: '$companyName',
              },
              count: {
                $sum: 1,
              },
            },
          },
          {
            $project: {
              _id: 0,
              companyName: '$_id._id',
              count: 1,
            },
          },
        ]).toArray()
      );
      return result;
    },
  });
});
