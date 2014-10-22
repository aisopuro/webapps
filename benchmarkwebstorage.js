var benchmarkWebStorage = function (imagesrc, timestorun) {
    var imageElement = new Image();
    var startload;

    imageElement.addEventListener('load', function () {
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
            localStorage.setItem("testImage", imgAsDataURL); // TODO: is this async?
            console.log('Web Stroage write time:', performance.now() - startstorage);
            timeWebStorage(timestorun);
        }
        catch (e) {
            console.log("Storage failed: " + e);
        }
    });


    startload = performance.now();
    imageElement.src = imagesrc;

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
        imgFromWebStorage.src = localStorage.getItem("testImage"); // TODO: does this cache?
    }
}