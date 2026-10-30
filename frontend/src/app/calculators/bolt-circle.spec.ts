import {describe,expect,it} from 'vitest';
import {calculateBoltCircle as calc} from './bolt-circle';
import {drawingCoordinates} from '../pattern-measurements';
describe('G9 bolt circle',()=>{
 it('uses center-origin Cartesian coordinates',()=>{const r=calc(100,10,4,0);expect(r.spacingDegrees).toBe(90);expect(r.chordMm).toBeCloseTo(70.710678,5);const p=drawingCoordinates(r.drawing);[[50,0],[0,50],[-50,0],[0,-50]].forEach(([x,y],i)=>{expect(p[i].x).toBeCloseTo(x,10);expect(p[i].y).toBeCloseTo(y,10);});expect(r.drawing.contours).toHaveLength(3);});
 it('rotates the first hole toward +Y and normalizes wrapped angles',()=>{expect(calc(100,10,4,450).holes[0].point.y).toBeCloseTo(50,10);expect(calc(100,10,4,-270).holes).toEqual(calc(100,10,4,90).holes);});
 it('rejects invalid counts, touching holes and nonfinite angles',()=>{for(const n of [2,3.5])expect(()=>calc(100,10,n,0)).toThrow();expect(()=>calc(100,100,4,0)).toThrow();expect(()=>calc(100,10,4,Infinity)).toThrow();});
});
