var benchmarkWebStorage = function (imagesrc, timestorun, callback) {
    console.log('bench');
    if (!Array.isArray(imagesrc)) {
        imagesrc = [imagesrc];
    }
    console.log(imagesrc);
    var imageNames = [];
    var currentIndex = 0;
    var loadsDone = [];
    for (var i = 0; i < imagesrc.length; i++) {
        console.log('for')
        loadsDone.push(false);
        var imageElement = new Image();
        var startload;

        imageElement.addEventListener('load', function () {
            if (imageElement.width + imageElement.height == 0) {
                console.log('0-image!!!!!!!!!!!!!!!!!!!!!!');
            }
            var imgCanvas = document.createElement("canvas"),
            imgContext = imgCanvas.getContext("2d");
     
            // Make sure canvas is as big as the picture
            imgCanvas.width = imageElement.width;
            imgCanvas.height = imageElement.height;
         
            // Draw image into canvas element
            imgContext.drawImage(imageElement, 0, 0, imageElement.width, imageElement.height);
         
            // Get canvas contents as a data URL
            var imgAsDataURL = imgCanvas.toDataURL("image/bmp"); // TODO: does this compress?
            console.log(imgAsDataURL.length);
         
            // Save image into localStorage
            try {
                var startstorage = performance.now();
                var name = "testImage" + currentIndex;
                localStorage.setItem(name, imgAsDataURL); // Not async: https://hacks.mozilla.org/2012/03/there-is-no-simple-solution-for-local-storage/
                imageNames.push(name);
                loadsDone[currentIndex++] = true;
                console.log('Web Stroage write time:', performance.now() - startstorage);
                storeCallback();
            }
            catch (e) {
                console.log("Storage failed: " + e);
            }
        });

        startload = performance.now();
        imageElement.src = imagesrc[i];
    }

    function storeCallback () {
        if (loadsDone.length === imagesrc.length &&
            loadsDone.every(function (value) {return value;})
        ) {
            timeWebStorage(timestorun);
        }
    }
    var current = 0;
    var webStorageData = [];
    var timeWebStorage = function (recurse) {
        var imgFromWebStorage = new Image();
        var startedloading, stoppedloading;
        imgFromWebStorage.addEventListener("load", function () {
            stoppedloading = performance.now();
            console.log('Web Storage:', recurse, stoppedloading - startedloading);
            if (recurse > 1) {
                webStorageData.push(stoppedloading - startedloading);
                timeWebStorage(recurse - 1);
            }
            else {
                callback(webStorageData);
            };
        });
        startedloading = performance.now();
        current = current % imageNames.length;
        imgFromWebStorage.src = localStorage.getItem(imageNames[current++]); // TODO: does this cache?
    }
}