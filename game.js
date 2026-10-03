const $=i=>document.getElementById(i),R=Math.random;
const DEF={sens:1,fov:75,blur:1,bri:1,vol:.7,res:1,fps:0,showfps:true},S={...DEF};
try{Object.assign(S,JSON.parse(localStorage.getItem('yk1')||'{}'))}catch(e){}
const save=()=>{try{localStorage.setItem('yk1',JSON.stringify(S))}catch(e){}};
const MAP=['#####################','#.....#.......#.....#','#.....#.......#.....#','#.....#.......#.....#','#.....#.......#.....#','###.#####L#####.#####','#...................#','#...................X','###.#####.#####.#####','#.....#.......#.....#','#.....#.......#.....#','#.....#.......#.....#','#.....#.......#.....#','#.....#.......#.....#','#####################'];
const CS=4,MW=21,MH=15,grid=MAP.map(r=>r.split(''));
const solid=(x,y)=>{const c=(grid[y]||[])[x];return c===undefined||c=='#'||c=='L'||c=='X'};
const PR=[[14,12,3,1,1.8,0x4a2c16],[5,12,1,3,6,0x2e1c10],[18,5,6,3,1,0x2e1c10],[42,11,3.5,1,1.8,0x3b2312],[34,5,8,3,1,0x2e1c10],[50,5,8,3,1,0x2e1c10],[55,12,1,3,6,0x2e1c10],[76,6,2,1,1.2,0x5a3a1a],[79,12,1,3,6,0x2e1c10],[66,6,4,.8,2.4,0x4a2020],[10,44,2,1,2,0x4a2c16],[7,53,2.4,.8,4.4,0x3a2a30],[22,40,1.2,3,4,0x2e1c10],[42,52,5,1.4,2,0x151515],[32,46,1.6,.9,4.4,0x3a1a1a],[70,46,3,1,3,0x4a2c16],[79,40,1.2,3,4,0x2e1c10],[62,54,2,1.5,1.5,0x3b2312]];
function hit(x,z,r){for(const a of[[-r,-r],[r,-r],[-r,r],[r,r]])if(solid(Math.floor((x+a[0])/CS),Math.floor((z+a[1])/CS)))return 1;for(const q of PR)if(Math.abs(x-q[0])<q[2]/2+r&&Math.abs(z-q[1])<q[4]/2+r)return 1;return 0}
function los(ax,az,bx,bz){const n=Math.ceil(Math.hypot(bx-ax,bz-az)/.6);for(let i=1;i<n;i++){const t=i/n;if(solid(Math.floor((ax+(bx-ax)*t)/CS),Math.floor((az+(bz-az)*t)/CS)))return 0}return 1}
function nxt(sx,sy,tx,ty){const P=new Int16Array(MW*MH).fill(-1),s=sy*MW+sx,q=[s];P[s]=s;
 for(let h=0;h<q.length;h++){const c=q[h],x=c%MW,y=(c/MW)|0;if(x==tx&&y==ty)break;
  for(const a of[[1,0],[-1,0],[0,1],[0,-1]]){const nx=x+a[0],ny=y+a[1];if(solid(nx,ny))continue;const k=ny*MW+nx;if(P[k]<0){P[k]=c;q.push(k)}}}
 let k=ty*MW+tx;if(P[k]<0||k==s)return null;while(P[k]!=s)k=P[k];return[k%MW,(k/MW)|0]}

