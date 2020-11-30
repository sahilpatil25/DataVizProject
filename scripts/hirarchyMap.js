var circlePack;
var lineSvg;
var lineWidth;
var lineHeight;
var lineInnerHeight;
var lineInnerWidth;
var lineMargin = { top: 20, right: 60, bottom: 60, left: 100 };
var colorScale;
var focus;
var categoryData;
var completeData;
var categoryMatrix;
var categories;
var completeCategories;
var count=0;
var dict;
var reverseDict;
var matrix;
var dates;
var root;
var node;
var circle;
var text;
var curr_cat="";

// This runs when the page is loaded
document.addEventListener('DOMContentLoaded', function() {
  circlePack = d3.select('#circlePack');
  lineSvg = d3.select('#linechart');
  lineWidth = +lineSvg.style('width').replace('px','');
  lineHeight = +lineSvg.style('height').replace('px','');;
  lineInnerWidth = lineWidth - lineMargin.left - lineMargin.right;
  lineInnerHeight = lineHeight - lineMargin.top - lineMargin.bottom;

  // Load both files before doing anything else
  Promise.all([d3.csv('data/Plain.csv'), d3.json("data/data.json")])
          .then(function(values){

    completeData = values[0];
    completeData.forEach(function(d){
      d.time = d.time.split(' ')[0];
    });

    completeCategories = values[1];
    filterByRegion("All");
  })

});

function filterByRegion(region){
  if(!region){
    return;
  }

  if(region != 'All'){
    categoryData = completeData.filter(function(d){
    return d.location == region;
    })
  }
  else{
    categoryData = completeData;
  } 

  dates = ['4/6/2020','4/7/2020','4/8/2020','4/9/2020','4/10/2020'];
  var cat = ["Earthquake","Ground","Flood","Aftershock","Fire","Water","Energy","Medical","Shelter","Transportation","Food","Rumble","Miscellaneous","Events","Resource","Other","All"];
  matrix = [];
  var k;
  for(k=0;k<17;k++){
    var temp = [0,0,0,0,0];
    matrix.push(temp); 
  }

  categoryData.forEach(function(d){
    var j;
    for(j=0; j<17; j++){
      if(d.Category==cat[j]){
        var i;
        for(i=0; i<5; i++){
          if(d.time == dates[i]){
            matrix[j][i]++;
          }
        }
      }
      else if(d.All==cat[j]){
        var i;
        for(i=0; i<5; i++){
          if(d.time == dates[i]){
            matrix[j][i]++;
          }
        }
      }
    }
  });

  for(var i=13; i<16; i++)
  {
    for(var j=0; j<5; j++){
      matrix[16][j] += matrix[i][j];
    }
  }

  dict = {};
  
  for(var i = 0; i<17; i++){
    dict[cat[i]]=i;
  }

  reverseDict = {};
  for(var i = 0; i<5; i++){
    reverseDict[i]=dates[i];
  }

  categories = completeCategories;
  var countArray = [];
  categories.children.forEach( function(d) {
    d.children.forEach( function(a){
      if(a.name == 'Miscellaneous')
      {
        a.size = d3.max(countArray)+150;
      } else
      {
        var count=0;
        for(var i=0; i<5; i++){
          count += matrix[dict[a.name]][i];
        }
        countArray.push(count);
        a.size = count;
      }
    })
  })

  drawCirclePack();
  drawLineChart("All");
}

function setView(cat){
  if(cat!="All"){
    click_event = new CustomEvent('click');
    bt2 = document.querySelector('#leaf'+cat);
    bt2.dispatchEvent(click_event);
  }
  else{
    click_event = new CustomEvent('click');
    bt2 = document.querySelector('#rootAll');
    bt2.dispatchEvent(click_event);
  }
}

