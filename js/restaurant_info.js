//import { reverse } from "dns";

let restaurant;
var map;
const port = 1337;
const api_host = `http://localhost:${port}/`;

SW_Register = () => {
  if (!navigator.serviceWorker) return;
  navigator.serviceWorker.register('sw.js').then(function(){
    console.log('Registration Worked!');
  }).catch(function(){
    console.log('Registration Failed!');
  })
}

SW_Register();

/**
 * Initialize Google map, called from HTML.
 */
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
   //   console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
     //   console.error(error);
        return;
      }

      fillRestaurantHTML();

      GetReviews(id).then(function() {
        new Promise(function(){
          self.restaurant.reviews.forEach(rev => {
            if (rev.offline != null && rev.offline == 1){
                let serverRev = Object.assign({}, rev);
    
                delete serverRev.offline; //remove offline property

                return postReviewToServer(api_host, serverRev)
                .then(function(){
                  if( serverRev.offline != null) { //the server is still down and review was not submitted successfully
                    return false;
                  } 
                  else{  //if review was successfully submitted to the server, remove offline property from the indexeddb for this review
                    delete rev.offline;
                    var restaurantDB = new RestaurantDB();
                     restaurantDB.InsertRestaurantReviewIntoIndexedDB(rev, id);
                     console.log(`offline property has been removed properly from indexeddb for review ${rev.id}`);
                     const ul = document.getElementById('reviews-list');
                    ul.appendChild(createReviewHTML(rev));
                  }
                })
            }
          })
        }) 
      }).then(function(){
        self.restaurant.reviews = self.restaurant.reviews.filter(re => re.offline == null);
        fillReviewsHTML();
      })
    });
  }
}

GetReviews = (id) => {
  return DBHelper.fetchRestaurantReviews(id).then(function(reviews) {
    if(!reviews){
      console.log('error found while fetching reviews');
    }
    else{
      self.restaurant.reviews = reviews;
    }
  })
  .catch(function(error) {
    console.log(error);
  });
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.createdAt;
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

showReviewForm = () => {
  document.getElementById('submitreview-form').removeAttribute('hidden');
}

submitReview = () => {
  let reviewername = document.getElementById('username').value;

  let restaurantid = parseInt(getParameterByName('id'), 10);

  let e = document.getElementById('rating-select');
  let rating = e.options[e.selectedIndex].value;

  let comments = document.getElementById('comments-textarea').value;

  let data = {
    'restaurant_id' : restaurantid,
    'name' : reviewername,
    'rating' : rating,
    'comments' : comments
  };

//try posting review to server
  postReviewToServer(api_host, data)
        .then(function() {
       //   console.log('Review has been submitted properly to the server');
        })
        .catch(function(error) {
          console.log(`error occured while posting review to the server ${error}`);
          data.offline = 1;
        })
        .then(() => {
          var restaurantDB = new RestaurantDB();
          data.createdAt = new Date();
          data.updatedAt = data.createdAt;

          return restaurantDB.InsertRestaurantReviewIntoIndexedDB(data, restaurantid)
                .then(function(response){
                  console.log('review has been inserted successfuly. from rest_info.js file');
                });
        })
        .then(() => {
          if(data.offline == null){ //only show on the front end if it was successfully submitted to the server
            const ul = document.getElementById('reviews-list');
            ul.appendChild(createReviewHTML(data));
          }
          
          var subLabel = document.getElementById('Submission-label');
          subLabel.innerHTML = "Review has been submitted successfully!";
          clearReviewForm();
          })
}

postReviewToServer = (url = ``, data = {}) => {
  let reviewUrl = `${url}reviews/`
  return fetch(reviewUrl, {
    method : 'POST', 
    headers : {
      'Content-Type' : 'application/json; charset=utf-8'
    },
    body : JSON.stringify(data)
  })
  .then(function() {
    console.log('');
  })
  .then(function(response) {
    console.log('');
  })
  .catch(function(error) {
    console.log(`${error}`);
    data.offline = 1;
  });
}


clearReviewForm = () =>{
  document.getElementById('username').value = "";
  document.getElementById('comments-textarea').value = "";
  document.getElementById('rating-select').value = 3;
}