/* renderer / post-process */
const cv=$('c'),rd=new THREE.WebGLRenderer({canvas:cv,antialias:false});
const scene=new THREE.Scene();scene.fog=new THREE.FogExp2(0,.045);scene.background=new THREE.Color(0);
const cam=new THREE.PerspectiveCamera(S.fov,1,.1,120);cam.rotation.order='YXZ';scene.add(cam);
const rt=new(rd.capabilities.isWebGL2?THREE.WebGLMultisampleRenderTarget:THREE.WebGLRenderTarget)(8,8);
const U={t:{value:rt.texture},v:{value:new THREE.Vector2()},b:{value:1},tm:{value:0},dg:{value:0},gr:{value:.07}};
const pc=new THREE.OrthographicCamera(-1,1,1,-1,0,1),pq=new THREE.Scene();
const quad=new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({uniforms:U,depthTest:false,
vertexShader:'varying vec2 u;void main(){u=uv;gl_Position=vec4(position,1.);}',
fragmentShader:`uniform sampler2D t;uniform vec2 v;uniform float b,tm,dg,gr;varying vec2 u;
float r(vec2 s){return fract(sin(dot(s,vec2(12.9898,78.233)))*43758.5453);}
void main(){vec3 c=vec3(0.);
for(int i=0;i<12;i++){c+=texture2D(t,u+v*(float(i)/11.-.5)).rgb;}c/=12.;
float d=length((u-.5)*vec2(1.,.85))*(1.+dg*.6);
c*=1.-smoothstep(.3,.95,d);
c=pow(c,vec3(.8));
c=mix(c,c*vec3(1.8,.45,.45),dg*.6);
c+=(r(u+tm)-.5)*gr;
gl_FragColor=vec4(c*b,1.);}`}));
quad.frustumCulled=false;pq.add(quad);
let W=innerWidth,H_=innerHeight;
function fit(){W=innerWidth;H_=innerHeight;const pr=Math.min(devicePixelRatio||1,2)*S.res;rd.setPixelRatio(pr);rd.setSize(W,H_);rt.setSize(Math.max(1,W*pr|0),Math.max(1,H_*pr|0));cam.aspect=W/H_;cam.fov=S.fov;cam.updateProjectionMatrix()}
addEventListener('resize',fit);

/* textures */
function tex(f,rx,ry){const c=document.createElement('canvas');c.width=c.height=256;const x=c.getContext('2d');f(x);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(rx||1,ry||1);t.anisotropy=8;return t}
const grime=(x,n,a)=>{for(let i=0;i<n;i++){x.fillStyle=`rgba(0,0,0,${R()*a})`;x.fillRect(R()*256,R()*256,R()*3+1,R()*24+1)}};
const wallT=tex(x=>{x.fillStyle='#6b5748';x.fillRect(0,0,256,256);
 for(let i=0;i<256;i+=32){x.fillStyle='rgba(40,12,12,.35)';x.fillRect(i,0,14,256)}
 grime(x,500,.22);x.fillStyle='#35210f';x.fillRect(0,176,256,80);x.fillStyle='#1c1008';x.fillRect(0,172,256,6);
 x.strokeStyle='#1c1008';for(let i=0;i<256;i+=64)x.strokeRect(i+6,190,52,56);
 for(let i=0;i<3;i++){const X=R()*256,Y=R()*150,g=x.createRadialGradient(X,Y,2,X,Y,40);g.addColorStop(0,'rgba(70,5,5,.5)');g.addColorStop(1,'rgba(70,5,5,0)');x.fillStyle=g;x.fillRect(X-40,Y-40,80,80)}});
const floorT=tex(x=>{for(let y=0;y<256;y+=32){x.fillStyle=`hsl(25,${35+R()*10}%,${20+R()*9}%)`;x.fillRect(0,y,256,32);x.fillStyle='rgba(0,0,0,.55)';x.fillRect(0,y,256,2);for(let k=0;k<3;k++)x.fillRect(R()*256,y,2,32)}grime(x,300,.3)},MW,MH);
const ceilT=tex(x=>{x.fillStyle='#3a322c';x.fillRect(0,0,256,256);grime(x,300,.3)},MW,MH);
const doorT=tex(x=>{x.fillStyle='#5a3418';x.fillRect(0,0,256,256);x.strokeStyle='#26140a';x.lineWidth=6;x.strokeRect(24,24,208,100);x.strokeRect(24,140,208,100);x.fillStyle='#c9a227';x.beginPath();x.arc(214,128,9,0,7);x.fill();grime(x,200,.3)});
const glT=(()=>{const c=document.createElement('canvas');c.width=c.height=64;const x=c.getContext('2d'),q=x.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,'rgba(255,255,255,.9)');q.addColorStop(.3,'rgba(255,255,255,.25)');q.addColorStop(1,'rgba(255,255,255,0)');x.fillStyle=q;x.fillRect(0,0,64,64);return new THREE.CanvasTexture(c)})();
const mat=o=>new THREE.MeshPhongMaterial(Object.assign({shininess:6,specular:0x181818},o));