function drawCirclePack(){
  circlePack.html("");
  var margin = 20,
  diameter = 600,
  g = circlePack.append("g").attr("transform", "translate(" + diameter / 2 + "," + diameter / 2 + ")");

  var green = d3.scaleSequential(d3.interpolateGreens).domain([-1, 5]);
  var blues = d3.scaleSequential(d3.interpolateBlues).domain([-1, 5]);
  var red1 = d3.scaleSequential(d3.interpolateReds).domain([-1, 5]);
  var colors = {'red': red1, 'blue': blues, 'green': green}
  var color = colors[document.getElementById("color-scale-select").value];

  var pack = d3.pack()
      .size([diameter - margin, diameter - margin])
      .padding(2);

  root = d3.hierarchy(categories)
      .sum(function(d) { return d.size; })
      .sort(function(a, b) { return b.value - a.value; });

  var focus = root,
      nodes = pack(root).descendants(),
      view;

  var cat1 = ["Earthquake","Ground","Flood","Aftershock","Fire","Water","Energy","Medical","Shelter","Transportation","Food","Rumble"];

  circle = g.selectAll("circle")
    .data(nodes)
    .enter().append("circle")
      .attr("class", function(d) { return d.parent ? d.children ? "node" : "node node--leaf" : "node node--root"; })
      .attr("id", function(d) { return d.parent ? d.children ? "node"+d.data.name : "leaf"+d.data.name : "root"+d.data.name; })
      .style("fill", function(d) { console.log(d.depth); return color(d.depth); })
      .on("click", function(d) { if (focus !== d){
          drawLineChart(d.data.name);
          zoom(d);
          console.log(this.id);
          if(d3.set(cat1).has(d.data.name)){
            focusDonut(d.data.name);
          }
          else if(this.id.startsWith("node")){
            focusOutDonut();
          }
          d3.event.stopPropagation(); 
        } 
      });

  text = g.selectAll("text")
    .data(nodes)
    .enter().append("text")
      .attr("class", "label")
      .style("fill-opacity", function(d) { return d.parent === root ? 1 : 0; }) 
      .style("display", function(d) { return d.parent === root ? "inline" : "none"; })
      .text(function(d) { return d.data.name; });

  node = g.selectAll("circle,text");

  circlePack
      // .style("background", color(-1))
      .on("click", function() {focusOutDonut(); drawLineChart(root.data.name); zoom(root); });

  zoomTo([root.x, root.y, root.r * 2 + margin]);

  function zoom(d) {
    var focus0 = focus; focus = d;

    var transition = d3.transition()
        .duration(d3.event.altKey ? 7500 : 750)
        .tween("zoom", function(d) {
          var i = d3.interpolateZoom(view, [focus.x, focus.y, focus.r * 2 + margin]);
          return function(s) {zoomTo(i(s)); };
        });

    transition.selectAll('.label')
      .filter(function(d) { return d.parent === focus || this.style.display === "inline" || (focus.children === undefined && d === focus); })
      .style("fill-opacity", function(d) {
        if(d.parent === focus){
          return 1;
        }
        else if(focus.children === undefined && d === focus){
          return 1;
        }
        else{
         return 0; 
        }})
      .on("start", function(d) { if (d.parent === focus){
          this.style.display = "inline";
        }else if(focus.children === undefined && d === focus){
          this.style.display = "inline";
        }})
      .on("end", function(d) { if (d.parent !== focus) this.style.display = "none"; if(focus.children === undefined && d === focus) this.style.display = "inline";});    
  }

  function zoomTo(v) {
    var k = diameter / v[2]; view = v;
    node.attr("transform", function(d) { return "translate(" + (d.x - v[0]) * k + "," + (d.y - v[1]) * k + ")"; });
    circle.attr("r", function(d) { return d.r * k; });
  }
}

function drawLineChart(category) {
  if(!category)
    return;

  var Categorys = ["Earthquake", "Ground", "Flood", "Aftershock", "Fire", "Water","Energy","Medical","Shelter","Transportation","Food","Rumble"];
  if(Categorys.includes(category)){
    let elements = "id" + category;
    curr_cat = elements;
    document.getElementById(elements).dispatchEvent(new Event('click'));
  } else if(category=="All" && curr_cat !="") {
    document.getElementById(curr_cat).dispatchEvent(new Event('click'));
    curr_cat = "";
  } 
  //Clear canvas
  lineSvg.html("");
  
  //Ploting axes
  x = d3.scaleTime()
        .domain([new Date("4/5/2020"), new Date("4/11/2020")])
        .range([lineMargin.left, lineWidth - lineMargin.right]);

  y = d3.scaleLinear()
        .domain([0, d3.max(matrix[dict[category]])])
        .range([lineHeight - lineMargin.bottom, lineMargin.top]);
  
  var i = 0;
  xAxis = g => g
    .attr("transform", `translate(0,${lineHeight - lineMargin.bottom})`)
    .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")))
    .call(g => g.select(".domain")
      .remove())
    .call(g => g.selectAll(".tick"))
    .style("color", "gray")
    .call(g => g.selectAll(".tick text")
      .style("color", function(g) {
        if (i%2==0) {
          i++;
          return "gray";
        }
        else {
          i++;
          return "white";
        }
      })
      .style("font-size", "12px")
      .style("font-weight", 600));

  yAxis = g => g
        .attr("transform", `translate(${lineWidth - 60},0)`)
        .call(d3.axisLeft(y)
          .tickSize(lineInnerWidth))
        .call(g => g.select(".domain")
          .remove())
        .call(g => g.selectAll(".tick:not(:first-of-type) line")
          .attr("stroke-opacity", 0.5)
          .attr("stroke-dasharray", "5,10"))
        .call(g => g.selectAll(".tick")
          .style("color", "gray")
          .style("font-size", "12px")
          .style("font-weight", 600));
  
  lineSvg.append("g")
         .call(xAxis);
  
  lineSvg.append("g")
         .call(yAxis);

  //Adding focus circle
  focus = lineSvg
    .append('g')
    .append('circle')
    .style("fill", "none")
    .attr("stroke", "black")
    .attr('r', 10)
    .style("opacity", 0)


  var green = d3.scaleSequential(d3.interpolateGreens).domain([-1, 5]);
  var blues = d3.scaleSequential(d3.interpolateBlues).domain([-1, 5]);
  var red1 = d3.scaleSequential(d3.interpolateReds).domain([-1, 5]);
  var colors = {'red': red1, 'blue': blues, 'green': green}
  var color = colors[document.getElementById("color-scale-select").value];

  //Addind line plot
  lineSvg.append("path")
    .datum(matrix[dict[category]])
    .attr("fill", "none")
    .attr("stroke",color(4))
    .attr("stroke-width", 2)
    .attr("d", d3.line()
      .x(function(d,i) {return x(new Date(reverseDict[i]));})
      .y(function(d) {return y(+d)}));

  //Adding Label to axes
  lineSvg.append("text")             
         .attr("transform", "translate(" + (lineInnerWidth/2 + 100) + " ," +
                            (lineInnerHeight + lineMargin.top + 40) + ")")
         .attr("class", "axis")
        . text("Day");

  lineSvg.append("text")
         .attr("transform", "rotate(-90)")
         .attr("y", 150 - lineMargin.left)
         .attr("x", -20 - (lineInnerHeight / 2))
         .attr("class", "axis") 
         .text("Number of messages in '"+category+"' category");
}
