var masterimage = new Image();

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
    var imgAsDataURL = imgCanvas.toDataURL("image/jpg"); // TODO: does this compress?
    console.log(imgAsDataURL.length);
 
    // Save image into localStorage
    try {
        localStorage.setItem("masterimage", imgAsDataURL);
    }
    catch (e) {
        console.log("Storage failed: " + e);
    }
}, false);

masterimage.src = "Satyrium_XXX.bmp";

// TODO: research