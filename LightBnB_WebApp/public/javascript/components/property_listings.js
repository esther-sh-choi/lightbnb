$(() => {
  const $propertyListings = $(`
  <section class="property-listings" id="property-listings">
      <p>Loading...</p>
      
    </section>
  `);
  window.$propertyListings = $propertyListings;

  window.propertyListings = {};

  function addListing(listing) {
    $propertyListings.append(listing);
  }
  function clearListings() {
    $propertyListings.empty();
  }

  const reservationForm = () => {
    $("form.reservation-form").on("submit", function (event) {
      event.preventDefault();
      console.log(event);

      const data = $(this).serialize();
      addReservation(data)
        .then(() => {
          views_manager.show("listings");
        })
        .catch((error) => {
          console.error(error);
          views_manager.show("listings");
        });
    });
  };
  window.propertyListings.reservationForm = reservationForm;

  window.propertyListings.clearListings = clearListings;

  function addProperties(
    properties,
    isReserveForm = false,
    isReservation = false
  ) {
    clearListings();

    for (const propertyId in properties) {
      const property = properties[propertyId];
      const listing = propertyListing.createListing(
        property,
        isReserveForm,
        isReservation
      );
      addListing(listing, isReservation);
    }
  }
  window.propertyListings.addProperties = addProperties;
});
