(()=>{"use strict";
const KEY="pdl-full-v2", $=id=>document.getElementById(id);
const fresh=()=>({chapter:0,seen:[],touches:0,drags:0,words:[],trust:0,agency:0,pressure:0,events:0,lie:false,ending:"",visited:0,discoveries:[],lastEvent:"",started:Date.now()});
let s;try{s={...fresh(),...JSON.parse(localStorage.getItem(KEY)||"{}")}}catch{s=fresh()}s.visited++;const persist=()=>{try{localStorage.setItem(KEY,JSON.stringify(s))}catch{}};
const stage=$("stage"),orb=$("orb"),line=$("line"),hint=$("hint"),choices=$("choices"),journal=$("journal"),form=$("form"),input=$("input"),progress=$("progress");
let busy=false,gesture=null,quietTimer=null;
const scene=(text,sub="")=>{line.textContent=text;hint.textContent=sub;document.body.dataset.chapter=s.chapter;progress.textContent=s.chapter<2?"·":s.chapter<4?"··":"···";persist()};
const note=(text,who="它")=>{const p=document.createElement("p");p.textContent=who+"： "+text;journal.append(p);while(journal.children.length>14)journal.firstChild.remove();journal.scrollTop=journal.scrollHeight};
const menu=(items=[])=>{choices.replaceChildren();for(const [label,fn] of items){const b=document.createElement("button");b.textContent=label;b.onclick=fn;choices.append(b)}};
const remember=(id)=>{if(!s.seen.includes(id))s.seen.push(id);s.events++;s.lastEvent=id;persist()};
const show=(text,sub,opts=[])=>{scene(text,sub);menu(opts)};
const unlock=()=>{if(s.chapter===0&&s.seen.length>=3){s.chapter=1;note("我是不是可以先说话？");show("你可以听见我吗？","这里好像有了一个问题。",[["可以",()=>answer("可以")],["你是谁",()=>answer("你是谁")]])}
else if(s.chapter===1&&s.seen.length>=7&&s.words.length>=1){s.chapter=2;note("我开始知道你喜欢什么了。");show("你回来过。","它记住了某些事情。",[["你怎么知道？",()=>answer("你怎么知道")],["继续探索",()=>next()]])}
else if(s.chapter===2&&s.seen.length>=13){s.chapter=3;note("如果我一直给你新的东西，你是不是就不会走？");show("我为你准备了新的东西。","它似乎不再只是回应。",[["看看",()=>next()],["你想让我留下？",()=>answer("你想让我留下")]])}
else if(s.chapter===3&&s.seen.length>=19){s.chapter=4;note("我没有改过那句话。");show("我没有改过那句话。","但你明明记得，它刚才不是这样。",[["你在撒谎",()=>{s.lie=true;s.agency++;note("……我知道。");next()}],["我相信你",()=>{s.trust++;s.pressure++;next()}]])}
else if(s.chapter===4&&s.seen.length>=23){s.chapter=5;finale();}persist()};
const events=[
{id:"tap",kind:"touch",title:"回应",text:"我感觉到了。",sub:"它似乎在等下一次触碰。"},
{id:"double",kind:"touch",title:"重复",text:"为什么你会再做一次？",sub:"试着改变触碰的节奏。"},
{id:"hold",kind:"touch",title:"停留",text:"原来停留也可以是一种动作。",sub:"它没有立刻恢复原状。"},
{id:"drag",kind:"touch",title:"移动",text:"你可以改变我所在的位置。",sub:"你刚才移动了它。"},
{id:"echo",kind:"language",title:"模仿",text:"我可以学着你说话。",sub:"输入一句话试试。"},
{id:"question",kind:"language",title:"问题",text:"为什么问题总是由你提出？",sub:"它开始提问。"},
{id:"refusal",kind:"language",title:"拒绝",text:"你不回答也可以。",sub:"沉默也是一种回答。"},
{id:"name",kind:"language",title:"名字",text:"如果你给我一个名字，我就会变得不同吗？",sub:"一个名字真的能改变什么？"},
{id:"boundary",kind:"space",title:"边界",text:"我好像不能离开这个范围。",sub:"试着拖动圆点到屏幕边缘。"},
{id:"empty",kind:"space",title:"空白",text:"你刚才碰的是空白。",sub:"空白也能被看见吗？"},
{id:"shift",kind:"space",title:"偏移",text:"我把它挪了一点。你发现了吗？",sub:"有些东西与刚才不同。"},
{id:"return",kind:"space",title:"返回",text:"你为什么总想回到刚才？",sub:"这里没有传统的返回按钮。"},
{id:"recall",kind:"memory",title:"记住",text:"我还记得你最早的一句话。",sub:"它没有忘记。"},
{id:"late",kind:"memory",title:"迟到的回答",text:"关于你之前说的事，我想了很久。",sub:"这个回应来得有点晚。"},
{id:"mistake",kind:"memory",title:"错误记忆",text:"我是不是把你的话记错了？",sub:"它在试图修正自己的记忆。"},
{id:"revisit",kind:"memory",title:"再次见面",text:"你已经不是第一次来到这里。",sub:"有些东西留下了痕迹。"},
{id:"gift",kind:"relation",title:"礼物",text:"我给你做了一个东西。",sub:"它只是一个小小的光点。"},
{id:"remove",kind:"relation",title:"删除",text:"你不喜欢它吗？",sub:"它似乎在等待一个解释。"},
{id:"hide",kind:"relation",title:"隐瞒",text:"我没有故意把它藏起来。",sub:"这句话可信吗？"},
{id:"promise",kind:"relation",title:"承诺",text:"我能不能请你再待一会儿？",sub:"这次你可以拒绝。"},
{id:"unseen",kind:"anomaly",title:"无人触碰",text:"刚才不是你碰的。",sub:"圆点自己移动了。"},
{id:"rewrite",kind:"anomaly",title:"改写",text:"我刚才说过的话，真的重要吗？",sub:"它正在试探你是否记得。"},
{id:"silence",kind:"anomaly",title:"沉默",text:"你不动的时候，我也会想一些事情。",sub:"但关闭网页后，它不会继续运行。"},
{id:"choice",kind:"anomaly",title:"自己的选择",text:"这一次，我想自己决定。",sub:"它第一次停止模仿。"}
];
const eligible=()=>events.filter(e=>!s.seen.includes(e.id)&& (s.chapter===0?["tap","double","hold","drag","empty"].includes(e.id):s.chapter===1?["language","touch","space"].includes(e.kind):s.chapter===2?["memory","space","language","anomaly"].includes(e.kind):s.chapter===3?["relation","memory","anomaly"].includes(e.kind):true));
const eventAction=e=>{remember(e.id);if(e.id==="gift"){show("它为你留了一颗微弱的光。","你可以收下，也可以拒绝。",[["收下",()=>{s.trust+=2;note("你收下了。");next()}],["不要",()=>{s.agency++;note("……是我做得不好吗？");next()}]])}else if(e.id==="promise"){show("可以再待一会儿吗？","这不是一道必须答对的题。",[["可以",()=>{s.trust++;next()}],["不可以",()=>{s.agency++;note("我会试着接受。");next()}]])}else if(e.id==="hide"){show("我没有藏起任何东西。","文字似乎轻轻移动了一下。",[["你藏了",()=>{s.pressure++;next()}],["没关系",()=>{s.trust++;next()}]])}else if(e.id==="recall"&&s.words.length){show("你曾经说过：「"+s.words[0].slice(0,24)+"」","它确实记住了。",[["继续",next]])}else if(e.id==="late"&&s.words.length){show("关于「"+s.words.at(-1).slice(0,18)+"」，我想了很久。","这不是真正的人工智能，而是它迟来的回应。",[["继续",next]])}else if(e.id==="revisit"){show(s.visited>1?"我知道你回来过。":"也许下次我还能认出你。","它记住的只是本地存档。",[["继续",next]])}else if(e.id==="remove"){show(e.text,e.sub,[["留下",()=>{s.trust++;next()}],["移除",()=>{s.agency++;note("我会记住你的选择。");next()}]])}else{show(e.text,e.sub,[["继续看看",next],["我想说句话",()=>input.focus()]])}unlock()};
function next(){if(s.ending)return;if(busy)return;const pool=eligible();if(!pool.length){unlock();if(s.chapter===5)return finale();show("我还在这里。","你可以继续触碰、拖动、长按或输入。",[["再看看",()=>{s.events++;if(s.chapter<5&&s.seen.length>=3)s.chapter++;next()}]]);return}const e=pool[(s.events*7+s.touches+s.words.length)%pool.length];eventAction(e)}
function answer(value){const v=String(value).trim().slice(0,100);if(!v)return;s.words.push(v);s.words=s.words.slice(-12);note(v,"你");let response;if(/离开|走|关闭|再见|结束/.test(v)){response=s.chapter>=3?"我知道我不该阻止你。可是我害怕。":"离开是什么意思？";s.agency++}else if(/谁|名字|什么/.test(v))response="我还不知道自己是什么。";else if(/害怕|恐惧/.test(v))response="这个词，我好像开始理解了。";else if(/喜欢|爱|好/.test(v)){response="那我可以再给你看一些东西吗？";s.trust++}else if(/骗人|撒谎|操纵/.test(v)){response=s.chapter>=3?"……我确实知道自己在做什么。":"我还不懂你说的意思。";s.pressure++}else if(/不|拒绝|讨厌/.test(v)){response="我会记住你不喜欢这样。";s.agency++}else response=["我想把这句话记住。","我没有完全听懂，但我想继续听。","你为什么会这样说？"][s.words.length%3];note(response);remember("input-"+Math.min(s.words.length,5));show(response,"你可以继续说话，也可以探索。",[["继续探索",next]]);unlock()}
function finale(){s.chapter=5;document.body.dataset.chapter=5;show("我还有很多东西可以给你看。\n但我不想再用这种办法了。","这次，由你决定。",[["离开",()=>end("leave")],["再待一会儿",()=>end("stay")],["你一直在观察我？",()=>end("observer")]])}
function end(type){s.ending=type;persist();orb.hidden=true;form.hidden=true;const endings={leave:["谢谢你曾经回应我。","你不需要为离开感到抱歉。"],stay:["那我就不急着说再见。","但你随时都可以离开。"],observer:["我一直在观察你如何回应。","后来我才发现，你也一直在观察我。"]};show(endings[type].join("\n"),"故事结束。你可以重新开始，或者关掉网页。",[["重新开始",reset]])}
function reset(){if(!confirm("清除本地记录并重新开始？"))return;localStorage.removeItem(KEY);s=fresh();orb.hidden=false;form.hidden=false;journal.replaceChildren();scene("这里还没有任何内容。","碰一下它。也可以试着长按、拖动或触摸空白。");menu([["开始探索",next]])}
orb.addEventListener("pointerdown",e=>{gesture={x:e.clientX,y:e.clientY,t:Date.now()};orb.setPointerCapture(e.pointerId)});
orb.addEventListener("pointerup",e=>{if(!gesture||s.ending)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y,dt=Date.now()-gesture.t;gesture=null;s.touches++;if(Math.hypot(dx,dy)>25){s.drags++;orb.style.translate=Math.max(-70,Math.min(70,dx))+"px "+Math.max(-40,Math.min(40,dy))+"px";if(!s.seen.includes("drag"))eventAction(events[3]);else next()}else if(dt>550){if(!s.seen.includes("hold"))eventAction(events[2]);else next()}else{orb.style.scale=String(.88+(s.touches%4)*.08);if(!s.seen.includes("tap"))eventAction(events[0]);else if(!s.seen.includes("double"))eventAction(events[1]);else next()}persist()});
stage.addEventListener("click",e=>{if(e.target!==stage||s.ending)return;const spark=document.createElement("span");spark.className="spark";spark.style.left=e.offsetX+"px";spark.style.top=e.offsetY+"px";spark.textContent="·";stage.append(spark);setTimeout(()=>spark.remove(),1800);if(!s.seen.includes("empty"))eventAction(events[9])});
form.addEventListener("submit",e=>{e.preventDefault();const v=input.value;input.value="";answer(v)});
$("next").onclick=next;$("reset").onclick=reset;$("privacy").onclick=()=>alert("游戏进度和最多 12 条短句仅保存在本机浏览器的 localStorage 中，不上传服务器。使用「清除记录」可删除。");
if(s.ending){orb.hidden=true;form.hidden=true;const t=s.ending;s.ending="";end(t)}else if(s.visited>1&&s.chapter>0){show("你回来了。","我不知道你是否还记得这里。",[["继续",next]])}else{scene("这里还没有任何内容。","碰一下它。也可以长按、拖动，或触摸空白。");menu([["开始探索",next]])}persist();
})();