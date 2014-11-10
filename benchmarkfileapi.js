function benchmarkFileAPI (imageUrl, timestorun, callback) {
    var FILESYSTEM, FILENAME = 'fileapicopy.bmp';
    function addImageFromUrl(fileSystem) {

        var xhr = new XMLHttpRequest();
        xhr.open('GET', imageUrl, true);
        // Setting the wanted responseType to "blob"
        // http://www.w3.org/TR/XMLHttpRequest2/#the-response-attribute
        xhr.responseType = 'blob';
        xhr.onload = function (evt) {
            if (xhr.status == 200) {
                console.log("Blob retrieved");
                var blob = xhr.response;
                console.log("Blob:", blob);
                writeBlobToFile(fileSystem, blob);
            } else {
                console.error("addImageFromUrl error:",
                    xhr.responseText, xhr.status
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
        console.log('getfile');
        FILESYSTEM.root.getFile(FILENAME, {}, function (fileEntry) {
            console.log(fileEntry);
            console.log('readas');
            fileEntry.file(function(file) {
                console.log('file', file);
                var reader = new FileReader();
                reader.onload = function (event) {
                    image.src = event.target.result;
                }
                reader.readAsDataURL(file);
            }, errorhandler);
        }, errorhandler);
    }

    function writeBlobToFile (fileSystem, blob) {
        console.log("Finish me!", imageUrl, timestorun);
        console.log(fileSystem);
        fileSystem.root.getFile(FILENAME, {create:true}, function (fileEntry) {
            console.log('got fileentry', fileEntry);
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (event) {
                    console.log("Wrote!")
                    timeFileAPILoad(timestorun);
                }
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
        navigator.webkitPersistentStorage.requestQuota(505*1024/*505 KB*/, function (grantedBytes) {
            console.log('Granted!', grantedBytes);
            //if (grantedBytes <= 0) return;
            var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            console.log(requestFileSystem);
            requestFileSystem(PERSISTENT, grantedBytes, fsGranted, errorhandler);
        }, errorhandler);
    }
    connectFilesystem();
}