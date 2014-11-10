var masterimage = new Image();
var startInternetLoading, stopInternetLoading;
masterimage.addEventListener('load', function () {
    console.log('Internet load time: ', performance.now() - startInternetLoading);
});
startInternetLoading = performance.now();
masterimage.src = 'http://www.aaoe.fr/public/MC/MC11/Satyrium_XXX.bmp';

var IMAGE = 'Satyrium_XXX.bmp';
var TIMESTORUN = 10;

// benchmarkWebStorage(IMAGE, TIMESTORUN);
// benchmarkIndexedDB(IMAGE, TIMESTORUN);
// benchmarkFileAPI(IMAGE, TIMESTORUN);
benchmarkWebSQL(IMAGE, TIMESTORUN);
