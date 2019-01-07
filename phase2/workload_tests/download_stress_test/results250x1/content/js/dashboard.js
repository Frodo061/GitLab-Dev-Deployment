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

    var data = {"OkPercent": 98.55, "KoPercent": 1.45};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.2474, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "17 /assets/icon_anchor-297aa9b0225eff3d6d0da74ce042a0ed5575b92aa66b7109a5e060a795b42e36.svg"], "isController": false}, {"data": [0.5, 500, 1500, "10 /assets/fontawesome-webfont-2adefcbc041e7d18fcf2d417879dc5a09997aa64d675b7a3c4b6ce33da13f3fe.woff2"], "isController": false}, {"data": [0.0, 500, 1500, "14 /root/download_test/blob/master/README.md"], "isController": false}, {"data": [0.0, 500, 1500, "15 /root/download_test/refs/master/logs_tree/"], "isController": false}, {"data": [0.0, 500, 1500, "18 /root/download_test/-/archive/master/download_test-master.tar.gz"], "isController": false}, {"data": [0.0, 500, 1500, "16 /root/download_test/commits/master/signatures"], "isController": false}, {"data": [0.0, 500, 1500, "1 /root/download_test"], "isController": false}, {"data": [0.974, 500, 1500, "9 /assets/icons-1bbf3f0e2e8f631ea6006c647f843db214684476054223102c16630dabc450d4.svg"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2000, 29, 1.45, 15935.892499999993, 262, 50291, 36243.100000000006, 44806.399999999994, 50139.0, 14.647829557855264, 242.2239121583394, 7.576403880026953], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["17 /assets/icon_anchor-297aa9b0225eff3d6d0da74ce042a0ed5575b92aa66b7109a5e060a795b42e36.svg", 250, 0, 0.0, 272.1120000000002, 262, 447, 276.0, 278.45, 350.5900000000008, 6.762788432926665, 5.395701318067466, 3.4061206616712205], "isController": false}, {"data": ["10 /assets/fontawesome-webfont-2adefcbc041e7d18fcf2d417879dc5a09997aa64d675b7a3c4b6ce33da13f3fe.woff2", 250, 0, 0.0, 571.3559999999997, 530, 992, 595.0, 621.3499999999999, 972.96, 4.666355576294913, 353.02985009332707, 2.660114325711619], "isController": false}, {"data": ["14 /root/download_test/blob/master/README.md", 250, 15, 6.0, 35796.62399999998, 19892, 50158, 48919.1, 50135.0, 50142.49, 3.278301577518719, 5.215585721849225, 1.9168587887986992], "isController": false}, {"data": ["15 /root/download_test/refs/master/logs_tree/", 250, 0, 0.0, 22789.268, 19818, 33361, 24711.3, 25254.9, 33184.840000000004, 3.620617242827557, 6.453311801220871, 2.0710496350417817], "isController": false}, {"data": ["18 /root/download_test/-/archive/master/download_test-master.tar.gz", 500, 0, 0.0, 16656.39999999999, 8047, 24262, 22160.8, 22901.0, 23998.0, 10.783763964974336, 117.32768893154467, 5.473434197472286], "isController": false}, {"data": ["16 /root/download_test/commits/master/signatures", 250, 0, 0.0, 24068.208000000002, 21188, 25452, 25250.7, 25315.8, 25417.45, 4.316372865553618, 2.500157817382897, 2.4395262672870737], "isController": false}, {"data": ["1 /root/download_test", 500, 43, 8.6, 68853.10599999999, 2431, 121749, 117161.5, 119188.84999999999, 121203.08, 3.9390239098751327, 258.56459199097964, 7.830856466892504], "isController": false}, {"data": ["9 /assets/icons-1bbf3f0e2e8f631ea6006c647f843db214684476054223102c16630dabc450d4.svg", 250, 0, 0.0, 457.70000000000005, 405, 1458, 441.0, 632.6499999999987, 1441.47, 4.681472604022321, 145.76112405668326, 2.289276677371634], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 29, 100.0, 1.45], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2000, 29, "504/Gateway Time-out", 29, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["14 /root/download_test/blob/master/README.md", 250, 15, "504/Gateway Time-out", 15, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1 /root/download_test", 250, 14, "504/Gateway Time-out", 14, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
