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
    {elemname: "#webStoreGraph", fun: benchmarkWebStorage, name: "Web Storage"},
    {elemname: "#indexedDBGraph", fun: benchmarkIndexedDB, name: "IndexedDB"},  // First load is huge, why?
    {elemname: "#fileAPIGraph", fun: benchmarkFileAPI, name: "File API"},
    {elemname: "#webSQLGraph", fun: benchmarkWebSQL, name: "WebSQL"}

];
var results = {};

function graphResult (runData) {
	// Calculate average
	var sum = runData.reduce(function (last, current) {
        return last + current;
    });
    var average = sum / runData.length;

    var current = TESTS[nextTest];
    results[current.name] = runData;
    document.querySelector(current.elemname).innerHTML = '';
    var webStorageData = [];
    var averageData = [];
    for (var i = 0; i < runData.length; i++) {
        webStorageData[i] = {x: i, y: runData[i]};
        averageData[i] = {x: i, y: average};
    }

    var graph = new Rickshaw.Graph({
        element: document.querySelector(current.elemname),
        renderer: 'multi',
        stack: false,
        series: [{
        	name: 'Webstorage',
            data: webStorageData,
            color: 'steelblue',
            renderer: 'bar'
        },{
        	name: 'Webstorage average',
            data: averageData,
            color: 'rgba(127, 0, 0, 0.3)',
            renderer: 'line'
        }
        ]
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
        var data = results["Web Storage"];
        var sum = data.reduce(function (last, current) {
            return last + current;
        });
        var average = sum / data.length;
        var squaresum = data.reduce(function (last, current) {
            return last + (current - average) * (current - average);
        });
        var variance = squaresum / data.length;
        var graph = new Rickshaw.Graph({
            element: document.querySelector("#comparisons"),
            renderer: 'bar',
            series: [{
                data: [{x: 0, y: average}, {x: 1, y: variance}],
                color: 'green'
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
