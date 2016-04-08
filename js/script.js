var selected = 0;

var gooApp = "http://steel-utility-127007.appspot.com";
var awsURL =  "http://stocksearch-env.us-west-2.elasticbeanstalk.com";
var localHost =  "http://localhost/~yangpinz/HW8/index.php";

$(document).ready(function(){
   	
   	drawFavList();
   	console.log(localStorage.getItem("favorite_list"));
	
	$("#form1").submit(function(event) {
		event.preventDefault();
		// $("#symbolsearch").checkValidity();
		if(selected != 1 && $("#symbolsearch").val()) {
    		selected = 0;
    		$("section.error-info").css("color", "red")
    		.show();
    	} 
    	else if($("#symbolsearch").val() == "undefined - undefined ( undefined )") {
    		selected = 0;
    		$("section.error-info").css("color", "red")
    		.show();
    	}else if(selected == 1){
    		$.ajax({
    			url: gooApp,
    			data: {symbol:$("#symbolsearch").val()},
    			type: 'GET',
    			// dataType: 'jsonp',
    			success: function(data) {
    				var obj = $.parseJSON(data);
    				if(obj && obj.Status && obj.Status == "SUCCESS") {
    					stockDetailTopRander();
    					listRander(obj);
    					dailyStockChart(obj);
    					plotChart(obj);
    					loadNews(obj);
    					enableRightBtn();
    				}
    			},
    			error: function(xhr, status, error) {
    				alert(status);
    			}
    		});
    	} 
	});

	window.setInterval(function(){
		if($("#refresh_toggle").prop("checked")==true) {
			// alert($("#refresh_toggle").prop("checked"));
			if(localStorage.getItem("favorite_list")){
				var favArr = localStorage.getItem("favorite_list").split("|");
				for(var i = 0; i < favArr.length; i++) {
					if(favArr[i] != "") {
						updateListCow(favArr[i]);
					}	
				}
			}
			
		}
	}, 5000);

	$('#myCarousel').carousel({
	    interval: false
	}); 

	$("#carousel_left_btn").click(function(){
		$("#myCarousel").carousel("prev");
	});

	$("#refresh_btn").click(function(){
		if(localStorage.getItem("favorite_list")) {
			var favArr = localStorage.getItem("favorite_list").split("|");
		// alert($("#favorite_list").children().children().length);
			for(var i = 0; i < favArr.length; i++) {
				if(favArr[i] != "") {
					updateListCow(favArr[i]);
				}			
			}
		}
		
	});

	$("#clear_btn").click(function(){	
		$("#symbolsearch").val("");	
		$("#carousel_right_btn").off("click");
		$("#carousel_right_btn").removeClass("active").addClass("disabled");
		$("#current_stock_left").empty();
		$("#current_stock_right").empty();
		$("#historical_charts").empty();
		$("#news_feeds_container").empty();
	});
    	    
    // });
});
$(function() {

	$("#symbolsearch")
		.focus()
		.autocomplete({
			source: function(request,response) {
				$.ajax({
					url: gooApp,
					type: 'GET',
					data: {
						input: request.term
					},
					success: function(data) {
						selected = 0;
						$("section.error-info").hide();
						var obj = $.parseJSON(data);
						response( $.map(obj, function(item) {
							return {
								label: item.Symbol + " - " + item.Name + " ( " +item.Exchange+ " )",
								value: item.Symbol
							}
						}));
					}
				});
			},
			minLength: 0,
			select: function( event, ui ) {
				//console.log(ui.item);
				// $("span.label-info").html("You selected " + ui.item.label).fadeIn("fast");
				$("section.error-info").hide();
				selected = 1;
			},
			open: function() {
				$(this).removeClass("ui-corner-all").addClass("ui-corner-top");
			},
			close: function() {
				$(this).removeClass("ui-corner-top").addClass("ui-corner-all");
			}
		})
	;
});

function stockDetailTopRander() {
	$("#current_stock_top").empty();
	$("#current_stock_top").append("<section class=\"pull-left\"><b>Stock Details</b></section>"+
		"<section class=\"pull-right\"><button type=\"button\" class=\"btn btn-default gray_button\" id=\"favorite_button\" style=\"color: white;\"><span class=\"glyphicon glyphicon-star\"></span></button></section>"+
		"<section class=\"pull-right\"><button type=\"button\" class=\"btn btn-default btn-social-icon btn-facebook fb-like\" id=\"facebook_button\" data-share=\"true\" data-show-faces=\"true\" data-href=\""+window.location.href+"\" data-layout=\"icon\"><span class=\"fa fa-facebook\"></span></button></section>"
	);
}

