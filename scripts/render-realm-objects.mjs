import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import sharp from 'sharp';

const browser = await chromium.launch({ channel: 'msedge' });
try {
  const page = await browser.newPage({ viewport: { width: 1200, height: 1000 } });
  await page.route('http://studio.local/**', async route => {
    const path = new URL(route.request().url()).pathname;
    if (path === '/') return route.fulfill({contentType:'text/html', body:'<style>*{margin:0}</style><script type="importmap">{"imports":{"three":"/modules/build/three.module.js","three/addons/":"/modules/examples/jsm/"}}</script>'});
    const modules = path.startsWith('/modules/');
    const root = resolve(modules ? 'node_modules/three' : 'public');
    const file = resolve(root, '.' + (modules ? path.slice(8) : path));
    if (!file.startsWith(root + sep)) return route.abort();
    return route.fulfill({body:await readFile(file), contentType:file.endsWith('.js')?'text/javascript':file.endsWith('.jpg')?'image/jpeg':'application/octet-stream'});
  });
  for(const [folder,slug] of [['GothicBed_01','alcove'],['side_table_01','companion'],['mid_century_lounge_chair','repose']]){
    await page.goto('http://studio.local/');
    await page.evaluate(async folder=>{
      const T=await import('three');
      const {GLTFLoader}=await import('three/addons/loaders/GLTFLoader.js');
      const {RGBELoader}=await import('three/addons/loaders/RGBELoader.js');
      const renderer=new T.WebGLRenderer({antialias:true,preserveDrawingBuffer:true});
      renderer.setSize(innerWidth,innerHeight);renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;
      renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.22; document.body.append(renderer.domElement);
      const scene=new T.Scene();scene.background=new T.Color('#ae9984');scene.fog=new T.FogExp2('#b39d85',0.09);
      const model=(await new GLTFLoader().loadAsync('/models/'+folder+'/model.gltf')).scene;
      model.traverse(m=>{if(m.isMesh){m.castShadow=true;m.receiveShadow=true;}});scene.add(model);
      const env=await new RGBELoader().loadAsync('/models/studio.hdr');env.mapping=T.EquirectangularReflectionMapping;scene.environment=env;
      const bounds=new T.Box3().setFromObject(model),c=bounds.getCenter(new T.Vector3()),s=bounds.getSize(new T.Vector3()),d=Math.max(s.x,s.y,s.z);
      const floor=new T.Mesh(new T.PlaneGeometry(100,100),new T.MeshStandardMaterial({color:'#ac9982',roughness:.84}));floor.rotation.x=-Math.PI/2;floor.position.y=bounds.min.y-.003;floor.receiveShadow=true;scene.add(floor);
      const light=new T.DirectionalLight('#ffe5c4',3.3);light.position.set(-3,5,3);light.castShadow=true;light.shadow.mapSize.set(2048,2048);light.shadow.normalBias=.01;scene.add(light);
      const camera=new T.PerspectiveCamera(32,innerWidth/innerHeight,.02,80);
      camera.position.copy(c).add(new T.Vector3(.97,.61,1.36).multiplyScalar(d*1.3));camera.lookAt(c);renderer.render(scene,camera);
    },folder);
    await sharp(await page.screenshot()).webp({quality:89}).toFile('public/images/products/'+slug+'.webp');
  }
}finally{await browser.close();}
