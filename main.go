package main

import (
	"encoding/json"
	"errors"
	"flag"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"
)

type Config struct {
	Port     int       `json:"port"`
	Projects []Project `json:"projects"`
}

type Project struct {
	Name string `json:"name"`
	Path string `json:"path"`
}

type mountedProject struct {
	Name string
	Path string
	URL  string
}

func main() {
	configPath := flag.String("config", "config.json", "configuration file path")
	flag.Parse()

	cfg, err := loadConfig(*configPath)
	if err != nil {
		log.Fatalf("load config: %v", err)
	}

	mux, projects, err := buildMux(cfg)
	if err != nil {
		log.Fatalf("build server: %v", err)
	}

	addr := fmt.Sprintf(":%d", cfg.Port)
	log.Printf("static file server listening on http://localhost%s", addr)
	for _, project := range projects {
		log.Printf("serving %s from %s at %s", project.Name, project.Path, project.URL)
	}

	if err := http.ListenAndServe(addr, mux); err != nil {
		log.Fatal(err)
	}
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
