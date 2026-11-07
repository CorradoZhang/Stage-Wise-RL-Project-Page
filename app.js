'use strict';
const stages=[
 ['Approach the object.','Learn to bring the end effector into the approach region. The gripper is held open for this stage.'],
 ['Establish a grasp.','Learn to close the gripper and establish contact with both fingerpad groups.'],
 ['Lift while holding.','Raise the object while maintaining the grasp. Stage completion requires stable confirmation.'],
 ['Move above the destination.','Transport the held object toward the target bin, respecting position and velocity conditions.'],
 ['Release and complete.','Place the object, release the gripper, and confirm stable task completion.']
];
document.querySelectorAll('[data-stage]').forEach(button=>button.addEventListener('click',()=>{
 const i=Number(button.dataset.stage);
 document.querySelectorAll('[data-stage]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});
 document.getElementById('stage-index').textContent=`STAGE 0${i+1} / 05`;
 document.getElementById('stage-title').textContent=stages[i][0];
 document.getElementById('stage-copy').textContent=stages[i][1];
 const object=document.getElementById('object');object.setAttribute('x',i>2?'225':'157');object.setAttribute('y',i===2||i===3?'72':'107');
}));
const finalRows=[
 {name:'Flat SAC',values:[0,0,0,0,0],color:'#8993a2'},
 {name:'Flat TD3',values:[0,0,0,0,0],color:'#a7afba'},
 {name:'Single SAC + stage rewards',values:[0,0,0,0,0],color:'#8993a2'},
 {name:'Single TD3 + stage rewards',values:[0,0,0,0,0],color:'#a7afba'},
 {name:'FSM-SAC',values:[34,16,26,25,38],color:'#3159d6'},
 {name:'FSM-TD3',values:[33,0,15,32,0],color:'#cf7e42'}
];
function finalChart(){
 const width=900,left=245,right=55,scale=(width-left-right)/100;
 let content='<title>Final held-out task success for six training configurations</title><desc>All four single-policy controls have zero success. FSM-SAC has mean27.8 percent, and FSM-TD3 has mean16 percent. Dots show five individual seeds.</desc>';
 for(let t=0;t<=100;t+=20){const x=left+t*scale;content+=`<line x1="${x}" x2="${x}" y1="15" y2="285" stroke="#e5e8ef"/><text x="${x}" y="308" text-anchor="middle" font-size="11" fill="#647080">${t}%</text>`;}
 finalRows.forEach((r,i)=>{
  const mean=r.values.reduce((a,b)=>a+b,0)/5;const sd=Math.sqrt(r.values.reduce((a,b)=>a+(b-mean)**2,0)/4);const y=35+i*45;
  content+=`<text x="${left-16}" y="${y+4}" text-anchor="end" font-size="12" fill="#26394e">${r.name}</text><rect x="${left}" y="${y-11}" width="${Math.max(mean*scale,.7)}" height="22" fill="${r.color}" opacity=".72" rx="2"/>`;
  if(sd){const low=left+Math.max(0,mean-sd)*scale,high=left+(mean+sd)*scale;content+=`<path d="M${low} ${y}H${high}M${low} ${y-5}v10M${high} ${y-5}v10" fill="none" stroke="#26394e" stroke-width="1.4"/>`;}
  r.values.forEach((v,j)=>content+=`<circle cx="${left+v*scale}" cy="${y+(j-2)*3}" r="3.1" fill="white" stroke="${r.color}" stroke-width="1.4"><title>Seed${j}: ${v}%</title></circle>`);
  content+=`<text x="${left+(Math.max(...r.values,mean+sd)+3)*scale}" y="${y+4}" font-size="11" fill="#526071">${mean.toFixed(1)} ± ${sd.toFixed(1)}%</text>`;
 });
 return `<svg viewBox="0 0 900 330" role="img" xmlns="http://www.w3.org/2000/svg">${content}</svg>`;
}
function stageChart(){
 const names=['APPROACH','GRASP','LIFT','MOVE','PLACE'],left=80,top=30,bottom=260;
 let c='<title>Cumulative stage completion during full-task testing</title><desc>Percentages use all original-reset test episodes as denominator. SAC:76.6,56.4,46,33.6,27.8. TD3:72,49.6,42.2,16,16.</desc>';
 const y=v=>bottom-v*(bottom-top)/100,x=i=>left+i*185;
 for(let t=0;t<=100;t+=25)c+=`<line x1="${left}" x2="820" y1="${y(t)}" y2="${y(t)}" stroke="#e5e8ef"/><text x="60" y="${y(t)+4}" text-anchor="end" font-size="11" fill="#647080">${t}%</text>`;
 names.forEach((n,i)=>c+=`<text x="${x(i)}" y="286" text-anchor="middle" font-size="10" fill="#647080">${n}</text>`);
 [{name:'FSM-SAC',v:[76.6,56.4,46,33.6,27.8],color:'#3159d6',offset:-12},{name:'FSM-TD3',v:[72,49.6,42.2,16,16],color:'#cf7e42',offset:20}].forEach((r,k)=>{
  c+=`<polyline points="${r.v.map((v,i)=>`${x(i)},${y(v)}`).join(' ')}" fill="none" stroke="${r.color}" stroke-width="2.5"/>`;
  r.v.forEach((v,i)=>c+=`<circle cx="${x(i)}" cy="${y(v)}" r="4" fill="${r.color}"><title>${r.name}, ${names[i]}: ${v}%</title></circle><text x="${x(i)}" y="${y(v)+r.offset}" text-anchor="middle" font-size="11" fill="${r.color}">${v}%</text>`);
  c+=`<circle cx="${325+k*155}" cy="316" r="3" fill="${r.color}"/><text x="${335+k*155}" y="320" font-size="11" fill="#526071">${r.name}</text>`;
 });
 return `<svg viewBox="0 0 900 340" role="img" xmlns="http://www.w3.org/2000/svg">${c}</svg>`;
}
function show(mode){
 const final=mode==='final';
 document.getElementById('chart').innerHTML=final?finalChart():stageChart();
 document.getElementById('chart-description').textContent=final?'Final held-out success · mean ± sample SD across five training seeds':'Full-task rollouts · cumulative completion, not local training success';
 document.getElementById('chart-note').textContent=final?'Each seed is tested from original environment resets. The points show individual training seeds.':'Denominator: all500 original-reset test episodes per backbone (5 training seeds ×100 episodes). This descriptive diagnostic has no uncertainty band; it is not a conditional stage success rate.';
 ['final','stages'].forEach(m=>{const b=document.getElementById('show-'+m);b.classList.toggle('active',mode===m);b.setAttribute('aria-pressed',String(mode===m));});
}
document.getElementById('show-final').addEventListener('click',()=>show('final'));
document.getElementById('show-stages').addEventListener('click',()=>show('stages'));
show('final');