/* world */
let n=0;grid.forEach(r=>r.forEach(c=>{if(c=='#')n++}));
const walls=new THREE.InstancedMesh(new THREE.BoxGeometry(CS,CS,CS),mat({map:wallT}),n),M4=new THREE.Matrix4();let wi=0;
grid.forEach((r,y)=>r.forEach((c,x)=>{if(c=='#'){M4.makeTranslation((x+.5)*CS,CS/2,(y+.5)*CS);walls.setMatrixAt(wi++,M4)}}));
walls.frustumCulled=false;walls.instanceMatrix.needsUpdate=true;scene.add(walls);
const fl=new THREE.Mesh(new THREE.PlaneGeometry(MW*CS,MH*CS),mat({map:floorT,shininess:25,specular:0x222222}));fl.rotation.x=-Math.PI/2;fl.position.set(MW*CS/2,0,MH*CS/2);scene.add(fl);
const ce=new THREE.Mesh(new THREE.PlaneGeometry(MW*CS,MH*CS),mat({map:ceilT}));ce.rotation.x=Math.PI/2;ce.position.set(MW*CS/2,CS,MH*CS/2);scene.add(ce);
const doors={};
grid.forEach((r,y)=>r.forEach((c,x)=>{if(c=='L'||c=='X'){const m=new THREE.Mesh(new THREE.BoxGeometry(CS-.04,CS,CS-.04),mat(c=='X'?{map:doorT,color:0xff7766}:{map:doorT}));m.position.set((x+.5)*CS,CS/2,(y+.5)*CS);scene.add(m);doors[c]=m}}));
PR.forEach(q=>{const m=new THREE.Mesh(new THREE.BoxGeometry(q[2],q[3],q[4]),mat({color:q[5]}));m.position.set(q[0],q[3]/2,q[1]);scene.add(m)});
scene.add(new THREE.AmbientLight(0x6a6a90,.75));
const cl=[[24,2.6,28],[56,2.6,28],[10.5,1.15,44.5]].map(q=>{const l=new THREE.PointLight(0xff9650,1.2,18,1.6);l.position.set(...q);scene.add(l);const s=new THREE.Mesh(new THREE.SphereGeometry(.1,8,8),new THREE.MeshBasicMaterial({color:0xffc080}));s.position.copy(l.position);scene.add(s);return l});
const spot=new THREE.SpotLight(0xfff0d0,0,36,Math.PI/6.5,.5,1.1);spot.position.set(.15,-.12,0);spot.target.position.set(0,0,-10);cam.add(spot,spot.target);

