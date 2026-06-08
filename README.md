# Go Static File Server

一个用 Go 实现的静态文件服务器。它可以通过配置文件指定监听端口，并把多个静态项目目录挂载到不同 URL 路径下。

## 项目结构

```text
.
├── config.json              # 当前运行配置
├── config.example.json      # 配置示例
├── go.mod                   # Go 模块定义
├── main.go                  # 服务入口和路由挂载逻辑
├── main_test.go             # 单元测试
├── README.md                # 项目说明
├── go-server.exe            # Windows 可执行文件，编译后生成
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
      "path": "html_prototype"
    }
  ]
}
```

字段说明：

- `port`：服务监听端口。不配置或配置为 `0` 时默认使用 `8080`。
- `projects`：静态项目列表，至少需要配置一个项目。
- `projects[].name`：项目访问路径名称，只能是单个 URL 路径片段，例如 `demo`。
- `projects[].path`：项目文件夹路径，可以使用绝对路径，也可以使用相对配置文件所在目录的相对路径。

多个项目配置示例：

```json
{
  "port": 8080,
  "projects": [
    {
      "name": "project-a",
      "path": "C:/path/to/project-a"
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

### 使用 exe 运行

编译后可以直接运行：

```powershell
.\go-server.exe
```

指定配置文件：

```powershell
.\go-server.exe -config config.json
```

启动成功后，浏览器访问：

```text
http://localhost:8080/
```

当前示例项目访问地址：

```text
http://localhost:8080/html_prototype/
```

根路径 `/` 会显示所有已配置项目的链接列表。

## 编译

在项目根目录执行：

```powershell
go build -o go-server.exe .
```

编译产物 `go-server.exe` 会生成在项目根目录。

## 测试

```powershell
go test ./...
```
