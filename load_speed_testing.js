var masterimage = new Image();
var startInternetLoading, stopInternetLoading;
masterimage.addEventListener('load', function () {
    console.log(performance.now() - startInternetLoading);
});
startInternetLoading = performance.now();
masterimage.src = 'http://www.aaoe.fr/public/MC/MC11/Satyrium_XXX.bmp';

benchmarkWebStorage('Satyrium_XXX.bmp', 10);