function listRander(obj) {
	
	
	$("#current_stock_left").empty()

	$("#current_stock_left").append("<table class=\"table table-striped\" id=\"current_stock_table\"></table>");
	// $("#current_stock_table").append("<caption><b>Stock Details</b></caption>");
	$("#current_stock_table").append("<tr><td><b>Name</b></td><td>"+obj.Name+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Symbol</b></td><td>"+obj.Symbol+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Last Price</b></td><td>"+ "$" + Math.round(obj.LastPrice * 100) / 100 +"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Change(Change Percent)</b></td><td id=\"change\""+changeRedGreen(obj.ChangePercent)+">"+Math.round(obj.Change * 100) / 100+" ( "+Math.round(obj.ChangePercent * 100) / 100+" %) "+showArrow(obj.Change)+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Time and Date</b></td><td>"+showTime(obj.Timestamp)+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Market Cap</b></td><td>"+showCap(obj.MarketCap)+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Volume</b></td><td>"+obj.Volume+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Change YTD (Change Percent YTD)</b></td><td class=\"green_red_color\" id=\"changeYTD\""+changeRedGreen(obj.ChangePercentYTD)+">"+showYTD(obj.ChangeYTD, obj.ChangePercentYTD)+showArrow(obj.ChangePercentYTD)+"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>High Price</b></td><td>"+ "$" + Math.round(obj.High * 100) / 100 +"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Low Price</b></td><td>"+ "$" + Math.round(obj.Low * 100) / 100 +"</td></tr>");
	$("#current_stock_table").append("<tr><td><b>Opening Price</b></td><td>"+ "$" + Math.round(obj.Open * 100) / 100 +"</td></tr>");


	$("#myCarousel").carousel(1);
	
	
}

function changeRedGreen(num) {
	if(num > 0) {
		return "style=\"color:green;\"";
	} else {
		return "style=\"color:red;\"";
	}
}

function showArrow(change) {
	if(change > 0) {
		return "<img src=\"images/up.png\"/>";
	}
	else if(change < 0) {
		return "<img src=\"images/down.png\"/>";
	}
}

function showTime(time) {
	var rtn = "";
	rtn += moment(time, "ddd MMM DD HH:mm:ss Z gggg").format("DD MMMM gggg, hh:mm:ss a");
	return rtn;
}

function showCap(cap) {
	if(cap >= 1000000000) {
		cap /= 1000000000;
		cap = Math.round(cap * 100) / 100;
		cap += " Billion";
		return cap;
	} else if(cap >= 1000000) {
		cap /= 1000000;
		cap = Math.round(cap * 100) / 100;
		cap += " Million";
		return cap;
	} else {
		return cap;
	}
}

function showYTD(YTD, percentYTD) {
	var rtn = "";
	rtn += Math.round(YTD * 100) / 100;
	rtn += " ( ";
	rtn += Math.round(percentYTD * 100) / 100 + "%";
	rtn += " ) ";
	return rtn;
}


