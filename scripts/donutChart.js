var  item;
var categoryData1;
var dict1;
var width = 600,
height = 600,
donut_width=300;
var matrix_donut;
var innerRadius = 70;
var ccount=0;

document.addEventListener('DOMContentLoaded', function() {
  Promise.all([d3.csv('data/Plain.csv')])
          .then(function(values){
      completeData12 = values[0];
      filterByRegion1("All");
  })
});

function filterByRegion1(region){
  if(!region){
    return;
  }
  if(region != 'All'){
    categoryData1 = completeData12.filter(function(d){
    return d.location == region;
    })
  }
  else{
    categoryData1 = completeData12;
  }
  var cat = ["Earthquake","Ground","Flood","Aftershock","Fire","Water","Energy","Medical","Shelter","Transportation","Food","Rumble"];
  matrix_donut = [];
  var k;
  for(k=0;k<12;k++){
    var temp = [0,0];
    matrix_donut.push(temp);
  }
  
  categoryData1.forEach(function(d){
    var j;
    for(j=0; j<12; j++){
       if(d.Category==cat[j]){
            matrix_donut[j][0]++;
       }
       matrix_donut[j][1] = 1;
    }
  });

  dict1 = {};
  
  for(var i = 0; i<12; i++){
    dict1[cat[i]]=i;
  }
  boot();
}

function getMaxValue(){
  var maxCount=0;
  for(var i=0; i<12; i++){
    if(matrix_donut[i][0]>maxCount){
      maxCount =matrix_donut[i][0];
    }
  }
  return +maxCount;
}

function boot() {
  var svg = d3.select("#donutChart");
  svg.html("");
  var colors =
  [
    "#9A2EFE",
    "#80FF00",
    "#610B0B",
    "#0489B1",
    "#D7DF01",
    "#0040FF",
    "#FF0000",
    "#6E6E6E",
    "#FF00FF",
    "#04B404",
    "#00FFFF",
    "#FF8000"
  ];
  
  var color = d3.scaleOrdinal()
  .domain(["a", "b", "c", "d", "e", "f", "g", "h","i","j","k","l"])
  .range(colors);

  var scale_message=d3.scaleLinear()
  .domain([0,getMaxValue()])
  .range([0,200]);

  // outer radius is defined by the number of messages in a particular category which have been scaled from 1 to 200 in the data file
  var arc = d3.arc()
    .innerRadius(innerRadius)
    .outerRadius(function (d) {
      var temp = matrix_donut[dict1[d.data.category]][0];
      var scaled = scale_message(temp);
      return innerRadius+scaled;
   });

  //arc length is defined by the priority level with the least priority getting the less arc size
  var pie = d3.pie()
    .sort(null)
    .value(function(d) {
      var temp = matrix_donut[dict1[d.category]][1];
      return temp;
      })
    var text = "Category Selected: None" ;

  svg = d3.select("#donutChart")
    .attr("width", width)
    .attr("height", height)
    .append("g")
    .attr('transform', 'translate(' + (width / 2) +',' + (height / 2) + ')');
    svg.html("");
    svg.append("text").attr("id", "chartTitle").attr("class","upperregion").attr("x", width-800).attr("y", -260).text(text);

  // format the data such that strings are converted to their appropriate types
  d3.csv("data/donut1.csv").then(data => {
    var path = svg.selectAll('path')
    .data(pie(data))
    .enter()
    .append('path')
    .attr('d', arc)
    .attr("opacity","1.0")
    .attr("stroke","none")
    .attr("id", function(d){return "path"+d.data.category;})
    .attr('fill', function(d) {
      return color(d.data.category);})
    .on('click', function(d,i){
      cc=this;
      var a= cc.attributes.opacity.value;
      var b =cc.attributes.stroke.value;
      if(a==1.0 && b=="black")
      {
       svg.selectAll('path').attr('opacity','1.0').attr("stroke","none");
       d3.select(".upperregion").text("Category Selected: " + "None").attr("alignment-baseline","middle"); 
       setView("All");
      }
      else{
        setView(d.data.category);
        text= "Region selected: " + d.data.category;
        d3.select(".upperregion").text("Category Selected: " + d.data.category).attr("alignment-baseline","middle"); 
        svg.selectAll('path').attr('opacity','0.5').attr("stroke","none");
        d3.select(this).attr('opacity','1.0')
          .attr("stroke","black")
          .attr("stroke-width","3px");
      }
    })
    .append("title")
    .text(function(d) { return "Category : "+ d.data.category + "\n"+"Message Count : "+ matrix_donut[dict1[d.data.category]][0];});

    var legend = svg.selectAll(".legend")
    .data(["Earthquake","Ground","Flood","Aftershock","Fire","Water","Energy","Medical","Shelter","Transportation","Food","Rumble"])//hard coding the labels as the datset may have or may not have but legend should be complete.
   .enter().append("g")
    .attr("class", "legend")
    .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

// draw legend colored rectangles
   legend.append("rect")
       .attr("x", width-450)
       .attr("y",-280)
       .attr("width", 18)
       .attr("height", 18)
       .style("fill", function(d){return color(d)});

// draw legend text
   legend.append("text")
    .attr("x", width-420)
    .attr("y", -265)
    .attr("dy", ".35em")
    .style("text-anchor", "start")
    .text(function(d) { return d;});
  });
}

function focusDonut(category1){
  var text= "Region selected: " + category1;
  d3.select(".upperregion").text("Category Selected: " + category1).attr("alignment-baseline","middle"); 
  d3.select("#donutChart").selectAll('path').attr('opacity','0.5').attr("stroke","none");
  d3.select("#path"+category1).attr('opacity','1.0')
    .attr("stroke","black")
    .attr("stroke-width","3px");
}

function focusOutDonut(){
  d3.select("#donutChart").selectAll('path').attr('opacity','1.0').attr("stroke","none");
  d3.select(".upperregion").text("Category Selected: " + "None").attr("alignment-baseline","middle"); 
}