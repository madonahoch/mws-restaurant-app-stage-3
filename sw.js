self.addEventListener('install', function(event){
  event.waitUntil(
    caches.open('restaurant-review-cache-v3').then(function(cache){
    }).catch(function(){

    })
  )
})
  

self.addEventListener('fetch', function(event) {
  if(event.request.method != 'POST'){
    event.respondWith(
      caches.match(event.request).then(function(response){
        if (response) return response;
  
        
        fetch(event.request).then(function(response1){
          caches.open('restaurant-review-cache-v3').then(function(cache){
            if(event.request.method != 'POST') //can not cache a POST request that results in 'sw.js:19 Uncaught (in promise) TypeError: Request method 'POST' is unsupported'
            {
              cache
              .put(event.request, response1)
              .catch(error => console.log(error)); //log any error
            }
          })
        })
  
        return fetch(event.request.clone())
        
      }).catch(function(){
        
      })
    )
  }
});