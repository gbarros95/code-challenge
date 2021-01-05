import React, { useCallback, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import {
  Box,
  Button,
  Card,
  Container,
  Grid,
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@material-ui/core';
import PerfectScrollbar from 'react-perfect-scrollbar';
import moment from 'moment';

import { TEXTS } from '../infra/constants';

import { Communities } from '../collections/communities';
import { People } from '../collections/people';

// some customization
const useStyles = makeStyles(theme => ({
  root: {
    backgroundColor: theme.palette.background.dark,
    display: 'flex',
    height: '100%',
    overflow: 'hidden',
    width: '100%',
  },
  wrapper: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
    paddingTop: 40,
  },
  contentContainer: {
    display: 'flex',
    flex: '1 1 auto',
    overflow: 'hidden',
  },
  content: {
    flex: '1 1 auto',
    height: '100%',
    overflow: 'auto',
  },
  gridWrapper: {
    backgroundColor: theme.palette.background.dark,
    minHeight: '100%',
    paddingTop: theme.spacing(2),
  },
  buttonCheckIn: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.success.main,
    '&:hover': {
      backgroundColor: theme.palette.success.dark,
    },
  },
  buttonCheckOut: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.error.main,
    '&:hover': {
      backgroundColor: theme.palette.error.dark,
    },
  },
}));

export const App = () => {
  const classes = useStyles();

  const [communityId, setCommunityId] = useState('unselected');
  const [peopleOnEvent, setPeopleOnEvent] = useState(0);
  const [peopleNotCheckedIn, setPeopleNotCheckedIn] = useState(0);
  const [peopleByCompany, setPeopleByCompany] = useState([]);

  // a function to fetch every community on the database
  const communities = useTracker(() => {
    const result = Communities.find().fetch();
    return result;
  });

  // a function to fetch every person on the database, filtering by community ID
  // it will find participants checked-in, not checek-in and participantes by company
  const people = useTracker(() => {
    const result = People.find(
      { communityId: communityId },
      { sort: { firstName: 1, lastName: 1, companyName: 1 } }
    ).fetch();
    const count1 = People.find({
      communityId: communityId,
      checkIn: { $exists: true },
      checkOut: { $exists: false },
    }).count();
    const count2 = People.find({
      communityId: communityId,
      checkIn: { $exists: false },
    }).count();
    Meteor.call('aggregatePeopleByCompany', communityId, (err, result) => {
      setPeopleByCompany(result);
    });
    setPeopleOnEvent(count1);
    setPeopleNotCheckedIn(count2);
    return result;
  }, [communityId]);

  // a function to update a participant and set check-in date
  const onCheckIn = useCallback(personId => {
    People.update(personId, { $set: { checkIn: new Date() } });
  }, []);

  // a function to update a participant and set check-ou date
  const onCheckOut = useCallback(personId => {
    People.update(personId, { $set: { checkOut: new Date() } });
  });

  return (
    <div className={classes.root}>
      <div className={classes.wrapper}>
        <div className={classes.contentContainer}>
          <div className={classes.content}>
            <Container maxWidth={false}>
              <Grid
                className={classes.gridWrapper}
                container
                justify="space-between"
                spacing={3}
              >
                <Grid item>
                  <Typography variant="h3" color="textPrimary">
                    {TEXTS.HOME_TITLE}
                  </Typography>
                </Grid>
              </Grid>
              <Card>
                <Box p={2}>
                  <Box display="flex" alignItems="center">
                    <TextField
                      label="Event"
                      name="communityId"
                      select
                      fullWidth
                      variant="outlined"
                      value={communityId}
                      InputLabelProps={{
                        shrink: true,
                      }}
                      SelectProps={{ native: true }}
                      onChange={e => {
                        e.preventDefault();
                        setCommunityId(e.target.value);
                      }}
                    >
                      <option value={'unselected'}>Select an event</option>
                      {communities.map(item => (
                        <option key={item._id} value={item._id}>
                          {item.name}
                        </option>
                      ))}
                    </TextField>
                  </Box>
                  <Box flexGrow={1} />
                  <Box display="flex" alignItems="center">
                    <Typography>
                      People in the event right now: {peopleOnEvent}
                    </Typography>
                  </Box>
                  <Box flexGrow={1} />
                  <Box display="flex" alignItems="center">
                    <Typography>
                      People by company in the event right now:{' '}
                      {peopleByCompany.map(item => {
                        if (item.companyName) {
                          return `${item.companyName}(${item.count}), `;
                        }
                      })}
                    </Typography>
                  </Box>
                  <Box flexGrow={1} />
                  <Box display="flex" alignItems="center">
                    <Typography>
                      People not checked-in: {peopleNotCheckedIn}
                    </Typography>
                  </Box>
                  <Box flexGrow={1} />
                  <PerfectScrollbar>
                    <Box minWidth={700}>
                      <Card>
                        <Table>
                          <TableHead>
                            <TableRow>
                              <TableCell align="center">FULL NAME</TableCell>
                              <TableCell align="center">COMPANY NAME</TableCell>
                              <TableCell align="center">TITLE</TableCell>
                              <TableCell align="center" width="10%">
                                CHECK-IN
                              </TableCell>
                              <TableCell align="center" width="10%">
                                CHECK-OUT
                              </TableCell>
                              <TableCell align="right">ACTIONS</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {people.map(item => (
                              <TableRow key={item._id}>
                                <TableCell align="left">
                                  {item.firstName} {item.lastName}
                                </TableCell>
                                <TableCell align="center">
                                  {item.companyName ? item.companyName : ' -- '}
                                </TableCell>
                                <TableCell align="center">
                                  {item.title ? item.title : ' -- '}
                                </TableCell>
                                <TableCell align="center">
                                  {item.checkIn
                                    ? moment(item.checkIn).format('MM/DD/YYYY')
                                    : 'N/A'}
                                </TableCell>
                                <TableCell align="center">
                                  {item.checkOut
                                    ? moment(item.checkOut).format('MM/DD/YYYY')
                                    : 'N/A'}
                                </TableCell>
                                <TableCell align="right">
                                  {item.checkIn && item.checkOut ? (
                                    'N/A'
                                  ) : item.checkIn ? (
                                    <Button
                                      className={classes.buttonCheckOut}
                                      onClick={() => onCheckOut(item._id)}
                                    >
                                      Check-out {item.firstName} {item.lastName}
                                    </Button>
                                  ) : (
                                    <Button
                                      className={classes.buttonCheckIn}
                                      onClick={() => onCheckIn(item._id)}
                                    >
                                      Check-in {item.firstName} {item.lastName}
                                    </Button>
                                  )}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </Card>
                    </Box>
                  </PerfectScrollbar>
                </Box>
              </Card>
            </Container>
          </div>
        </div>
      </div>
    </div>
  );
};
