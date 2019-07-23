import gql from 'graphql-tag';

// measurements_day(where: {datetime : {_gt: "2018-12-31", _lt: "2019-02-01"}, device_id: {_eq: 3} })  {

export const GetQuery = gql`
query PostsGetQuery{
      measurements_day(where: {device_id: {_eq: 3} })  {
      device_id
      datetime
      temperature
      rain
    }
}`;
