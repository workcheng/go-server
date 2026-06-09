package main

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"html/template"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"sort"
	"strings"
	"syscall"
	"time"
)

type Config struct {
	Port     int       `json:"port"`
	Projects []Project `json:"projects"`
}

type Project struct {
	Name string `json:"name"`
	Path string `json:"path"`
	Open int    `json:"open"`
}

type mountedProject struct {
	Name string
	Path string
	URL  string
}

type serverMeta struct {
	PID   int    `json:"pid"`
	Port  int    `json:"port"`
	Token string `json:"token"`
}

func main() {
	flag.Usage = printHelp
	configPath := flag.String("config", "config.json", "configuration file path")
	pidPath := flag.String("pid", "go-server.pid", "PID file path")
	child := flag.Bool("child", false, "run as background server child")
	flag.Parse()

	command := ""
	if args := flag.Args(); len(args) > 0 {
		command = strings.ToLower(args[0])
	}

	switch command {
	case "help":
		printHelp()
	case "status":
		if err := printStatus(*pidPath); err != nil {
			log.Fatal(err)
		}
	case "stop":
		if err := stopServer(*pidPath); err != nil && !errors.Is(err, errServerStopped) {
			log.Fatal(err)
		}
	case "":
		cfg, err := loadConfig(*configPath)
		if err != nil {
			log.Fatalf("load config: %v", err)
		}
		if *child {
			if err := runServer(cfg, *pidPath, true); err != nil {
				log.Fatal(err)
			}
			return
		}
		if err := runServer(cfg, *pidPath, false); err != nil {
			log.Fatal(err)
		}
	case "start":
		cfg, err := loadConfig(*configPath)
		if err != nil {
			log.Fatalf("load config: %v", err)
		}
		if err := startServer(cfg, *configPath, *pidPath); err != nil {
			log.Fatal(err)
		}
	case "restart":
		cfg, err := loadConfig(*configPath)
		if err != nil {
			log.Fatalf("load config: %v", err)
		}
		if err := stopServer(*pidPath); err != nil && !errors.Is(err, errServerStopped) {
			log.Fatal(err)
		}
		if err := startServer(cfg, *configPath, *pidPath); err != nil {
			log.Fatal(err)
		}
	default:
		log.Fatalf("unknown command: %s\nRun go-server.exe help for usage.", command)
	}
}

func printHelp() {
	fmt.Fprintf(flag.CommandLine.Output(), `Usage:
  go-server.exe [options]
  go-server.exe [options] start
  go-server.exe [options] stop
  go-server.exe [options] restart
  go-server.exe [options] status
  go-server.exe help

Commands:
  start    Start go-server.exe in the background and open the browser.
  stop     Stop the background server started by this executable.
  restart  Stop and start the background server.
  status   Show whether the background server is running.
  help     Show this help text.

Options:
`)
	flag.CommandLine.VisitAll(func(f *flag.Flag) {
		if f.Name == "child" {
			return
		}
		fmt.Fprintf(flag.CommandLine.Output(), "  -%s", f.Name)
		if f.DefValue != "" && f.DefValue != "false" {
			fmt.Fprintf(flag.CommandLine.Output(), " string")
		}
		fmt.Fprintf(flag.CommandLine.Output(), "\n    \t%s", f.Usage)
		if f.DefValue != "" && f.DefValue != "false" {
			fmt.Fprintf(flag.CommandLine.Output(), " (default %q)", f.DefValue)
		}
		fmt.Fprintln(flag.CommandLine.Output())
	})
}

func runServer(cfg Config, pidPath string, writePID bool) error {
	mux, projects, err := buildMux(cfg)
	if err != nil {
		return fmt.Errorf("build server: %w", err)
	}

	token := ""
	if writePID {
		token, err = newToken()
		if err != nil {
			return err
		}
		mux.HandleFunc("/__go_server__/stop", func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodPost || r.Header.Get("X-Go-Server-Token") != token {
				http.NotFound(w, r)
				return
			}
			w.WriteHeader(http.StatusOK)
			go func() {
				time.Sleep(200 * time.Millisecond)
				os.Exit(0)
			}()
		})
		mux.HandleFunc("/__go_server__/status", func(w http.ResponseWriter, r *http.Request) {
			if r.Method != http.MethodGet || r.Header.Get("X-Go-Server-Token") != token {
				http.NotFound(w, r)
				return
			}
			w.WriteHeader(http.StatusOK)
			w.Write([]byte("ok"))
		})
		if err := writeMeta(pidPath, serverMeta{
			PID:   os.Getpid(),
			Port:  cfg.Port,
			Token: token,
		}); err != nil {
			return err
		}
		defer os.Remove(pidPath)
	}

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("static file server listening on http://localhost%s", addr)
	for _, project := range projects {
		log.Printf("serving %s from %s at %s", project.Name, project.Path, project.URL)
	}

	server := &http.Server{
		Addr:    addr,
		Handler: mux,
	}
	ln, err := net.Listen("tcp", addr)
	if err != nil {
		return err
	}
	if !writePID {
		openBrowser(openURL(cfg))
	}
	if err := server.Serve(ln); err != nil {
		return err
	}
	return nil
}

