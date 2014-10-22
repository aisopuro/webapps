var masterimage = new Image();
var startload;

// Take action when the image has loaded
masterimage.addEventListener("load", function () {
    var imgCanvas = document.createElement("canvas"),
        imgContext = imgCanvas.getContext("2d");
 
    // Make sure canvas is as big as the picture
    imgCanvas.width = masterimage.width;
    imgCanvas.height = masterimage.height;
 
    // Draw image into canvas element
    imgContext.drawImage(masterimage, 0, 0, masterimage.width, masterimage.height);
 
    // Get canvas contents as a data URL
    var imgAsDataURL = imgCanvas.toDataURL("image/bmp"); // TODO: does this compress?
    console.log(imgAsDataURL.length);
 
    // Save image into localStorage
    try {
        var startstorage = performance.now();
        localStorage.setItem("masterimage", imgAsDataURL); // TODO: is this async?
        console.log('Web Stroage write time:', performance.now() - startstorage);
    }
    catch (e) {
        console.log("Storage failed: " + e);
    }
    console.log('Load time (internet): ', performance.now() - startload);

    timeWebStorage(1);
}, false);
startload = performance.now();
console.log('startload', startload);
masterimage.src = "Satyrium_XXX.bmp";

// TODO: research

var timeWebStorage = function (recurse) {
    var imgFromWebStorage = new Image();
    var startedloading, stoppedloading;
    imgFromWebStorage.addEventListener("load", function () {
        stoppedloading = performance.now();
        console.log('Web Storage:', recurse, stoppedloading - startedloading);
        if (recurse > 1) {
            timeWebStorage(recurse - 1)
        };
    });
    startedloading = performance.now();
    imgFromWebStorage.src = localStorage.getItem("masterimage"); // TODO: does this cache?
}

// Start code from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB
// Slightly modified

const DB_NAME = 'image-time-test-indexeddb';
const DB_VERSION = 1; // Use a long long for this value (don't use a float)
const DB_STORE_NAME = 'images';


var db;

function openDb() {
    console.log("openDb ...");
    // DEBUG: reset DB every time
    var req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onsuccess = function (evt) {
        // Better use "this" than "req" to get the result to avoid problems with
        // garbage collection.
        // db = req.result;
        console.log("openDb DONE");
        db = this.result;
    };
    req.onerror = function (evt) {
        console.error("openDb:", evt.target.errorCode);
    };

    req.onupgradeneeded = function (evt) {
        console.log("openDb.onupgradeneeded");
        var store = evt.currentTarget.result.createObjectStore(
            DB_STORE_NAME, { keyPath: 'id', autoIncrement: true }
        );

        store.createIndex('image', 'image', { unique: true });
    };
}

openDb();

console.log(db);
function getObjectStore(store_name, mode) {
    console.log(db); // First time through this is undefined, should fix somehow
    var tx = db.transaction(store_name, mode);
    return tx.objectStore(store_name);
}

function getBlob(key, store, success_callback) {
    var req = store.get(key);
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

function addEntry(indexes, blob) {
    console.log("addPublication arguments:", arguments);
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
    };
    req.onerror = function() {
        console.error("addPublication error", this.error);
        displayActionFailure(this.error);
    };
}

addImageFromUrl({'image': 'masterimage'}, 'Satyrium_XXX.bmp');

// End code from https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API/Using_IndexedDB