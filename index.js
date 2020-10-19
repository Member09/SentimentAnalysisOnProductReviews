
$(document).ready(function () {
    //$(".btn-trigger-ml").off('click').on('click', OnMLSubmitClick);
});

var MW = {
    "G2": "https://api.apify.com/v2/actor-tasks/oRKFokGuX3qFE3Ny4/runs/last/dataset/items?token=2Z5avMBNgZaz9hgEdF7bzdpKL&ui=1&clean=1",
    "CT": "https://api.apify.com/v2/actor-tasks/vLPwCyPdqPC4Q8CaY/runs/last/dataset/items?token=2Z5avMBNgZaz9hgEdF7bzdpKL&ui=1&clean=1"
};
var PC = {
    "G2": "https://api.apify.com/v2/actor-tasks/xNooTtzfF8wA9hziq/runs/last/dataset/items?token=2Z5avMBNgZaz9hgEdF7bzdpKL&ui=1&clean=1",
    "CT": "	https://api.apify.com/v2/actor-tasks/gyBzus974ybHSsE6H/runs/last/dataset/items?token=2Z5avMBNgZaz9hgEdF7bzdpKL&ui=1&Clean=1"
};

function OnMLSubmitClick(source) {
    //var source = $(this).attr("data-source");
    var requestObj = {};
    switch (source) {
        case "MW": requestObj = MW;
            break;
        case "PC": requestObj = PC;
            break;
        default: requestObj = null;
            break;
    };

    if (requestObj == null) {
        var options = {
            autohide: true,
            delay: 500,
            animation: true
        }
        $('#wipToast').toast(options);
        return;
    }
    var sharedObj = {
        Response: {},
        Source: source,
        Request: requestObj
    };

    PerformAsyncOps(sharedObj);
}

function PerformAsyncOps(sharedObj) {
    $('#btnViewReport').css({ 'display': 'none' });
    $("#ulTicked").html("");
    UpdateProgress('Sourcing Customer Feedbacks');

    var waterfallFunctions = [];
    waterfallFunctions.push(async.constant(sharedObj));
    waterfallFunctions.push(GetG2Data);
    waterfallFunctions.push(GetCTData);
    waterfallFunctions.push(MergeData);
    waterfallFunctions.push(RunML);
    waterfallFunctions.push(SaveMLResult);
    waterfallFunctions.push(StoreChartData);


    async.waterfall(waterfallFunctions, function (error) {
        if (error == null) {
            UpdateProgress('Data Ready!');

            $('#btnViewReport').css({ 'display': 'block' }).on('click', ViewReportClicked);
        }
    });
}

function GetG2Data(sharedObj, callback) {

    $.ajax({
        url: sharedObj.Request.G2,
        type: "GET"
    }).then(function (resposne) {
        resposne[0].comments.forEach(function (value) { if (value.Product === undefined || value.Product == "") value.Product = "G2 CROWD"; });

        if (sharedObj.Source == "MW") {
            sharedObj.Response.G2 = resposne;
        }
        else {
            sharedObj.Response.G2 = [{ comments: [], url: "https://www.g2.com/products/procore/reviews" }];
        }
        callback(null, sharedObj);
    }, function (e) {
        callback(e);
    });
}
function GetCTData(sharedObj, callback) {

    $.ajax({
        url: sharedObj.Request.CT,
        type: "GET"
    }).then(function (resposne) {
        resposne[0].comments.forEach(function (value) { value.Product = "CAPTERRA"; })
        if (sharedObj.Source == "PC") {
            sharedObj.Response.CT = resposne;
        }
        else {
            sharedObj.Response.CT = [{ comments: [], url: "https://www.g2.com/products/procore/reviews" }];
        }
        UpdateProgress('Customer Feedbacks obtained');
        callback(null, sharedObj);
    }, function (e) {
        callback(e);
    });
}

