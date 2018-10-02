class RestaurantDB {

    constructor(){

        this.dbPromise = idb.open('db-restaurants', 1, function(upgradeDB){
            switch(upgradeDB.oldVersion){
                case 0: {
                    var restObjStore = upgradeDB.createObjectStore('Restaurants', {keyPath: 'id'});
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
}