#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include <LittleFS.h>
#include <ArduinoJson.h>

// --- 1. WiFi Credentials ---
const char* ssid = "Wifi";
const char* password = "12345678";

// Create the WebServer on port 80
AsyncWebServer server(80);

// --- 2. Mock State Variables ---
unsigned long lastChange = 0;
int currentState = 1; // Start at 1 (Babyccino)

void setup() {
  // Serial setup for debugging
  Serial.begin(115200);
  delay(1000);

  // --- 3. Mount LittleFS ---
  if(!LittleFS.begin(true)){
    Serial.println("LittleFS Mount Failed!");
    return;
  }
  Serial.println("LittleFS Mounted successfully.");

  // --- 4. Connect to WiFi ---
  WiFi.begin(ssid, password);
  Serial.print("Connecting to WiFi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nConnected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  // --- 5. Static File Routes (WITH ANTI-CACHE) ---
  // We tell the server to force the iPad to always fetch the newest images and HTML
  server.serveStatic("/", LittleFS, "/")
        .setDefaultFile("index.html")
        .setCacheControl("no-cache, no-store, must-revalidate");

  // --- 6. Mock API Endpoint (/api/state) ---
  server.on("/api/state", HTTP_GET, [](AsyncWebServerRequest *request){
    StaticJsonDocument<512> doc;

    if (currentState == 0) {
      // STATE 0: IDLE
      doc["main_image"] = "";
      doc.createNestedArray("icons"); // Empty icons array
    } 
    else if (currentState == 1) {
      // STATE 1: BABYCCINO 
      doc["main_image"] = "/compressed_photos/Babyccino.png";
      doc["drink_name"] = "Babyccino";
      
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    // Slot 0
      icons.add("regular.png"); // Slot 1
    } 
    else if (currentState == 2) {
      // STATE 2: BLACK AMERICANO
      doc["main_image"] = "/compressed_photos/black_americano.png";
      doc["drink_name"] = "Black Americano";
      
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    // Slot 0
      icons.add("8oz.png");    // Slot 1
      icons.add("double.png"); // Slot 2
      icons.add("oat.png");    // Slot 3
    }

    String responseStr;
    serializeJson(doc, responseStr);
    
    // Create the response and add headers to completely disable Safari's JSON caching
    AsyncWebServerResponse *response = request->beginResponse(200, "application/json", responseStr);
    response->addHeader("Cache-Control", "no-cache, no-store, must-revalidate, max-age=0");
    response->addHeader("Pragma", "no-cache");
    response->addHeader("Expires", "0");
    request->send(response);
  });

  // --- 7. Start the Server ---
  server.begin();
  Serial.println("HTTP server started. Open your iPad browser!");
}

void loop() {
  // Cycles through the orders every 8 seconds
  unsigned long now = millis();
  if (now - lastChange > 8000) {
    lastChange = now;
    currentState = (currentState + 1) % 3; // Cycles 0 -> 1 -> 2 -> 0
    
    Serial.print("Mock State Switched To: ");
    Serial.println(currentState);
  }
}