function dailyStockChart(obj) {
	$("#current_stock_right").empty();
	// $("#current_stock_right").append("<section class=\"row\"></section>")
	// $("#current_stock_right .row").append("<section id=\"fb_and_save\" class=\"col-md-offset-9\"></section>");
	// $("#current_stock_right .row #fb_and_save").append("<button type=\"button\" class=\"btn btn-default btn-social-icon btn-facebook fb-like\" id=\"facebook_button\" data-share=\"true\" data-show-faces=\"true\" data-href=\""+window.location.href+"\" data-layout=\"icon\"><span class=\"fa fa-facebook\"></span></button>");
	// $("#current_stock_right .row #fb_and_save").append("<button type=\"button\" class=\"btn btn-default gray_button\" id=\"favorite_button\" style=\"color: white;\"><span class=\"glyphicon glyphicon-star\"></span></button>");
	$("#current_stock_right").append("<img class=\"img-responsive\" src=\"http://chart.finance.yahoo.com/t?s="+obj.Symbol+"&lang=en-US&width=480&height=350\" alt=\"Daily Stock Chart\"/>");
	
	favBtnColor(obj.Symbol);
	$("#favorite_button").click(function(){
		var fav_list = localStorage.getItem("favorite_list");
		if(!fav_list) {
			saveToLocal(obj.Symbol);
		} else if(fav_list.indexOf(obj.Symbol+"|") < 0) {
			saveToLocal(obj.Symbol);
		} else {
			delInFavBtn(obj.Symbol);
			// drawFavList();
		}
		favBtnColor(obj.Symbol);
	});

	$("#facebook_button").click(function(){
		$("[property='og:url']").attr("content",window.location.href);
		$("[property='og:image']").attr("content",$("#current_stock_right img").attr("src"));
		$("[property='og:title']").attr("content","Current Stock Price of "+obj.Name+" is $"+Math.round(obj.LastPrice * 100) / 100);
		$("[property='og:description']").attr("content","LAST TRADE PRICE: $ "+Math.round(obj.LastPrice * 100) / 100+", CHANGE: "+$("#current_stock_table #change").text());
		FB.ui({
		  method: 'feed',
		  link: "http://dev.markitondemand.com",
		  name: "Current Stock Price of "+obj.Name+" is $"+Math.round(obj.LastPrice * 100) / 100,
		  picture: $("#current_stock_right img").attr("src"),
		  caption: "LAST TRADE PRICE: $ "+Math.round(obj.LastPrice * 100) / 100+", CHANGE: "+$("#current_stock_table #change").text(),
		  description: "Stock Information of "+obj.Name+" ("+obj.Symbol+")"
		}, 
		function(response){
			if (response && !response.error_message) {
			alert('Posted Successfully');
			} else {
			alert('Not Posted');
			}
		});
	});
}

function favBtnColor(symbol) {
	var fav_list = localStorage.getItem("favorite_list");
	if(!fav_list) {
		$("#favorite_button").css("color", "white"); 
	}
	else if(fav_list.indexOf(symbol+"|") < 0) {
		$("#favorite_button").css("color", "white"); 
	} else {
		$("#favorite_button").css("color", "gold"); 
	}
}

function saveToLocal(symbol) {
	var fav_list = localStorage.getItem("favorite_list");
	if(!fav_list) {
		localStorage.setItem("favorite_list","");
		fav_list = localStorage.getItem("favorite_list");
	}
	if(fav_list.indexOf(symbol) < 0) {
		fav_list += symbol + "|";
		$("#favorite_button").css("color", "gold");
		localStorage.removeItem('favorite_list');
		localStorage.setItem('favorite_list', fav_list);
		drawFavList();
		console.log(localStorage.getItem("favorite_list"));
	} else {

	}
}

function delInFavBtn(symbol) {
	var fav_list_rows = $("#favorite_list").children().children();
	for(var i = 0; i < fav_list_rows.length; i++) {
		if($(fav_list_rows[i]).children("td.symbol").text() == symbol) {
			$(fav_list_rows[i]).remove();
			break;
		}
	}
	var fav_list = localStorage.getItem("favorite_list");
	var tmpStr = symbol+"|";
	var index = fav_list.indexOf(tmpStr);
	if(index > -1) {
		// console.log("index: "+index);
		// console.log("sub1: "+fav_list.substring(0, index)+" sub2: "+fav_list.substring(index + tmpStr.length, fav_list.length));
		var tmp = fav_list.substring(0, index) + fav_list.substring(index + tmpStr.length, fav_list.length);
		console.log("delete: "+symbol);
		fav_list = tmp;
		localStorage.removeItem("favorite_list");
		localStorage.setItem("favorite_list", fav_list);
		console.log(localStorage.getItem("favorite_list"));
	}		

}

function drawFavList() {
	if(!localStorage.getItem("favorite_list")) return;
	var symbolArr = localStorage.getItem("favorite_list").split("|");
	$("#favorite_list").empty();
	$("#favorite_list").append("<tr><th>Symbol</th><th>Company Name</th><th>Stock Price</th><th>Change(Change Persent)</th><th>Market Cap</th><th></th></tr>");
	for(var i = 0; i < symbolArr.length; i++) {
		drawfavListRow(symbolArr[i]);		
	}
	
}

