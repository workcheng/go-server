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
