
(function(){

const style=document.createElement("style");

style.textContent=`
#savdoAds{
position:relative;
margin:0 0 25px;
overflow:hidden;
border-radius:22px;
background:white;
}
.savdoAd{
position:relative;
display:none;
}
.savdoAd.active{
display:block;
animation:bannerFade .5s ease;
}
.savdoAd img{
width:100%;
height:310px;
object-fit:cover;
display:block;
}
.savdoAdText{
position:absolute;
bottom:0;
left:0;
right:0;
padding:25px;
color:white;
background:linear-gradient(transparent,#000c);
}
.savdoAdText h2{
margin:8px 0;
font-size:27px;
}
.savdoAdText p{
margin:5px 0 12px;
}
.savdoAdText a{
display:inline-block;
background:#ff6900;
color:white;
text-decoration:none;
padding:12px 20px;
border-radius:12px;
font-weight:bold;
}
.savdoAdLabel{
position:absolute;
top:12px;
left:12px;
background:#0008;
color:white;
padding:6px 12px;
border-radius:8px;
font-size:11px;
}
.savdoDots{
display:flex;
justify-content:center;
gap:8px;
padding:10px;
}
.savdoDot{
width:10px;
height:10px;
padding:0;
border-radius:50%;
background:#ddd;
}
.savdoDot.active{
background:#ff6900;
}
@keyframes bannerFade{
from{opacity:.4}
to{opacity:1}
}
@media(max-width:650px){
.savdoAd img{height:220px}
.savdoAdText{padding:15px}
.savdoAdText h2{font-size:19px}
.savdoAdText p{font-size:12px}
.savdoAdText a{padding:8px 14px;font-size:12px}
}
`;

document.head.appendChild(style);

let current=0;
let timer=null;
let banners=[];

function escapeText(value){

return String(value??"").replace(
/[&<>"']/g,
c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"
})[c]
);

}

function safeLink(value){

try{

const url=new URL(value);

return ["http:","https:"].includes(url.protocol)
?url.href:"";

}catch{

return "";

}

}

function showBanner(index){

if(!banners.length)return;

current=(index+banners.length)%banners.length;

document.querySelectorAll(".savdoAd")
.forEach((el,i)=>{
el.classList.toggle("active",i===current);
});

document.querySelectorAll(".savdoDot")
.forEach((el,i)=>{
el.classList.toggle("active",i===current);
});

}

async function loadBanners(){

const home=document.getElementById("home");

if(!home)return;

let container=document.getElementById("savdoAds");

if(!container){

container=document.createElement("div");
container.id="savdoAds";
container.hidden=true;

const hero=home.querySelector(".hero");

if(hero)hero.after(container);
else home.prepend(container);

}

const now=new Date().toISOString();

const {data,error}=await db
.from("banners")
.select("*")
.eq("active",true)
.lte("starts_at",now)
.or(`ends_at.is.null,ends_at.gt.${now}`)
.order("created_at",{ascending:false})
.limit(10);

if(error){

console.error("Banner error:",error.message);
return;

}

banners=(data||[]).filter(
b=>safeLink(b.image_url)
);

clearInterval(timer);

if(!banners.length){

container.hidden=true;
container.innerHTML="";
return;

}

container.hidden=false;

container.innerHTML=banners.map((b,i)=>{

const link=safeLink(b.link_url);

return `

<div class="savdoAd ${i===0?"active":""}">

<img src="${escapeText(safeLink(b.image_url))}"
alt="${escapeText(b.title)}">

<div class="savdoAdLabel">РЕКЛАМА</div>

<div class="savdoAdText">

<h2>${escapeText(b.title)}</h2>

<p>${escapeText(b.description)}</p>

${link?`
<a href="${escapeText(link)}"
target="_blank"
rel="noopener noreferrer">
Муфассал →
</a>
`:""}

</div>

</div>

`;

}).join("")+

(banners.length>1?`

<div class="savdoDots">

${banners.map((b,i)=>`

<button class="savdoDot ${i===0?"active":""}"
data-index="${i}"
aria-label="Рекламаи ${i+1}">
</button>

`).join("")}

</div>

`:"");

container.querySelectorAll(".savdoDot")
.forEach(dot=>{

dot.onclick=()=>{

showBanner(Number(dot.dataset.index));

};

});

current=0;

if(banners.length>1){

timer=setInterval(()=>{

showBanner(current+1);

},5000);

}

}

function startBanners(){

loadBanners().catch(console.error);

setInterval(()=>{

loadBanners().catch(console.error);

},60000);

}

if(document.readyState==="loading"){

document.addEventListener(
"DOMContentLoaded",startBanners
);

}else{

startBanners();

}

})();
