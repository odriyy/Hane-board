#!/usr/bin/env python3
import subprocess
import time
import RPi.GPIO as GPIO
from mfrc522 import SimpleMFRC522

GPIO.setwarnings(False)

# --- CONFIGURATION ---
STICKER_MAP = {
    27464173210: "chocolate_french_mint.html",
    12345678901: "history.html",
    22334455667: "settings.html",
    33445566778: "menu_4.html",
    44556677889: "menu_5.html",
    55667788990: "menu_6.html",
    66778899001: "menu_7.html",
    77889900112: "menu_8.html",
    88990011223: "menu_9.html",
    99001122334: "menu_10.html",
    11112222333: "menu_11.html",
    22223333444: "menu_12.html"
}

reader = SimpleMFRC522()
last_card_id = None
last_read_time = 0

print("Hane Board System: Online. Waiting for tap...")

def change_page(page_name):
    """Open the selected local HTML page in Chromium."""
    url = f"file:///home/haneboard/hane_menus/{page_name}"
    print(f"Switching to: {page_name}")

    subprocess.run([
        "chromium-browser",
        "--kiosk",
        url
    ])

try:
    while True:
        card_id, text = reader.read()
        current_time = time.time()

        print(f"Detected card UID: {card_id}")

        # Prevent repeated triggering from the same tap
        if card_id == last_card_id and (current_time - last_read_time) < 2:
            time.sleep(0.2)
            continue

        last_card_id = card_id
        last_read_time = current_time

        if card_id in STICKER_MAP:
            page = STICKER_MAP[card_id]
            change_page(page)
        else:
            print(f"Unknown Sticker Detected: {card_id}")

        time.sleep(1)

except KeyboardInterrupt:
    print("\nShutting down safely...")

finally:
    GPIO.cleanup()