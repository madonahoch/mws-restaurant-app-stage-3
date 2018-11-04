class RestaurantDB {

    constructor(){

        this.dbPromise = idb.open('db-restaurants', 1, function(upgradeDB){
            switch(upgradeDB.oldVersion){
                case 0: {
                    var restObjStore = upgradeDB.createObjectStore('Restaurants', {keyPath: 'id'});
                    var revObjStore = upgradeDB.createObjectStore('Reviews', {keyPath: 'id', autoIncrement:true});
                    var restReviewsIndex = revObjStore.createIndex('restReviews', 'restaurant_id');
                }
            }
        });
    }

    InsertRestaurantsIntoIndexedDB(restaurants) {
        this.dbPromise.then(function(db){
            var tx = db.transaction('Restaurants', 'readwrite');
            var restObjStore = tx.objectStore('Restaurants');

            restaurants.forEach(rest => {
                restObjStore.put(rest);
            });
            return tx.complete;
        }).then(function(){
            console.log('All Restaurants have been inserted to indexed DB.');
        })
    }

    GetRestaurants(){
        return this.dbPromise.then(function(db){
            var tx = db.transaction('Restaurants');
            var restObjStore = tx.objectStore('Restaurants');

            return restObjStore.getAll();
        }).then(function(restaurants){
            if (!restaurants) console.log(`Restaurants were NOT found!`);

            else  console.log(`Restaurants were found!`);

            return restaurants;
        });
    }

    InsertRestaurantReviewsIntoIndexedDB(restaurantReviews, id) {
        this.dbPromise.then(function(db){
            var tx = db.transaction('Reviews', 'readwrite');
            var reviewsObjStore = tx.objectStore('Reviews');

            if(restaurantReviews.constructor === Array){
                console.log('attempting to insert array of reviews in indexeddb');   
                restaurantReviews.forEach(review => {
                    reviewsObjStore.put(review);
                });
            }
            else{ //This in case a user posted a review and we need to add it to indexeddb
                console.log('attempting to insert one review obj in indexeddb');   
                reviewsObjStore.put(restaurantReviews);//in case it's a single review obj (not array)           
            }
          
            return tx.complete;
        }).then(function(){
            console.log(`All Restaurant Reviews for restaurant ${id} have been inserted to indexed DB.`);
        })   
    } 

    InsertRestaurantReviewIntoIndexedDB(restaurantReview, id) {
        return this.dbPromise.then(function(db){
            var tx = db.transaction('Reviews', 'readwrite');
            var reviewsObjStore = tx.objectStore('Reviews');

            console.log('attempting to insert one review obj in indexeddb');   
            reviewsObjStore.put(restaurantReview);          
            
          
            return tx.complete;
        }).then(function(){
            console.log(` Restaurant Review for restaurant ${id} has been inserted to indexed DB.`);
            return true;
        })   
    } 

    GetRestaurantReviews(restid){
        return this.dbPromise.then(function(db){
            var tx = db.transaction('Reviews');
            var reviewsObjStore = tx.objectStore('Reviews');

            var restReviewsIndex = reviewsObjStore.index('restReviews');

            return restReviewsIndex.getAll(restid);

        }).then(function(reviews){
            if (!reviews || reviews.length == 0) console.log(`Reviews were NOT found for rest ${restid}!`);

            else  console.log(`Reviews for rest ${restid} were found!`);

            return reviews;
        });
    }
}