package main

import (
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestBuildMuxServesMultipleProjects(t *testing.T) {
	first := t.TempDir()
	second := t.TempDir()
	mustWriteFile(t, filepath.Join(first, "index.html"), "first")
	mustWriteFile(t, filepath.Join(second, "asset.txt"), "second")

	mux, _, err := buildMux(Config{
		Port: 8080,
		Projects: []Project{
			{Name: "first", Path: first},
			{Name: "second", Path: second},
		},
	})
	if err != nil {
		t.Fatal(err)
	}

	assertResponse(t, mux, "/first/", http.StatusOK, "first")
	assertResponse(t, mux, "/second/asset.txt", http.StatusOK, "second")
	assertResponse(t, mux, "/missing/", http.StatusNotFound, "404")
}

func TestBuildMuxRedirectsProjectRoot(t *testing.T) {
	dir := t.TempDir()
	mux, _, err := buildMux(Config{
		Projects: []Project{{Name: "site", Path: dir}},
	})
	if err != nil {
		t.Fatal(err)
	}

	req := httptest.NewRequest(http.MethodGet, "/site", nil)
	rec := httptest.NewRecorder()
	mux.ServeHTTP(rec, req)

	if rec.Code != http.StatusMovedPermanently {
		t.Fatalf("status = %d, want %d", rec.Code, http.StatusMovedPermanently)
	}
	if got := rec.Header().Get("Location"); got != "/site/" {
		t.Fatalf("Location = %q, want %q", got, "/site/")
	}
}

func TestLoadConfigValidatesProjectNames(t *testing.T) {
	dir := t.TempDir()
	configPath := filepath.Join(dir, "config.json")
	projectPath := filepath.Join(dir, "site")
	if err := os.Mkdir(projectPath, 0755); err != nil {
		t.Fatal(err)
	}
	mustWriteFile(t, configPath, `{"port":8080,"projects":[{"name":"bad/name","path":"site"}]}`)

	_, err := loadConfig(configPath)
	if err == nil || !strings.Contains(err.Error(), "single URL path segment") {
		t.Fatalf("error = %v, want single URL path segment error", err)
	}
}

func TestLoadOrCreateConfigCreatesDefaultProject(t *testing.T) {
	dir := t.TempDir()
	configPath := filepath.Join(dir, "config.json")

	cfg, err := loadOrCreateConfig(configPath)
	if err != nil {
		t.Fatal(err)
	}
	if cfg.Port != 8080 {
		t.Fatalf("port = %d, want 8080", cfg.Port)
	}
	if len(cfg.Projects) != 1 {
		t.Fatalf("projects length = %d, want 1", len(cfg.Projects))
	}
	if cfg.Projects[0].Name != "example_site" || cfg.Projects[0].Open != 1 {
		t.Fatalf("project = %#v, want example_site with open=1", cfg.Projects[0])
	}

	for _, name := range []string{"index.html", "styles.css", "app.js", "data.json"} {
		if _, err := os.Stat(filepath.Join(dir, "example_site", name)); err != nil {
			t.Fatalf("expected generated %s: %v", name, err)
		}
	}
}

func TestServerMetaRoundTrip(t *testing.T) {
	pidPath := filepath.Join(t.TempDir(), "go-server.pid")
	want := serverMeta{PID: 1234, Port: 8080, Token: "token"}

	if err := writeMeta(pidPath, want); err != nil {
		t.Fatal(err)
	}
	got, err := readMeta(pidPath)
	if err != nil {
		t.Fatal(err)
	}
	if got != want {
		t.Fatalf("meta = %#v, want %#v", got, want)
	}
}

func TestOpenURLUsesRootWhenNoProjectIsSelected(t *testing.T) {
	got := openURL(Config{
		Port:     8080,
		Projects: []Project{{Name: "site"}},
	})
	if got != "http://localhost:8080/" {
		t.Fatalf("openURL = %q, want %q", got, "http://localhost:8080/")
	}
}

func TestOpenURLUsesSelectedProject(t *testing.T) {
	got := openURL(Config{
		Port: 8080,
		Projects: []Project{
			{Name: "first"},
			{Name: "second", Open: 1},
		},
	})
	if got != "http://localhost:8080/second/" {
		t.Fatalf("openURL = %q, want %q", got, "http://localhost:8080/second/")
	}
}

func TestOpenURLUsesFirstSelectedProject(t *testing.T) {
	got := openURL(Config{
		Port: 8080,
		Projects: []Project{
			{Name: "first", Open: 1},
			{Name: "second", Open: 1},
		},
	})
	if got != "http://localhost:8080/first/" {
		t.Fatalf("openURL = %q, want %q", got, "http://localhost:8080/first/")
	}
}

func assertResponse(t *testing.T, handler http.Handler, path string, status int, body string) {
	t.Helper()

	req := httptest.NewRequest(http.MethodGet, path, nil)
	rec := httptest.NewRecorder()
	handler.ServeHTTP(rec, req)

	if rec.Code != status {
		t.Fatalf("%s status = %d, want %d", path, rec.Code, status)
	}
	if !strings.Contains(rec.Body.String(), body) {
		t.Fatalf("%s body = %q, want it to contain %q", path, rec.Body.String(), body)
	}
}

func mustWriteFile(t *testing.T, path string, content string) {
	t.Helper()

	if err := os.WriteFile(path, []byte(content), 0644); err != nil {
		t.Fatal(err)
	}
}
