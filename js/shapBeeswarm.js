function renderGroupedSHAPBeeswarm(){
  fetch('./processed_data/shap_beeswarm_data.json').then(res=>res.json()).then(data=>{
    const {shap_values,features,feature_names}=data;
    const traces=feature_names.map((name,i)=>{
      const x=shap_values.map(row=>row[i]);
      const y=Array(x.length).fill(name);
      const color=features.map(row=>row[i]);
      return {
        x:x,y:y,mode:'markers',type:'scatter',name:name,
        text:color.map(v=>`Feature value: ${v.toFixed(2)}`),
        hoverinfo:'x+text',
        marker:{
          size:6,color:color,colorscale:'RdBu',
          showscale:i===feature_names.length-1,
          colorbar:i===feature_names.length-1?{title:'Feature value',thickness:15}:undefined
        },
        showlegend:false
      };
    });
    Plotly.newPlot('chart3',traces,{
      title:'Grouped SHAP Beeswarm (Page 3)',
      xaxis:{title:'SHAP value (impact on model output)',zeroline:true,gridcolor:'#444'},
      yaxis:{type:'category',gridcolor:'#444'},
      margin:{l:120,r:30,t:50,b:40},
      plot_bgcolor:'#111',
      paper_bgcolor:'#111',
      font:{color:'#eee'},
      showlegend:false
    },{responsive:true});
  }).catch(err=>console.error("SHAP beeswarm data load error:",err));
}
