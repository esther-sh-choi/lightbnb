const { Pool } = require("pg");

const pool = new Pool({
  user: "vagrant",
  password: "pw",
  host: "localhost",
  database: "lightbnb",
});

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(
      `SELECT * FROM users
          WHERE email = $1;
        `,
      [email]
    )
    .then((result) => {
      console.log(result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(
      `SELECT * FROM users
        WHERE id = $1;
      `,
      [id]
    )
    .then((result) => {
      console.log(result.rows[0]);
      return result.rows[0];
    })
    .catch((err) => {
      console.log(err.message);
      return null;
    });
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  const { name, email, password } = user;
  return pool
    .query(
      `INSERT INTO users (name, email, password)
      VALUES ($1, $2, $3)
      RETURNING *;`,
      [name, email, password]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 10) {
  return pool
    .query(
      `SELECT properties.*, reservations.*, avg(rating) as average_rating FROM properties
      JOIN reservations ON properties.id = property_id
      JOIN property_reviews ON properties.id = property_reviews.property_id
      WHERE reservations.guest_id = $1
      GROUP BY properties.id, reservations.id
      LIMIT $2;
      `,
      [guest_id, limit]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllReservations = getAllReservations;

/**
 * Submit reservation for a single user.
 * @param {{guest_id: integer, property_id: integer, start_date: date, end_date: date}} object Reservation data of the user (guest).
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const submitReservation = function (data) {
  const { guest_id, property_id, start_date, end_date } = data;
  return pool
    .query(
      `
    INSERT INTO reservations (start_date, end_date, property_id, guest_id)
    VALUES ($1, $2, $3, $4)
    RETURNING *;
  `,
      [start_date, end_date, property_id, guest_id]
    )
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.submitReservation = submitReservation;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = function (options, limit = 10) {
  const queryParams = [limit];

  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;

  if (options.city) {
    queryParams.push(`city LIKE '%${options.city}%'`);
  }

  if (options.owner_id) {
    queryParams.push(`properties.owner_id = ${options.owner_id}`);
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(
      `cost_per_night >= ${options.minimum_price_per_night * 100}`,
      `cost_per_night <= ${options.maximum_price_per_night * 100}`
    );
  } else if (options.minimum_price_per_night) {
    queryParams.push(
      `cost_per_night >= ${options.minimum_price_per_night * 100}`
    );
  } else if (options.maximum_price_per_night) {
    queryParams.push(
      `cost_per_night <= ${options.maximum_price_per_night * 100}`
    );
  }

  queryString += queryParams.length > 1 ? " WHERE " : "";
  // empty queryParams
  queryString += queryParams.splice(1).join(" AND ");
  queryString += ` GROUP BY properties.id `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryString += `LIMIT $1;`;
  console.log(queryString);

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const {
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
  } = property;
  const query = `INSERT INTO properties (owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
RETURNING *;`;
  const params = [
    owner_id,
    title,
    description,
    thumbnail_photo_url,
    cover_photo_url,
    cost_per_night,
    street,
    city,
    province,
    post_code,
    country,
    parking_spaces,
    number_of_bathrooms,
    number_of_bedrooms,
  ];
  return pool
    .query(query, params)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.addProperty = addProperty;

/*
const getAllProperties = function (options, limit = 10) {
  const queryParams = [];

  let queryString = `
    SELECT properties.*, avg(property_reviews.rating) as average_rating
    FROM properties
    JOIN property_reviews ON properties.id = property_id
    `;

  if (options.city) {
    queryParams.push(`%${options.city}%`);
    queryString += `WHERE city LIKE $${queryParams.length} `;
  }

  if (options.owner_id) {
    queryParams.push(options.owner_id);
    queryString += queryParams.length > 1 ? "AND " : "WHERE ";
    queryString += `properties.owner_id = $${queryParams.length} `;
  }

  if (options.minimum_price_per_night && options.maximum_price_per_night) {
    queryParams.push(
      options.minimum_price_per_night * 100,
      options.maximum_price_per_night * 100
    );
    queryString += queryParams.length > 1 ? "AND " : "WHERE ";
    queryString += `cost_per_night >= $${
      queryParams.length - 1
    } AND cost_per_night <= $${queryParams.length} `;
  } else if (options.minimum_price_per_night) {
    queryParams.push(options.minimum_price_per_night * 100);
    queryString += queryParams.length > 1 ? "AND " : "WHERE ";
    queryString += `cost_per_night >= $${queryParams.length} `;
  } else if (options.maximum_price_per_night) {
    queryParams.push(options.maximum_price_per_night * 100);
    queryString += queryParams.length > 1 ? "AND " : "WHERE ";
    queryString += `cost_per_night <= $${queryParams.length} `;
  }

  queryString += `GROUP BY properties.id `;

  if (options.minimum_rating) {
    queryParams.push(options.minimum_rating);
    queryString += `HAVING avg(property_reviews.rating) >= $${queryParams.length}`;
  }

  queryParams.push(limit);
  queryString += `LIMIT $${queryParams.length};`;

  return pool
    .query(queryString, queryParams)
    .then((result) => {
      console.log(result.rows);
      return result.rows;
    })
    .catch((err) => {
      console.log(err.message);
    });
};
exports.getAllProperties = getAllProperties; */
