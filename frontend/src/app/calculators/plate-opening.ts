import { finiteResult, integer, positive, requireCondition } from './validation';
import { line, polygon } from './drawings';
import type { PatternDrawing } from '../pattern-drawing';
export function calculatePlateOpening(diameterMm:number,thicknessMm:number,tiltDegrees:number,directionDegrees:number){
 positive(diameterMm,thicknessMm);requireCondition(Number.isFinite(tiltDegrees)&&tiltDegrees>=0&&tiltDegrees<90,'angle');requireCondition(Number.isFinite(directionDegrees),'angle');
 const angle=tiltDegrees*Math.PI/180;const direction=((directionDegrees%360)+360)%360*Math.PI/180;const majorMm=diameterMm/Math.cos(angle);const shiftMm=thicknessMm*Math.tan(angle);finiteResult(majorMm,shiftMm);
 const count=Math.max(72,Math.ceil(2*Math.PI*Math.sqrt(majorMm/2/(8*.01))));integer(count,1,10000);
 const center={x:shiftMm*Math.cos(direction),y:shiftMm*Math.sin(direction)};
 const ellipse=Array.from({length:count},(_,i)=>{const a=i*2*Math.PI/count;return{x:majorMm/2*Math.cos(a)*Math.cos(direction)-diameterMm/2*Math.sin(a)*Math.sin(direction),y:majorMm/2*Math.cos(a)*Math.sin(direction)+diameterMm/2*Math.sin(a)*Math.cos(direction)};});
 const far=ellipse.map(p=>({x:p.x+center.x,y:p.y+center.y}));const extent=majorMm/2+shiftMm;
 const datums=[line({x:-extent,y:0},{x:extent,y:0}),line({x:0,y:-extent},{x:0,y:extent})];
 const face=(points:typeof ellipse,mirrored=false):PatternDrawing=>({...polygon(points),closed:false,construction:datums,coordinateOrigin:'origin',coordinatePoints:[{id:'O',point:{x:0,y:0}},{id:'C',point:mirrored?{x:-center.x,y:center.y}:{x:0,y:0}}],labels:[{text:'O',point:{x:0,y:0}},{text:'A',point:{x:0,y:extent*.85}},{text:'B',point:{x:(mirrored?-1:1)*extent*.85,y:0}},{text:mirrored?'-X':'+X',point:{x:extent*.6,y:0}},{text:'+Y',point:{x:0,y:extent*.6}}],measurements:[{id:'a',kind:'length',value:majorMm,unit:'mm'},{id:'b',kind:'length',value:diameterMm,unit:'mm'},{id:'S',kind:'length',value:shiftMm,unit:'mm'}]});
 const frontDrawing=face(ellipse);const farDrawing=face(far.map(p=>({x:-p.x,y:p.y})),true);
 const drawing:PatternDrawing={...frontDrawing,contours:[polygon(far).outline],construction:[...datums,line({x:0,y:0},center)],labels:[...(frontDrawing.labels??[]),{text:'C',point:center},{text:'S',point:{x:center.x/2,y:center.y/2}}],coordinatePoints:[{id:'O',point:{x:0,y:0}},{id:'C',point:center}]};
 const frontRing=ellipse.map(p=>({...p,z:0}));const farRing=far.map(p=>({...p,z:thicknessMm}));
 const model=[{points:[...frontRing,frontRing[0]]},{points:[...farRing,farRing[0]],seam:true},...Array.from({length:8},(_,i)=>{const k=Math.floor(i*count/8);return{points:[frontRing[k],farRing[k]]};})];
 const sectionDrawing:PatternDrawing={...polygon([{x:-majorMm/2,y:0},{x:majorMm/2,y:0},{x:shiftMm+majorMm/2,y:-thicknessMm},{x:shiftMm-majorMm/2,y:-thicknessMm}]),closed:false,construction:[line({x:-extent,y:0},{x:extent,y:0}),line({x:-extent,y:-thicknessMm},{x:extent,y:-thicknessMm})],labels:[{text:'a',point:{x:0,y:0}},{text:'t',point:{x:extent*.8,y:-thicknessMm/2}}]};
 return{sectionDrawing,majorMm,minorMm:diameterMm,shiftMm,center,ellipse,far,frontDrawing,farDrawing,drawing,model};
}
