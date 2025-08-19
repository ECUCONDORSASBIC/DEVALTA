const fs=require('fs');
const path=require('path');
const {spawn}=require('child_process');
const root=process.cwd();
const outDir=path.join(root,'reports');
if(!fs.existsSync(outDir))fs.mkdirSync(outDir,{recursive:true});
const now=Date.now();
const isDir=p=>{try{return fs.statSync(p).isDirectory()}catch{return false}};
const isFile=p=>{try{return fs.statSync(p).isFile()}catch{return false}};
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const list=(dir)=>fs.readdirSync(dir,{withFileTypes:true});
const shouldSkip=name=>name==='node_modules'||name.startsWith('.')||name==='dist'||name==='build'||name==='coverage'||name==='.git';
const findPackages=(bases)=>{
  const found=[];
  const visit=(dir)=>{
    let pkg;
    const pj=path.join(dir,'package.json');
    if(isFile(pj)){
      const j=readJson(pj);
      if(j&&j.name&&j.scripts&&j.scripts.build)found.push({name:j.name,dir,type:dir.includes('/apps/')?'app':'package'});
      return;
    }
    for(const d of list(dir)){
      if(!d.isDirectory())continue;
      if(shouldSkip(d.name))continue;
      visit(path.join(dir,d.name));
    }
    return pkg;
  };
  for(const b of bases){if(isDir(b))visit(b)}
  return found;
};
const trySpawn=(cmd,args,cwd)=>new Promise(resolve=>{
  const child=spawn(cmd,args,{cwd,env:process.env});
  let out='';
  let err='';
  child.stdout.on('data',d=>{out+=d});
  child.stderr.on('data',d=>{err+=d});
  child.on('error',e=>resolve({code:127,stdout:out,stderr:String(e)}));
  child.on('close',code=>resolve({code,stdout:out,stderr:err}));
});
const run=async(cwd)=>{
  const t0=Date.now();
  const attempts=[
    ['pnpm',['run','build']],
    ['corepack',['pnpm','run','build']],
    ['npx',['-y','pnpm','run','build']],
    ['npm',['run','build']]
  ];
  for(const [cmd,args] of attempts){
    const r=await trySpawn(cmd,args,cwd);
    if(r.code===0)return {code:0,time:Date.now()-t0,stdout:r.stdout,stderr:r.stderr};
    if(!r.stderr && !r.stdout)continue;
    if(cmd==='npm')return {code:r.code,time:Date.now()-t0,stdout:r.stdout,stderr:r.stderr};
  }
  return {code:1,time:Date.now()-t0,stdout:'',stderr:'all runners failed'};
};
const uniqBy=(arr,fn)=>{const m=new Map();for(const x of arr){const k=fn(x);if(!m.has(k))m.set(k,x)}return [...m.values()]};
const bases=[path.join(root,'apps'),path.join(root,'packages')];
const pkgs=uniqBy(findPackages(bases),x=>x.name).sort((a,b)=>a.name.localeCompare(b.name));
const results=[];
(async()=>{
  for(const p of pkgs){
    const r=await run(p.dir);
    results.push({name:p.name,type:p.type,path:p.dir,buildTime:r.time,success:r.code===0,errors:r.code===0?[]:[r.stderr||r.stdout],warnings:[],typeErrors:0,missingDeps:[],circularDeps:[],bundleSize:null});
  }
  const total=results.length;
  const successful=results.filter(x=>x.success).length;
  const failed=total-successful;
  const totalBuildTime=results.reduce((a,b)=>a+b.buildTime,0);
  const avgBuildTime=total?Math.round(totalBuildTime/total):0;
  const criticalIssues=results.filter(x=>!x.success).map(x=>({workspace:x.name,errors:x.errors}));
  const performanceMetrics=[...results].sort((a,b)=>b.buildTime-a.buildTime).slice(0,5).map(x=>({workspace:x.name,buildTime:(x.buildTime/1000).toFixed(2)+'s'}));
  const payload={timestamp:new Date(now).toISOString(),summary:{total,successful,failed,totalBuildTime,avgBuildTime,totalTypeErrors:0,workspacesWithWarnings:0,workspacesWithCircularDeps:0,totalBundleSize:0},criticalIssues,typeErrorBreakdown:[],performanceMetrics,bundleSizes:[],details:results};
  const file=path.join(outDir,`build-audit-${now}.json`);
  fs.writeFileSync(file,JSON.stringify(payload,null,2));
  console.log(file);
  process.exit(failed?1:0);
})();