/* items */
const items=[];
function mk(kind,x,y,z,col,fn){const m=new THREE.Group(),mt=mat({color:col,emissive:col,emissiveIntensity:.5,shininess:80}),B=(g,px,py,pz,rx)=>{const o=new THREE.Mesh(g,mt);o.position.set(px,py,pz);o.rotation.x=rx||0;m.add(o)};
 if(kind=='l'){B(new THREE.CylinderGeometry(.06,.05,.4,10),0,0,0,Math.PI/2);B(new THREE.CylinderGeometry(.11,.06,.14,10),0,0,-.25,Math.PI/2)}
 else{B(new THREE.TorusGeometry(.12,.04,8,16),0,.2,0);B(new THREE.BoxGeometry(.05,.4,.05),0,0,0);B(new THREE.BoxGeometry(.14,.05,.05),.07,-.12,0)}
 const sp=new THREE.Sprite(new THREE.SpriteMaterial({map:glT,color:col,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));sp.scale.set(1.6,1.6,1);m.add(sp);
 m.scale.setScalar(1.5);m.position.set(x,y,z);scene.add(m);items.push({m,y,fn})}

/* ghost */
const gh=new THREE.Group(),gm=mat({color:0xdde3ee,emissive:0x182030,transparent:true,opacity:.9,shininess:40}),eyeM=new THREE.MeshBasicMaterial({color:0x050505}),bkM=new THREE.MeshBasicMaterial({color:0});
const gadd=(geo,m,x,y,z,sc)=>{const o=new THREE.Mesh(geo,m);o.position.set(x,y,z);if(sc)o.scale.set(...sc);gh.add(o);return o};
gadd(new THREE.ConeGeometry(.75,2.3,16),gm,0,1.25,0);gadd(new THREE.SphereGeometry(.4,16,12),gm,0,2.55,0);
gadd(new THREE.SphereGeometry(.09,8,8),eyeM,-.15,2.6,.33);gadd(new THREE.SphereGeometry(.09,8,8),eyeM,.15,2.6,.33);
gadd(new THREE.SphereGeometry(.1,8,8),bkM,0,2.35,.36,[1,2.4,.5]);
[-.5,.5].forEach(x=>{gadd(new THREE.CylinderGeometry(.07,.05,1.3,8),gm,x,1.9,.6).rotation.x=Math.PI/2.4});
scene.add(gh);

/* audio */
let AC,MG,NB;
function aInit(){if(AC)return;try{AC=new(window.AudioContext||window.webkitAudioContext)();MG=AC.createGain();MG.gain.value=S.vol;MG.connect(AC.destination);
 NB=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NB.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=R()*2-1;
 [55,58.5,82].forEach((f,i)=>{const o=AC.createOscillator(),g=AC.createGain();o.type=i==2?'triangle':'sine';o.frequency.value=f;g.gain.value=i==2?.025:.1;o.connect(g);g.connect(MG);o.start()})}catch(e){AC=null}}
function tone(f,f2,d,ty,v){if(!AC)return;const o=AC.createOscillator(),g=AC.createGain(),t=AC.currentTime;o.type=ty;o.frequency.setValueAtTime(f,t);o.frequency.exponentialRampToValueAtTime(f2,t+d);g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(MG);o.start(t);o.stop(t+d)}
function nz(d,v,fc){if(!AC)return;const s=AC.createBufferSource(),f=AC.createBiquadFilter(),g=AC.createGain(),t=AC.currentTime;s.buffer=NB;f.type='lowpass';f.frequency.value=fc;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);s.connect(f);f.connect(g);g.connect(MG);s.start(t);s.stop(t+d)}

/* state */
const p={x:6,z:28,ey:1.7,cy:1.7,sl:0,sdr:[0,0],stm:100,tired:0,run:0,cr:0,cl:0,bt:0,ba:0,rl:0,stp:0,ck:6};
const G={x:70,z:44,chase:0,tg:null,ry:0,al:0,hb:0,dT:0},HV={l:0,a:0,b:0},K={};
let yaw=-Math.PI/2,pitch=0,st=0,fb=0,lon=0,el=0,T=0,mdx=0,mdy=0,bs=0,bx=1,by=0,mc=-9,mt,tries=0;
function msg(t,ms=3800){const e=$('msg');e.textContent=t;e.style.opacity=1;clearTimeout(mt);mt=setTimeout(()=>e.style.opacity=0,ms)}
function msgT(t){if(T-mc>4){mc=T;msg(t,2500)}}
function ui(){$('ob').textContent='目的: '+(!HV.l?'懐中電灯を探せ':!HV.a?'書斎の鍵を探せ':!HV.b?'書斎に入り、玄関の鍵を探せ':'玄関から脱出しろ');
 $('inv').textContent=[HV.l?'［ライト］':'',HV.a?'［書斎の鍵］':'',HV.b?'［玄関の鍵］':''].join(' ')}
