function benchmarkFileAPI (imageUrl, timestorun) {
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

    function timeFileAPILoad (timestorun) {
        // TODO: allow saving and do actual timing tests
        console.log('Run me many times: ', timestorun);
    }

    function writeBlobToFile (fileSystem, blob) {
        console.log("Finish me!", imageUrl, timestorun);
        console.log(fileSystem);
        fileSystem.root.getFile('fileapicopy.bmp', {create:true}, function (fileEntry) {
            console.log('got fileentry', fileEntry);
            fileEntry.createWriter(function (fileWriter) {
                fileWriter.onwriteend = function (event) {
                    timeFileAPILoad(timestorun);
                }
                fileWriter.write(blob);
            }, errorhandler);
        }, errorhandler);
    }

    var errorhandler = function (error) {
        console.log(error);
    }
    function connectFilesystem () {
        navigator.webkitPersistentStorage.requestQuota(505*1024/*505 KB*/, function (grantedBytes) {
            console.log('Granted!', grantedBytes);
            //if (grantedBytes <= 0) return;
            var requestFileSystem = window.requestFileSystem || window.webkitRequestFileSystem;
            console.log(requestFileSystem);
            requestFileSystem(PERSISTENT, grantedBytes, addImageFromUrl, errorhandler);
        }, errorhandler);
    }
    connectFilesystem();
}