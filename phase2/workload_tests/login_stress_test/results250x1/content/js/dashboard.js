/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
    var dataset = [
        {
            "label" : "KO",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "OK",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.03380212188502344, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.06, 500, 1500, "1 /"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in-2"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in-1"], "isController": false}, {"data": [0.33, 500, 1500, "1 /-0"], "isController": false}, {"data": [0.0, 500, 1500, "30 /users/sign_out-0"], "isController": false}, {"data": [0.002, 500, 1500, "30 /users/sign_out-1"], "isController": false}, {"data": [0.096, 500, 1500, "1 /-1"], "isController": false}, {"data": [0.0, 500, 1500, "30 /users/sign_out"], "isController": false}, {"data": [0.0, 500, 1500, "9 /projects/new"], "isController": false}, {"data": [0.0, 500, 1500, "9 /projects/new-1"], "isController": false}, {"data": [0.0, 500, 1500, "9 /projects/new-0"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in-0"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 3053, 0, 0.0, 11893.29905011463, 272, 53753, 27650.599999999995, 47613.09999999998, 51637.0, 37.55181363082865, 134.76793124469563, 22.704702759652402], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["1 /", 500, 0, 0.0, 11390.624000000002, 746, 36177, 29283.10000000002, 31210.0, 33458.0, 13.795386822646506, 72.00297376807195, 9.03975054491778], "isController": false}, {"data": ["5 /users/sign_in-2", 157, 0, 0.0, 8679.31847133758, 6367, 11582, 10353.000000000002, 10622.8, 11501.379999999997, 8.44040642976184, 40.21976935043815, 4.063594111203699], "isController": false}, {"data": ["5 /users/sign_in-1", 209, 0, 0.0, 19836.655502392347, 10351, 30182, 27671.0, 28597.5, 30025.2, 3.7701812934066927, 10.400007469333453, 1.767272481284387], "isController": false}, {"data": ["1 /-0", 250, 0, 0.0, 2737.579999999999, 272, 13248, 9782.800000000001, 10860.45, 12691.880000000001, 18.86223027010714, 9.465966052701072, 6.060228280141844], "isController": false}, {"data": ["30 /users/sign_out-0", 250, 0, 0.0, 4707.299999999999, 1812, 18521, 6389.6, 7481.449999999998, 16857.780000000006, 5.871714775583062, 2.8815210897315455, 2.58034340723865], "isController": false}, {"data": ["30 /users/sign_out-1", 250, 0, 0.0, 3993.888, 663, 8457, 5985.5, 6843.45, 8088.600000000001, 9.532161512944676, 45.40086611602547, 4.1796294133907805], "isController": false}, {"data": ["1 /-1", 250, 0, 0.0, 8652.960000000001, 468, 23059, 18990.3, 20991.549999999996, 22836.670000000002, 6.9696124895455815, 32.87917414448007, 2.327741671313075], "isController": false}, {"data": ["30 /users/sign_out", 500, 0, 0.0, 8701.365999999993, 5182, 25423, 10215.5, 12401.0, 23991.0, 11.449769859625823, 60.153199709748336, 10.052092874808217], "isController": false}, {"data": ["9 /projects/new", 500, 0, 0.0, 14441.224, 6091, 40921, 29752.000000000022, 39898.0, 40677.0, 8.08852077132134, 44.860768753235405, 6.651196949414391], "isController": false}, {"data": ["9 /projects/new-1", 239, 0, 0.0, 5468.008368200836, 2131, 11832, 8816.0, 10709.0, 11629.0, 8.14337796858496, 38.90241815095915, 3.427535062949334], "isController": false}, {"data": ["9 /projects/new-0", 239, 0, 0.0, 8437.753138075313, 1843, 30038, 21262.0, 28686.0, 30025.4, 4.578105545445839, 1.7834588401494111, 1.9224466645915144], "isController": false}, {"data": ["5 /users/sign_in-0", 209, 0, 0.0, 17509.009569377988, 2592, 29668, 27187.0, 28335.0, 29532.5, 4.588162978573938, 2.786478914207938, 3.2551440181001934], "isController": false}, {"data": ["5 /users/sign_in", 500, 0, 0.0, 40650.53600000002, 13055, 53753, 51896.100000000006, 52501.0, 53166.0, 7.6676532380499625, 50.52279617269088, 10.763797702387707], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Percentile 1
            case 8:
            // Percentile 2
            case 9:
            // Percentile 3
            case 10:
            // Throughput
            case 11:
            // Kbytes/s
            case 12:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 3053, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
