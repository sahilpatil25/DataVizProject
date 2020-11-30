var svg;
let region = "All";
console.log(region);
regionData=[]
let sentiments ='All';

// only take the rows from the data belonging to the region selected 

document.addEventListener('DOMContentLoaded', function() {
    
     
  
Promise.all([d3.csv('data/data_final_loc.csv')])
          .then(function(values){
    
   data= values[0];
    
   // console.log(data);

     
        
    drawData();
   })
    
  
});

function regionChange(region_name){
      region = region_name;
    //  console.log(region);
      d3.select("#matrixsvg").html("");//.remove();
      regionData=[];
     drawData();
    }


function drawData()
{
 
 // region = document.getElementById('region').value;
 // console.log(region);
    
 sentiments = document.getElementById('sentiment').value;
    
// console.log(sentiments);
   // ------------------ NEW CODE ALPHA FILTER-------
    
 alpha_range = document.getElementById('username_range').value;
    
 //console.log(alpha_range);
    
d3.select("#username_range").on("change", function(d)
        
                {
   //  console.log(alpha_range);
     d3.select("#matrixsvg").html("");
    //.remove();
     regionData=[];
     drawData();
                         });
    
     // ------------------ NEW CODE ALPHA FILTER-------
 
 d3.select("#region").on("change", function(d)
        
                         {
     d3.select("#matrixsvg").html("");//.remove();
      regionData=[];
     drawData();
                         });
    
    

d3.select("#sentiment").on("change", function(d)
        
                         {
   //  sentiments = document.getElementById('sentiment').value;
   // console.log(sentiments);
  
     d3.select("#matrixsvg").html("");//.remove();
     regionData=[];
     drawData();
                         });

 regionData.length =0;

  
  // ----------NEW CODE---------------- 
    //get range 
    min_range= alpha_range.charAt(0);
    max_range = alpha_range.charAt(1);
  //  console.log(min_range, max_range);
    min = min_range.charCodeAt();
    max = max_range.charCodeAt();
  //  -----------NEW CODE --------------
       
       
 data.forEach(function(d){
   //  console.log(d['location'])
     message_loc = d['location'];
     username_of_account = d['account'].toLocaleUpperCase();
     let u = username_of_account.charAt(0).charCodeAt();
    // console.log(username_of_account, u, min, max);
    
     
     if (message_loc === region.toString() ||( region == "All" &&  message_loc !== "<Location with-held due to contract>")){
         if( alpha_range == "All" )
             {
                regionData.push(d);  
             }
         else if ( u>= min &&  u <= max)
             {
                 regionData.push(d);  
             }
         else
             {
                // console.log("this was skipped: ",username_of_account );
             }
        
        // console.log(message_loc);
     }
     
     
 });
    

    
  // console.log(regionData[0]['account']); 



//consolidating the data
    dataFinal =[];
  
    
    
prev_username = regionData[0]['account'];
//console.log(prev_username);
let k = 0;
let k2=0;
let j=0;
let pos =100;
let z=0;
usernameData =[];
prev ="nothing";

    
    for (i = 0; i < regionData.length ; i++) {
        current_username = regionData[i]['account'];
        if(prev == current_username)
            {
                //console.log("skip", current_username);
            }
        else{
           // console.log("add", current_username);
            usernames_of_account={};
            usernames_of_account['username'] = current_username;
            usernames_of_account['y'] =k2;
            k2= k2+35;
           
            usernameData.push(usernames_of_account);
        }
         prev = current_username;
    }
        
    console.log("Username data's length is :",usernameData.length );
        
        
        
        /*
            usernames_of_account={};
            usernames_of_account['username'] = regionData[i]['account'];
         if (prev_username == regionData[i]['account'])
        {
         usernames_of_account['y'] =k2;  
         //console.log ("I came here");
        }*/
            
    
    
 let count =0;           
for (i = 0; i < regionData.length ; i++) {
       var sentiment_data = {};
      sentiment_data['username']= regionData[i]['account'];
      sentiment_data['date'] = regionData[i]['date'];
      sentiment_data['d_or_n'] =   regionData[i]['day_night_label'];
      sentiment_data['sen_num'] = regionData[i]['sentiment_num'];
     
    //console.log("Current Username:");
   // console.log(regionData[i]['account']);
   // console.log("Previous Username:");
   // console.log(prev_username);
    if (prev_username == regionData[i]['account'])
        {
           sentiment_data['y'] = k; 
         //console.log ("I came here");
        }
    else
        {
            k = k + 35;
            sentiment_data['y'] =k ; 
           // console.log (" but then I also came here");
           // console.log(regionData[i]['account']);
            count = count +1;
            
        }
    
    prev_username= sentiment_data['username'];
    
    date = regionData[i]['date'];
    var date_split = date.split("-");
    //console.log(date_split);
    var dd = parseInt(date_split[2]);
   // console.log(dd);
    
    d_n = regionData[i]['day_night_label'];
    
    let offset =0;
    if (d_n === "day")
        {
            offset = -25;
        }
    else 
        {
            offset = 25;
        }
    z = pos * (dd -1) + offset ;
    sentiment_data['x'] =z;
    
    
        
    /*if () {
      data.push(dogs_data);*/
  // ----- new code 
    //username_account = regionData[i]['account'];
    
     dataFinal.push(sentiment_data);
  }
    let l= dataFinal.length -1;
    let last_y = dataFinal[l].y;
   // console.log(dataFinal[0])
    
    
//check the data     
 dataFinal.forEach(function(d){
    // console.log(d['username'], d['y'], d['sen_num'], d['x'], d['date'], d['d_or_n']);
     
 });
    



console.log("The number of rows is :",count + 1 );

let h = regionData.length;
svg = d3.select("#matrixsvg").append("svg").attr("width", 1200 ).attr("height", last_y + 150);


///<_------old code------->
var images = svg.selectAll(".images")
    .data(dataFinal)
    .enter()
    .append("image");

images.attr("xlink:href",function (d) {
       
       if(d.sen_num == 0 && (sentiments =="All" || sentiments =="Neutral" ))
       
      {  return "yellow.png";}
       
       else  if (d.sen_num > 0 && (sentiments =="All" || sentiments =="Positive" )){
            return "green.png";
       }
    else if(d.sen_num < 0 && (sentiments =="All" || sentiments =="Negative"))
        {
            return "red.png";
        }
    else{
        
    }
     }  )
   .attr("x", function (d,i) { return d.x ;})
   .attr("y", function (d, i) { 
                           return 60 + d.y ; })
   .attr("width", 25)
   .attr("height", 25); 
    
    
    
    
 
    
    console.log(usernameData);
    
    var text = svg.selectAll("text")
                        .data(usernameData)
                       .enter().append("text");
    
    
  
    var textLabels = text
                 .attr("x", 100)
                .attr("y", function(d) { return (72.5 +(d.y )); })
                 .text( function (d) { //console.log(d.username); 
                     return d.username; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "12px")
                .attr("fill", "black"); 
    
    
    dates =['2020-04-06', '2020-04-07', '2020-04-08', '2020-04-09', '2020-04-10'];  
    x_coords_rows =[ 485, 585, 685, 785, 885];
    
   
    dates_final =[];
    let pos_date = 75;
    let pos_inc = 2;
    
    for(i=0; i<dates.length; i++)
        {
            dates_data ={};
            dates_data['date'] = dates[i];
            dates_data['x']= x_coords_rows[i];
            dates_final.push(dates_data);
            
        }

    var colLabels = svg.selectAll("text2")
                        .data(dates_final)
                       .enter().append("text");
     var cols = colLabels
                 .attr("x",  function (d,i) { return d.x - 3 ;})
                .attr("y", function(d) { return 20; })
                 .text( function (d) { return d.date; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "15px")
                .attr("fill", "black");
    
    
    days=['Day','Night','Day','Night','Day','Night','Day','Night','Day','Night'];
    x_coords_rows2 =[ 475, 525, 575, 625, 675, 725, 775, 825, 875, 925];
    days_final=[];
    for(i=0; i<days.length; i++)
        {
            day_night ={};
            day_night['time'] = days[i];
            day_night['x']= x_coords_rows2[i];
            days_final.push(day_night);
            
        }
    var colLabels2 = svg.selectAll("text3")
                        .data(days_final)
                       .enter().append("text");
     var cols2 = colLabels2
                 .attr("x",  function (d,i) { return d.x + 5 ;})
                .attr("y", function(d) { return 40; })
                 .text( function (d) { return d.time; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "12px")
                .attr("fill", "black");
    
    
       //------- new code insertion for legend starts here -----------
    labels =[{'sentiment': 'Positive','x': 1050, 'y': 60 }, {'sentiment' : 'Negative', 'x': 1050, 'y': 90}, {'sentiment' : 'Neutral', 'x': 1050, 'y': 120}];
  /*  x_ilabels = [1000, 1000, 1000];
    y_ilabels = [ 60, 80, 100];*/
    
    var images2 = svg.selectAll(".images2")
    .data(labels)
    .enter()
    .append("image");
    
    images2.attr("xlink:href",function (d) {
       
       if(d.sentiment == "Positive")
       
      {  return "green.png";}
       
       else if (d.sentiment == "Negative") {
            return "red.png";
       }
        else {
            return "yellow.png";
        }
       
       }  )
   .attr("x", function (d,i) { return d.x;})
    .attr("y", function (d, i) { 
                           return d.y ; })
    .attr("width", 25)
    .attr("height", 25);
    
    
     var text4 = svg.selectAll("textnew")
                        .data(labels)
                       .enter().append("text");
    
    
  
    var textLabels4 = text4
                 .attr("x", function(d) { return d.x + 30; } )
                .attr("y", function(d) { return d.y + 19 ; })
                 .text( function (d) { return d.sentiment; })
                 .attr("font-family", "sans-serif")
                 .attr("font-size", "20px")
                .attr("fill", "black"); 
    
    

  
    
    
    
    
    //------- new code insertion for legend ends here -----------
    
    
    
}