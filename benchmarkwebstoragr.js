function benchmarkWebStorage (timestorun) {
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

        timeWebStorage(timestorun);
    }, false);
    startload = performance.now();
    masterimage.src = "Satyrium_XXX.bmp";

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
}