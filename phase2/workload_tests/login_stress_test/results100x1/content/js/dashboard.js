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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.07178571428571429, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.13, 500, 1500, "1 /"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in-1"], "isController": false}, {"data": [0.515, 500, 1500, "1 /-0"], "isController": false}, {"data": [0.0, 500, 1500, "30 /users/sign_out-0"], "isController": false}, {"data": [0.05, 500, 1500, "30 /users/sign_out-1"], "isController": false}, {"data": [0.18, 500, 1500, "1 /-1"], "isController": false}, {"data": [0.0, 500, 1500, "30 /users/sign_out"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in-0"], "isController": false}, {"data": [0.0, 500, 1500, "9 /projects/new"], "isController": false}, {"data": [0.0, 500, 1500, "5 /users/sign_in"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1000, 0, 0.0, 7182.817000000003, 276, 20539, 13092.099999999999, 18866.949999999993, 20199.73, 22.550456646747097, 126.39568387783291, 13.175544734468373], "isController": false}, "titles": ["Label", "#Samples", "KO", "Error %", "Average", "Min", "Max", "90th pct", "95th pct", "99th pct", "Throughput", "Received", "Sent"], "items": [{"data": ["1 /", 200, 0, 0.0, 4763.81, 755, 14824, 7978.8, 10073.899999999994, 14799.560000000023, 12.836970474967908, 67.00459824293966, 8.41172577021823], "isController": false}, {"data": ["5 /users/sign_in-1", 100, 0, 0.0, 8951.119999999995, 4438, 12576, 11621.6, 11962.049999999997, 12573.699999999999, 3.3521051220166265, 33.22073664605122, 1.5712992759452935], "isController": false}, {"data": ["1 /-0", 100, 0, 0.0, 1056.99, 276, 5875, 2410.8, 3988.0999999999954, 5867.449999999996, 15.227653418608192, 7.642824682122734, 4.8924784909395465], "isController": false}, {"data": ["30 /users/sign_out-0", 100, 0, 0.0, 6007.809999999999, 2673, 8282, 7576.8, 7854.7, 8281.23, 4.247547041583486, 2.8616603794121396, 1.8665978210083678], "isController": false}, {"data": ["30 /users/sign_out-1", 100, 0, 0.0, 3887.269999999998, 609, 7783, 6789.000000000004, 7721.2, 7782.5599999999995, 5.792735909169901, 27.325082003417712, 2.53997892892313], "isController": false}, {"data": ["1 /-1", 100, 0, 0.0, 3706.2700000000004, 457, 8949, 5998.3, 6592.599999999999, 8932.109999999991, 6.58457891617831, 31.064422902811618, 2.1991464739579905], "isController": false}, {"data": ["30 /users/sign_out", 200, 0, 0.0, 9895.570000000009, 3729, 15989, 13839.7, 14235.549999999997, 15981.470000000007, 8.16559833421794, 44.019512590331935, 7.1688211938104764], "isController": false}, {"data": ["5 /users/sign_in-0", 100, 0, 0.0, 8093.240000000001, 2254, 13358, 12387.800000000003, 12996.949999999999, 13357.59, 3.9850163385669877, 2.4201191021758186, 2.827104462222045], "isController": false}, {"data": ["9 /projects/new", 200, 0, 0.0, 8421.210000000001, 5637, 13001, 12590.0, 12903.599999999999, 13000.85, 6.2690029150863555, 86.47287529777765, 2.6324914584835284], "isController": false}, {"data": ["5 /users/sign_in", 200, 0, 0.0, 17044.879999999997, 6907, 20539, 20197.3, 20416.15, 20538.46, 6.23208276205908, 65.54726937398729, 7.342537665150194], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1000, 0, null, null, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
