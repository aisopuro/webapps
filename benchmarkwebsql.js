var benchmarkWebSQL = function (imagesrc, timestorun, callback) {
	// Check is imagesrc is array
	if (!Array.isArray(imagesrc)) {
        imagesrc = [imagesrc];
    }

    var db;
	var version = 1.0;
	var dbName = "webSQLdatabase";
	var dbDisplayName = "webSQLdatabase";
	var dbSize = 2 * 1024 * 1024;



    var imageNames = [];
    var currentIndex = 0;
    var loadsDone = [];

    // database initialization
	db = openDatabase(dbName, version, dbDisplayName, dbSize, function(database) 
	{
		console.log('Database ready.');
	});
	db.transaction(function (tx) {
		tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');
	});

    

	
    var init = function(i) {
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

	        // Save image into WebSQL
			try 
			{
				// start transaction, create table, insert data
				db.transaction(function (tx) {
					var startstorage = performance.now();
					var name = "testImage" + currentIndex;
					tx.executeSql('INSERT INTO foo (id, text) VALUES (?,?)',[i+1,imgAsDataURL]);
					imageNames.push(name);
	                loadsDone[currentIndex++] = true;
					console.log('Web SQL write time:', performance.now() - startstorage);
					storeCallback();
				});
				
				// timeWebSQL(timestorun);
				
			}
			catch (e) {
				console.log('Storage failed: ' + e);
			}
		});
		startload = performance.now();
	    imageElement.src = imagesrc[i];
    };

    var storeCallback = function() {
    	if (loadsDone.length === imagesrc.length &&
            loadsDone.every(function (value) {return value;})
        ) {
            timeWebSQL(timestorun);
        }
    };
    
	

	var current = 0;
    var webSQLData = [];
    var timeWebSQL = function (recurse) {
        var imgFromWebSQL = new Image();
        var startedloading, stoppedloading;
        imgFromWebSQL.addEventListener("load", function () {
            stoppedloading = performance.now();
            console.log('Web SQL:', recurse, stoppedloading - startedloading);
            if (recurse > 1) {
                webSQLData.push(stoppedloading - startedloading);
                timeWebSQL(recurse - 1);
            }
            else {
            	db.transaction(function (tx) {
					tx.executeSql('DROP TABLE foo');
				});
                callback(webSQLData);
            }
        });
        startedloading = performance.now();
        current = current % imageNames.length;
        db.transaction(function (tx) {
        	tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
				
		        imgFromWebSQL.src = results.rows.item(current).text;
		        current++;
			});
        });
        
    };

    for (var i = 0; i < imagesrc.length; i++) {
    	loadsDone.push(false);
	    init(i);
    }

	// Database initialization
	// var db;
	// var version = 1.0;
	// var dbName = "testdb";
	// var dbDisplayName = "test_db";
	// var dbSize = 2 * 1024 * 1024;
	// try 
	// {
	// 	db = openDatabase(dbName, version, dbDisplayName, dbSize, function(database) 
	// 	{
	// 		console.log('Database ready.');
	// 	});

	// 	// start transaction, create table, insert data
	// 	db.transaction(function (tx) {
	// 		tx.executeSql('CREATE TABLE IF NOT EXISTS foo (id unique, text)');
	// 		var startstorage = performance.now();
	// 		tx.executeSql('INSERT INTO foo (id, text) VALUES (?,?)',[1,imgAsDataURL]);
	// 		console.log('Web SQL write time:', performance.now() - startstorage);
 //            // timeWebStorage(timestorun);
	// 		// tx.executeSql('INSERT INTO foo (id, text) VALUES (2, "another try")');
	// 		// tx.executeSql('SELECT * FROM foo', [], function (tx, results) {
	// 		// 	var len = results.rows.length, i;
	// 		// 	for (i = 0; i < len; i++) {
	// 		// 		console.log(results.rows.item(i).text);
	// 		// 	}
	// 		// });
	// 	});

	// 	db.transaction(function (tx) {
	// 		tx.executeSql('DROP TABLE foo');
	// 	});
	// }
	// catch (e) {
	// 	console.log('Storage failed: ' + e);
	// }
};