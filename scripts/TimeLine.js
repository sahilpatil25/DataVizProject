document.addEventListener('DOMContentLoaded', function() {
  drawTimeLine("Final1");

});

function drawTimeLine(category_file){


var margin = {top: 60, right: 20, bottom: 90, left: 60},
  width = 1832 - margin.left - margin.right,  //1250
  height = 620 - margin.top - margin.bottom;

var x = d3.scaleBand()
  .rangeRound([0, width-150])
  .padding(0.1);

var y = d3.scaleLinear()
  .rangeRound([height, 0]);

var color = d3.scaleOrdinal()
  .range(["#1f77b4 ", "#ff7f0e", "#aec7e8", "#ffbb78", "#2ca02c", "#d62728", "#98df8a","#98abc5", "#9467bd", "#1f77b4", "#17becf", "#bcbd22", "#7f7f7f", "#e377c2","#8c564b", "#d9d9d9", "#6b486b", "#31a354", "#d0743c", "#ff8c00","ff9896"]);

// var xAxis = d3.svg.axis()
//     .scale(x)
//     .orient("bottom");
var xAxis = d3.axisBottom(x);

var yAxis = d3.axisLeft(y)
  //.tickFormat(d3.format(".1s"));
var svg = d3.select("#timeline")
    .attr("class", "timeline")
    .attr("width", width + margin.left + margin.right )
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var active_link = "0"; //to control legend selections and hover
var legendClicked; //to control legend selections
var legendClassArray = []; //store legend classes to select bars in plotSingle()
var y_orig; //to store original y-posn
var active_d;

var file_name = "data/timeline/" + category_file + ".csv";
console.log(file_name);
d3.csv(file_name, function(d) {
  // console.log(d);
  return {
    date: d.date,
    Earthquake: +d.Earthquake,
    Ground: +d.Ground,
    Flood: +d.Flood,
    Aftershock: +d.Aftershock,
    Fire: +d.Fire,
    Water: +d.Water,
    Energy: +d.Energy,
    Medical: +d.Medical,
    Shelter: +d.Shelter,
    Transportation: +d.Transportation,
    Food: +d.Food,
    Rumble: +d.Rumble,    
    // Miscellaneous: +d.Miscellaneous,
  };
}).then(function(data){
  // console.log(data);
  // if (error) throw error;
  color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date"; }));
  data.forEach(function(d) {
    var mystate = d.date; //add to stock code
    var y0 = 0;
    //d.ages = color.domain().map(function(name) { return {name: name, y0: y0, y1: y0 += +d[name]}; });
    d.ages = color.domain().map(function(name) { return {mystate:mystate, name: name, y0: y0, y1: y0 += +d[name]}; });
    d.total = d.ages[d.ages.length - 1].y1;
    //console.log(d);
  });
  //data.sort(function(a, b) { return b.total - a.total; });

  x.domain(data.map(function(d) { return d.date; }));
  y.domain([0, d3.max(data, function(d) { return d.total; })]);
  // console.log(data);
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis)
      .selectAll("text")
      .attr("transform", "translate(-10," + 30 + ")rotate(-90)");

  svg.append("text")             
      .attr("transform",
            "translate(" + (width/2) + " ," + 
                           (height + margin.top +15) + ")")
      .style("text-anchor", "middle")
      .text("Date(month/day hour)");

  svg.append("g")
      .attr("class", "y axis")
      .call(yAxis)
    .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 6)
      .attr("dy", ".71em")
      .style("text-anchor", "end");

  svg.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", 0 - margin.left )
      .attr("x",0 - (height / 2))
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .text("Messages");

  svg.append("text")
        .attr("class", "ChartTitle")
        .attr("x", (width / 2))             
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .text("TimeLine Chart");
    

  var state = svg.selectAll(".state")
      .data(data)
    .enter().append("g")
      .attr("class", "g")
      .attr("transform", function(d) { return "translate(" + "0" + ",0)"; });
      //.attr("transform", function(d) { return "translate(" + x(d.State) + ",0)"; })

  state.selectAll("rect")
      .data(function(d) {
        return d.ages; 
      })
    .enter().append("rect")
      .attr("width", x.bandwidth())
      .attr("y", function(d) { return y(d.y1); })
      .attr("x",function(d) { //add to stock code
          return x(d.mystate)
        })
      .attr("height", function(d) { return y(d.y0) - y(d.y1); })
      .attr("class", function(d) {
        classLabel = d.name.replace(/\s/g, ''); //remove spaces
        return "class" + classLabel;
      })
      .style("fill", function(d) { return color(d.name); });

  state.selectAll("rect")
       .on("mouseover", function(d){

          var delta = d.y1 - d.y0;
          var xPos = parseFloat(d3.select(this).attr("x"));
          var yPos = parseFloat(d3.select(this).attr("y"));
          var height = parseFloat(d3.select(this).attr("height"))

          d3.select(this).attr("stroke","blue").attr("stroke-width",0.8);

          svg.append("text")
          .attr("x",xPos)
          .attr("y",yPos +height/2)
          .attr("class","tooltip")
          .text(d.name +": "+ delta);

       })
       .on("mouseout",function(){
          svg.select(".tooltip").remove();
          d3.select(this).attr("stroke","pink").attr("stroke-width",0.2);
                                
        })


var legend = svg.selectAll(".legend")
    .data(color.domain().slice().reverse())
  .enter().append("g")
    //.attr("class", "legend")
    .attr("class", function (d) {
      legendClassArray.push(d.replace(/\s/g, '')); //remove spaces
      return d;
    })
    .attr("transform", function(d, i) { return "translate(0," + i * 15 + ")"; });

//reverse order to match order in which bars are stacked    
legendClassArray = legendClassArray.reverse();

legend.append("rect")
    .attr("x", width - 8)
    .attr("width", 10)
    .attr("height", 10)
    .style("fill", color)
    .attr("id", function (d, i) {
      return "id" + d.replace(/\s/g, '');
    })
    .on("mouseover",function(){        

      d3.select(this).style("cursor", "pointer");
      // if (active_link === "0") 
      // else {
      //   if (active_link.split("class").pop() === this.id.split("id").pop()) {
      //     d3.select(this).style("cursor", "pointer");
      //   } else d3.select(this).style("cursor", "auto");
      // }
    })
    .on("click",function(d){        

      if (active_link === "0") { //nothing selected, turn on this selection
        d3.select(this)           
          .style("stroke", "black")
          .style("stroke-width", 2);

          active_link = this.id.split("id").pop();
          plotSingle(this);
          active_d = d;
          //gray out the others
          for (i = 0; i < legendClassArray.length; i++) {
            if (legendClassArray[i] != active_link) {
              d3.select("#id" + legendClassArray[i])
                .style("opacity", 0.5);
            }
          }
         
      } else { //deactivate
        if (active_link === this.id.split("id").pop()) {//active square selected; turn it OFF
          d3.select(this)           
            .style("stroke", "none");

          active_link = "0"; //reset

          //restore remaining boxes to normal opacity
          for (i = 0; i < legendClassArray.length; i++) {              
              d3.select("#id" + legendClassArray[i])
                .style("opacity", 1);
          }
          //restore plot to original
          restorePlot(d);

        } else {
          var click_event = new CustomEvent('click');
          bt2 = document.querySelector('#id'+active_link);
          bt2.dispatchEvent(click_event);

          sleep(500);
          
          d3.select(this)           
          .style("stroke", "black")
          .style("stroke-width", 2);

          active_link = this.id.split("id").pop();
          plotSingle(this);
          active_d = d;
          //gray out the others
          for (i = 0; i < legendClassArray.length; i++) {
            if (legendClassArray[i] != active_link) {
              d3.select("#id" + legendClassArray[i])
                .style("opacity", 0.5);
            }
          }

        }

      } //end active_link check
                        
                              
    });

legend.append("text")
    .attr("x", width - 20)
    .attr("y", 5)
    .attr("dy", ".35em")
    .style("text-anchor", "end")
    .text(function(d) { return d; });

function restorePlot(d) {
  // console.log(d);
  state.nodes().forEach(function (d, i) {      
    //restore shifted bars to original posn
    var nodes = d.childNodes;
    d3.select(nodes[idx])
      .transition()
      // .duration(1000)        
      .attr("y", y_orig[i]);
  })

  //restore opacity of erased bars
  for (i = 0; i < legendClassArray.length; i++) {
    if (legendClassArray[i] != class_keep) {
      d3.selectAll(".class" + legendClassArray[i])
        .transition()
        // .duration(1000)
        // .delay(750)
        .style("opacity", 1);
    }
  }

}

function plotSingle(d) {
  if(d.id=="idlandslide"){
    class_keep = "landslide";
  } else if (d.id=="idbridge"){
    class_keep = "bridge";
  }
  else{
    class_keep = d.id.split("id").pop();
  }
  //class_keep = d.id.split("id").pop();
  // console.log(class_keep);
  idx = legendClassArray.indexOf(class_keep);    
 
  //erase all but selected bars by setting opacity to 0
  for (i = 0; i < legendClassArray.length; i++) {
    if (legendClassArray[i] != class_keep) {
      d3.selectAll(".class" + legendClassArray[i])
        .transition()
        .duration(1000)          
        .style("opacity", 0);
    }
  }

  //lower the bars to start on x-axis
  y_orig = [];
  state.nodes().forEach(function (d, i) {        
    var nodes = d.childNodes;
    
    //get height and y posn of base bar and selected bar
    h_keep = d3.select(nodes[idx]).attr("height");
    y_keep = d3.select(nodes[idx]).attr("y");
    //store y_base in array to restore plot
    y_orig.push(y_keep);

    h_base = d3.select(nodes[0]).attr("height");
    y_base = d3.select(nodes[0]).attr("y");    

    h_shift = h_keep - h_base;
    y_new = y_base - h_shift;

    //reposition selected bars
    d3.select(nodes[idx])
      .transition()
      // .ease("bounce")
      .duration(1000)
      .delay(750)
      .attr("y", y_new);
  })    
}
});
}

function sleep(ms) {
  var now = new Date().getTime();
  while(new Date().getTime() < now + ms){ /* do nothing */ } 
}