function drawfavListRow(query) {
	$.ajax({
		url: gooApp,
		data: {symbol:query},
		type: 'GET',
		async: false,
		// dataType: 'jsonp',
		success: function(data) {	
			var obj = $.parseJSON(data);					
			if(obj && obj.Status && obj.Status == "SUCCESS") {
				$("#favorite_list").append("<tr><td class=\"symbol\"><a class=\"StockDetail\">"+query+"</a></td><td>"+obj.Name+"</td>"+
				"<td class=\"price\">"+ "$" + Math.round(obj.LastPrice * 100) / 100 +"</td>"+
				"<td class=\"changeRG priceChange\""+changeRedGreen(obj.ChangePercent)+">"+Math.round(obj.Change * 100) / 100+" ( "+Math.round(obj.ChangePercent * 100) / 100+" %) "+showArrow(obj.Change)+"</td>"+
				"<td>"+showCap(obj.MarketCap)+"</td>"+
				"<td><button type=\"button\" class=\"btn btn-default gray_button trash_btn\"><span class=\"glyphicon glyphicon-trash\"></span></button></td></tr>");
			}
			enableTrash();
			enableStockDetail();
		},
		error: function(xhr, status, error) {
			alert(status);
		}
	});
}

function enableTrash() {
	$(".trash_btn").on('click', function(){
		var symbol = $(this).parent().siblings().first().text();
		$(this).parent().parent().remove();
		// alert(symbol);
		var fav_list = localStorage.getItem("favorite_list");
		if(!fav_list) {
			alert("error in Trashing!");
			return;
		}
		var tmpStr = symbol+"|";
		var index = fav_list.indexOf(tmpStr);
		if(index > -1) {
			console.log("index: "+index);
			console.log("sub1: "+fav_list.substring(0, index)+" sub2: "+fav_list.substring(index + tmpStr.length, fav_list.length));
			var tmp = fav_list.substring(0, index) + fav_list.substring(index + tmpStr.length, fav_list.length);
			console.log("delete: "+symbol);
			fav_list = tmp;
			localStorage.removeItem("favorite_list");
			localStorage.setItem("favorite_list", fav_list);
			console.log(localStorage.getItem("favorite_list"));
		}	
		favBtnColor(symbol);	
		return;
	});
}

function enableStockDetail() {
	$(".StockDetail").on('click', function(){
		var query = $(this).text();
		// alert(symbol);
		$.ajax({
			url: gooApp,
			data: {symbol:query},
			type: 'GET',
			// dataType: 'jsonp',
			success: function(data) {
				var obj = $.parseJSON(data);
				if(obj && obj.Status == "SUCCESS") {
					stockDetailTopRander()
					listRander(obj);
					dailyStockChart(obj);
					plotChart(obj);
					loadNews(obj);
				}
			},
			error: function(xhr, status, error) {
				alert(status);
			}
		});
	});
}

function plotChart(obj) {
	var params = renderChartJson(obj);
	$.ajax({
        beforeSend:function(){
            $("#chart_container").text("Loading chart...");
        },
        data: {parameters: encodeURIComponent(params)},
        url: gooApp,
        type: 'GET',
        // context: this,
        success: function(data){
        	$("#historical_charts").empty();
        	$("#historical_charts").append("<div id=\"chart_resizer\"></div>");
        	$("#chart_resizer").append("<div id=\"chart_container\"></div>")
        	var interactiveJSON = $.parseJSON(data);
        	var metaData = serialize(interactiveJSON);
            drawChart(metaData, obj);
         	// alert(interactiveJSON.Labels);

        },
        error: function(response,txtStatus){
            console.log(response,txtStatus)
        }
    });
}

function renderChartJson(obj) {
	var text = '{"Normalized": false, "NumberOfDays": 1095, "DataPeriod": "Day", "Elements": [{"Symbol": "'+obj.Symbol+'", "Type": "price", "Params": ["ohlc"]}]}';	

	// var json_a = JSON.parse(text);
	return text;
}

