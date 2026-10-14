import type {Crop} from './types';
export async function loadImage(url:string):Promise<HTMLImageElement>{return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=reject;img.src=url;});}
export async function fileToDataUrl(file:File):Promise<string>{return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(String(r.result));r.onerror=reject;r.readAsDataURL(file);});}
export async function cropAndCompress(dataUrl:string,crop:Crop,rotation:number):Promise<string>{
 const img=await loadImage(dataUrl);const c=document.createElement('canvas');const left=Math.floor(img.width*crop.x);const top=Math.floor(img.height*crop.y);const sw=Math.max(1,Math.floor(img.width*crop.width));const sh=Math.max(1,Math.floor(img.height*crop.height));
 const rad=((rotation%360)+360)%360;const sideways=rad===90||rad===270;const scale=Math.min(1,1600/Math.max(sw,sh));c.width=Math.max(1,Math.round((sideways?sh:sw)*scale));c.height=Math.max(1,Math.round((sideways?sw:sh)*scale));const ctx=c.getContext('2d');if(!ctx)throw new Error('Canvas no disponible');ctx.fillStyle='white';ctx.fillRect(0,0,c.width,c.height);ctx.translate(c.width/2,c.height/2);ctx.rotate(rad*Math.PI/180);ctx.drawImage(img,left,top,sw,sh,-sw*scale/2,-sh*scale/2,sw*scale,sh*scale);return c.toDataURL('image/jpeg',0.82);
}