const pick=()=>{tone(660,1100,.35,'sine',.3);ui()};
mk('l',9.5,1.3,43.5,0xfff2c0,()=>{HV.l=1;lon=1;msg('懐中電灯を手に入れた ― [E]で点灯／消灯');pick()});
mk('k',72,1.2,12,0xe0b040,()=>{HV.a=1;msg('書斎の鍵を手に入れた');pick()});
mk('k',42,1.7,11,0xff5040,()=>{HV.b=1;msg('玄関の鍵を手に入れた ― 出口へ急げ');pick()});
const fmt=s=>Math.floor(s/60)+'分'+Math.floor(s%60)+'秒';
function reset(){Object.assign(p,{x:6,z:28,ey:1.7,cy:1.7,sl:0,stm:100,tired:0,rl:0});yaw=-Math.PI/2;pitch=0;HV.l=HV.a=HV.b=0;lon=0;el=0;items.forEach(i=>{i.got=0;i.m.visible=true});grid[5][9]='L';doors.L.visible=true;Object.assign(G,{x:70,z:44,chase:0,tg:null,al:0,dT:0});ui()}
function endScr(t,d){$('et').textContent=t;$('ed').textContent=d;$('end').hidden=false}
function die(){st=3;document.exitPointerLock();tone(900,180,1.3,'sawtooth',.5);nz(1.3,.7,5000);setTimeout(()=>endScr('喰われた…','生存時間 '+fmt(el)),1100)}
function win(){st=4;document.exitPointerLock();[523,659,784,1046].forEach((f,i)=>setTimeout(()=>tone(f,f,.8,'sine',.3),i*220));endScr('脱出成功','夜明けの光が差し込む。生還タイム '+fmt(el))}
function rndCell(){for(let i=0;i<60;i++){const x=1+(R()*(MW-2)|0),y=1+(R()*(MH-2)|0);if(!solid(x,y))return R()<.35?[Math.floor(p.x/CS),Math.floor(p.z/CS)]:[x,y]}return[2,7]}
function ghostAnim(){gh.position.set(G.x,.15+Math.sin(T*1.8)*.12,G.z);gh.rotation.set(0,G.ry,Math.sin(T*2.3)*.06);eyeM.color.setHex(G.chase>0?0xff2000:0x050505)}
function ghostUp(dt){
 const dx=p.x-G.x,dz=p.z-G.z,d=Math.hypot(dx,dz),vis=los(G.x,G.z,p.x,p.z);
 let rad=p.sl>0?10:p.run?14:p.cr?3.5:7;if(lon&&HV.l)rad*=1.3;
 if((vis&&d<rad)||d<rad*.4)G.chase=6;
 G.chase=Math.max(0,G.chase-dt);
 if(G.chase>0&&!G.al){G.al=1;tone(110,55,.9,'sawtooth',.3)}if(G.chase<=0)G.al=0;
 const gc=[Math.floor(G.x/CS),Math.floor(G.z/CS)],pcl=[Math.floor(p.x/CS),Math.floor(p.z/CS)];let tx=null,tz=0,spd=1.9,nx;
 if(G.chase>0){spd=4.2;if(vis){tx=p.x;tz=p.z}else if(nx=nxt(gc[0],gc[1],pcl[0],pcl[1])){tx=(nx[0]+.5)*CS;tz=(nx[1]+.5)*CS}}
 else{if(!G.tg||(gc[0]==G.tg[0]&&gc[1]==G.tg[1]))G.tg=rndCell();
  if(nx=nxt(gc[0],gc[1],G.tg[0],G.tg[1])){tx=(nx[0]+.5)*CS;tz=(nx[1]+.5)*CS}else G.tg=null}
 if(tx!=null){const ex=tx-G.x,ez=tz-G.z,l=Math.hypot(ex,ez);if(l>.05){const s=Math.min(spd*dt,l);G.x+=ex/l*s;G.z+=ez/l*s;G.ry=Math.atan2(ex,ez)}}
 G.dT=G.chase>0?Math.min(1,Math.max(0,(16-d)/11)):Math.min(.35,Math.max(0,(9-d)/20));
 G.hb-=dt;if(d<14&&G.hb<=0){G.hb=.35+d/14*.9;tone(60,38,.16,'sine',.7);setTimeout(()=>tone(55,35,.16,'sine',.5),170)}
 const f=(d<8)&&R()<.3*(1-d/10)?.1:1;spot.intensity=HV.l&&lon?3*f:0;
 ghostAnim();if(Math.hypot(p.x-G.x,p.z-G.z)<1.15&&st==1)die()}
