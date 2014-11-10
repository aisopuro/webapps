var benchmarkWebSQL = function (imagesrc, timestorun) {

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
	var dbName = "testdb";
	var dbDisplayName = "test_db";
	var dbSize = 2 * 1024 * 1024;
	try 
	{
		db = openDatabase(dbName, version, dbDisplayName, dbSize, function(database) 
		{
			console.log('Database ready.');
			alert("database creation callback");
		});

		// start transaction, create table, insert data
		db.transaction(function (tx) {
			tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');
			tx.executeSql('INSERT INTO foo (id, text) VALUES (1, "synergies")');
			tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
				var len = results.rows.length, i;
				for (i = 0; i < len; i++) {
					console.log(results.rows.item(i).text);
				}
			});
		});

		db.transaction(function (tx) {
			tx.executeSql('DROP TABLE foo');
		});
	}
	catch (e) {
		console.log('Storage failed: ' + e);
	}
};