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
    tags = []
    
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            full_content = f.read()
        
        # 1. 프론트매터 추출 (--- ... ---)
        main_content = full_content
        fm_match = re.match(r'^---\s*\n(.*?)\n---\s*\n', full_content, re.DOTALL)
        if fm_match:
            frontmatter = fm_match.group(1)
            main_content = full_content[fm_match.end():]
            
            # 태그 파싱 (YAML 리스트 형태 지원)
            tag_section = re.search(r'tags:\s*\n((?:\s*-\s*.*\n?)*)', frontmatter)
            if tag_section:
                lines = tag_section.group(1).split('\n')
                tags = [line.strip().lstrip('-').strip() for line in lines if line.strip()]
        
        # 2. 깃허브 주소 파싱 (프론트매터 외부 상단에서 우선순위)
        gm = re.search(r'^github:\s*(https?://[^\s]+)', main_content, re.MULTILINE | re.IGNORECASE)
        if gm:
            github = gm.group(1).strip()
            # 깃허브 주소 줄은 본문 텍스트에서 나중에 제외될 수 있도록 처리 (현재는 단순 추출)

        # 3. 본문에서 첫 번째 헤딩(# 제목)을 찾으면 그것을 제목으로 사용
        m = re.search(r'^#\s+(.+)', main_content, re.MULTILINE)
        if m:
            title = m.group(1).strip()
        
        # 4. 이미지 태그에서 파일명 추출 (Obsidian 포맷 ![[이미지.png]])
        img_matches = re.findall(r'!\[\[(.*?)\]\]', main_content)
        images.extend(img_matches)
        
        # 5. 일반 마크다운 포맷 ![텍스트](이미지.png) -> 괄호 안이 이미지
        std_matches = re.findall(r'!\[.*?\]\((.*?)\)', main_content)
        for path in std_matches:
            img_name = os.path.basename(path).replace("%20", " ") # 인코딩 풀기
            if img_name not in images:
                images.append(img_name)
                
    except Exception as e:
        print(f"Error parsing {filepath}: {e}")
    
    return title, images, github, tags

def generate():
    data = {
        "about": "about.md",
        "projects": [],
        "thoughts": []
    }
    
    # 1. Projects 폴더 스캔
    proj_dir = os.path.join(VAULT_DIR, "projects")
    if os.path.exists(proj_dir):
        # 파일명에서 {seq} 부분을 제거하고, title을 추출하는 함수
        def parse_proj_filename(filename):
            match = re.match(r'^\{(\d+)\}(.*)\.md$', filename)
            if match:
                return int(match.group(1)), match.group(2).strip()
            return 999999, filename.replace(".md", "").strip()

        # .md 파일 필터링 후 정보 추출
        files = [f for f in os.listdir(proj_dir) if f.endswith(".md")]
        proj_files_info = [(parse_proj_filename(f)[0], parse_proj_filename(f)[1], f) for f in files]
        
        # seq 기준으로 오름차순 정렬 (seq가 없는 경우 맨 뒤가 되도록 999999 반환)
        proj_files_info.sort(key=lambda x: (x[0], x[1]))

        for seq, file_title, f in proj_files_info:
            path = os.path.join(proj_dir, f)
            _, images, github, tags = parse_markdown(path)
            data["projects"].append({
                "id": file_title,
                "title": file_title,
                "github": github,
                "images": images,
                "tags": tags,
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
            title, _, _, _ = parse_markdown(path)
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
