import json
import glob
import os
import sys

print("--- Verifying Translation Files ---")
en_path = "src/i18n/locales/en.json"
if not os.path.exists(en_path):
    # Try parent directory / workspace context fallback
    en_path = "Frontend/src/i18n/locales/en.json"

if not os.path.exists(en_path):
    print("Error: Could not find en.json template.")
    sys.exit(1)

with open(en_path, "r", encoding="utf-8") as f:
    en_data = json.load(f)

def get_keys_recursive(d, prefix=""):
    keys = {}
    for k, v in d.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            keys.update(get_keys_recursive(v, full_key))
        else:
            keys[full_key] = v
    return keys

en_keys = get_keys_recursive(en_data)

has_error = False
locales_dir = os.path.dirname(en_path)
for path in sorted(glob.glob(os.path.join(locales_dir, "*.json"))):
    if "en.json" in path:
        continue
    
    lang_code = os.path.basename(path).split(".")[0]
    with open(path, "r", encoding="utf-8") as f:
        try:
            data = json.load(f)
        except Exception as e:
            print(f"FAIL: {path} has invalid JSON structure: {e}")
            has_error = True
            continue
            
    keys = get_keys_recursive(data)
    missing = set(en_keys.keys()) - set(keys.keys())
    extra = set(keys.keys()) - set(en_keys.keys())
    
    if missing or extra:
        print(f"FAIL: {lang_code}.json is not aligned with en.json")
        if missing:
            print(f"  Missing keys: {list(missing)[:10]} ...")
        if extra:
            print(f"  Extra keys: {list(extra)[:10]} ...")
        has_error = True
    else:
        print(f"PASS: {lang_code}.json is perfectly aligned")

if has_error:
    print("\ni18n verification FAILED! Please run python align_i18n.py or align the files manually.")
    sys.exit(1)
else:
    print("\ni18n verification SUCCESSFUL! All locales match en.json.")
    sys.exit(0)
