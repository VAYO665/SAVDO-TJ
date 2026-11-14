
(function(){

const style=document.createElement("style");

style.textContent=`
.extraFields{
background:white;
border:1px solid #e8eaf0;
border-radius:18px;
padding:18px;
margin:15px 0;
}
.extraGrid{
display:grid;
grid-template-columns:repeat(3,minmax(0,1fr));
gap:12px;
}
.extraFields h3{
margin:0 0 15px;
color:#ff6900;
}
.extraFields input,
.extraFields select{
margin:7px 0;
}
.extraDetails{
display:grid;
grid-template-columns:repeat(2,minmax(0,1fr));
gap:10px;
margin:15px 0;
}
.extraDetail{
background:#f5f6fa;
padding:12px;
border-radius:10px;
overflow-wrap:anywhere;
}
.extraDetail strong{
display:block;
margin-top:5px;
}
@media(max-width:650px){
.extraGrid{
grid-template-columns:repeat(2,minmax(0,1fr));
}
}
`;

document.head.appendChild(style);

const fields={

"Мошин":[

["brand","Марка","select",[
"Toyota","Mercedes-Benz","BMW","Hyundai",
"Kia","Opel","Volkswagen","Audi","Lexus",
"Nissan","Honda","Chevrolet","BYD",
"Tesla","Ford","Mazda","VAZ","Дигар"
]],

["model","Модел","text"],

["year","Соли барориш","number"],

["mileage","Пробег (км)","number"],

["fuel","Сӯзишворӣ","select",[
"Бензин","Дизел","Газ","Гибрид","Электро"
]],

["gearbox","Қуттии суръат","select",[
"Автомат","Механика","Робот","Вариатор"
]],

["body","Намуди кузов","select",[
"Седан","Хетчбек","Универсал",
"Кроссовер","Ҷип","Минивэн","Пикап"
]],

["color","Ранг","select",[
"Сафед","Сиёҳ","Хокистарӣ",
"Кабуд","Сурх","Сабз","Дигар"
]]

],

"Хона ва замин":[

["property","Намуди амвол","select",[
"Квартира","Хонаи шахсӣ","Замин",
"Мағоза","Офис","Дигар"
]],

["deal","Намуди эълон","select",[
"Фурӯш","Иҷора"
]],

["rooms","Ҳуҷраҳо","select",[
"1","2","3","4","5","6+"
]],

["area","Масоҳат (м²)","number"],

["floor","Ошёна","number"],

["totalFloors","Ҳамагӣ ошёна","number"],

["repair","Таъмир","select",[
"Нав","Евроремонт",
"Таъмири одӣ","Бе таъмир"
]]

],

"Телефон":[

["brand","Бренд","select",[
"Apple","Samsung","Xiaomi",
"Huawei","Honor","Google",
"Oppo","Realme","Дигар"
]],

["model","Модел","text"],

["memory","Хотира","select",[
"32 GB","64 GB","128 GB",
"256 GB","512 GB","1 TB"
]],

["color","Ранг","text"]

]

};

function esc(v){

return String(v??"").replace(/[&<>"']/g,c=>({
"&":"&amp;",
"<":"&lt;",
">":"&gt;",
'"':"&quot;",
"'":"&#39;"
})[c]);

}

function fieldHTML(field,prefix,values){

const [key,label,type,options]=field;
const value=values[key]??"";

if(type==="select"){

return `

<div>
<label>${esc(label)}</label>

<select id="${prefix}_${key}">

<option value="">Интихоб кунед</option>

${options.map(option=>`

<option value="${esc(option)}"
${String(value)===option?"selected":""}>

${esc(option)}

</option>

`).join("")}

</select>
</div>

`;

}

return `

<div>

<label>${esc(label)}</label>

<input id="${prefix}_${key}"
type="${type}"
${type==="number"?'min="0" step="1"':'maxlength="100"'}
value="${esc(value)}"
placeholder="${esc(label)}">

</div>

`;

}

window.renderPostAttributes=function(values={}){

const category=document.getElementById("category");

if(!category)return;

let box=document.getElementById("postAttributes");

if(!box){

box=document.createElement("div");
box.id="postAttributes";
category.after(box);

}

const list=fields[category.value]||[];

box.innerHTML=list.length?`

<div class="extraFields">

<h3>Маълумоти иловагӣ</h3>

<div class="extraGrid">

${list.map(f=>fieldHTML(f,"postExtra",values)).join("")}

</div>

</div>

`:"";

};

window.getPostAttributes=function(){

const category=document.getElementById("category");
const result={};

for(const field of fields[category.value]||[]){

const [key,label,type]=field;

const el=document.getElementById("postExtra_"+key);

if(!el||el.value.trim()==="")continue;

if(type==="number"){

const number=Number(el.value);

if(Number.isFinite(number)&&number>=0)
result[key]=number;

}else{

result[key]=el.value.trim();

}

}

return result;

};

window.renderSearchAttributes=function(category){

const filters=document.querySelector(".filters");

if(!filters)return;

let box=document.getElementById("searchAttributes");

if(!box){

box=document.createElement("div");
box.id="searchAttributes";
filters.after(box);

}

const list=fields[category]||[];

box.innerHTML=list.length?`

<div class="extraFields">

<h3>Филтри махсус</h3>

<div class="extraGrid">

${list.map(f=>fieldHTML(f,"searchExtra",{})).join("")}

</div>

<br>

<button onclick="loadAds()">

🔍 Ҷустуҷӯ

</button>

</div>

`:"";

};

window.applyExtraFilters=function(query,category){

for(const field of fields[category]||[]){

const [key,label,type]=field;

const el=document.getElementById("searchExtra_"+key);

if(!el||el.value.trim()==="")continue;

if(type==="number"){

query=query.contains("attributes",{
[key]:Number(el.value)
});

}else{

query=query.contains("attributes",{
[key]:el.value.trim()
});

}

}

return query;

};

window.renderDetailAttributes=function(ad){

const list=fields[ad.category]||[];
const values=ad.attributes||{};

const html=list.filter(f=>

values[f[0]]!==undefined&&
values[f[0]]!==null&&
values[f[0]]!==""

).map(([key,label])=>`

<div class="extraDetail">

<small>${esc(label)}</small>

<strong>${esc(values[key])}</strong>

</div>

`).join("");

return html?`

<h3>Хусусиятҳо</h3>

<div class="extraDetails">

${html}

</div>

`:"";

};

const category=document.getElementById("category");

if(category){

category.addEventListener("change",()=>{

renderPostAttributes();

});

renderPostAttributes();

}

})();