func loadConfig(configPath string) (Config, error) {
	data, err := os.ReadFile(configPath)
	if err != nil {
		return Config{}, err
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return Config{}, err
	}

	if cfg.Port == 0 {
		cfg.Port = 8080
	}
	if cfg.Port < 1 || cfg.Port > 65535 {
		return Config{}, fmt.Errorf("port must be between 1 and 65535: %d", cfg.Port)
	}
	if len(cfg.Projects) == 0 {
		return Config{}, errors.New("projects must contain at least one project")
	}

	baseDir := filepath.Dir(configPath)
	for i := range cfg.Projects {
		cfg.Projects[i].Name = strings.TrimSpace(cfg.Projects[i].Name)
		cfg.Projects[i].Path = strings.TrimSpace(cfg.Projects[i].Path)

		if cfg.Projects[i].Name == "" {
			return Config{}, fmt.Errorf("projects[%d].name is required", i)
		}
		if strings.ContainsAny(cfg.Projects[i].Name, `/\`) || cfg.Projects[i].Name == "." || cfg.Projects[i].Name == ".." {
			return Config{}, fmt.Errorf("projects[%d].name must be a single URL path segment", i)
		}
		if cfg.Projects[i].Path == "" {
			return Config{}, fmt.Errorf("projects[%d].path is required", i)
		}
		if !filepath.IsAbs(cfg.Projects[i].Path) {
			cfg.Projects[i].Path = filepath.Clean(filepath.Join(baseDir, cfg.Projects[i].Path))
		}

		info, err := os.Stat(cfg.Projects[i].Path)
		if err != nil {
			return Config{}, fmt.Errorf("projects[%d].path: %w", i, err)
		}
		if !info.IsDir() {
			return Config{}, fmt.Errorf("projects[%d].path is not a directory: %s", i, cfg.Projects[i].Path)
		}
	}

	return cfg, nil
}

var errServerStopped = errors.New("go-server.exe is stopped")

const (
	windowsDetachedProcess       = 0x00000008
	windowsCreateNewProcessGroup = 0x00000200
)

func startServer(cfg Config, configPath string, pidPath string) error {
	if meta, err := readMeta(pidPath); err == nil && isRunning(meta) {
		fmt.Printf("go-server.exe is already running. pid=%d port=%d\n", meta.PID, meta.Port)
		return nil
	}

	exePath, err := os.Executable()
	if err != nil {
		return err
	}
	exePath, err = filepath.Abs(exePath)
	if err != nil {
		return err
	}
	configPath, err = filepath.Abs(configPath)
	if err != nil {
		return err
	}
	pidPath, err = filepath.Abs(pidPath)
	if err != nil {
		return err
	}

	exeDir := filepath.Dir(exePath)
	out, err := os.OpenFile(filepath.Join(exeDir, "server.out.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer out.Close()
	errOut, err := os.OpenFile(filepath.Join(exeDir, "server.err.log"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
	if err != nil {
		return err
	}
	defer errOut.Close()

	cmd := exec.Command(exePath, "-config", configPath, "-pid", pidPath, "-child")
	cmd.Stdout = out
	cmd.Stderr = errOut
	cmd.Dir = exeDir
	cmd.SysProcAttr = &syscall.SysProcAttr{
		CreationFlags: windowsDetachedProcess | windowsCreateNewProcessGroup,
		HideWindow:    true,
	}
	if err := cmd.Start(); err != nil {
		return err
	}
	if err := cmd.Process.Release(); err != nil {
		return err
	}

	deadline := time.Now().Add(5 * time.Second)
	for time.Now().Before(deadline) {
		meta, err := readMeta(pidPath)
		if err == nil && meta.PID > 0 && meta.Port == cfg.Port && isRunning(meta) {
			fmt.Printf("go-server.exe started. pid=%d port=%d\n", meta.PID, meta.Port)
			openBrowser(openURL(cfg))
			return nil
		}
		time.Sleep(200 * time.Millisecond)
	}

	return errors.New("go-server.exe did not start within 5 seconds; check server.err.log")
}

func stopServer(pidPath string) error {
	meta, err := readMeta(pidPath)
	if err != nil {
		fmt.Println("go-server.exe is stopped.")
		return errServerStopped
	}
	if !isRunning(meta) {
		_ = os.Remove(pidPath)
		fmt.Println("go-server.exe is stopped.")
		return errServerStopped
	}

	req, err := http.NewRequest(http.MethodPost, fmt.Sprintf("http://127.0.0.1:%d/__go_server__/stop", meta.Port), nil)
	if err != nil {
		return err
	}
	req.Header.Set("X-Go-Server-Token", meta.Token)

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()
	req = req.WithContext(ctx)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("stop request failed: %s", resp.Status)
	}

	deadline := time.Now().Add(3 * time.Second)
	for time.Now().Before(deadline) {
		if !isRunning(meta) {
			_ = os.Remove(pidPath)
			fmt.Printf("go-server.exe stopped. pid=%d\n", meta.PID)
			return nil
		}
		time.Sleep(200 * time.Millisecond)
	}

	return errors.New("go-server.exe did not stop within 3 seconds")
}

func printStatus(pidPath string) error {
	meta, err := readMeta(pidPath)
	if err != nil || !isRunning(meta) {
		fmt.Println("go-server.exe is stopped.")
		return nil
	}
	fmt.Printf("go-server.exe is running. pid=%d port=%d\n", meta.PID, meta.Port)
	return nil
}

func isRunning(meta serverMeta) bool {
	if meta.PID <= 0 || meta.Port <= 0 || meta.Token == "" {
		return false
	}

	req, err := http.NewRequest(http.MethodGet, fmt.Sprintf("http://127.0.0.1:%d/__go_server__/status", meta.Port), nil)
	if err != nil {
		return false
	}
	req.Header.Set("X-Go-Server-Token", meta.Token)
	ctx, cancel := context.WithTimeout(context.Background(), 800*time.Millisecond)
	defer cancel()
	req = req.WithContext(ctx)

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return false
	}
	io.Copy(io.Discard, resp.Body)
	resp.Body.Close()
	return resp.StatusCode == http.StatusOK
}

func readMeta(pidPath string) (serverMeta, error) {
	data, err := os.ReadFile(pidPath)
	if err != nil {
		return serverMeta{}, err
	}

	var meta serverMeta
	if err := json.Unmarshal(data, &meta); err != nil {
		return serverMeta{}, err
	}
	return meta, nil
}

func writeMeta(pidPath string, meta serverMeta) error {
	data, err := json.MarshalIndent(meta, "", "  ")
	if err != nil {
		return err
	}
	return os.WriteFile(pidPath, data, 0644)
}

func newToken() (string, error) {
	data := make([]byte, 32)
	if _, err := rand.Read(data); err != nil {
		return "", err
	}
	return hex.EncodeToString(data), nil
}

func openURL(cfg Config) string {
	path := "/"
	for _, project := range cfg.Projects {
		if project.Open == 1 {
			path = "/" + project.Name + "/"
			break
		}
	}
	return fmt.Sprintf("http://localhost:%d%s", cfg.Port, path)
}

func openBrowser(url string) {
	cmd := exec.Command("rundll32", "url.dll,FileProtocolHandler", url)
	if err := cmd.Start(); err != nil {
		log.Printf("open browser failed: %v", err)
		return
	}
	if err := cmd.Process.Release(); err != nil {
		log.Printf("release browser process failed: %v", err)
	}
}

func buildMux(cfg Config) (*http.ServeMux, []mountedProject, error) {
	mux := http.NewServeMux()
	projects := make([]mountedProject, 0, len(cfg.Projects))
	seen := make(map[string]struct{}, len(cfg.Projects))

	for _, project := range cfg.Projects {
		if _, ok := seen[project.Name]; ok {
			return nil, nil, fmt.Errorf("duplicate project name: %s", project.Name)
		}
		seen[project.Name] = struct{}{}

		prefix := "/" + project.Name + "/"
		path := project.Path
		mux.Handle(prefix, http.StripPrefix(prefix, http.FileServer(http.Dir(path))))
		mux.HandleFunc("/"+project.Name, func(w http.ResponseWriter, r *http.Request) {
			http.Redirect(w, r, r.URL.Path+"/", http.StatusMovedPermanently)
		})

		projects = append(projects, mountedProject{
			Name: project.Name,
			Path: path,
			URL:  prefix,
		})
	}

	sort.Slice(projects, func(i, j int) bool {
		return projects[i].Name < projects[j].Name
	})

	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		renderIndex(w, projects)
	})

	return mux, projects, nil
}

func renderIndex(w http.ResponseWriter, projects []mountedProject) {
	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := indexTemplate.Execute(w, projects); err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
	}
}

var indexTemplate = template.Must(template.New("index").Parse(`<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Static Projects</title>
  <style>
    body { font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; margin: 40px; line-height: 1.5; }
    h1 { font-size: 24px; margin-bottom: 16px; }
    ul { padding-left: 20px; }
    a { color: #0b57d0; }
    small { color: #666; display: block; margin-top: 4px; }
  </style>
</head>
<body>
  <h1>Static Projects</h1>
  <ul>
    {{range .}}
    <li><a href="{{.URL}}">{{.Name}}</a><small>{{.Path}}</small></li>
    {{end}}
  </ul>
</body>
</html>`))
