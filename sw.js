self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open('restaurant-review-cache-v2').then(function(cache){
    }).catch(function(){

    })
  )
})
  

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response){
      if (response) return response;

      
      fetch(event.request).then(function(response1){
        caches.open('restaurant-review-cache-v2').then(function(cache){
          cache.put(event.request, response1);
        })
      })

      return fetch(event.request.clone())
      
    }).catch(function(){
      
    })
  )
});