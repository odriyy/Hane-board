#include <Arduino.h>
#include <WiFi.h>
#include <WebServer.h>
#include <LittleFS.h>

const char* ssid = "Wifi";
const char* password = "12345678";

WebServer server(80);

// Change this later based on LDR / puzzle logic
String currentPage = "black_americano.html";

String getContentType(const String& path) {
  if (path.endsWith(".html")) return "text/html";
  if (path.endsWith(".css")) return "text/css";
  if (path.endsWith(".js")) return "application/javascript";
  if (path.endsWith(".png")) return "image/png";
  if (path.endsWith(".jpg") || path.endsWith(".jpeg")) return "image/jpeg";
  if (path.endsWith(".svg")) return "image/svg+xml";
  return "text/plain";
}

bool handleFileRead(String path) {
  if (path.endsWith("/")) {
    path += "index.html";
  }

  if (!LittleFS.exists(path)) {
    Serial.print("File not found: ");
    Serial.println(path);
    return false;
  }

  File file = LittleFS.open(path, "r");
  server.streamFile(file, getContentType(path));
  file.close();
  return true;
}

void setup() {
  Serial.begin(115200);
  delay(1000);

  if (!LittleFS.begin(true)) {
    Serial.println("LittleFS mount failed");
    return;
  }

  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println();
  Serial.println("Connected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // Endpoint that tells the browser which page to open
  server.on("/page", HTTP_GET, []() {
    server.send(200, "text/plain", currentPage);
  });

  // Manual test route
  server.on("/set/black", HTTP_GET, []() {
    currentPage = "black_americano.html";
    server.send(200, "text/plain", "OK: black_americano.html");
  });

  // Serve all files from LittleFS
  server.onNotFound([]() {
    String path = server.uri();
    if (!handleFileRead(path)) {
      server.send(404, "text/plain", "404 Not Found");
    }
  });

  // Serve root
  server.on("/", HTTP_GET, []() {
    handleFileRead("/index.html");
  });

  server.begin();
  Serial.println("HTTP server started");
}

void loop() {
  server.handleClient();
}