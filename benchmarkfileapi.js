function benchmarkFileAPI (imageUrl, timestorun, callback) {
    var FILESYSTEM, FILENAME = 'fileapicopy.bmp', FILENAMES = [];
    if (!Array.isArray(imageUrl)) {
        imageUrl = [imageUrl];
    }
    var loadsDone = [];
    var loadCount = 0;
    function addImageFromUrl(fileSystem) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', imageUrl[loadCount++], true);
        // Setting the wanted responseType to "blob"
        // http://www.w3.org/TR/XMLHttpRequest2/#the-response-attribute
        xhr.responseType = 'blob';
        xhr.onload = function (evt) {
            console.log(evt);
            setTimeout(function() {}, 1000);
            if (xhr.status == 200) {
                console.log("Blob retrieved");
                var blob = xhr.response;
                console.log("Blob:", blob);
                writeBlobToFile(fileSystem, blob);
                if (loadCount < imageUrl.length) {
                    addImageFromUrl(fileSystem);
                }
            } else {
                console.error("addImageFromUrl error:",
                    xhr
                );
            }
        };
        xhr.send();
        
    }
    var results = [];
    function timeFileAPILoad (recurse) {
        var startLoad = performance.now();
        var image = new Image();
        image.addEventListener('load', function () {
            if (recurse > 1) {
                results.push(performance.now() - startLoad);
                return timeFileAPILoad(recurse - 1);
            }
            else {
                callback(results);
            }
        });
        // console.log('getfile');
        FILESYSTEM.root.getFile(FILENAMES[recurse % imageUrl.length], {}, function (fileEntry) {
            // console.log(fileEntry);
            // console.log('readas');
            fileEntry.file(function(file) {
                // console.log('file', file);
                var reader = new FileReader();
                reader.onload = function (event) {
                    // console.log(event);
                    image.src = event.target.result;
                }
                reader.readAsDataURL(file);
            }, errorhandler);
        }, errorhandler);
    }

    function storeCallback () {
        if (loadsDone.length === imageUrl.length &&
            loadsDone.every(function (value) {return value;})
        ) {
            timeFileAPILoad(timestorun);
        }
    }

    function writeBlobToFile (fileSystem, blob) {
        var name = "testFile" + FILENAMES.length;
        FILENAMES.push(name);
        console.log(name);
        fileSystem.root.getFile(name, {create:true}, function (fileEntry) {
            console.log('got fileentry', fileEntry);
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (event) {
                    console.log("Wrote!");
                    console.log(event);
                    loadsDone.push(true);
                    storeCallback();
                }
                console.log(blob);
                fileWriter.write(blob);
            }, errorhandler);
        }, errorhandler);
    }

    var errorhandler = function (error) {
        console.log(error);
    }

    function fsGranted (fileSystem) {
        FILESYSTEM = fileSystem;
        addImageFromUrl(fileSystem);
    }
    function connectFilesystem () {
        navigator.webkitPersistentStorage.requestQuota(673*1024*imageUrl.length/*673 KB per image*/, function (grantedBytes) {
            console.log('Granted!', grantedBytes);
            //if (grantedBytes <= 0) return;
            var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            console.log(requestFileSystem);
            requestFileSystem(PERSISTENT, grantedBytes, fsGranted, errorhandler);
        }, errorhandler);
    }
    connectFilesystem();
}