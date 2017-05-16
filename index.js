const fs = require("fs")
const path = require("path")
var opn = require('opn')
var config = {
    project:"活动2",
    route:[{
        title:"第一页",
        data:{},
        name:"page1",
        param:["id"],
        components:[{
            component:"component1",
            npm:"jiayoubao_ui_component1",
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

var default_options = {
    npm:"cnpm",//通过cnpm安装依赖
    build:{
        index: path.resolve(__dirname, './public/'+config.project+'/index.html'),
        assetsRoot: path.resolve(__dirname, './public/'+config.project),
        assetsSubDirectory: 'static',
        assetsPublicPath: '/'+config.project,
    }
}


const prefix = `./project/${config.project}`


const createRouteItem= (config,options)=>{
    var list = []
    //默认路由
    list.push(`{
        path: '/',
        redirect: {name:"${config.route[0].name}"}
    }`)
    config.route.forEach((route,index)=>{
        list.push(`{
            path: '/${route.name}',
            name: '${route.name}',
            component: ${route.name}
        }`)
    })
    return list.join(",\n")
}

const createImport = (config,options)=>{
    var list = []
    config.route.forEach((route,index)=>{
        list.push(`import ${route.name} from '@/components/${route.name}'`)
    })
    return list.join('\n')
}

const createRoute = (config,options)=>{
    var route =  `import Vue from 'vue'
    import Router from 'vue-router'
    ${createImport(config,options)}

    Vue.use(Router)

    export default new Router({
    routes: [
        ${createRouteItem(config,options)}
    ]
    })
    `
    fs.mkdirSync(`${prefix}/src/router`)
    fs.writeFileSync(`${prefix}/src/router/index.js`,route)
    console.log(`路由文件创建成功`);
    
}

//创建template
const createVueComponentTemplate=(config,options)=>{
    var list = []
    config.route.forEach(route=>{
        list.push(`<template>
            <div id="${route.name}">
                ${route.components.map((component,index)=>{
                    return `<${component.component} :data="data${index}"></${component.component}>`
                }).join("\n")}
            </div>
        </template>`)
    })
    return list
}


//创建script
const createVueComponentScript=(config,options)=>{
    var list = []
    config.route.forEach(route=>{
        list.push(`<script>
        ${route.components.map(component=>`import ${component.component} from "${component.npm}"`).join("\n")}
        export default {
        components:{
            ${route.components.map(component=>`${component.component}`).join(",")}
        },
        data () {
            return {
                ${route.components.map((component,index)=>`data${index}:${JSON.stringify(component.data)}`).join(",")}
            }
        }
        }
        </script>`)
    })
    return list
}

const createVueComponent = (config,options)=>{
    console.log(`正在创建活动组件...`);
    var templateList = createVueComponentTemplate(config,options)
    var scriptList = createVueComponentScript(config,options)
    fs.mkdirSync(`${prefix}/src/components`)
    config.route.forEach((route,index)=>{
        var content = templateList[index]+scriptList[index]
        fs.writeFileSync(`${prefix}/src/components/${route.name}.vue`,content)
        console.log(`---${route.name}.vue创建成功`);
    })
}


const createProject=(config,options,callback)=>{
    var exec = require('child_process').exec; 
    var project = config.project
    var cmdStr = `git clone https://github.com/David-zzg/jiayoubao_template_creator.git ${prefix}`;
    console.log(cmdStr)
    exec(`rm -rf ${prefix}`, function(err,stdout,stderr){
        if(err) {
            console.log('error:'+stderr);
        } else {
            exec(cmdStr, function(err,stdout,stderr){
                if(err) {
                    console.log('error:'+stderr);
                } else {
                    console.log(`创建活动："${project}"成功`);
                    callback&&callback()
                }
            });
        }
    });
    
}

//创建依赖
const createPackageDep = (config,options)=>{
    var project = config.project
    var packageObj = require(`${prefix}/package.json`)
    var dep = packageObj.dependencies
    config.route.forEach(route=>{
        route.components.forEach(component=>{
            dep[component.npm] = component.version
        })
    })
    fs.writeFileSync(`${prefix}/package.json`,JSON.stringify(packageObj))
    console.log(`package.json添加依赖成功`);
}

const installModule = (config,options,callback)=>{
    console.log(`正在安装依赖...`);
    var exec = require('child_process').exec; 
    var project = config.project
    var cmdStr = `cd ${prefix}&&${options.npm} install`;
    // var cmdStr = `git clone https://github.com/David-zzg/jiayoubao_template_creator.git ${project}`;
    console.log(`执行命令:${cmdStr}`)
    var spawn = require('child_process').spawn;
    exec(cmdStr, function(err,stdout,stderr){
        if(err) {
            console.log('get error:'+stderr);
        } else {
            console.log(`安装活动："${project}"成功`);
            callback&&callback()
        }
        
    });
}

const startProcess = (config)=>{
    var project = config.project
    var workerProcess = require('child_process').exec(`cd ${prefix}&&npm run dev`, {})
    workerProcess.stdout.on('data', function (data) {
        console.log(data);
    });
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
}


//修改配置文件
const editConfig = (config,options)=>{
    var project = config.project
    var content = fs.readFileSync(`${prefix}/config/index.js`,"utf-8")
    var contentList = content.split('\n')
    try{
        contentList.forEach((line,index)=>{
            if(index>=20)throw('停止搜索')
            for(var i in options.build){
                var reg = new RegExp(i+":(.+)")
                line.replace(reg,function (params) {
                    contentList[index] = `${i}:"${options.build[i]}",`
                })
            }
            
        })
    }catch(e){

    }
    fs.writeFileSync(`${prefix}/config/index.js`,contentList.join("\n"))
    console.log(`修改配置文件成功`);
}

const buildProject = (config,options,callback)=>{
    console.log(`正在生成index.html和相关文件...`);
    var exec = require('child_process').exec; 
    var project = config.project
    var cmdStr = `cd ${prefix}&&npm run build`;
    // var cmdStr = `git clone https://github.com/David-zzg/jiayoubao_template_creator.git ${project}`;
    console.log(`执行命令:${cmdStr}`)
    var workerProcess = require('child_process').exec(cmdStr, {})
    workerProcess.stdout.on('data', function (data) {
        console.log(data);
    });
    workerProcess.stderr.on('data', function (data) {
        console.log('stderr: ' + data);
    });
    workerProcess.stderr.on('close', function (data) {
        console.log(`编译成功!`)
        opn(`http://localhost:3000/${config.project}/index.html`)
    });
}

const start = (env,config,options)=>{
    switch (env) {
        case "dev":
            startProcess(config)
            break;
        case "build":
            buildProject(config,options)
            break;
        default:
            throw("缺少参数!");
    }
}

var env = process.argv[2]
createProject(config,options,()=>{
    createPackageDep(config,options)//修改package.json  添加依赖
    createVueComponent(config,options)//创建components
    createRoute(config,options)//创建路由
    editConfig(config,options) //修改配置文件
    installModule(config,options,()=>{
        start(env,config,options)
    })//安装依赖
    
})//创建项目



export default (config,options)=>{

}