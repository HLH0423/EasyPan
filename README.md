# 仿百度网盘项目

This template should help get you started developing with Vue 3 in Vite.


## 项目设置

```sh
npm install
```

### 项目启动

```sh
npm run dev
```

### 项目构建

```sh
npm run build
```
## 项目架构
![image](https://github.com/HLH0423/EasyPan/assets/54101102/5a1e626c-d958-4df7-8627-06afa062f735)


## 注册登录页面
可以实现无账号时的注册，忘记密码时的重置密码以及有账号时的登录功能  
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/8822feec-68f9-4acb-98e1-3e6a6f002117)

### 找回密码
![image](https://github.com/HLH0423/EasyPan/assets/54101102/8ab4f9c4-ca5c-447c-9515-fece9df8c41e)

### 注册页面
![image](https://github.com/HLH0423/EasyPan/assets/54101102/e0d53b4e-4fc1-4395-8c80-d3eb6cba010d)

### 发送邮箱验证码
![image](https://github.com/HLH0423/EasyPan/assets/54101102/28df267a-95fb-423e-8d28-54f8205c4df6)


## 网盘主页
主要展示网盘中的文件列表，可实现上传、新建文件夹、批量删除、批量移动以及文件搜索的功能
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/b4b2711e-dfdf-4724-8173-21d43a283e27)

### 批量上传文件 
主要实现分片上传、秒传、断点续传以及取消上传的功能，可以展示文件上传的进度以及文件解析的进展  
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/d94b50b3-53da-4e10-b505-89e24544d131)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/8c890417-2de5-4045-9371-14ff00ed0f6c)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/ca9228ad-6cbe-4ca9-8717-bac494510dff)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/8feca309-4cd4-45e0-b200-87ed38a130ae)


### 文件列表

#### 新建文件夹
![image](https://github.com/HLH0423/EasyPan/assets/54101102/42e23991-ff6e-40c0-8b39-4de2b5e38ea9)

#### 文件预览
支持视频播放、音频播放、图片预览、excel/doc/pdf 在线预览以及文本预览（代码后缀名默认使用文本预览）
######
对于其他类型的文件（如 .zip 压缩文件），当点击文件名时，会提示点击下载  
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/7eab0864-a67d-4672-996a-b95923c46c46)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/77a11eb2-4cb2-4171-a13a-59e2405af8b8)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/4f0de4fa-7e5c-4133-9ffe-8d2ee4ae3cde)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/2d4d9f4e-6f52-4eba-a78c-ef760e7286c0)


#### 文件下载
![image](https://github.com/HLH0423/EasyPan/assets/54101102/e3c937f8-6799-44ca-a8e6-0008175d0d97)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/7a774fd6-2332-4e69-b94e-0fc6f84f8c61)

#### 文件分享
分享文件时，支持选择文件分享的有效期以及自定义提取码  
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/1d6c7ffd-cf2b-4826-be71-b36481831bb4)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/8697edf2-b470-4de2-aa0b-6748b96e2c4e)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/4032962d-9e8c-404f-bf13-672953e1e241)

##### 文件分享校验
![image](https://github.com/HLH0423/EasyPan/assets/54101102/1d2a4078-f4cb-4296-9f4d-b30d286ec952)
##### 查看分享的文件列表
![image](https://github.com/HLH0423/EasyPan/assets/54101102/b2ad50e8-9ee4-42e8-9454-29053f5d1ad3)
##### 预览分享的文件内容
![image](https://github.com/HLH0423/EasyPan/assets/54101102/4289179a-bb70-49a4-95d0-decf8aca1860)
##### 保存到我的网盘
![image](https://github.com/HLH0423/EasyPan/assets/54101102/d77d398d-17db-463f-85fe-45e3a0de8325)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/92a3a3f5-bbe4-4383-a69c-22b970b60160)


#### 文件删除
支持单个文件的删除以及文件的批量删除，并将删除后的文件放入到回收站，可在10天内进行删除文件的还原

##### 单个文件的删除
![image](https://github.com/HLH0423/EasyPan/assets/54101102/1b5a778a-ca80-40a9-9688-77f460d90750)

##### 批量文件的删除
![image](https://github.com/HLH0423/EasyPan/assets/54101102/5bfd82a3-e603-45f6-a324-780d89fe8273)


#### 文件重命名
![image](https://github.com/HLH0423/EasyPan/assets/54101102/ee8226c5-30c6-4f4f-87b6-8a374222fe6d)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/86dd3b53-e426-47c1-9645-36032df1c19a)


#### 文件移动
支持单个文件以及批量文件的移动  
######
如果移动到当前目录，会提示不可移动    
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/cc27e2ca-88fa-4ce1-b039-9adf70dcc2e2)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/2464e86d-2885-458d-b090-f5736852146b)
![image](https://github.com/HLH0423/EasyPan/assets/54101102/aedf4545-a225-4680-aef2-47d5101137e0)


## 分享页面
可实现复制分享链接以及取消分享的功能
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/d7ae2161-7997-4943-8058-629fc012d3c7)


## 回收站页面
可实现还原删除的文件以及彻底删除文件的功能
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/a8b4f019-8c4f-419b-bf9f-6735ece4afd8)

## 设置（管理员）页面
该页面只允许具有管理员身份的账号进行控制更改
######
可实现查看用户所有文件、用户管理以及系统设置等功能

### 用户文件
主要实现文件的搜索、文件的批量删除以及文件的预览功能
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/9c47d2df-ef1b-44d3-ad23-1c5dd48abcb9)

### 用户管理
主要展示了当前已注册的用户信息，支持根据用户昵称以及用户状态进行用户的查询
######
可以对用户的使用空间进行分配以及对用户的状态进行控制
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/46880d65-055a-4d42-a19d-b7cc9b4ade12)

### 系统设置
可以设置邮件的模板以及用户初始化空间大小
######
![image](https://github.com/HLH0423/EasyPan/assets/54101102/27768001-74e7-4842-8c33-f0d5897c61bc)






