
<!-- dev0000000000 -->

<!-- 安装项目所需依赖模块 -->
1. npm install 
<!-- 默认先执行gulp命令：
·····清空dist文件内容，编译sass,javascript 打包压缩 
·····gulp.task('default',['clean','sass','script'])
-->
2. gulp 

<!-- 命令3：清空dist文件夹 -->
3. gulp clean  
	gulp cleanCss
	gulp cleanScript

<!-- 命令4：编译sass -->
4. gulp sass

<!-- 命令5：
.....gulp jshint 检查js语法
.....gulp script 编译script 
-->
5. gulp jshint
	gulp script

<!-- 命令6：压缩文件
.....gulp html 压缩html
		htmlOpts = {
        removeComments: true,  // 移除注释
        collapseWhitespace: true,  // 移除空格
        collapseBooleanAttributes: true,//省略布尔属性的值 <input checked="true"/> ==> <input />
        removeEmptyAttributes: true,//删除所有空格作属性值 <input id="" /> ==> <input />
        removeScriptTypeAttributes: true,//删除<script>的type="text/javascript"
        removeStyleLinkTypeAttributes: true,//删除<style>和<link>的type="text/css"
        minifyJS: true,//压缩页面JS
        minifyCSS: true//压缩页面CSS
      };
.....gulp fontmin 压缩iconfont字体文件
.....gulp image 压缩图片文件
 -->
6. gulp html
	gulp fontmin
	gulp image

<!-- 命令7：启动本地服务 -->
7. gulp webserver

<!-- 命令8：gulp watch 时时监听文件变化 
	默认设置的是时时监听sass和script的发生变化时，自动编译压缩生成目标文件
-->
8. gulp watch 
