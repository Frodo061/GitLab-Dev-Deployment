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

    var data = {"OkPercent": 97.88445890968266, "KoPercent": 2.1155410903173313};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.05024580682475419, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.03, 500, 1500, "1 /"], "isController": false}, {"data": [0.061866125760649086, 500, 1500, "9 /projects/new-1"], "isController": false}, {"data": [0.060851926977687626, 500, 1500, "9 /projects/new-0"], "isController": false}, {"data": [0.1860215053763441, 500, 1500, "1 /-0"], "isController": false}, {"data": [0.082, 500, 1500, "30 /users/sign_out-0"], "isController": false}, {"data": [0.076, 500, 1500, "30 /users/sign_out-1"], "isController": false}, {"data": [0.05268817204301075, 500, 1500, "1 /-1"], "isController": false}, {"data": [0.038, 500, 1500, "30 /users/sign_out"], "isController": false}, {"data": [0.028, 500, 1500, "9 /projects/new"], "isController": false}, {"data": [0.001, 500, 1500, "5 /users/sign_in"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4916, 104, 2.1155410903173313, 12613.238608624904, 142, 259898, 23297.9, 28301.699999999993, 65304.77, 18.68640218337458, 66.81843236133443, 10.063754613633167], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["1 /", 1000, 80, 8.0, 24448.617000000013, 753, 259898, 43406.9, 75876.65, 259849.98, 3.826550135459875, 19.140538304723496, 2.3191360152028837], "isController": false}, {"data": ["9 /projects/new-1", 493, 4, 0.8113590263691683, 9717.042596348883, 443, 35229, 15921.2, 17423.2, 26799.22, 1.9558912794226746, 9.318994852147712, 0.8165522196688078], "isController": false}, {"data": ["9 /projects/new-0", 493, 0, 0.0, 12133.628803245441, 145, 66405, 17112.6, 21117.09999999996, 39490.78, 1.9008474772322426, 0.7525267318725468, 0.7894719244249262], "isController": false}, {"data": ["1 /-0", 465, 0, 0.0, 7547.688172043009, 277, 71958, 14960.800000000017, 30239.0, 71297.93999999999, 6.361149110807114, 3.1925845374487007, 2.043767634233926], "isController": false}, {"data": ["30 /users/sign_out-0", 500, 0, 0.0, 7544.95, 142, 35442, 11289.0, 12462.849999999999, 15837.340000000002, 2.12300702715326, 1.0240399032439549, 0.93296207247946], "isController": false}, {"data": ["30 /users/sign_out-1", 500, 0, 0.0, 6327.088000000001, 441, 15727, 8661.0, 9008.8, 11096.94, 2.238618861707081, 10.665453591752032, 0.9815819032289839], "isController": false}, {"data": ["1 /-1", 465, 5, 1.075268817204301, 10019.969892473126, 460, 67692, 16315.2, 19578.399999999994, 60478.6599999999, 5.800536393688018, 27.248097673548305, 1.9164574627331128], "isController": false}, {"data": ["30 /users/sign_out", 1000, 0, 0.0, 13872.19200000001, 584, 37999, 19992.6, 21963.899999999987, 23776.81, 4.2378268423952195, 22.234412412065094, 3.720513995423147], "isController": false}, {"data": ["9 /projects/new", 1000, 22, 2.2, 21850.501999999975, 589, 67235, 30763.09999999999, 35570.29999999999, 48243.740000000005, 3.8487147217186823, 19.711342787701046, 3.160373597143484], "isController": false}, {"data": ["5 /users/sign_in", 1000, 88, 8.8, 12087.32999999999, 566, 61435, 18670.1, 24723.19999999999, 34160.93, 3.8307424745064087, 17.684645079315523, 2.6234301138496665], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 70, 67.3076923076923, 1.4239218877135882], "isController": false}, {"data": ["422/Unprocessable Entity", 34, 32.69230769230769, 0.6916192026037429], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4916, 104, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 70, "422/Unprocessable Entity", 34, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["1 /", 500, 40, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 40, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["9 /projects/new-1", 493, 4, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 4, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1 /-1", 465, 5, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 5, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["9 /projects/new", 500, 11, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 11, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["5 /users/sign_in", 500, 44, "422/Unprocessable Entity", 34, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 10, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
