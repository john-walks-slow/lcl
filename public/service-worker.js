/**
 * Copyright 2018 Google Inc. All Rights Reserved.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *     http://www.apache.org/licenses/LICENSE-2.0
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// If the loader is already loaded, just stop.
if (!self.define) {
  let registry = {};

  // Used for `eval` and `importScripts` where we can't get script URL by other means.
  // In both cases, it's safe to use a global var because those functions are synchronous.
  let nextDefineUri;

  const singleRequire = (uri, parentUri) => {
    uri = new URL(uri + ".js", parentUri).href;
    return registry[uri] || (
      
        new Promise(resolve => {
          if ("document" in self) {
            const script = document.createElement("script");
            script.src = uri;
            script.onload = resolve;
            document.head.appendChild(script);
          } else {
            nextDefineUri = uri;
            importScripts(uri);
            resolve();
          }
        })
      
      .then(() => {
        let promise = registry[uri];
        if (!promise) {
          throw new Error(`Module ${uri} didn’t register its module`);
        }
        return promise;
      })
    );
  };

  self.define = (depsNames, factory) => {
    const uri = nextDefineUri || ("document" in self ? document.currentScript.src : "") || location.href;
    if (registry[uri]) {
      // Module is already loading or loaded.
      return;
    }
    let exports = {};
    const require = depUri => singleRequire(depUri, uri);
    const specialDeps = {
      module: { uri },
      exports,
      require
    };
    registry[uri] = Promise.all(depsNames.map(
      depName => specialDeps[depName] || require(depName)
    )).then(deps => {
      factory(...deps);
      return exports;
    });
  };
}
define(['./workbox-bf399525'], (function (workbox) { 'use strict';

  /**
  * Welcome to your Workbox-powered service worker!
  *
  * You'll need to register this file in your web app.
  * See https://goo.gl/nhQhGp
  *
  * The rest of the code is auto-generated. Please don't update this file
  * directly; instead, make changes to your Workbox build configuration
  * and re-run your build process.
  * See https://goo.gl/2aRDsh
  */

  self.skipWaiting();
  workbox.clientsClaim();
  /**
   * The precacheAndRoute() method efficiently caches and responds to
   * requests for URLs in the manifest.
   * See https://goo.gl/S9QRab
   */

  workbox.precacheAndRoute([{
    "url": "/static/assets/1baef0c58db86bfdc8d5.png",
    "revision": null
  }, {
    "url": "/static/assets/2d8f63604b6935ae6c08.png",
    "revision": null
  }, {
    "url": "/static/assets/3d4bcd95ef29fdf05a00.png",
    "revision": null
  }, {
    "url": "/static/assets/409db1c82c2322d43f68.png",
    "revision": null
  }, {
    "url": "/static/assets/67fa5e1ff6aa932b343c.png",
    "revision": null
  }, {
    "url": "/static/assets/9557579b13e106e7867b.png",
    "revision": null
  }, {
    "url": "/static/assets/a96ea28aa740801a8d1e.png",
    "revision": null
  }, {
    "url": "/static/assets/af095fbd29f242f73e1b.png",
    "revision": null
  }, {
    "url": "/static/assets/af0a2985ff7d0c1a0039.png",
    "revision": null
  }, {
    "url": "/static/assets/e63db753aa3e331d671e.png",
    "revision": null
  }, {
    "url": "/static/assets/fb1ba6f28f6f1d52ab80.png",
    "revision": null
  }, {
    "url": "/static/assets/fd7e83bda7a47752fe78.png",
    "revision": null
  }, {
    "url": "/static/fonts/315cc510d6edd6cb61a7.ttf",
    "revision": null
  }, {
    "url": "/static/fonts/874d75551149cd58cdfd.ttf",
    "revision": null
  }, {
    "url": "/static/fonts/d97ba26efbde8823e777.ttf",
    "revision": null
  }, {
    "url": "/static/index.html",
    "revision": "32904f1c447d5ef52089044825bdcdb3"
  }], {});

}));
//# sourceMappingURL=service-worker.js.map
