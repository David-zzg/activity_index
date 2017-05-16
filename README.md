活动页面自动化配置方案

![配置](http://clubimg.kingdee.com/club/attachments/school/images/imgupload/20170516kaLg9haO52naElLR.png)
（成功的最后一步应该是返回url，这里写错了）

我基于这个流程，自己写了个demo。  
后台服务器采用express，前端采用vue2，并采用了官方的脚手架来做构建。  
在可视化页面编辑完成后，我们应该可以获取到如下的数据结构（因为不知道现有结构，所以我自己设计了一种）：
```
{
    project:"活动2",
    route:[{
        title:"第一页",
        data:{},
        name:"page1",
        components:[{
            component:"component1",
            npm:"jiayoubao_ui_component1",//npm来源
            version:"1.2.0",
            data:{
                name:"component1"
            }
        },{
            component:"component2",
            npm:"jiayoubao_ui_component2",
            version:"1.3.0",
            data:{
                name:"component2"
            }
        }]
    },{
        title:"第二页",
        data:{},
        name:"page2",
        components:[{
            component:"component1",
            npm:"jiayoubao_ui_component1",
            version:"1.2.0",
            data:{
                name:"component3"
            }
        },{
            component:"component2",
            npm:"jiayoubao_ui_component2",
            version:"1.3.0",
            data:{
                name:"component4"
            }
        }]
    }]
}
```
这时候，页面的路由和页面结构就基本清晰明了了。


关于npm包的管理，由于项目中只能引入一个同名包（假设你有一个ui包，你无法在一个项目中引入两个不同版本的ui包）。对于前期组件未稳定且变动频繁来说。将多个组件封装到一个包是不太实际的（项目中很可能出现需要component1@1.0和component2@1.2的情况）。因而我采取每个组件当独成包的方式，等到第一版组件稳定后，在统一封装成一个包的措施。
假设我们的包前缀为jiayoubao_ui,那么component1的包可以命名为jiayoubao_ui_component1,以此类推。因而在package.json的依赖中我们很容易就实现
```
"dependencies": {
    "jiayoubao_ui_component1": "^1.0.0",
    "jiayoubao_ui_component2": "^1.2.0",
    "vue": "^2.2.6",
    "vue-router": "^2.3.1"
},
的方式。
```

为配合demo使用，我预先在npm仓库发了两个包，分别为jiayoubao_ui_component1,jiayoubao_ui_component2。并设置了不同的版本号

config应该从数据库中获取，这里为了方便，我直接在文件中读取



demo启动方法.
```
1.安装依赖 cnpm install
2.启动server// 根目录下npm start启动服务器，其中端口号为3000
3.修改config.js配置（该配置为可视化编辑页面生成的配置）
4.执行npm run build 生成文件。并在浏览器预览效果
```