function drawChart(data, obj) {
	$('#chart_container').highcharts('StockChart', {


        rangeSelector : {
        		buttons : [{
                type : 'day',
                count : 7,
                text : '1w'
            }, {
                type : 'month',
                count : 1,
                text : '1m'
            }, {
                type : 'month',
                count : 3,
                text : '3m'
            }, {
                type : 'month',
                count : 6,
                text : '6m'
            },  {
                type: 'ytd',
                text: 'YTD'
            }, {
                type : 'year',
                count : 1,
                text : '1y'
            },	{
                type : 'all',
                count : 1,
                text : 'All'
            }],
            selected : 0,
            inputEnabled : false
        },

        exporting: {
	        enabled: false
	    },

        title : {
            text : obj.Symbol+' Stock Price'
        },

        yAxis: {
            title: {
                text: 'Stock Value',
                align: 'middle',
                textAlign: 'left'
            }
        },

        series : [{
            name : obj.Symbol+' Stock Price',
            data : data,
            type : 'area',
            threshold : null,
            tooltip : {
                valueDecimals : 2,
                valuePrefix: "$"
            },
            fillColor : {
                linearGradient : {
                    x1: 0,
                    y1: 0,
                    x2: 0,
                    y2: 1
                },
                stops : [
                    [0, Highcharts.getOptions().colors[0]],
                    [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
                ]
            }
            
        }]
    });

	var chart = $('#chart_container').highcharts();
    $('#chart_resizer').resizable({
        // On resize, set the chart size to that of the
        // resizer minus padding. If your chart has a lot of data or other
        // content, the redrawing might be slow. In that case, we recommend
        // that you use the 'stop' event instead of 'resize'.
        resize: function () {
            chart.setSize(
                this.offsetWidth - 20,
                this.offsetHeight - 20,
                false
            );
        }
    });
}

function serialize(json) {
	var dates = json.Dates || [];
    var elements = json.Elements || [];
    var chartSeries = [];

    if (elements[0]){

        for (var i = 0, datLen = dates.length; i < datLen; i++) {
            var dat = fixDate( dates[i] );
            var pointData = [
                dat,
                elements[0].DataSeries['close'].values[i]
            ];
            chartSeries.push( pointData );
        };
    }
    return chartSeries;

}

function fixDate(dateIn) {
	var dat = new Date(dateIn);
    return Date.UTC(dat.getFullYear(), dat.getMonth(), dat.getDate());
}

function updateListCow(query) {
	$.ajax({
		url: gooApp,
		data: {symbol:query},
		type: 'GET',
		tryCount : 0,
    	retryLimit : 3,
		// dataType: 'jsonp',
		success: function(data) {	
			var obj = $.parseJSON(data);					
			if(obj && obj.Status && obj.Status == "SUCCESS") {
				var cows = $("#favorite_list").children().children();
				// console.log("find: "+obj.Symbol);
				for(var i = 1; i < cows.length; i++) {
					// console.log($(cows[i]).children(".symbol").text());
					if($(cows[i]).children(".symbol").text() == obj.Symbol) {
						// console.log("change from: "+$(cows[i]).children(".price").text()+" to: "+obj.LastPrice);
						$(cows[i]).children(".price").text("$"+Math.round(obj.LastPrice*100)/100);
						// $(cows[i]).children(".priceChange").text(Math.round(obj.Change*100)/100);
						$(cows[i]).children(".priceChange").html("<td class=\"changeRG priceChange\""+changeRedGreen(obj.ChangePercent)+">"+Math.round(obj.Change * 100) / 100+" ( "+Math.round(obj.ChangePercent * 100) / 100+" %) "+showArrow(obj.Change)+"</td>")
						break;
					}
				}
			}
		},
		error: function(xhr, textStatus, errorThrown ) {
	        if (textStatus == 'timeout') {
	            this.tryCount++;
	            if (this.tryCount <= this.retryLimit) {
	                //try again
	                $.ajax(this);
	                return;
	            }            
	            return;
	        }
	        if (xhr.status == 500) {
	            alert(textStatus);
	        } else {
	            //handle error
	        }
	    }
	});
}

function loadNews(obj) {
	$.ajax({
		url:gooApp,
		data: {q: obj.Symbol},
		type: 'GET',
		success: function(data) {
			var parsed = $.parseJSON(data);
			$("#news_feeds_container").empty();
			for(var i = 0; i < parsed.d.results.length; i++) {
				$("#news_feeds_container").append("<div class=\"well col-md-12\">"+"<p><a href=\""+parsed.d.results[i].Url+"\" target=\"_blank\">"+
					parsed.d.results[i].Title+"</a></p>"+
					"<p>"+parsed.d.results[i].Description+"</p>"+
					"<p><b>Publisher: "+parsed.d.results[i].Source+"</b></p>"+
					"<p><b>Date: "+modNewsTime(parsed.d.results[i].Date)+"</b></p>"+
					"</div>");
			}
				// alert(parsed.d.results[i].Title);
			
		},
		error: function(xhr, status, error) {
			alert(status);
		}
	});	
}

function modNewsTime(time) {
	var rtn = "";
	rtn += moment(time, moment.ISO_8601).format("DD MMM gggg, HH:mm:ss");
	return rtn;
}

function enableRightBtn() {
	$("#carousel_right_btn").click(function(){
		$("#myCarousel").carousel("next");
	});
	$("#carousel_right_btn").removeClass("disabled").addClass("active");
}


