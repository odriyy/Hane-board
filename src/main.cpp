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
      icons.add("hot.png");    
      icons.add("regular.png"); 
    } 
    else if (currentState == 2) {
      // STATE 2: BLACK AMERICANO
      doc["main_image"] = "/compressed_photos/black_americano.png";
      doc["drink_name"] = "Black Americano";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    
      icons.add("8oz.png");    
      icons.add("double.png"); 
      icons.add("oat.png");    
    }
    else if (currentState == 3) {
      // STATE 3: DOUBLE ESPRESSO
      doc["main_image"] = "/compressed_photos/double_espresso.png";
      doc["drink_name"] = "Double Espresso";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    
      icons.add("6oz.png");    
      icons.add("double.png"); 
    }
    else if (currentState == 4) {
      // STATE 4: FRENCH MINT CHOCO
      doc["main_image"] = "/compressed_photos/french_mint_choco.png";
      doc["drink_name"] = "French Mint Choco";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("iced.png");    
      icons.add("8oz.png");    
      icons.add("low_fat.png"); 
    }
    else if (currentState == 5) {
      // STATE 5: MATCHA
      doc["main_image"] = "/compressed_photos/matcha.png";
      doc["drink_name"] = "Matcha";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    
      icons.add("8oz.png");    
      icons.add("single.png"); 
      icons.add("soy.png"); 
    }
    else if (currentState == 6) {
      // STATE 6: MOCHA
      doc["main_image"] = "/compressed_photos/mocha.png";
      doc["drink_name"] = "Mocha";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    
      icons.add("8oz.png");    
      icons.add("double.png"); 
      icons.add("regular.png"); 
    }
    else if (currentState == 7) {
      // STATE 7: SPICED CHAI
      doc["main_image"] = "/compressed_photos/spiced_chai.png";
      doc["drink_name"] = "Spiced Chai";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("iced.png");    
      icons.add("8oz.png");    
      icons.add("oat.png"); 
    }
    else if (currentState == 8) {
      // STATE 8: WHITE LATTE
      doc["main_image"] = "/compressed_photos/white_latte.png";
      doc["drink_name"] = "White Latte";
      JsonArray icons = doc.createNestedArray("icons");
      icons.add("hot.png");    
      icons.add("8oz.png");    
      icons.add("single.png"); 
      icons.add("soy.png"); 
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
    // Modulo 9 because we have 9 total states (0 through 8)
    currentState = (currentState + 1) % 9; 
    
    Serial.print("Mock State Switched To: ");
    Serial.println(currentState);
  }
}