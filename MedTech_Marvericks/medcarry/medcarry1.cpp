#include "thingProperties.h"
#include "Preferences.h"
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include <math.h>

#define SCREEN_WIDTH 128
#define SCREEN_HEIGHT 64
#define OLED_RESET -1
#define SCREEN_ADDRESS 0x3C
Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

//--PINS--
#define RelayPin1 15
#define ButtonPin1 4
#define ButtonPin2 5
#define wifiLed    2
#define THERMISTOR_PIN 34

// --- Thermistor Parameters ---
const float R_FIXED = 10000.0;   // 10kΩ fixed resistor
const float BETA = 3950.0;       // Beta coefficient
const float To = 298.15;         // 25°C in Kelvin
const float Ro = 10000.0;        // 10kΩ at 25°C

// --- Voltage supply compensation ---
const float V_SUPPLY = 3.1;      // Measured actual supply voltage (battery powered)

// --- State ---
Preferences pref;
float currentTemp = 0;

// --- Button debounce ---
bool button1Prev = HIGH;
bool button2Prev = HIGH;
unsigned long lastButton1Press = 0;
unsigned long lastButton2Press = 0;
const unsigned long debounceDelay = 50;

// --- Timing ---
unsigned long lastTempReadTime = 0;
const unsigned long tempReadInterval = 1000;  // 1 second

void setup() {
  Serial.begin(115200);
  delay(1500);

  initProperties();
  ArduinoCloud.begin(ArduinoIoTPreferredConnection);
  setDebugMessageLevel(2);
  ArduinoCloud.printDebugInfo();

  pref.begin("Relay_State", false);

  pinMode(RelayPin1, OUTPUT);
  pinMode(wifiLed, OUTPUT);
  pinMode(ButtonPin1, INPUT_PULLUP);
  pinMode(ButtonPin2, INPUT_PULLUP);

  digitalWrite(wifiLed, LOW);
  digitalWrite(RelayPin1, !cooler); //ACTIVE LOW