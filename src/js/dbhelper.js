
/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Server API URL.
   * 
   */
  static get API_Server_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}`;
  }



  /**
   * Fetch all restaurants.
   */
  static fetchRestaurants() {

    var restaurantDB = new RestaurantDB();

    return restaurantDB.GetRestaurants().then(function(restaurants){
      if(!restaurants || restaurants.length == 0){
        return fetch(`${DBHelper.API_Server_URL}/restaurants`)
        .then(function(response){
          return response.json();
        }).then(function (jsonResponse){
          restaurantDB.InsertRestaurantsIntoIndexedDB(jsonResponse);
          return jsonResponse;
        } )
      }
  
      else{
        console.log(`restaurants from db are: ${restaurants}`);
        return restaurants;
      }
    }).catch(function(){
      console.log('error occurred while getting restaurants');
    });
  }

    /**
   * Fetch all restaurant reviews.
   */
  static fetchRestaurantReviews(id) {

  var restaurantDB = new RestaurantDB();

    return restaurantDB.GetRestaurantReviews(parseInt(id, 10)).then(function(reviews){
      if(!reviews || reviews.length == 0){
        return fetch(`${DBHelper.API_Server_URL}/reviews/?restaurant_id=${id}`)
        .then(function(response){
          return response.json();
        }).then(function (jsonResponse){
          jsonResponse.forEach(rev => {
            rev.restaurant_id = parseInt(rev.restaurant_id);
          }); 
          restaurantDB.InsertRestaurantReviewsIntoIndexedDB(jsonResponse, id);
          return jsonResponse;
        } )
      }
  
      else{
        console.log(`Reviews from db are: ${reviews}`);
       return reviews;
      }
    }).catch(function(){
      console.log('error occurred while getting reviews');
    return null;
    });
  }

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.

    DBHelper.fetchRestaurants().then(function(restaurantsJson){
      const restaurant = restaurantsJson.find(r => r.id == id);
     
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
    }).catch(Error('Unexpected Error occurred fetching restaurants'))
  }

    /**
   * Fetch restaurant reviews by its ID.
   */
  /*static fetchReviewsByRestaurantId(id, callback) {
    // fetch all restaurants with proper error handling.

    DBHelper.fetchRestaurants().then(function(restaurantsJson){
      const restaurant = restaurantsJson.find(r => r.id == id);
     
        if (restaurant) { // Got the restaurant
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
    }).catch(Error('Unexpected Error occurred fetching restaurants'))
  }*/

  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants

    DBHelper.fetchRestaurants().then(function(restaurantsJson){
      let results = restaurantsJson
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
    }).catch(Error('Unexpected Error occurred fetching restaurants'))
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then(function(restaurantsjson){
      // Get all neighborhoods from all restaurants
      const neighborhoods = restaurantsjson.map((v, i) => restaurantsjson[i].neighborhood);
      // Remove duplicates from neighborhoods
      const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
      callback(null, uniqueNeighborhoods);
    }).catch(Error('Unexpected Error occurred fetching restaurants'))

  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants().then(function(restaurantJson){

      const cuisines = restaurantJson.map((v, i) => restaurantJson[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);

    }).catch(Error('Unexpected Error occurred fetching restaurants'))
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/dist/img/${restaurant.photograph}.webp`);
  }

  /**
   * Map marker for a restaurant.
   */
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }

}
