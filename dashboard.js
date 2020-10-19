$(document).ready(function () {

    var chartJSON = JSON.parse(window.localStorage.getItem("Chart"));

    var chartColors = {
        VERYBAD: 'rgb(255, 0, 0)',
        BAD: 'rgb(255, 192, 0)',
        NEUTRAL: 'rgb(178, 178, 178)',
        GOOD: 'rgb(88, 234, 68)',
        VERYGOOD: 'rgb(0, 153, 0)',
        MW: 'rgb(0, 0, 255)',
        PC: 'rgb(0, 0, 0)',
    };

    var chartLabels = {
        VERYBAD: 'Very Bad',
        BAD: 'Bad',
        NEUTRAL: 'Neutral',
        GOOD: 'Good',
        VERYGOOD: 'VeryGood'
    };

    if ($("#productTitle").length) {
        if (chartJSON.source == "MW")
            $('#productTitle').text("Masterworks");
        else if (chartJSON.source == "PC")
            $('#productTitle').text("Procore");
    }

    if ($("#upValue").length) {
        $('#upValue').text(chartJSON.likesdislikes.likes + "(" + Math.floor((chartJSON.likesdislikes.likes / chartJSON.likesdislikes.total) * 100) + "%)");
    }

    if ($("#downValue").length) {
        $('#downValue').text(chartJSON.likesdislikes.dislikes + "(" + Math.floor((chartJSON.likesdislikes.dislikes / chartJSON.likesdislikes.total) * 100) + "%)");
    }

    if ($("#npsScore").length) {
        $('#npsScore').text(chartJSON.nps);
    }

    if ($(".my-rating").length) {
        $('#supAvgReview').text(chartJSON.averagerating);

        $(".my-rating").starRating({
            totalStars: 5,
            starSize: 16,
            strokeWidth: 9,
            strokeColor: "black",
            initialRating: chartJSON.averagerating,
            readOnly: true,
            starGradient: { start: '#FFC000', end: '#FF9511' }
        });
    }

    if ($("#avgSentimentScore").length) {
        var avgSentimentScore = new JustGage({
            id: "avgSentimentScore",
            value: chartJSON.averagesentimentscore,
            min: -1,
            max: 1,
            title: " ",
            label: " ",
            levelColors: ["#FF0000", "#FFC000", "#999999", "#58EA44", "#009900"]
        });
    }

    if ($("#doughnutChart").length) {

        var doughnutPieData = {
            datasets: [{
                data: chartJSON.donut,
                backgroundColor: [chartColors.VERYBAD, chartColors.BAD, chartColors.NEUTRAL, chartColors.GOOD, chartColors.VERYGOOD]
            }],
            // These labels appear in the legend and in the tooltips when hovering different arcs
            labels: [chartLabels.VERYBAD, chartLabels.BAD, chartLabels.NEUTRAL, chartLabels.GOOD, chartLabels.VERYGOOD]
        };

        var doughnutPieOptions = {
            responsive: true,
            legend: {
                position: 'bottom',
            },
            animation: {
                animateScale: true,
                animateRotate: true
            }
        };

        var doughnutChartCanvas = $("#doughnutChart").get(0).getContext("2d");
        var doughnutChart = new Chart(doughnutChartCanvas, {
            type: 'doughnut',
            data: doughnutPieData,
            options: doughnutPieOptions
        });
    }

    if ($("#scatterChart").length) {

        var scatterChartOptions = {
            responsive: true,
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Customer Rating'
                    },
                    ticks: {
                        min: 0,
                        max: 5,
                        stepSize: 1
                    },
                    offset: true
                }],
                yAxes: [{
                    gridLines: {
                        display: false
                    },
                    scaleLabel: {
                        display: true,
                        labelString: 'Sentiment Score'
                    },
                    ticks: {
                        min: -1,
                        max: 1
                    },
                    offset: true
                }]
            },
            legend: {
                position: 'bottom',
            },
            tooltips: {
                callbacks: {
                    label: function (tooltipItem, data) {
                        var label = data.datasets[tooltipItem.datasetIndex].label || '';

                        if (label) {
                            label += ': ';
                        }
                        label += "(Sentiment Score:" + Math.round(tooltipItem.yLabel * 100) / 100;
                        label += ", Customer Rating:" + Math.round(tooltipItem.xLabel * 100) / 100 + ")";
                        return label;
                    }
                }
            }
        }

        var scatterChartData = [];
        $.each(chartLabels, function (name, labelString) {
            var colorData = {
                label: labelString,
                data: chartJSON.scattered[name],
                backgroundColor: chartColors[name],
                pointRadius: 5,
                pointHoverRadius: 8,
                pointHoverBackgroundColor: chartColors[name],
            };
            scatterChartData.push(colorData);
        });
        var scatterChartCanvas = $("#scatterChart").get(0).getContext("2d");
        var scatterChart = new Chart(scatterChartCanvas, {
            type: 'scatter',
            data: {
                labels: [chartLabels.VERYBAD, chartLabels.BAD, chartLabels.NEUTRAL, chartLabels.GOOD, chartLabels.VERYGOOD],
                datasets: scatterChartData
            },
            options: scatterChartOptions
        });
    }

    if ($("#linechart-multi").length) {

        var multiLineOptions = {
            responsive: true,
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    type: "time",
                    time: {
                        unit: "quarter",
                        displayFormats: {
                            quarter: "YYYY - [Q]Q"
                        },
                        format: 'YYYY-[Q]Q',
                        tooltipFormat: 'YYYY - [Q]Q'
                    },
                    offset: true
                }],
                yAxes: [{
                    ticks: {
                        min: -1,
                        max: 1
                    }
                }]
            },
            legend: {
                position: 'bottom'
            },
            elements: {
                point: {
                    radius: 5
                }
            }

        };
        var multiLineData = {
            datasets: [{
                label: 'Masterworks',
                data: chartJSON.review.MW,
                borderColor: chartColors.MW,
                backgroundColor: chartColors.MW,
                borderWidth: 2,
                fill: false,
                lineTension: 0
            },
              {
                  label: 'Procore',
                  data: chartJSON.review.PC,
                  borderColor: chartColors.PC,
                  backgroundColor: chartColors.PC,
                  borderWidth: 2,
                  fill: false,
                  lineTension: 0
              }
            ]
        };

        var multiLineCanvas = $("#linechart-multi").get(0).getContext("2d");
        var lineChart = new Chart(multiLineCanvas, {
            type: 'line',
            data: multiLineData,
            options: multiLineOptions
        });
    }

    if ($("#comboChart").length) {
        var comboOptions = {
            responsive: true,
            tooltips: {
                mode: 'index',
                intersect: true
            },
            scales: {
                xAxes: [{
                    gridLines: {
                        display: false
                    },
                    type: "time",
                    time: {
                        unit: "quarter",
                        displayFormats: {
                            quarter: "YYYY - [Q]Q"
                        },
                        format: 'YYYY-[Q]Q',
                        tooltipFormat: 'YYYY - [Q]Q'
                    },
                    stacked: true,
                    offset: true
                }],
                yAxes: [
                //    {
                //    display: true,
                //    position: 'left',
                //    id: 'y-axis-1',
                //    ticks: {
                //        min: -100,
                //        max: 100,
                //        stepSize: 25
                //    }
                //},
                {
                    display: true,
                    position: 'left',
                    id: 'y-axis-2',
                    stacked: true,
                }]
            },
            legend: {
                position: 'bottom'
            },
            elements: {
                point: {
                    radius: 5
                }
            }

        };
        var comboData = {
            datasets: []
        }

        //comboData.datasets.push({
        //    type: 'line',
        //    label: 'NPS Score',
        //    data: chartJSON.stack.Product,
        //    borderColor: chartColors[chartJSON.source],
        //    backgroundColor: chartColors[chartJSON.source],
        //    borderWidth: 2,
        //    yAxisID: 'y-axis-1',
        //    lineTension: 0,
        //    fill: false
        //});

        $.each(chartLabels, function (name, labelString) {
            var colorData = {
                type: 'bar',
                label: labelString,
                data: chartJSON.stack[name],
                backgroundColor: chartColors[name],
                yAxisID: 'y-axis-2'
            };
            comboData.datasets.push(colorData);
        });

        var comboCanvas = $("#comboChart").get(0).getContext("2d");
        var lineChart = new Chart(comboCanvas, {
            type: 'bar',
            data: comboData,
            options: comboOptions
        });

    }

    if ($("#wordCloud").length) {
        var word_list = [];
        var abc = { 'procore': 96, 'use': 52, 'software': 41, 'project': 39, 'one': 38, 's': 36, 'information': 30, 'time': 30, 'tool': 30, 'able': 29, 'us': 29, 'easy': 26, 'allows': 23, 'great': 23, 'company': 23, 'ability': 22, 'tools': 22, 'system': 22, 't': 21, 'process': 21, 'construction': 20, 'drawings': 20, 'team': 19, 'way': 18, 'much': 18, 'better': 18, 'documents': 18, 'place': 17, 'work': 17, 'program': 17 };
        $.each(abc, function (text, weight) {
            word_list.push({ text: text, weight: weight });
        });

        //[{'procore': 22, 'use': 11, 'program': 8, 'time': 7, 'work': 6, 'data': 6, 'make': 5, 'project': 5, 'internet': 5, 'will': 4, 'hard': 4, 'team': 4, 'using': 4, 'changes': 4, 'company': 4, 'daily': 4, 'asked': 4, 'connection': 4, 'system': 4, 'projects': 4, 'nothing': 3, 'something': 3, 'everything': 3, 'everyone': 3, 'request': 3, 'admin': 3, 'signature': 3, 'page': 3, 'multiple': 3, 'year': 3}]
        $("#wordCloud").jQCloud(word_list);

        $("#wordCloud").jQWCloud({
            words: word_list,
            //cloud_color: 'yellow',		
            minFont: 10,
            maxFont: 50,
            //fontOffset: 5,
            //cloud_font_family: 'Owned',
            //verticalEnabled: false,
            padding_left: 1,
            //showSpaceDIV: true,
            //spaceDIVColor: 'white',
            word_common_classes: 'WordClass',
            word_mouseEnter: function () {
                $(this).css("text-decoration", "underline");
            },
            word_mouseOut: function () {
                $(this).css("text-decoration", "none");
            },
            word_click: function () {
                alert("You have selected:" + $(this).text());
            },
            beforeCloudRender: function () {
                date1 = new Date();
            },
            afterCloudRender: function () {
                var date2 = new Date();
                console.log("Cloud Completed in " + (date2.getTime() - date1.getTime()) + " milliseconds");
            }
        });

    }
});