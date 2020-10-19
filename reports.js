$(document).ready(function () {

    var chartJSON = JSON.parse(window.localStorage.getItem("Chart"));
    if ($("#productTitle").length) {
        if (chartJSON.source == "MW")
            $('#productTitle').text("Masterworks");
        else if (chartJSON.source == "PC")
            $('#productTitle').text("Procore");
    }


    json_data = JSON.parse(localStorage.ML);

    $('#example').show();


    result = [];
    for (var i in json_data[0]["comments"]) {
        result[i] = []
        result[i][0] = json_data[0]["comments"][i]["Product"];
        result[i][1] = json_data[0]["comments"][i]["time"];
        result[i][2] = json_data[0]["comments"][i]["title"];
        var rating = json_data[0]["comments"][i]["Rating"];
        result[i][3] = (rating) ? rating : 0;
        result[i][4] = json_data[0]["comments"][i]["SentimentScore"];
        result[i][5] = "";
        result[i][6] = json_data[0]["comments"][i]["text"];
    }

    $('#example').DataTable({
        data: result,
        //columns: [
        //    { title: 'Source', width: "10px" },
        //    { title: "Start Date", width: "10px" },
        //    { title: "Review", width:"30%" },
        //    { title: "User Rating", width: "10%" },
        //    { title: "Sentiment Score", width: "10%" },
        //    { title: "Operations", width:"10%", defaultContent: "<button>Click!</button>" },
        //    { title:"Review Text", visible:false}
        //],

        "columnDefs": [{
            "targets": -1,
            "data": result,
            "defaultContent": "<img src='/images/AhaIcon.png' alt='Aha' height='20px' width='50px'> <img src='/images/emailICON.png' alt='mail' height='20px' width='30px'>"
        }, { "targets": 2, "width": "400px", "searchable": true, render: function (data, type, full, meta) { return "<div style='width:400px;word-break: break-word !important;white-space:initial;'>" + data + "</div>"; } }
        , { "targets": [3,4], "width": "100px", render: function (data, type, full, meta) { return "<div style='text-align:center;'>" + data + "</div>"; } }],

        "scrollX": true,
        "scrollY": true,
        autoWidth: false,
        responsive: true,
    });

    $('#example').on('click', 'tbody td', function () {
        //get textContent of the TD
        console.log('TD cell textContent : ', this.textContent)
        var thisText = this.textContent;
        if (this.cellIndex == 2) {
            var element = result.find(function (e) {
                return e[2] == thisText;
            });
            //alert(element[6]);
            $('#exampleModalLong').modal('show');
            $(".modal-body").text(element[6]);
        }
        //get the value of the TD using the API 
        console.log('value by :  row:' + this.parentNode.rowIndex + ', column: ' + this.cellIndex);
    });
    
    
});