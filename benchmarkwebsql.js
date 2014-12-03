var benchmarkWebSQL = function (imagesrc, timestorun) {
    if (!Array.isArray(imagesrc)) {
        imagesrc = [imagesrc];
    }
	var imageElement = new Image();
    var startload;
    
	imageElement.addEventListener('load', function() {
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
	});

	// Database initialization
	var db;
	var version = 1.0;
	var dbName = "tizendb";
	var dbDisplayName = "tizen_test_db";
	var dbSize = 2 * 1024 * 1024;
	try 
	{
	   db = openDatabase(dbName, version, dbDisplayName, dbSize, function(database) 
	   {
	      alert("database creation callback");
	   });
	}
	catch (e) {
		console.log('Storage failed: ' + e);
	}
};