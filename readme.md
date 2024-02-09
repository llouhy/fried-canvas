# fried-canvas

## 介绍
fried-canvas是一个基于canvas的图画引擎。

## 使用
### 下载到项目
npm i fried-canvas
### 引入到项目
import { initEngine } from 'fried-canvas';
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

const { addModel, observe, createShape, drawShape, updateShape, translate, onEvent } = engine;  

3. 添加图形模板  
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

4. 创建图形并绘制  
const shapeInstance = createShape('customModelName1', o?: { data?: '你的业务数据（any）'; layer?: 图层实例 });  
drawShape(shapeInstance, placePoint?: { x: number; y: number; }); // placePoint是要放置在图纸上的位置  

5. 移动图形（基于图形中心点）  
shapeInstance.moveTo(x: number, y: number);  

6. 旋转图形  
shapeInstance.rotate(rotateDegree: number); // 角度非弧度  

7. 变更图形  
假如widthParams发生了变化并且想要图形产生变化：  
widthParams = 30;  
updateShape(shapeInstance, isColorRed, widthParams);  

8. 移动画布  
translate(x: number, y: number);  

9. 事件系统  
type ShapeEvent = "shape:mousedown" | "shape:mouseup" | "shape:click" | "shape:dbClick" | "shape:contextMenu" | "shape:mouseenter" | "shape:mouseleave" | "shape:mousemove" | "shape:rotateStart" | "shape:rotateEnd" | "shape:moveStart" | "shape:moveEnd";  
type LifeCycle = 'after:engineInit' | "before:modelAdd" | "after:modelAdd" | "before:shapeCreate" | "after:shapeCreate" | "before:shapeUpdate" | "after:shapeUpdate";  
type EventType = "graph:mousedown" | "graph:mouseup" | "graph:click" | "graph:dbClick" | "graph:contextMenu" | "graph:mouseenter" | "graph:mouseleave" | "graph:mousemove" | ShapeEvent | LifeCycle;  
onEvent(eventType, (data) => {});