function MergeData(sharedObj, callback) {
    var mergedResponse = sharedObj.Response.G2;
    if (mergedResponse.length > 0)
        delete mergedResponse[0].url;
    if (sharedObj.Response.CT.length > 0)
        sharedObj.Response.CT[0].comments.forEach(function (value) {
            mergedResponse[0].comments.push(value)
        });
    mergedResponse[0].comments = mergedResponse[0].comments.filter(function (value) { return value.text.length > 0 })
    sharedObj.Response.Result = mergedResponse;
    callback(null, sharedObj);
}
function HardcodedReviews() {

}
function RunML(sharedObj, callback) {
    UpdateProgress('Processing Sentiment Analysis');

    $.ajax({
        url: "http://127.0.0.1:5000/processsentimentanalysis",
        type: "POST",
        data: JSON.stringify(sharedObj.Response.Result),
        "headers": {
            "content-type": "application/json"
        },
        "crossDomain": true,
    }).then(function (resposne) {
        sharedObj.Response.ML = resposne;
        UpdateProgress('Sentiment Analysis Processed');
        callback(null, sharedObj);
    }, function (e) {
        callback(e);
    });
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function SaveMLResult(sharedObj, callback) {
    UpdateProgress('Generating Data');

    window.localStorage.setItem("ProductType", sharedObj.Source);
    window.localStorage.setItem("ML", JSON.stringify(sharedObj.Response.ML));
    if (sharedObj.Source == "MW") {
        window.localStorage.setItem("MWResponse", JSON.stringify(sharedObj.Response.ML));
    }
    else {
        window.localStorage.setItem("PCResponse", JSON.stringify(sharedObj.Response.ML));
    }

    callback(null, sharedObj);
}

function StoreChartData(sharedObj, callback) {
    window.localStorage.setItem("Chart", "");
    var chartJSON = {
        donut: [0, 0, 0, 0, 0],
        scattered: [],
        nps: 0,
        review: {
            MW: [],
            PC: []
        },
        stack: {},
        averagerating: 0,
        averagesentimentscore: 0,
        source: "",
        likesdislikes: {
            likes: 0,
            dislikes: 0,
            total: 0
        }
    }
    chartJSON.source = sharedObj.Source;
    var comments = sharedObj.Response.ML[0].comments;
    var total = sharedObj.Response.ML[0].comments.length;

    var groupedData = {};
    comments.forEach(function (value) { if (groupedData[value.SentimentGroup]) { groupedData[value.SentimentGroup]++; } else { groupedData[value.SentimentGroup] = 1; } });


    comments.forEach(function (value) {
        if (value.SentimentScore > 0) {
            chartJSON.likesdislikes.likes += 1;
        }
        else {
            chartJSON.likesdislikes.dislikes += 1;
        }
    });
    chartJSON.likesdislikes.total = total;


    var postive = 0;
    var negative = 0;
    for (var key in groupedData) {
        var value = groupedData[key];
        var percent = (value / total) * 100;
        percent = Math.floor(percent);
        if (key == "VERYBAD") {
            negative += value;
            chartJSON.donut[0] = percent;
        }
        if (key == "BAD") {
            negative += value;
            chartJSON.donut[1] = percent;
        }
        if (key == "NEUTRAL") {
            //postive += value;
            chartJSON.donut[2] = percent;
        }
        if (key == "GOOD") {
            postive += value;
            chartJSON.donut[3] = percent;
        }
        if (key == "VERYGOOD") {
            postive += value;
            chartJSON.donut[4] = percent;
        }
    }
    var sumSentimentscore = 0;
    var scatteredSource = [];
    comments.forEach(function (value) {
        scatteredSource.push({
            x: parseFloat((value.Rating) ? value.Rating : 3),
            y: value.SentimentScore
        });
        sumSentimentscore += value.SentimentScore;
    });

    chartJSON.scattered = GroupScattered(scatteredSource);

    chartJSON.averagesentimentscore = (sumSentimentscore / total).toFixed(2);


    var sumRating = 0;
    comments.forEach(function (value) {
        sumRating += parseFloat((value.Rating) ? value.Rating : 3);
    });

    chartJSON.averagerating = (sumRating / total).toFixed(1);
    var postivePer = (postive / total) * 100;
    var negPer = (negative / total) * 100;
    chartJSON.nps = Math.floor(postivePer - negPer);
    var keyAsArray = [];
    if (localStorage.PCResponse) {
        var pcResponse = JSON.parse(localStorage.PCResponse)[0].comments
        chartJSON.review.PC = QJSONForReview(pcResponse, keyAsArray, false);
    }
    if (localStorage.MWResponse) {
        var mwResponse = JSON.parse(localStorage.MWResponse)[0].comments
        chartJSON.review.MW = QJSONForReview(mwResponse, keyAsArray, false);;
    }
    chartJSON.review.Q = getUnique(keyAsArray);

    var keyAsArrayForStack = [];
    chartJSON.stack.Product = QJSON(sharedObj.Response.ML[0].comments, keyAsArrayForStack, false);
    chartJSON.stack.Q = getUnique(keyAsArrayForStack);

    GetStackBySentimentGroup(chartJSON.stack, sharedObj.Response.ML, keyAsArrayForStack);

    window.localStorage.setItem("Chart", JSON.stringify(chartJSON));
    callback(null, sharedObj);
}
function GetStackBySentimentGroup(stack, response, keyAsArrayForStack) {
    var comments = response[0].comments;
    var vb = comments.filter(function (value) { return value.SentimentGroup == "VERYBAD"; });
    var b = comments.filter(function (value) { return value.SentimentGroup == "BAD"; });
    var n = comments.filter(function (value) { return value.SentimentGroup == "NEUTRAL"; });
    var g = comments.filter(function (value) { return value.SentimentGroup == "GOOD"; });
    var vg = comments.filter(function (value) { return value.SentimentGroup == "VERYGOOD"; });
    stack.VERYBAD = QJSON(vb, keyAsArrayForStack, true);
    stack.BAD = QJSON(b, keyAsArrayForStack, true);
    stack.NEUTRAL = QJSON(n, keyAsArrayForStack, true);
    stack.GOOD = QJSON(g, keyAsArrayForStack, true);
    stack.VERYGOOD = QJSON(vg, keyAsArrayForStack, true);
}
function GroupScattered(scatteredSource) {
    var group = {};
    group.VERYBAD = scatteredSource.filter(function (value) { return value.y < -0.5 });
    group.BAD = scatteredSource.filter(function (value) { return value.y >= -0.5 && value.y < 0 });
    group.NEUTRAL = scatteredSource.filter(function (value) { return value.y == 0 });
    group.GOOD = scatteredSource.filter(function (value) { return value.y > 0 && value.y <= 0.5 });
    group.VERYGOOD = scatteredSource.filter(function (value) { return value.y > 0.5 && value.y <= 1 });
    return group;
}
function getUnique(array) {
    var uniqueArray = [];

    // Loop through array values
    for (i = 0; i < array.length; i++) {
        if (uniqueArray.indexOf(array[i]) === -1) {
            uniqueArray.push(array[i]);
        }
    }
    return uniqueArray;
}

function QJSONForReview(comments, keyAsArray, hasSum) {
    var groupedSentimentScore = {};
    GenQKeys(groupedSentimentScore);
    comments.forEach(function (value) {
        //chartJSON.review.PC.push({
        groupObj(value, groupedSentimentScore);
    });
    var returnArray = [];
    groupedSentimentScore = SortObject(groupedSentimentScore);

    for (var group in groupedSentimentScore) {
        keyAsArray.push(group);
    }

    for (var group in groupedSentimentScore) {
        var npsObject = CalculateSentimentScorePerQ(groupedSentimentScore[group]);
        if (isNaN(npsObject)) {
            npsObject = 0;
        }
        var npsSum = (groupedSentimentScore[group]).length;
        var j = {
            x: group,
            y: (hasSum) ? npsSum : npsObject.toFixed(2),

        }
        returnArray.push(j);
    }
    return returnArray;
}

function QJSON(comments, keyAsArray, hasSum) {
    var groupedSentimentScore = {};
    GenQKeys(groupedSentimentScore);
    comments.forEach(function (value) {
        //chartJSON.review.PC.push({
        groupObj(value, groupedSentimentScore);
    });
    var returnArray = [];
    groupedSentimentScore = SortObject(groupedSentimentScore);

    for (var group in groupedSentimentScore) {
        keyAsArray.push(group);
    }

    for (var group in groupedSentimentScore) {
        var npsObject = CalculateNPS(groupedSentimentScore[group]);
        if (isNaN(npsObject)) {
            npsObject = 0;
        }
        var npsSum = (groupedSentimentScore[group]).length;
        var j = {
            x: group,
            y: (hasSum) ? npsSum : npsObject,

        }
        returnArray.push(j);
    }
    return returnArray;
}
function GenQKeys(o) {

    o["2018-Q1"] = [];
    o["2018-Q2"] = [];
    o["2018-Q3"] = [];
    o["2018-Q4"] = [];
    o["2019-Q1"] = [];
    o["2019-Q2"] = [];

}
function CheckQKeys(value) {
    var keyArray = ["2018-Q1", "2018-Q2", "2018-Q3", "2018-Q4", "2019-Q1", "2019-Q2"];
    return keyArray.indexOf(value) > -1;
}
function groupObj(x, o) {


    var dt_object = new Date(x["time"]); // convert to datetime object
    var qName;
    var month = dt_object.getMonth();
    var year = dt_object.getFullYear();
    if (month <= 3) {
        qName = "Q1";
    }
    else if (month > 3 && month <= 6) {
        qName = "Q2";

    }
    else if (month > 6 && month <= 9) {
        qName = "Q3";

    }
    else if (month > 9 && month <= 12) {
        qName = "Q4";

    }

    var key = year + '-' + qName;

    if (CheckQKeys(key)) {
        if (o[key] === undefined) {
            o[key] = [];
        };
        o[key].push(x.SentimentScore);
    }

}
function CalculateSentimentScorePerQ(arrayObj) {
    var total = arrayObj.length;
    var score = 0;
    for (var sscore of arrayObj) {
        score += sscore;
    }
    return (score / total);
}
function CalculateNPS(arrayObj) {
    var positive = 0;
    var negative = 0;
    var total = arrayObj.length;
    for (var sscore of arrayObj) {

        if (sscore == 0) {
            positive += sscore;
        }
        else if (sscore < -0.5) {
            negative += sscore;
        }
        else if (sscore >= -0.5 && sscore < 0) {
            negative += sscore;
        }
        else if (sscore > 0 && sscore <= 0.5) {
            positive += sscore;
        }
        else if (sscore > 0.5 && sscore <= 1) {
            positive += sscore;
        }

    }
    var postivePer = (positive / total) * 100;
    var negPer = (negative / total) * 100;
    return Math.floor(postivePer - negPer);
}
function UpdateProgress(message) {
    $('#logsContainer').removeClass('d-none');
    var ul = $('#ulTicked');
    var li = $('<li>' + message + '</li>');
    ul.append(li);
}
function ViewReportClicked(message) {
    window.location.href = "Dashboard.html";
}
function SortObject(unordered) {
    const ordered = {};
    Object.keys(unordered).sort().forEach(function (key) {
        ordered[key] = unordered[key];
    });
    return ordered;
}