function update(dt){
 el+=dt;
 const sh=K.ShiftLeft||K.ShiftRight,ax=(K.KeyD?1:0)-(K.KeyA?1:0),az=(K.KeyW?1:0)-(K.KeyS?1:0),mv=ax||az,sn=Math.sin(yaw),cs=Math.cos(yaw);let dx=0,dz=0;
 if(mv){const l=Math.hypot(ax,az);dx=(-sn*az+cs*ax)/l;dz=(-cs*az-sn*ax)/l}
 const cp=K.KeyC&&!p.cl;p.cl=!!K.KeyC;
 if(cp&&sh&&mv&&p.sl<=0&&p.stm>12){p.sl=.85;p.sdr=[dx,dz];p.stm-=12;tone(140,50,.6,'sine',.2);nz(.7,.25,700)}
 const cr=!!K.KeyC&&p.sl<=0,run=!!(sh&&mv&&!cr&&p.sl<=0&&p.stm>0&&!p.tired);
 let spd=cr?1.7:run?6.4:3.4;
 if(p.sl>0){p.sl-=dt;spd=2+8*Math.max(p.sl,0)/.85;dx=p.sdr[0];dz=p.sdr[1]}
 if(run)p.stm-=22*dt;else if(p.sl<=0)p.stm+=(mv?9:18)*dt;
 p.stm=Math.max(0,Math.min(100,p.stm));if(p.stm<=0)p.tired=1;else if(p.stm>30)p.tired=0;
 p.run=run;p.cr=cr;
 const mvg=mv||p.sl>0;
 if(mvg){const sx=dx*spd*dt,sz=dz*spd*dt;if(!hit(p.x+sx,p.z,.45))p.x+=sx;if(!hit(p.x,p.z+sz,.45))p.z+=sz;
  p.bt+=dt*spd*1.7;p.stp+=spd*dt;
  if(p.sl<=0&&p.stp>(run?2.6:2.1)){p.stp=0;const v=cr?.06:run?.4:.22;nz(.09,v,run?900:500);tone(80,45,.12,'sine',v)}}
 const k=Math.min(1,dt*8);p.ba+=((mvg&&p.sl<=0?1:0)-p.ba)*k;
 p.ey+=((p.sl>0?.7:cr?1:1.7)-p.ey)*Math.min(1,dt*10);
 p.cy=p.ey+Math.sin(p.bt)*.045*p.ba*(run?1.7:1);p.rl+=((p.sl>0?.06:0)-p.rl)*k;
 ghostUp(dt);
 for(const it of items){if(it.got)continue;it.m.rotation.y+=dt*1.6;it.m.position.y=it.y+Math.sin(T*2.2)*.07;
  if(Math.hypot(p.x-it.m.position.x,p.z-it.m.position.z)<2.5){it.got=1;it.m.visible=false;it.fn()}}
 if(grid[5][9]=='L'&&Math.hypot(p.x-38,p.z-22)<3.6){if(HV.a){grid[5][9]='.';doors.L.visible=false;tone(90,40,.9,'sawtooth',.25);nz(.9,.3,500);msg('書斎の扉が開いた…')}else msgT('扉には鍵がかかっている')}
 if(st==1&&Math.hypot(p.x-82,p.z-30)<3.6){if(HV.b)win();else msgT('玄関は固く閉ざされている…')}
 p.ck-=dt;if(p.ck<0){p.ck=9+R()*15;tone(260+R()*120,90,1.4,'sawtooth',.05)}
 $('stf').style.width=p.stm+'%'}
function post(dt){
 const ang=Math.hypot(mdx,mdy)*.0022*S.sens/Math.max(dt,.004),t=Math.min(1,Math.max(0,(ang-3.5)/7.5)),tt=t*t;
 bs+=(tt-bs)*Math.min(1,dt*(tt>bs?30:12));
 if(mdx||mdy){const l=Math.hypot(mdx,mdy);bx=mdx/l;by=mdy/l}
 const L=.05*S.blur*bs;U.v.value.set(bx*L,-by*L*W/H_);mdx=mdy=0;
 U.tm.value=(T*37)%100;U.b.value=S.bri;
 U.dg.value+=((st==3?1:G.dT)*(1+Math.sin(T*9)*.12)-U.dg.value)*Math.min(1,dt*4)}

/* loop */
let last=performance.now(),fa=0,fc=0;
function loop(now){requestAnimationFrame(loop);
 if(S.fps&&now-last<1000/S.fps-1)return;
 const dt=Math.min((now-last)/1000,.05);last=now;T+=dt;
 fc++;fa+=dt;if(fa>=.5){$('fps').textContent=Math.round(fc/fa)+' FPS';fc=0;fa=0}
 if(st==1)update(dt);
 if(st==3){let d=Math.atan2(-(G.x-p.x),-(G.z-p.z))-yaw;d=Math.atan2(Math.sin(d),Math.cos(d));yaw+=d*Math.min(1,dt*9);pitch+=(.55-pitch)*Math.min(1,dt*6);ghostAnim()}
 cl.forEach((l,i)=>l.intensity=1.15+Math.sin(T*8+i*2)*.1+R()*.12);
 cam.position.set(p.x+(st==3?(R()-.5)*.1:0),p.cy,p.z);cam.rotation.set(pitch,yaw,p.rl);
 post(dt);
 rd.setRenderTarget(rt);rd.render(scene,cam);rd.setRenderTarget(null);rd.render(pq,pc)}

