# fried-canvas

## 介绍
fried-canvas是一个基于canvas的图画引擎。

## 使用
### 下载到项目
npm i fried-canvas
### 引入到项目
``` javascript

import { initEngine } from 'fried-canvas';
```
### 项目中使用   

1. 创建实例     
```javascript

const engine = initEngine(  
    { mountDom: HTMLElement;  
      id?: string;  
      width?:number;  
      height?: number  
    }  
);  
const { addModel, observe, createShape, drawShape, updateShape, translate, onEvent, createLayer, appendToLayer } = engine;  
```
3. 添加图形模板
``` javascript  
addModel({  
    name: 'customModelName1',  
    draw: (ctx, arg1, arg2) => {  
        // 请确保该函数中的restore将ctx状态还原  
        ctx.save();  
        ctx.strokeStyle = arg1 ? 'red' : 'green';  
        ctx.strokeRect(10, 10, arg2, 100);  
        ctx.restore();  
    },  
    borderOptions?: {  
      needBorder?: boolean;  
      paddingLeft?: number;  
      paddingRight?: number;  
      paddingTop?: number;  
      paddingBottom?: number;  
      borderDash?: [number, number];  
      borderWidth?: number;  
      borderColor?: string;  
      radius?: number;  
    };  
}, isColorRed, observe(widthParams));  
// draw函数除了第一个参数必须为ctx, 其余参数可以自定义  
// addModel除了第一个参数外，后续的参数对应draw函数的非ctx参数，作为模板的初始值计算该图形的边界  
// observe意味着传入的该变量可能引起尺寸的改变  
```
4. 创建图形并绘制
```javascript

const shapeInstance = createShape('customModelName1', o?: { data?: '你的业务数据（any）'; layer?: 图层实例 });  
drawShape(shapeInstance, placePoint?: { x: number; y: number; }); // placePoint是要放置在图纸上的位置  
```
5. 移动图形（基于图形中心点） 
``` javascript 

shapeInstance.moveTo(x: number, y: number);  
```
6. 旋转图形
```javascript

shapeInstance.rotate(rotateDegree: number); // 角度非弧度
```
7. 变更图形  
* 假如widthParams发生了变化并且想要图形产生变化：  
```javascript

widthParams = 30;  
updateShape(shapeInstance, isColorRed, widthParams);  
shapeInstance.updateBorder({ // 更新边框  
  needBorder?: boolean;  
  paddingLeft?: number;  
  paddingRight?: number;  
  paddingTop?: number;  
  paddingBottom?: number;  
  borderDash?: [number, number];  
  borderWidth?: number;  
  borderColor?: string;  
  radius?: number;  
});  
```
8. 移动画布
```javascript

translate(x: number, y: number);  
```
9. 事件系统  
```javascript

type ShapeEvent = "shape:mousedown" | "shape:mouseup" | "shape:click" | "shape:dbClick" | "shape:contextMenu" | "shape:mouseenter" | "shape:mouseleave" | "shape:mousemove";  
type LifeCycle = 'after:engineInit' | "before:modelAdd" | "after:modelAdd" | "before:shapeCreate" | "after:shapeCreate" | "before:shapeDraw" | "after:shapeDraw" | "before:shapeUpdate" | "after:shapeUpdate";  
type EventType = "graph:mousedown" | "graph:mouseup" | "graph:click" | "graph:dbClick" | "graph:contextMenu" | "graph:mouseenter" | "graph:mouseleave" | "graph:mousemove" | ShapeEvent | LifeCycle;  
onEvent(eventType, (data) => {});
```
10. 创建图层、添加图形到图层  
* 图层将影响每次图形绘制的最小绘制范围计算，同一图层的图形才会被计算。  
* 不创建图层的情况下，将创建一个默认图层并将所有图形绘制到该默认图层。  
* 不建议创建过多图层。    
```javascript

const layerInstance = createLayer(index: number, isDefault?: boolean);  
appendToLayer(shapeInstance, layerInstance);
```