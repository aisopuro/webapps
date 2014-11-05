function benchmarkIndexedDB (imagesrc, timestorun) {
    // Code from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
    // Slightly modified

    const DB_NAME = 'image-time-test-indexeddb';
    const DB_VERSION = 1; // Use a long long for this value (don't use a float)
    const DB_STORE_NAME = 'images';


    var db;

    function openDb() {
        console.log("openDb ...");
        // DEBUG: reset DB every time
        var delreq = indexedDB.deleteDatabase(DB_NAME);
        var req;
        delreq.onsuccess = delreq.onerror = function (event) {
            console.log('deleted');
            req = indexedDB.open(DB_NAME, DB_VERSION);
            req.onsuccess = function (evt) {
                // Better use "this" than "req" to get the result to avoid problems with
                // garbage collection.
                // db = req.result;
                console.log("openDb DONE");
                db = this.result;
                addImageFromUrl({'name': 'masterimage'}, imagesrc);
            };
            req.onerror = function (evt) {
                console.error("openDb:", evt.target.errorCode);
            };

            req.onupgradeneeded = function (evt) {
                console.log("openDb.onupgradeneeded");
                var store = evt.currentTarget.result.createObjectStore(
                    DB_STORE_NAME, { keyPath: 'name', autoIncrement: true }
                );

                store.createIndex('name', 'name', { multiEntry: true });
            };
        };
        
    }

    console.log(db);
    function getObjectStore(store_name, mode) {
        var tx = db.transaction(store_name, mode);
        return tx.objectStore(store_name);
    }

    function getBlob(key, store, success_callback) {
        var req = store.index('name').get(key);
        req.onsuccess = function(evt) {
            var value = evt.target.result;
            if (value)
                success_callback(value.blob);
        };
    }

    function addImageFromUrl(indexes, url) {
        console.log("addImageFromUrl:", arguments);

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        // Setting the wanted responseType to "blob"
        // http://www.w3.org/TR/XMLHttpRequest2/#the-response-attribute
        xhr.responseType = 'blob';
        xhr.onload = function (evt) {
            if (xhr.status == 200) {
                console.log("Blob retrieved");
                var blob = xhr.response;
                console.log("Blob:", blob);
                addEntry(indexes, blob);
            } else {
                console.error("addImageFromUrl error:",
                    xhr.responseText, xhr.status
                );
            }
        };
        xhr.send();

        // We can't use jQuery here because as of jQuery 1.8.3 the new "blob"
        // responseType is not handled.
        // http://bugs.jquery.com/ticket/11461
        // http://bugs.jquery.com/ticket/7248
        // $.ajax({
        //   url: url,
        //   type: 'GET',
        //   xhrFields: { responseType: 'blob' },
        //   success: function(data, textStatus, jqXHR) {
        //     console.log("Blob retrieved");
        //     console.log("Blob:", data);
        //     // addPublication(biblioid, title, year, data);
        //   },
        //   error: function(jqXHR, textStatus, errorThrown) {
        //     console.error(errorThrown);
        //     displayActionFailure("Error during blob retrieval");
        //   }
        // });
    }

    function testLoadImage (recurse) {
        var store = getObjectStore(DB_STORE_NAME, 'readwrite');
        var testImage = new Image();
        var startBlobLoad;

        var assignToImage = function (blob) {
            testImage.src = URL.createObjectURL(blob);
        };

        testImage.addEventListener('load', function () {
            console.log('IndexedDB load time: ', performance.now() - startBlobLoad);
            if (recurse > 1) return testLoadImage(recurse - 1)
            else document.body.appendChild(testImage);
        });
        startBlobLoad = performance.now();
        getBlob('masterimage', store, assignToImage);
    }

    function addEntry(indexes, blob) {
        console.log("addEntry arguments:", arguments);
        var obj = indexes;
        if (typeof blob != 'undefined')
            obj.blob = blob;

        var store = getObjectStore(DB_STORE_NAME, 'readwrite');
        var req;
        try {
            req = store.add(obj);
        } catch (e) {
            if (e.name == 'DataCloneError')
                displayActionFailure("This engine doesn't know how to clone a Blob, use Firefox");
                throw e;
        }
        req.onsuccess = function (evt) {
            console.log("Insertion in DB successful");
            console.log(evt, req);
            testLoadImage(timestorun);
        };
        req.onerror = function() {
            console.error("addPublication error", this.error);
            displayActionFailure(this.error);
        };
    }
    openDb();
}