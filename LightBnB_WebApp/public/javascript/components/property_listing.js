$(() => {
  window.propertyListing = {};

  function createListing(property, isReserveForm, isReservation) {
    return `
    <article class="property-listing">
        <section class="property-listing__preview-image">
          <img src="${property.thumbnail_photo_url}" alt="house">
        </section>
        <section class="property-listing__details">
          <h3 class="property-listing__title">${property.title}</h3>
          <ul class="property-listing__details">
            <li>number_of_bedrooms: ${property.number_of_bedrooms}</li>
            <li>number_of_bathrooms: ${property.number_of_bathrooms}</li>
            <li>parking_spaces: ${property.parking_spaces}</li>
          </ul>
          ${
            isReservation
              ? `<p>${moment(property.start_date).format("ll")} - ${moment(
                  property.end_date
                ).format("ll")}</p>`
              : ``
          }
          <footer class="property-listing__footer">
            <div class="property-listing__rating">${
              Math.round(property.average_rating * 100) / 100
            }/5 stars</div>
            <div class="property-listing__price">$${
              property.cost_per_night / 100.0
            }/night</div>
          </footer>
          ${
            isReserveForm
              ? `<form name='${property.id}_reservation-form' class="reservation-form">
              <div class="reservation-form__field-wrapper">
                <label for='start_date'>Start Date:</label>
                <input type='date' name='start_date' />
              </div>
              <div class="reservation-form__field-wrapper">
                <label for='end_date'>End Date:</label>
                <input type='date' name='end_date' />
              </div>
              <input type='hidden' name='property_id' value="${property.id}" />
              <button type='submit' class="start-reservation-button">Make Reservation</button>
            </form>`
              : ``
          }
        </section>
      </article>
      
    `;
  }

  window.propertyListing.createListing = createListing;
});
