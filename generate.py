import os
import json
import re

VAULT_DIR = "vault"
INDEX_FILE = os.path.join(VAULT_DIR, "index.json")

def parse_markdown(filepath):
    # 파일명 기반 기본 제목
    title = os.path.basename(filepath).replace(".md", "")
    images = []
    github = ""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            content = f.read()
            
            # github 주소 파싱 (github: url)
            gm = re.search(r'^github:\s*(https?://[^\s]+)', content, re.MULTILINE | re.IGNORECASE)
            if gm:
                github = gm.group(1).strip()
                
            # 본문에서 첫 번째 헤딩(# 제목)을 찾으면 그것을 제목으로 사용
            m = re.search(r'^#\s+(.+)', content, re.MULTILINE)
            if m:
                title = m.group(1).strip()
            
            # 이미지 태그에서 파일명 추출 (Obsidian 포맷 ![[이미지.png]])
            img_matches = re.findall(r'!\[\[(.*?)\]\]', content)
            images.extend(img_matches)
            
            # 일반 마크다운 포맷 ![텍스트](이미지.png) -> 괄호 안이 이미지, URL 인코딩 등 무시하고 추출
            std_matches = re.findall(r'!\[.*?\]\((.*?)\)', content)
            for path in std_matches:
                img_name = os.path.basename(path).replace("%20", " ") # 인코딩 풀기
                if img_name not in images:
                    images.append(img_name)
                
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    
    return title, images, github

def generate():
    data = {
        "about": "about.md",
        "projects": [],
        "thoughts": []
    }
    
    # 1. Projects 폴더 스캔
    proj_dir = os.path.join(VAULT_DIR, "projects")
    if os.path.exists(proj_dir):
        # 파일명 순 정렬
        files = sorted(os.listdir(proj_dir))
        for f in files:
            if f.endswith(".md"):
                path = os.path.join(proj_dir, f)
                title, images, github = parse_markdown(path)
                data["projects"].append({
                    "id": f.replace(".md", ""),
                    "title": title,
                    "github": github,
                    "images": images,
                    "markdown": f
                })
                
    # 2. Thoughts 폴더 스캔
    thought_dir = os.path.join(VAULT_DIR, "thoughts")
    if os.path.exists(thought_dir):
        # 최신 글이 위로 오게 하기 위해 파일명 역순 정렬 권장 (혹은 생성시간 기준)
        # 생성 시간 기준으로 가져와서 최신순 정렬
        def get_mtime(filename):
            return os.path.getmtime(os.path.join(thought_dir, filename))
            
        files = [f for f in os.listdir(thought_dir) if f.endswith(".md")]
        files.sort(key=get_mtime, reverse=True)
        
        for f in files:
            path = os.path.join(thought_dir, f)
            title, _, _ = parse_markdown(path)
            data["thoughts"].append({
                "title": title,
                "markdown": f
            })
                
    # 3. Profile 이미지 찾기
    profile_img = ""
    img_dir = os.path.join(VAULT_DIR, "images")
    if os.path.exists(img_dir):
        for f in os.listdir(img_dir):
            if f.startswith("profile."):
                profile_img = f
                break
    data["profile_image"] = profile_img
                
    with open(INDEX_FILE, 'w', encoding='utf-8') as f:
        json.dump(data, f, ensure_ascii=False, indent=2)
    print("✅ vault/index.json 파일이 성공적으로 자동 생성/갱신되었습니다.")

if __name__ == "__main__":
    generate()
