import os
import re

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # We want to replace `font-size: 2rem;` with `font-size: calc(2rem * var(--text-scale, 1));`
    # We should avoid replacing if it already has calc or var
    
    # Match font-size: <number>rem; (or without ;)
    # We need to capture the number and any trailing semicolon
    
    pattern = r'font-size:\s*([0-9]*\.?[0-9]+)rem\s*(;?)'
    
    # Replacement function
    def repl(match):
        val = match.group(1)
        semicolon = match.group(2)
        return f'font-size: calc({val}rem * var(--text-scale, 1)){semicolon}'
    
    new_content, num_subs = re.subn(pattern, repl, content)
    
    if num_subs > 0:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f"Updated {filepath} ({num_subs} replacements)")

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith('.astro') or file.endswith('.css'):
            process_file(os.path.join(root, file))

