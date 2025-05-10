document.addEventListener('DOMContentLoaded',function(){
  for(let i=1;i<=6;i++){
    const chart=document.getElementById(`chart${i}`);
    if(chart&&chart.tagName==='CANVAS')createChart(`chart${i}`);
  }
  if(document.getElementById("chart3"))renderGroupedSHAPBeeswarm();
  if(document.getElementById("correlationMatrixChart"))renderCorrelationMatrix();
});

