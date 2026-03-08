import os
import subprocess

password = ""

def replace_in_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    if password in content:
        print(f"Cleaning {filepath}...")
        new_content = content.replace(password, "")
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)

# Fix the files locally first (already done but good to be sure)
replace_in_file("windows/sign_windows.ps1")
replace_in_file("build_and_sign.ps1")
