# Go Static File Server

一个用 Go 实现的静态文件服务器。它可以通过配置文件指定监听端口，并把多个静态项目目录挂载到不同 URL 路径下。

## 项目结构

```text
.
├── config.json              # 当前运行配置
├── config.example.json      # 配置示例
├── app.rc                   # Windows 图标资源定义
├── assets/app.ico           # Windows 可执行文件图标
├── build.bat                # 编译带图标的 exe
├── go.mod                   # Go 模块定义
├── main.go                  # 服务入口和路由挂载逻辑
├── main_test.go             # 单元测试
├── README.md                # 项目说明
├── go-server.exe            # Windows 可执行文件，编译后生成
├── go-server.pid            # 后台运行时生成的进程状态文件
└── html_prototype/          # 示例静态项目
    ├── index.html
    ├── app.js
    ├── styles.css
    ├── data.json
    └── assets/
```

## 配置说明

默认配置文件是 `config.json`：

```json
{
  "port": 8080,
  "projects": [
    {
      "name": "html_prototype",
      "path": "html_prototype",
      "open": 1
    }
  ]
}
```

字段说明：

- `port`：服务监听端口。不配置或配置为 `0` 时默认使用 `8080`。
- `projects`：静态项目列表，至少需要配置一个项目。
- `projects[].name`：项目访问路径名称，只能是单个 URL 路径片段，例如 `demo`。
- `projects[].path`：项目文件夹路径，可以使用绝对路径，也可以使用相对配置文件所在目录的相对路径。
- `projects[].open`：可选。设置为 `1` 时，服务启动后浏览器自动打开到该项目，例如 `/html_prototype/`。如果多个项目都设置为 `1`，取配置中的第一个；如果都没有设置，打开根路径 `/`。

多个项目配置示例：

```json
{
  "port": 8080,
  "projects": [
    {
      "name": "project-a",
      "path": "C:/path/to/project-a",
      "open": 1
    },
    {
      "name": "project-b",
      "path": "./project-b"
    }
  ]
}
```

## 使用方式

### 直接运行源码

```powershell
go run .
```

指定配置文件：

```powershell
go run . -config config.json
```

### 使用可执行文件运行

Windows 编译后可以直接前台运行：

```powershell
.\go-server.exe
```

指定配置文件：

```powershell
.\go-server.exe -config config.json
```

Linux/macOS 编译后可以直接前台运行：

```bash
./go-server
```

指定配置文件：

```bash
./go-server -config config.json
```

### 使用可执行文件管理服务

可执行文件支持 `start`、`stop`、`restart`、`status` 四个管理命令，不需要额外的 bat 脚本。

后台启动：

```powershell
.\go-server.exe start
```

Linux/macOS：

```bash
./go-server start
```

关闭：

```powershell
.\go-server.exe stop
```

```bash
./go-server stop
```

重启：

```powershell
.\go-server.exe restart
```

```bash
./go-server restart
```

状态查询：

```powershell
.\go-server.exe status
```

```bash
./go-server status
```

查看帮助：

```powershell
.\go-server.exe help
```

```bash
./go-server help
```

指定配置文件启动：

```powershell
.\go-server.exe -config config.json start
```

后台运行时会生成 `go-server.pid`，用于记录进程号、端口和本地控制令牌。服务输出会写入 `server.out.log`，错误输出会写入 `server.err.log`。

服务启动成功后会自动使用默认浏览器打开服务首页。也可以手动访问：

```text
http://localhost:8080/
```

当前示例项目访问地址：

```text
http://localhost:8080/html_prototype/
```

根路径 `/` 会显示所有已配置项目的链接列表。

## 编译

Windows 下编译带图标的 exe：

```powershell
.\build.bat
```

编译脚本会先用 `windres` 根据 `assets/app.ico` 生成 Windows 资源文件 `app_windows.syso`，再编译 `go-server.exe`。编译产物 `go-server.exe` 会生成在项目根目录。

如果没有修改图标，也可以直接执行：

```powershell
go build -o go-server.exe .
```

Linux/macOS：

```bash
go build -o go-server .
```

## 测试

```powershell
go test ./...
```