/* menu / settings / input */
const OPT=[['sens','マウス感度',.2,3,.05],['fov','視野角 (FOV)',60,110,1],['blur','モーションブラー',0,2,.05],['bri','明るさ',.5,2,.05],['vol','音量',0,1,.05],['res','描画解像度',.5,1,.05]];
$('set').innerHTML='<h2>設定</h2>'+OPT.map(o=>`<label><span>${o[1]}</span><input type=range id=s_${o[0]} min=${o[2]} max=${o[3]} step=${o[4]}><output id=o_${o[0]}></output></label>`).join('')+'<label><span>FPS上限</span><select id=s_fps>'+[[0,'無制限'],[30,'30'],[60,'60'],[90,'90'],[144,'144']].map(a=>`<option value=${a[0]}>${a[1]}`).join('')+'</select></label><label><span>FPS表示</span><input type=checkbox id=s_showfps></label><button id=bkb>戻る</button>';
function apply(){fit();if(MG)MG.gain.value=S.vol;$('fps').hidden=!S.showfps}
[...OPT.map(o=>o[0]),'fps','showfps'].forEach(k=>{const e=$('s_'+k),o=$('o_'+k),sync=()=>{if(o)o.textContent=S[k]};
 if(e.type=='checkbox')e.checked=!!S[k];else e.value=S[k];sync();
 e.oninput=e.onchange=()=>{S[k]=e.type=='checkbox'?e.checked:+e.value;sync();apply();save()}});
const back=()=>{$('set').hidden=true;$('mn').hidden=false};
$('bkb').onclick=back;$('stb').onclick=()=>{$('mn').hidden=true;$('set').hidden=false};
function pause(){if(st!=1)return;st=2;$('ttl').textContent='一時停止';$('go').textContent='再開';$('mn').hidden=false;$('set').hidden=true;$('ov').hidden=false}
function resume(){st=1;$('ov').hidden=true;if(!el)msg('…ここは、どこだ。 出口を探さなければ。',5000)}
const lock=()=>{try{const q=cv.requestPointerLock();q&&q.catch&&q.catch(()=>{})}catch(e){}};
const go=()=>{aInit();if(AC&&AC.state=='suspended')AC.resume();lock()};
$('go').onclick=go;
$('rt').onclick=()=>{reset();$('end').hidden=true;go()};
document.addEventListener('pointerlockchange',()=>{if(document.pointerLockElement==cv){tries=0;fb=0;resume()}else if(st==1&&!fb)pause()});
document.addEventListener('pointerlockerror',()=>{if(tries++<1)setTimeout(lock,1300);else{fb=1;resume();msg('視点操作: 画面をドラッグ',5000)}});
addEventListener('mousemove',e=>{if(st==1&&(document.pointerLockElement==cv||(fb&&e.buttons&1))){if(Math.abs(e.movementX)>400||Math.abs(e.movementY)>400)return;const a=.0022*S.sens;yaw-=e.movementX*a;pitch=Math.max(-1.45,Math.min(1.45,pitch-e.movementY*a));mdx+=e.movementX;mdy+=e.movementY}});
addEventListener('keydown',e=>{
 if(e.code=='Escape'){if(!$('set').hidden)back();else if(st==1&&document.pointerLockElement!=cv)pause();return}
 K[e.code]=1;
 if(e.code=='KeyE'&&!e.repeat&&st==1){if(!HV.l)msg('ライトを持っていない');else{lon=!lon;nz(.05,.3,3000)}}});
addEventListener('keyup',e=>{K[e.code]=0});
addEventListener('blur',()=>{for(const k in K)K[k]=0});
apply();ui();requestAnimationFrame(loop);
