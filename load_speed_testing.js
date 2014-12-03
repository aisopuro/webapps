var masterimage = new Image();
var startInternetLoading, stopInternetLoading;
masterimage.addEventListener('load', function () {
    console.log('Internet load time: ', performance.now() - startInternetLoading);
});
startInternetLoading = performance.now();
masterimage.src = 'http://www.aaoe.fr/public/MC/MC11/Satyrium_XXX.bmp';

// Note for report: only File API can handle binaries, everything else has to be
// stringified from canvas, which unpacks compressed images, right?
var IMAGE = ['Satyrium_XXX_2.bmp', 'Satyrium_XXX_3.bmp', 'Satyrium_XXX_4.bmp', 'Satyrium_XXX_5.bmp'];
var TIMESTORUN = 50 * IMAGE.length, nextTest = 0;
var TESTS = [
    {elemname: "#webStoreGraph", fun: benchmarkWebStorage},
    {elemname: "#indexedDBGraph", fun: benchmarkIndexedDB},  // First load is huge, why?
    {elemname: "#fileAPIGraph", fun: benchmarkFileAPI},
    {elemname: "#websqlGraph", fun: benchmarkWebSQL}
];

function graphResult (runData) {
    var current = TESTS[nextTest];
    var webStorageData = [];
    for (var i = 0; i < runData.length; i++) {
        webStorageData[i] = {x: i, y: runData[i]};
    }
    var graph = new Rickshaw.Graph({
        element: document.querySelector(current.elemname),
        renderer: 'bar',
        series: [{
            data: webStorageData,
            color: 'steelblue'
        }]
    });

    var hoverDetail = new Rickshaw.Graph.HoverDetail( {
        graph: graph
    });

    var time = new Rickshaw.Fixtures.Time();
    var mseconds = time.unit('millisecond');

    var yAxis = new Rickshaw.Graph.Axis.Y({
        graph: graph,
        timeUnit: mseconds,
        //orientation: 'left' //TODO: need to mod css to do this
    });

    yAxis.render();

    var xAxis = new Rickshaw.Graph.Axis.X( {
        graph: graph,
        //orientation: "bottom" TODO: need to mod css to do this (need "below")
    } );
     
    graph.render();
    nextTest++;
    runNextTest();
}

function runNextTest () {
    if (nextTest >= TESTS.length) {
        // TODO: make comparison graphs here
        return;
    }
    else {
        TESTS[nextTest].fun(IMAGE, TIMESTORUN, graphResult);
    }
}

runNextTest();

// TODO: calls get mixed together if we just call them like this
// Need to make sure they get called in sequence? Q maybe?
// benchmarkWebStorage(IMAGE, TIMESTORUN, graphResult);
// benchmarkIndexedDB(IMAGE, TIMESTORUN);
// benchmarkFileAPI(IMAGE, TIMESTORUN);
// benchmarkWebSQL(IMAGE, TIMESTORUN);
