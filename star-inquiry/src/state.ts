import type {Run} from './domain';
import type {Prediction} from './Learning';
export type AppState={version:1;lesson:3|4|5;step:number;home:boolean;notes:Record<string,string>;prediction:Prediction|null;predictions:Prediction[];runs:Run[];activeRunId:string;completed:string[];fontSize:'small'|'normal'|'large';mode:'practice'|'manual'|'serial';reveal:boolean};
export const STORAGE_KEY='nc1395-star-inquiry-v1';
export const initialState:AppState={version:1,lesson:3,step:0,home:true,notes:{},prediction:null,predictions:[],runs:[],activeRunId:'',completed:[],fontSize:'normal',mode:'manual',reveal:false};
export function download(name:string,content:string,type='text/plain;charset=utf-8'){const url=URL.createObjectURL(new Blob([content],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
export function practiceLabel(runs:Run[]){return runs.some(r=>r.mode==='practice')?'연습 데이터 포함':'직접 입력 / 센서 데이터';}
