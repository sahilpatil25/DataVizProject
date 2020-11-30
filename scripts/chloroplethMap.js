var data5;
var msg_count = {};
var minval=Number.MAX_VALUE, maxval=0;
var text1 = "";
document.addEventListener('DOMContentLoaded', function() {
    
    Promise.all([d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson"),
        d3.json("https://raw.githubusercontent.com/iDataVisualizationLab/VAST19_mc1/master/Dataset/StHimark.geojson"),
            d3.csv('data/YInt.csv')])
          .then(function(values){
            data5 = values[1];

            function renameKey ( obj, oldKey, newKey ) {
                obj[newKey] = obj[oldKey];
            }
            function addKey(obj, val, key){
                obj[key] = val;
            }
            
            data5.features.forEach( obj => 
                renameKey( obj.properties, 'Nbrhood', 'name' ) 
            );

            data5.features.forEach( obj => 
                addKey( obj.geometry, obj.properties.Id, 'id' ) 
            );

            values[2].forEach(msg => {
                var loc = msg["location"].toString();
                if(msg_count[loc]){
                    msg_count[loc] += 1;
                    if(msg_count[loc] > maxval) maxval = msg_count[loc];
                    if(msg_count[loc] < minval) minval = msg_count[loc];
                }
                else{
                    msg_count[loc] = 1;
                }
            });

            drawMap();
          });
});

function drawMap(){
    var tooltip = d3.select("body").append("div")
                      .style('opacity', 0)
                      .style('position', 'absolute')
                      .style('padding', '0 10px');
    var svg = d3.select('#my_dataviz'),
    width = +svg.attr("width"),
    height = +svg.attr("height");
    	svg.html("");
svg.append("text").attr("class","region").attr("x", 20).attr("y", 40).text(text1);

    var green = d3.scaleSequential(d3.interpolateGreens).domain([minval,maxval]);
    var blues = d3.scaleSequential(d3.interpolateBlues).domain([minval,maxval]);
    var red1 = d3.scaleSequential(d3.interpolateReds).domain([minval,maxval]);
    var colors = {'red': red1, 'blue': blues, 'green': green}
    var red = colors[document.getElementById("color-scale-select").value];


    var projection = d3.geoMercator()
        .center(d3.geoCentroid(data5))
        .scale(95000)
        .translate([ width/2 + 10, height/2 - 50]);

    svg.append("g")
        .selectAll("path")
        .data(data5.features)
        .enter()
        .append("path")
        .attr("fill", function(d, i){
            return red(msg_count[d.properties.name]);
        })
        .attr("d", d3.geoPath().projection(projection))
        .style("stroke", "black")
        .on('mouseover', function(d,i) {
            // console.log(d);
            tooltip.html("<p><span style='display:block'>Neighbourhood: " + d.properties.name + 
                "</span><span style='display:block'> Number of Messages: " + msg_count[d.properties.name] + "</span></p>")
            .transition()
            .style("border-radius","5px")
            .style("border-color", "black")
            .style("border-style","solid")
            .style("border-width","1px")
            .style("text-align", "center")
            .style('opacity', 1)
            .style('background', 'white')
            .style('left', (d3.event.pageX + 10) + 'px')
            .style('top', (d3.event.pageY - 15) + 'px')
            .duration(100);
        })
        .on('mouseout', function(d,i) {
            tooltip.transition()
                .duration('50')
                .style("opacity", 0);
        })
        .on('click', function(d,i){
            if(text1 == ""){
            text1= d.properties.name;
            d3.select(".region").text("Region: " + text1).style("font-size", "18px").attr("alignment-baseline","middle");
            fun1(d.properties.name);
            d3.select(this).transition()
             .duration('50')
             .style('stroke', 'cyan')
             .style('stroke-width', '4');
         }
            else if(text1 == d.properties.name){
                d3.select(this).transition()
                 .duration('50')
                 .style('stroke', 'Black')
                 .style('stroke-width', '1');
             text1="";
             d3.select(".region").text(text1).style("font-size", "18px").attr("alignment-baseline","middle");
             removefilter();
            }
            else{
                svg.selectAll("path")
                    .style('stroke', 'Black')
                 .style('stroke-width', '1');
                 d3.select(this).transition()
             .duration('50')
             .style('stroke', 'cyan')
             .style('stroke-width', '4');
             text1= d.properties.name;
            d3.select(".region").text("Region: " + text1).style("font-size", "18px").attr("alignment-baseline","middle");
            fun1(d.properties.name);
            }
        })
        .append("text")
        .attr("class", "label")
        .style("fill","black")
        .text(function(d){
               return d.properties.name;
        });

        function removefilter(){
            filterByRegion("All");
            filterByRegion1("All");
            d3.select("#timeline").html("");
            drawTimeLine("Final1");
        }

        function fun1(n){
            filterByRegion(n);
            filterByRegion1(n);
            regionChange(n);
            d3.select("#timeline").html("");
            drawTimeLine(n);
        }

  var margin = ({top: 20, right: 40, bottom: 30, left: 40})
  var barHeight = 20
  var height = 100
  var width = 280 // this includes margin effective width is 200

axisScale = d3.scaleLinear()
    .domain(red.domain())
    .range([margin.left, width - margin.right])

axisBottom = g => g
              .attr("class", `x-axis`)
              .attr("transform", `translate(0,${height - margin.bottom})`)
              .call(d3.axisBottom(axisScale)
                .ticks(width/80)
                .tickSize(-barHeight)
                .tickFormat(d => d % 1000 ==0 ? d : null))

    svg.append("text")             
    .attr("transform", "translate(" + 300 + " ," +
                        40 + ")")
    .attr("class", "ChartTitle")
    .text("The city of St. Himark");

  svg1 = svg.append("svg")
                    .attr("height",height)
                    .attr("width",width)
                    .attr('transform',`translate(0,${450-margin.top})`);
  const defs = svg1.append("defs");
  
  const linearGradient = defs.append("linearGradient")
      .attr("id", "linear-gradient");
  
  linearGradient.selectAll("stop")
    .data(axisScale.ticks().map((t, i, n) => ({ offset: `${100*i/n.length}%`, color: red(t) })))
    .enter().append("stop")
    .attr("offset", d => d.offset)
    .attr("stop-color", d => d.color);
  
  svg1.append('g')
    .attr("transform", `translate(0,${height - margin.bottom - barHeight})`)
    .append("rect")
    .attr('transform', `translate(${margin.left}, 0)`)
    .attr("width", width - margin.right - margin.left)
    .attr("height", barHeight)
    .style("fill", "url(#linear-gradient)")
    .attr("font-color","black");
  
  svg1.append('g')
    .call(axisBottom);

}
