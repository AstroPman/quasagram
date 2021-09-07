/*
 * This file (which will be your service worker)
 * is picked up by the build system ONLY if
 * quasar.conf > pwa > workboxPluginMode is set to "InjectManifest"
 */

/*
    dependencies
*/

import { precacheAndRoute } from 'workbox-precaching'
import { registerRoute } from 'workbox-routing'
import { StaleWhileRevalidate } from 'workbox-strategies'
import { CacheFirst } from 'workbox-strategies'
import {ExpirationPlugin} from 'workbox-expiration'
import {CacheableResponsePlugin} from 'workbox-cacheable-response'
import {NetworkFirst} from 'workbox-strategies'
import {Queue} from 'workbox-background-sync'





/*
  config
*/

// disable workbox logs
self.__WB_DISABLE_DEV_LOGS = true

precacheAndRoute(self.__WB_MANIFEST)

let backgroundSyncSupported = 'sync' in self.registration ? true : false

/*

queue - createPost

*/

let createPostQueue = null

if (backgroundSyncSupported) {
  createPostQueue = new Queue('createPostQueue', {
    onSync: async ({queue}) => {
      let entry;
      while (entry = await queue.shiftRequest()) {
        try {
          await fetch(entry.request);
          console.log('Replay successful for request', entry.request);
          const channel = new BroadcastChannel('sw-messages');
          channel.postMessage({msg: 'offline-post-uploaded'});
        } catch (error) {
          console.error('Replay failed for request', entry.request, error);
  
          // Put the entry back in the queue and re-throw the error:
          await queue.unshiftRequest(entry);
          throw error;
        }
      }
      console.log('Replay complete!');
    }
  })
}

/*
  caching starategies
*/

registerRoute(
  ({url}) => url.host.startsWith('fonts.g'),
  new CacheFirst({
      cacheName: 'google-fonts',
      plugins: [
        new ExpirationPlugin({
          maxEntries: 30,
        }),
        new CacheableResponsePlugin({
          statuses: [0, 200]
        }),
      ],
    }
  )
);

registerRoute(
  ({url}) => url.pathname.startsWith('/posts'),
  new NetworkFirst()
);

registerRoute(
  ({url}) => url.href.startsWith('http'),
  new StaleWhileRevalidate()
);

/*

 events - fetch

*/

 if (backgroundSyncSupported) {
   self.addEventListener('fetch', (event) => {
     
    if (event.request.url.endsWith('/createPost')) {

      // const promiseChain = fetch(event.request.clone()).catch((err) => {
      //   return createPostQueue.pushRequest({request: event.request})
      // });

      // event.watiUntil(promiseChain);
      if(!self.navigator.onLine){
        const promiseChain = async () => {
          try {
            const response = await fetch(event.request.clone());
            return response;
  
          } catch (error) {
            // return createPostQueue.pushRequest({request: event.request});
            return await createPostQueue.pushRequest({request: event.request});
            
          }
        }
        event.respondWith(promiseChain());
      }
     }
   })
 }

/*
 events - push
*/

self.addEventListener('push', event => {
  console.log('push message recieved', event)
  if (event.data) {
    console.log('event.data: ', event.data)
    let data = JSON.parse(event.data.text())
    event.waitUntil(
      self.registration.showNotification(
        data.title,
        {
          body: data.body,
          icon: 'icons/icon-128x128.png',
          badge: 'icons/icon-128x128.png',
          data: {
            openUrl: data.openUrl
          }
        }
      )
    )
  }
})



/*
 events - notifications
*/

  self.addEventListener('notificationclick', event => {
    let notification = event.notification
    let action = event.action
    
    if (action == 'hello') {
      console.log('hello clicked')
    }
    else if (action == 'goodbye') {
      console.log('goodbye clicked')
    }
    else {
      event.waitUntil(
        clients.matchAll().then(clis => {
          let clientUsingApp = clis.find(cli => {
            return cli.visibilityState === 'visible'
          })
          if (clientUsingApp) {
            clientUsingApp.navigate(notification.data.openUrl)
            clientUsingApp.focus()
          }
          else {
            clients.openWindow(notification.data.openUrl)
          }
        })
      )
    }
    notification.close()
  })

  self.addEventListener('notificationclose', event => {
    // console.log('close')
  })
