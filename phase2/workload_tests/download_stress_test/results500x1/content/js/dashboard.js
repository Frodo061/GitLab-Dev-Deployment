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

    var data = {"OkPercent": 47.975, "KoPercent": 52.025};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1278, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.831, 500, 1500, "17 /assets/icon_anchor-297aa9b0225eff3d6d0da74ce042a0ed5575b92aa66b7109a5e060a795b42e36.svg"], "isController": false}, {"data": [0.141, 500, 1500, "10 /assets/fontawesome-webfont-2adefcbc041e7d18fcf2d417879dc5a09997aa64d675b7a3c4b6ce33da13f3fe.woff2"], "isController": false}, {"data": [0.036, 500, 1500, "14 /root/download_test/blob/master/README.md"], "isController": false}, {"data": [0.036, 500, 1500, "15 /root/download_test/refs/master/logs_tree/"], "isController": false}, {"data": [0.053, 500, 1500, "18 /root/download_test/-/archive/master/download_test-master.tar.gz"], "isController": false}, {"data": [0.036, 500, 1500, "16 /root/download_test/commits/master/signatures"], "isController": false}, {"data": [0.0, 500, 1500, "1 /root/download_test"], "isController": false}, {"data": [0.092, 500, 1500, "9 /assets/icons-1bbf3f0e2e8f631ea6006c647f843db214684476054223102c16630dabc450d4.svg"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4000, 2081, 52.025, 12049.122749999999, 130, 232533, 34989.4, 62561.649999999965, 129161.34999999999, 16.538561723979676, 257.88903930079096, 7.903013900919544], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["17 /assets/icon_anchor-297aa9b0225eff3d6d0da74ce042a0ed5575b92aa66b7109a5e060a795b42e36.svg", 500, 0, 0.0, 624.0680000000002, 130, 15589, 1304.0, 1850.6, 7474.96, 3.166922131718625, 2.5267337711075357, 1.4831587039687868], "isController": false}, {"data": ["10 /assets/fontawesome-webfont-2adefcbc041e7d18fcf2d417879dc5a09997aa64d675b7a3c4b6ce33da13f3fe.woff2", 500, 0, 0.0, 6647.900000000002, 314, 65822, 12842.200000000003, 16396.399999999998, 35556.75000000002, 2.1277591717059097, 160.974124054743, 1.1377859708326772], "isController": false}, {"data": ["14 /root/download_test/blob/master/README.md", 500, 452, 90.4, 13596.333999999993, 215, 50155, 34213.6, 35542.549999999996, 50147.0, 2.1226284933158426, 6.29573683996867, 1.1661356115504953], "isController": false}, {"data": ["15 /root/download_test/refs/master/logs_tree/", 500, 450, 90.0, 3107.028000000001, 216, 29206, 7848.800000000039, 11555.599999999997, 28124.94, 2.6793560971427346, 8.101357612988448, 1.4379769253852914], "isController": false}, {"data": ["18 /root/download_test/-/archive/master/download_test-master.tar.gz", 1000, 882, 88.2, 1072.7080000000008, 215, 9424, 1965.1, 2154.4499999999994, 3868.4500000000025, 6.325950948576344, 25.750524658556795, 2.9873314924816072], "isController": false}, {"data": ["16 /root/download_test/commits/master/signatures", 500, 447, 89.4, 1924.910000000002, 219, 15819, 3352.9000000000033, 7346.899999999985, 15681.650000000036, 3.1363693388533433, 9.055825414000754, 1.661810194768536], "isController": false}, {"data": ["1 /root/download_test", 1000, 761, 76.1, 74740.21300000002, 2400, 237048, 119332.49999999999, 131357.55, 185713.60000000006, 4.143428936050318, 261.69944502006456, 7.567434791492297], "isController": false}, {"data": ["9 /assets/icons-1bbf3f0e2e8f631ea6006c647f843db214684476054223102c16630dabc450d4.svg", 500, 25, 5.0, 15259.882000000007, 409, 156591, 27700.300000000003, 40419.399999999994, 129538.5, 2.129852869763757, 63.25777835579618, 0.9147010897924671], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 58, 2.787121576165305, 1.45], "isController": false}, {"data": ["504/Gateway Time-out", 150, 7.2080730418068235, 3.75], "isController": false}, {"data": ["500/Internal Server Error", 1843, 88.5631907736665, 46.075], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 35.237.142.78:80 [\/35.237.142.78] failed: Connection timed out (Connection timed out)", 30, 1.4416146083613648, 0.75], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4000, 2081, "500/Internal Server Error", 1843, "504/Gateway Time-out", 150, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 58, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 35.237.142.78:80 [\/35.237.142.78] failed: Connection timed out (Connection timed out)", 30, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["14 /root/download_test/blob/master/README.md", 500, 452, "500/Internal Server Error", 443, "504/Gateway Time-out", 9, null, null, null, null, null, null], "isController": false}, {"data": ["15 /root/download_test/refs/master/logs_tree/", 500, 450, "500/Internal Server Error", 450, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["18 /root/download_test/-/archive/master/download_test-master.tar.gz", 500, 441, "500/Internal Server Error", 441, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["16 /root/download_test/commits/master/signatures", 500, 447, "500/Internal Server Error", 447, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["1 /root/download_test", 500, 266, "504/Gateway Time-out", 141, "500/Internal Server Error", 62, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 39, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 35.237.142.78:80 [\/35.237.142.78] failed: Connection timed out (Connection timed out)", 24, null, null], "isController": false}, {"data": ["9 /assets/icons-1bbf3f0e2e8f631ea6006c647f843db214684476054223102c16630dabc450d4.svg", 500, 25, "Non HTTP response code: java.net.SocketException/Non HTTP response message: Connection reset", 19, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to 35.237.142.78:80 [\/35.237.142.78] failed: Connection timed out (Connection timed out)", 6, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
