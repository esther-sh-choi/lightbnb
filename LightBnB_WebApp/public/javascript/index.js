$(() => {
  getAllListings().then(function (json) {
    propertyListings.addProperties(json.properties, true);
    views_manager.show("listings");
  });
});
