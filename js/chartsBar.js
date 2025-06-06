function createChart(canvasId){
  const ctx = document.getElementById(canvasId).getContext('2d');
  new Chart(ctx,{
    type:'bar',
    data:{
      labels:['A','B','C','D','E'],
      datasets:[{
        label:'Random Data',
        data:Array.from({length:5},()=>Math.floor(Math.random()*100)),
        backgroundColor:'rgba(0,172,193,0.2)',
        borderColor:'rgba(0,172,193,1)',
        borderWidth:2
      }]
    },
    options:{
      responsive:true,
      maintainAspectRatio:false,
      scales:{
        y:{beginAtZero:true,grid:{color:'#333'}},
        x:{grid:{color:'#333'}}
      },
      plugins:{legend:{labels:{color:'#ccc'}}}
    }
  });
}
